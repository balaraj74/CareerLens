const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getCareerRecommendations = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { profile } = data;

  if (!profile) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "profile" argument.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    You are CareerLens, an AI career advisor.
    User Profile: ${typeof profile === 'object' ? JSON.stringify(profile) : profile}
    Task: Recommend top 3 career paths. For each path, provide:
    1. A "career" title.
    2. A "reason" for why it’s a good fit.
    3. A list of "missingSkills" (as a string, comma separated).
    4. A "learningPlan" (as a string with newlines).
    5. A list of "resources" (as a string with newlines).
    Return a single JSON object with a key "careerRecommendations" which is an array of these objects.
    Example item: { "career": "Cloud Engineer", "reason": "...", "missingSkills": "Terraform, Ansible", "learningPlan": "...", "resources": "..." }
    Return valid JSON only.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean the text to ensure it's valid JSON
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);
    
    // Store in Firestore
    const db = admin.firestore();
    await db.collection('recommendations').add({
      userId: context.auth.uid,
      recommendations: parsedResult.careerRecommendations,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return parsedResult;
  } catch (error) {
    console.error("Error generating content or parsing JSON:", error);
    throw new functions.https.HttpsError('internal', 'Failed to generate AI recommendations.');
  }
});
