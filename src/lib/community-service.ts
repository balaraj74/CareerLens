/**
 * Community Service - Student Reviews & Discussions
 * Handles review submission, moderation, and retrieval
 */

import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

export interface Review {
  id: string;
  title: string;
  content: string;
  author: {
    uid: string;
    name: string;
    email?: string;
    photoURL?: string;
  };
  category: 'KCET' | 'NEET' | 'JEE' | 'COMEDK' | 'GATE' | 'College Reviews';
  college?: string;
  year?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  photos?: string[];
  upvotes: number;
  downvotes: number;
  verified: boolean;
  moderated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmission {
  title: string;
  content: string;
  category: Review['category'];
  college?: string;
  year?: string;
  rating: Review['rating'];
  photos?: string[];
}

/**
 * Submit a new review
 */
export async function submitReview(reviewData: ReviewSubmission): Promise<string> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated to submit reviews');
    }

    // AI Moderation check
    const isAppropriate = await moderateContent(reviewData.content);
    if (!isAppropriate) {
      throw new Error('Review content violates community guidelines');
    }

    const review = {
      title: reviewData.title,
      content: reviewData.content,
      author: {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        photoURL: user.photoURL,
      },
      category: reviewData.category,
      college: reviewData.college || '',
      year: reviewData.year || '',
      rating: reviewData.rating,
      photos: reviewData.photos || [],
      upvotes: 0,
      downvotes: 0,
      verified: false,
      moderated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), review);
    console.log('Review submitted successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

/**
 * Get reviews by category
 */
/**
 * Get reviews by category
 */
export async function getReviewsByCategory(
  category: Review['category'],
  maxResults: number = 50
): Promise<Review[]> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('category', '==', category),
      where('moderated', '==', true),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  } catch (error) {
    console.error('Error fetching reviews by category:', error);
    // Return empty array if there's a permission error or no reviews yet
    return [];
  }
}

/**
 * Get all reviews (public read access)
 */
export async function getAllReviews(maxResults: number = 50): Promise<Review[]> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('moderated', '==', true),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return empty array if there's a permission error or no reviews yet
    return [];
  }
}

/**
 * Vote on a review (upvote/downvote)
 */
export async function voteReview(
  reviewId: string,
  voteType: 'upvote' | 'downvote'
): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    if (!auth.currentUser) {
      throw new Error('User must be authenticated to vote');
    }

    const reviewRef = doc(db, 'reviews', reviewId);
    
    // In a production app, you'd want to track user votes to prevent multiple votes
    // For now, we'll just increment/decrement the count
    
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (voteType === 'upvote') {
      // You'd use increment() in a real implementation
      updates.upvotes = (await getDocs(query(collection(db, 'reviews'), where('__name__', '==', reviewId)))).docs[0]?.data()?.upvotes + 1 || 1;
    } else {
      updates.downvotes = (await getDocs(query(collection(db, 'reviews'), where('__name__', '==', reviewId)))).docs[0]?.data()?.downvotes + 1 || 1;
    }

    await updateDoc(reviewRef, updates);
  } catch (error) {
    console.error('Error voting on review:', error);
    throw error;
  }
}

/**
 * AI Content Moderation using Gemini
 */
async function moderateContent(content: string): Promise<boolean> {
  try {
    // Use Gemini API for content moderation
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not configured, skipping moderation');
      return true; // Allow content if API key is missing
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following content for inappropriate material, spam, offensive language, or harmful content. Respond with ONLY "APPROPRIATE" or "INAPPROPRIATE".\n\nContent: ${content}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
    
    return result === 'APPROPRIATE';
  } catch (error) {
    console.error('Error moderating content:', error);
    return true; // Allow content if moderation fails
  }
}

/**
 * Get mock/seeded reviews (for initial data)
 */
export function getMockReviews(): Review[] {
  return [
    {
      id: 'mock-1',
      title: 'KCET 2024 - My Journey to 95 Percentile',
      content: 'Sharing my preparation strategy for KCET 2024. I focused heavily on PYQs (Previous Year Questions) and NCERT books. Mock tests were crucial for time management. Physics was my strongest subject, followed by Chemistry. Mathematics required consistent practice.',
      author: {
        uid: 'user1',
        name: 'Priya Sharma',
        photoURL: 'https://i.pravatar.cc/150?u=priya',
      },
      category: 'KCET',
      college: 'RVCE Bangalore',
      year: '2024',
      rating: 5,
      upvotes: 124,
      downvotes: 3,
      verified: true,
      moderated: true,
      createdAt: new Date('2024-06-15').toISOString(),
      updatedAt: new Date('2024-06-15').toISOString(),
    },
    {
      id: 'mock-2',
      title: 'JEE Mains 2024 - Tips from a 98 Percentiler',
      content: 'Consistency is key! I studied 6-8 hours daily for 2 years. Allen modules + HC Verma for Physics, NCERT + MS Chauhan for Chemistry, Cengage for Maths. Took 50+ mock tests in the last 3 months.',
      author: {
        uid: 'user2',
        name: 'Rahul Kumar',
        photoURL: 'https://i.pravatar.cc/150?u=rahul',
      },
      category: 'JEE',
      college: 'IIT Bombay',
      year: '2024',
      rating: 5,
      upvotes: 456,
      downvotes: 12,
      verified: true,
      moderated: true,
      createdAt: new Date('2024-07-20').toISOString(),
      updatedAt: new Date('2024-07-20').toISOString(),
    },
    {
      id: 'mock-3',
      title: 'NEET 2024 - Biology Strategy That Worked',
      content: 'NCERT is the bible for NEET Biology! I read NCERT Biology 11th and 12th at least 5 times. Made handwritten notes with diagrams. For Physics and Chemistry, focused on numerical problems and concepts.',
      author: {
        uid: 'user3',
        name: 'Anjali Reddy',
        photoURL: 'https://i.pravatar.cc/150?u=anjali',
      },
      category: 'NEET',
      college: 'AIIMS Delhi',
      year: '2024',
      rating: 5,
      upvotes: 389,
      downvotes: 8,
      verified: true,
      moderated: true,
      createdAt: new Date('2024-08-10').toISOString(),
      updatedAt: new Date('2024-08-10').toISOString(),
    },
    {
      id: 'mock-4',
      title: 'PES University Review - CSE Branch',
      content: 'Great infrastructure and placement opportunities. Faculty is knowledgeable and helpful. Campus life is vibrant with lots of technical clubs. Average package is around 8-10 LPA. Good for those who want to stay in Bangalore.',
      author: {
        uid: 'user4',
        name: 'Karthik M',
        photoURL: 'https://i.pravatar.cc/150?u=karthik',
      },
      category: 'College Reviews',
      college: 'PES University',
      year: '2023',
      rating: 4,
      upvotes: 234,
      downvotes: 15,
      verified: true,
      moderated: true,
      createdAt: new Date('2024-09-05').toISOString(),
      updatedAt: new Date('2024-09-05').toISOString(),
    },
    {
      id: 'mock-5',
      title: 'GATE CSE 2024 - How I Scored 750+',
      content: 'Started preparation 8 months before exam. Made notes for all subjects. Practiced all PYQs from last 15 years. Test series from Made Easy helped a lot. Focus on core subjects: Algorithms, OS, DBMS, Networks.',
      author: {
        uid: 'user5',
        name: 'Deepak Singh',
        photoURL: 'https://i.pravatar.cc/150?u=deepak',
      },
      category: 'GATE',
      college: 'IIT Madras',
      year: '2024',
      rating: 5,
      upvotes: 567,
      downvotes: 10,
      verified: true,
      moderated: true,
      createdAt: new Date('2024-10-01').toISOString(),
      updatedAt: new Date('2024-10-01').toISOString(),
    },
  ];
}
