import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No API Key found');
        return;
    }

    // We can't easily list models with the SDK in this version without a specific call, 
    // but we can try a raw fetch to the list endpoint if the SDK doesn't expose it easily.
    // Actually, the SDK usually doesn't expose listModels directly in the main class in some versions.
    // Let's try a raw fetch to be sure.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('All Models:', data.models.map((m: any) => m.name));
        } else {
            console.log('No models found or error structure:', data);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
