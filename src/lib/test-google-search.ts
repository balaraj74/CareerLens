/**
 * Test Google Custom Search API
 * 
 * Run this to verify your Google Search API credentials are working
 * Usage: node --loader tsx src/lib/test-google-search.ts
 */

import { searchCollegeReviews, searchFreeCourses, searchMentors } from './google-search-service';

async function testGoogleSearch() {
  console.log('🔍 Testing Google Custom Search API...\n');

  try {
    // Test 1: Search for college reviews
    console.log('Test 1: Searching for college reviews...');
    const reviews = await searchCollegeReviews('PESIT Bangalore', 'JEE', { numResults: 5 });
    console.log(`✅ Found ${reviews.length} college reviews`);
    if (reviews.length > 0) {
      console.log(`   First result: "${reviews[0].title.substring(0, 60)}..."`);
    }
    console.log('');

    // Wait 2 seconds (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Search for free courses
    console.log('Test 2: Searching for free courses...');
    const courses = await searchFreeCourses('Machine Learning', { 
      level: 'beginner',
      numResults: 5 
    });
    console.log(`✅ Found ${courses.length} free courses`);
    if (courses.length > 0) {
      console.log(`   First result: "${courses[0].title.substring(0, 60)}..."`);
    }
    console.log('');

    // Wait 2 seconds (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Search for mentors
    console.log('Test 3: Searching for mentors...');
    const mentors = await searchMentors('Software Engineer', { 
      company: 'Google',
      numResults: 5 
    });
    console.log(`✅ Found ${mentors.length} mentor profiles`);
    if (mentors.length > 0) {
      console.log(`   First result: "${mentors[0].title.substring(0, 60)}..."`);
    }
    console.log('');

    console.log('🎉 All tests passed! Google Custom Search is working!\n');
    
    console.log('📊 Summary:');
    console.log(`   • College Reviews: ${reviews.length}`);
    console.log(`   • Free Courses: ${courses.length}`);
    console.log(`   • Mentor Profiles: ${mentors.length}`);
    console.log('');

  } catch (error: any) {
    console.error('❌ Error during testing:', error.message);
    
    if (error.message.includes('credentials not configured')) {
      console.log('\n💡 Fix: Make sure you have set these in .env.local:');
      console.log('   NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_api_key');
      console.log('   NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=6495457f6bd0c4747');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Possible issues:');
      console.log('   1. Invalid API key');
      console.log('   2. Search Engine ID is incorrect');
      console.log('   3. Exceeded daily quota (100 searches/day)');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Rate limited - wait a few seconds and try again');
    }
  }
}

// Run the test
testGoogleSearch();
