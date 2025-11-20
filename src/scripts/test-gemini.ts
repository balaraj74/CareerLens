import { GoogleGenerativeAI } from '@google/generative-ai';


async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    console.log('Checking API Key...');
    if (!apiKey) {
        console.error('❌ No API Key found in environment variables');
        return;
    }
    console.log('✅ API Key found (starts with):', apiKey.substring(0, 5) + '...');

    try {
        console.log('Initializing GoogleGenerativeAI...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        console.log('Sending test prompt...');
        const result = await model.generateContent('Hello, are you working?');
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini Response:', text);
    } catch (error: any) {
        console.error('❌ Error testing Gemini:', error.message);
        if (error.response) {
            console.error('Error details:', JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
