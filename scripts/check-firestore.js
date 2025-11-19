const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./careerlens-1-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'careerlens-1'
});

const db = admin.firestore();

async function checkFirestoreData() {
  console.log('🔍 Checking Firestore data...\n');
  
  try {
    // Check careerUpdates collection
    const updatesSnapshot = await db.collection('careerUpdates')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (updatesSnapshot.empty) {
      console.log('❌ No data in careerUpdates collection');
    } else {
      const doc = updatesSnapshot.docs[0];
      const data = doc.data();
      
      console.log('✅ Latest document ID:', doc.id);
      console.log('📅 Timestamp:', data.timestamp?.toDate());
      console.log('\n📊 Data Sources:');
      console.log('  - Google:', data.dataSources?.google || 0);
      console.log('  - Reddit:', data.dataSources?.reddit || 0);
      console.log('  - News:', data.dataSources?.news || 0);
      
      console.log('\n🔥 Trending Skills:');
      if (data.summary?.trendingSkills) {
        data.summary.trendingSkills.forEach((skill, i) => {
          console.log(`  ${i+1}. ${skill.skill} (+${skill.growth}%)`);
        });
      } else {
        console.log('  No skills data');
      }
      
      console.log('\n💼 Hot Jobs:');
      if (data.summary?.hotJobs) {
        data.summary.hotJobs.forEach((job, i) => {
          console.log(`  ${i+1}. ${job.title} - ${job.city} (${job.openings} openings)`);
        });
      } else {
        console.log('  No jobs data');
      }
      
      console.log('\n📝 Raw Summary Keys:', Object.keys(data.summary || {}));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkFirestoreData();
