/**
 * Firebase Cloud Functions for CareerLens
 * Real-time data intelligence automation
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all cloud functions
export { fetchReviewsScheduled } from './fetchReviews';
export { fetchResourcesScheduled } from './fetchResources';
export { fetchMentorsScheduled } from './fetchMentors';
export { summarizeDataTrigger } from './summarizeData';
export { notifyUsersTrigger } from './notifyUsers';
export { fetchCareerUpdates } from './fetchCareerIntelligence';

/**
 * Health check function
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    functions: [
      'fetchReviewsScheduled',
      'fetchResourcesScheduled',
      'fetchMentorsScheduled',
      'summarizeDataTrigger',
      'notifyUsersTrigger',
      'fetchCareerUpdates',
      'refreshCareerUpdates'
    ]
  });
});
