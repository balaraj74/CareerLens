/**
 * Real-Time Mentor Chat Service
 * Handles mentor matching, chat messages, and mentorship bookings
 */

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

export interface Mentor {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  title: string;
  company: string;
  expertise: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  bio: string;
  availability: {
    days: string[];
    times: string[];
  };
  pricing: {
    free: boolean;
    hourlyRate?: number;
  };
  verified: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'event' | 'system';
}

export interface ChatRoom {
  id: string;
  mentorId: string;
  menteeId: string;
  mentorName: string;
  menteeName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  active: boolean;
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number; // in minutes
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

/**
 * Get all available mentors
 */
export async function getMentors(limitCount: number = 20): Promise<Mentor[]> {
  try {
    const app = getApp();
    const db = getFirestore(app);

    const q = query(
      collection(db, 'mentors'),
      where('verified', '==', true),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const mentors: Mentor[] = [];

    snapshot.forEach((doc) => {
      mentors.push({
        id: doc.id,
        ...doc.data(),
      } as Mentor);
    });

    return mentors.length > 0 ? mentors : getMockMentors();
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return getMockMentors();
  }
}

/**
 * Create or get existing chat room
 */
export async function createChatRoom(mentorId: string): Promise<string> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Check if chat room already exists
    const q = query(
      collection(db, 'chatRooms'),
      where('mentorId', '==', mentorId),
      where('menteeId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    // Create new chat room
    const chatRoom = {
      mentorId,
      menteeId: user.uid,
      mentorName: 'Mentor', // You'd fetch this from mentor data
      menteeName: user.displayName || user.email?.split('@')[0] || 'User',
      unreadCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'chatRooms'), chatRoom);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
}

/**
 * Send a chat message
 */
export async function sendMessage(
  chatRoomId: string,
  message: string
): Promise<void> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const messageData = {
      chatRoomId,
      senderId: user.uid,
      senderName: user.displayName || user.email?.split('@')[0] || 'User',
      senderPhoto: user.photoURL,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    await addDoc(collection(db, 'messages'), messageData);

    // Update chat room's last message
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: message.substring(0, 100),
      lastMessageTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Listen to real-time messages
 */
export function subscribeToMessages(
  chatRoomId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  try {
    const app = getApp();
    const db = getFirestore(app);

    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as ChatMessage);
      });
      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    return () => {};
  }
}

/**
 * Get user's chat rooms
 */
export async function getUserChatRooms(): Promise<ChatRoom[]> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const q = query(
      collection(db, 'chatRooms'),
      where('menteeId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const chatRooms: ChatRoom[] = [];

    snapshot.forEach((doc) => {
      chatRooms.push({
        id: doc.id,
        ...doc.data(),
      } as ChatRoom);
    });

    return chatRooms;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return [];
  }
}

/**
 * Book a mentorship session
 */
export async function bookMentorshipSession(
  mentorId: string,
  sessionData: {
    title: string;
    description: string;
    scheduledAt: string;
    duration: number;
  }
): Promise<string> {
  try {
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const session = {
      mentorId,
      menteeId: user.uid,
      title: sessionData.title,
      description: sessionData.description,
      scheduledAt: sessionData.scheduledAt,
      duration: sessionData.duration,
      meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(7)}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'mentorshipSessions'), session);
    
    // Send notification to mentor (you can implement this)
    console.log('Mentorship session booked:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error booking session:', error);
    throw error;
  }
}

/**
 * Get AI-powered chat summary using Gemini
 */
export async function getChatSummary(messages: ChatMessage[]): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || messages.length === 0) {
      return 'No summary available';
    }

    const chatText = messages
      .map((msg) => `${msg.senderName}: ${msg.message}`)
      .join('\n');

    const prompt = `Summarize this mentorship chat conversation in 2-3 sentences. Focus on key topics discussed and action items:\n\n${chatText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary unavailable';
  } catch (error) {
    console.error('Error generating chat summary:', error);
    return 'Summary unavailable';
  }
}

/**
 * Mock mentors for initial data
 */
export function getMockMentors(): Mentor[] {
  return [
    {
      id: 'mentor-1',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh@example.com',
      photoURL: 'https://i.pravatar.cc/150?u=rajesh',
      title: 'Senior Software Engineer',
      company: 'Google',
      expertise: ['System Design', 'DSA', 'Interview Prep', 'Career Guidance'],
      experience: 12,
      rating: 4.9,
      reviewCount: 156,
      bio: '12+ years at Google. Helped 200+ students crack FAANG interviews. Expert in system design and algorithms.',
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        times: ['6:00 PM - 9:00 PM IST'],
      },
      pricing: {
        free: false,
        hourlyRate: 2000,
      },
      verified: true,
      createdAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: 'mentor-2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      photoURL: 'https://i.pravatar.cc/150?u=priya2',
      title: 'Data Scientist',
      company: 'Microsoft',
      expertise: ['Machine Learning', 'Python', 'Data Science', 'AI'],
      experience: 8,
      rating: 4.8,
      reviewCount: 98,
      bio: 'ML expert at Microsoft. Published 10+ research papers. Passionate about teaching AI/ML to beginners.',
      availability: {
        days: ['Tuesday', 'Thursday', 'Saturday'],
        times: ['7:00 PM - 10:00 PM IST'],
      },
      pricing: {
        free: true,
      },
      verified: true,
      createdAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: 'mentor-3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      photoURL: 'https://i.pravatar.cc/150?u=amit',
      title: 'Full Stack Developer',
      company: 'Amazon',
      expertise: ['React', 'Node.js', 'AWS', 'System Design'],
      experience: 10,
      rating: 4.7,
      reviewCount: 134,
      bio: 'Full stack expert at Amazon. Specializing in React, Node.js, and AWS. Love helping students build real projects.',
      availability: {
        days: ['Monday', 'Thursday', 'Sunday'],
        times: ['8:00 PM - 11:00 PM IST'],
      },
      pricing: {
        free: false,
        hourlyRate: 1500,
      },
      verified: true,
      createdAt: new Date('2024-03-01').toISOString(),
    },
    {
      id: 'mentor-4',
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      photoURL: 'https://i.pravatar.cc/150?u=sneha',
      title: 'Product Manager',
      company: 'Meta',
      expertise: ['Product Management', 'Strategy', 'Career Growth', 'Leadership'],
      experience: 9,
      rating: 4.9,
      reviewCount: 87,
      bio: 'Product Manager at Meta. Transitioned from engineering to PM. Can guide you through PM career path.',
      availability: {
        days: ['Wednesday', 'Friday', 'Saturday'],
        times: ['6:30 PM - 9:30 PM IST'],
      },
      pricing: {
        free: true,
      },
      verified: true,
      createdAt: new Date('2024-04-01').toISOString(),
    },
    {
      id: 'mentor-5',
      name: 'Karthik Menon',
      email: 'karthik@example.com',
      photoURL: 'https://i.pravatar.cc/150?u=karthik2',
      title: 'DevOps Engineer',
      company: 'Netflix',
      expertise: ['DevOps', 'Kubernetes', 'Docker', 'CI/CD', 'Cloud'],
      experience: 7,
      rating: 4.6,
      reviewCount: 72,
      bio: 'DevOps engineer at Netflix. Expert in Kubernetes and cloud infrastructure. Happy to help with DevOps career.',
      availability: {
        days: ['Tuesday', 'Thursday', 'Friday'],
        times: ['7:30 PM - 10:00 PM IST'],
      },
      pricing: {
        free: false,
        hourlyRate: 1800,
      },
      verified: true,
      createdAt: new Date('2024-05-01').toISOString(),
    },
  ];
}
