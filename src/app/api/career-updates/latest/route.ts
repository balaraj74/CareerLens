/**
 * API Route: Get Latest Career Updates
 * Fetches the most recent career intelligence data from Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit as firestoreLimit, getDocs, doc, getDoc } from 'firebase/firestore';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get the daily snapshot
    const snapshotRef = doc(db, 'careerUpdates', date);
    const snapshotDoc = await getDoc(snapshotRef);

    if (!snapshotDoc.exists()) {
      // Try to get the most recent date
      const updatesQuery = query(
        collection(db, 'careerUpdates'),
        orderBy('timestamp', 'desc'),
        firestoreLimit(1)
      );
      
      const snapshot = await getDocs(updatesQuery);
      
      if (snapshot.empty) {
        return NextResponse.json({
          success: false,
          message: 'No career updates available yet'
        }, { status: 404 });
      }

      const latestDoc = snapshot.docs[0];
      const latestData = latestDoc.data();

      return NextResponse.json({
        success: true,
        date: latestDoc.id,
        data: latestData
      });
    }

    const data = snapshotDoc.data();

    // Also fetch subcollections
    const [jobsSnapshot, skillsSnapshot, certsSnapshot] = await Promise.all([
      getDocs(collection(db, 'careerUpdates', date, 'jobs')),
      getDocs(collection(db, 'careerUpdates', date, 'skills')),
      getDocs(collection(db, 'careerUpdates', date, 'certifications'))
    ]);

    const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const skills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const certifications = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      success: true,
      date,
      data: {
        ...data,
        jobs,
        skills,
        certifications
      }
    });

  } catch (error: any) {
    console.error('Error fetching career updates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch career updates'
      },
      { status: 500 }
    );
  }
}
