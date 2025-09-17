const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // or axios

admin.initializeApp();
const db = admin.firestore();

exports.generateCareerPlan = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');

  const userId = context.auth.uid;
  const roleIds = data.roleIds || []; // optional filter
  try {
    // Load user profile
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User profile not found.');

    const userProfile = userDoc.data();

    // Load roles
    let rolesSnapshot;
    if (roleIds.length) {
      const rolePromises = roleIds.map(id => db.collection('roles').doc(id).get());
      const roleDocs = await Promise.all(rolePromises);
      var roles = roleDocs.filter(r => r.exists).map(r => ({ id: r.id, ...r.data() }));
    } else {
      rolesSnapshot = await db.collection('roles').limit(10).get();
      var roles = rolesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Load prompt template
    const promptDoc = await db.collection('prompts').doc('careerAdvisor').get();
    const promptTemplate = promptDoc.exists ? promptDoc.data().userTemplate : null;
    const systemPrompt = promptDoc.exists ? promptDoc.data().system : null;

    // Prepare prompt (simple templating)
    const payloadPrompt = promptTemplate
      .replace('{{userProfile}}', JSON.stringify(userProfile))
      .replace('{{roles}}', JSON.stringify(roles));

    // Call LLM (example generic)
    const LLM_API_URL = "https://api.your-llm.com/v1/complete";
    const LLM_API_KEY = functions.config().llm.key;

    const llmResp = await fetch(LLM_API_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        system: systemPrompt,
        prompt: payloadPrompt,
        max_tokens: 900
      })
    });

    if (!llmResp.ok) {
      const text = await llmResp.text();
      throw new Error(`LLM Error: ${text}`);
    }
    const llmJson = await llmResp.json();
    // adapt reading result to provider's shape
    const generated = llmJson.output || llmJson.choices?.[0]?.text || JSON.stringify(llmJson);

    // Persist plan
    const planRef = db.collection('plans').doc();
    const planData = {
      userId,
      rolesRecommended: roles.map(r => ({ id: r.id, title: r.title })),
      generatedText: generated,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'generated'
    };
    await planRef.set(planData);

    return { planId: planRef.id, plan: planData };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
