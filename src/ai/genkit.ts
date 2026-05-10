/**
 * Genkit AI Configuration — Vertex AI (Production)
 *
 * Uses the @genkit-ai/google-genai plugin with vertexAI() initializer
 * to authenticate via Application Default Credentials (ADC).
 *
 * This routes all AI calls through your billable GCP project (careerlens-1),
 * using the Vertex AI endpoint (aiplatform.googleapis.com).
 *
 * Auth: `gcloud auth application-default login` (local dev)
 *       or GCE/Cloud Run default service account (production).
 *
 * Model: gemini-2.5-flash (stable, billable, high-quality)
 *
 * IMPORTANT: Initialization is lazy (deferred to first call) to prevent
 * build-time crashes in CI environments without GCP credentials.
 */

import { genkit, type Genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

let _ai: Genkit | null = null;

/**
 * Lazily initialize the Genkit instance on first use.
 * This prevents build-time failures in CI (GitHub Actions)
 * where GCP credentials are not available.
 */
function getAI(): Genkit {
  if (!_ai) {
    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID
      || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      || 'careerlens-1';

    const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    _ai = genkit({
      plugins: [
        vertexAI({
          projectId: PROJECT_ID,
          location: LOCATION,
        }),
      ],
      model: 'vertexai/gemini-2.5-flash',
    });
  }
  return _ai;
}

/** @deprecated Use callGemini() instead. Exposed for legacy flows. */
export const ai = new Proxy({} as Genkit, {
  get(_target, prop, receiver) {
    return Reflect.get(getAI(), prop, receiver);
  },
});

/**
 * Shared helper: call Gemini via the centralized Genkit instance.
 * All services should use this instead of direct fetch() calls.
 */
export async function callGemini(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    outputSchema?: any;
  } = {}
): Promise<string> {
  const result = await getAI().generate({
    model: options.model || 'vertexai/gemini-2.5-flash',
    prompt,
    config: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
      topP: options.topP ?? 0.9,
      topK: options.topK ?? 40,
    },
    ...(options.outputSchema ? { output: { schema: options.outputSchema } } : {}),
  });

  return result.text ?? '';
}
