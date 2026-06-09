/**
 * CareerLens Mobile — AI Service
 *
 * Fallback chain:
 *  1. Gemini (primary)         — EXPO_PUBLIC_GEMINI_API_KEY
 *     model: gemini-2.5-flash
 *     endpoint: generativelanguage.googleapis.com
 *
 *  2. NVIDIA NIM Cloud (fallback) — EXPO_PUBLIC_NVIDIA_API_KEY
 *     model: moonshotai/kimi-k2.6  (262K context, ✅ confirmed working)
 *     endpoint: https://integrate.api.nvidia.com/v1/chat/completions
 *     (OpenAI-compatible, no Docker/GPU needed — hosted by NVIDIA)
 *
 * All screens inherit this via generateContent() / generateJSON().
 */

import Constants from 'expo-constants';

// ── Keys ──────────────────────────────────────────────────────────────────────
const GEMINI_KEY: string =
  Constants.expoConfig?.extra?.geminiApiKey ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  '';

const NVIDIA_KEY: string =
  Constants.expoConfig?.extra?.nvidiaApiKey ||
  process.env.EXPO_PUBLIC_NVIDIA_API_KEY ||
  '';

// ── Models ────────────────────────────────────────────────────────────────────
export const MODELS = {
  GEMINI_PRIMARY: 'gemini-2.5-flash',
  NVIDIA_KIMI:    'moonshotai/kimi-k2.6',   // ✅ tested — NVIDIA NIM cloud
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type AIOptions = {
  preferredModel?: string;
  temperature?: number;
  jsonMode?: boolean;
};

// ── JSON extraction ────────────────────────────────────────────────────────────
/**
 * Robustly extracts a JSON value from any LLM response that may contain
 * markdown fences, prose, or other wrapping text.
 */
export function extractJSON(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();

  try { return JSON.parse(cleaned); } catch { /* fall through */ }

  const objMatch = extractBracket(cleaned, '{', '}');
  if (objMatch) { try { return JSON.parse(objMatch); } catch { /* try array */ } }

  const arrMatch = extractBracket(cleaned, '[', ']');
  if (arrMatch) { try { return JSON.parse(arrMatch); } catch { /* give up */ } }

  throw new SyntaxError(`[AI] Cannot parse JSON from: "${raw.slice(0, 200)}"`);
}

function extractBracket(text: string, open: string, close: string): string | null {
  const start = text.indexOf(open);
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (esc)  { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === open)  depth++;
    else if (ch === close && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

// ── Provider: Gemini ──────────────────────────────────────────────────────────
async function callGemini(prompt: string, options: AIOptions): Promise<string> {
  if (!GEMINI_KEY) throw new Error('No Gemini API key');

  const model = options.preferredModel || MODELS.GEMINI_PRIMARY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.jsonMode ? 8192 : 1024,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

// ── Provider: NVIDIA NIM Cloud ────────────────────────────────────────────────
async function callNvidia(prompt: string, options: AIOptions): Promise<string> {
  if (!NVIDIA_KEY) throw new Error('No NVIDIA API key — set EXPO_PUBLIC_NVIDIA_API_KEY in .env');

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_KEY}`,
    },
    body: JSON.stringify({
      model: MODELS.NVIDIA_KIMI,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.4,
      max_tokens: options.jsonMode ? 8192 : 1024,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`NVIDIA NIM ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  if (data?.detail) throw new Error(`NVIDIA NIM: ${data.detail}`);

  const text: string = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('NVIDIA NIM returned empty response');
  return text;
}

// ── Public API ────────────────────────────────────────────────────────────────
export const gemini = {
  MODELS,

  /**
   * Sends a prompt with automatic 2-step fallback:
   *   Gemini 2.5 Flash → NVIDIA NIM kimi-k2.6
   *
   * Console logs show which provider answered.
   */
  async generateContent(prompt: string, options: AIOptions = {}): Promise<string> {
    // 1️⃣ Gemini
    try {
      const text = await callGemini(prompt, options);
      console.log('[AI] ✅ Gemini (gemini-2.5-flash) answered');
      return text;
    } catch (e) {
      console.warn('[AI] Gemini failed →', (e as Error).message);
    }

    // 2️⃣ NVIDIA NIM — kimi-k2.6
    try {
      const text = await callNvidia(prompt, options);
      console.log('[AI] ✅ NVIDIA NIM (kimi-k2.6) answered');
      return text;
    } catch (e) {
      console.error('[AI] NVIDIA NIM failed →', (e as Error).message);
      throw new Error(`All AI providers exhausted. Last: ${(e as Error).message}`);
    }
  },

  /**
   * Generates structured JSON with automatic fallback + safe extraction.
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options: Omit<AIOptions, 'jsonMode'> = {}
  ): Promise<T> {
    const text = await gemini.generateContent(prompt, { ...options, jsonMode: true });
    return extractJSON(text) as T;
  },
};

export default gemini;
