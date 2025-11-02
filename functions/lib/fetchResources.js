"use strict";
/**
 * Cloud Function: Fetch Learning Resources
 * Runs every 12 hours to scrape courses from multiple platforms
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchResourcesManual = exports.fetchResourcesScheduled = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const db = admin.firestore();
/**
 * Scrape NPTEL courses
 */
async function scrapeNPTEL(searchTerm) {
    try {
        const url = 'https://nptel.ac.in/courses';
        const response = await axios_1.default.get(url, { timeout: 10000 });
        const $ = (0, cheerio_1.load)(response.data);
        const courses = [];
        $('.course-card').slice(0, 10).each((_i, el) => {
            const title = $(el).find('.course-title').text().trim();
            const instructor = $(el).find('.course-instructor').text().trim();
            const description = $(el).find('.course-desc').text().trim();
            const href = $(el).find('a').attr('href');
            if (title && href) {
                courses.push({
                    title,
                    platform: 'NPTEL',
                    url: href.startsWith('http') ? href : `https://nptel.ac.in${href}`,
                    instructor,
                    level: 'intermediate',
                    description: description || `NPTEL course: ${title}`
                });
            }
        });
        return courses;
    }
    catch (error) {
        console.error('NPTEL scraping error:', error);
        return [];
    }
}
/**
 * Scrape Coursera via search
 */
async function scrapeCoursera(searchTerm) {
    try {
        const url = `https://www.coursera.org/search?query=${encodeURIComponent(searchTerm)}`;
        const response = await axios_1.default.get(url, { timeout: 10000 });
        const $ = (0, cheerio_1.load)(response.data);
        const courses = [];
        $('li.cds-9').slice(0, 10).each((_i, el) => {
            const title = $(el).find('h2').text().trim();
            const href = $(el).find('a').attr('href');
            const rating = parseFloat($(el).find('.ratings-text').text().trim());
            if (title && href) {
                courses.push({
                    title,
                    platform: 'Coursera',
                    url: href.startsWith('http') ? href : `https://www.coursera.org${href}`,
                    level: 'beginner',
                    description: `Coursera: ${title}`,
                    rating: isNaN(rating) ? undefined : rating
                });
            }
        });
        return courses;
    }
    catch (error) {
        console.error('Coursera scraping error:', error);
        return [];
    }
}
/**
 * Scrape AWS Training
 */
async function scrapeAWS() {
    try {
        const url = 'https://aws.amazon.com/training/';
        const response = await axios_1.default.get(url, { timeout: 10000 });
        const $ = (0, cheerio_1.load)(response.data);
        const courses = [];
        $('div.lb-content-item').slice(0, 10).each((_i, el) => {
            const title = $(el).find('h3').text().trim();
            const href = $(el).find('a').attr('href');
            const description = $(el).find('p').text().trim();
            if (title && href) {
                courses.push({
                    title,
                    platform: 'AWS Training',
                    url: href.startsWith('http') ? href : `https://aws.amazon.com${href}`,
                    level: 'intermediate',
                    description: description || `AWS Training: ${title}`
                });
            }
        });
        return courses;
    }
    catch (error) {
        console.error('AWS scraping error:', error);
        return [];
    }
}
/**
 * Scrape GCP Training
 */
async function scrapeGCP() {
    try {
        const url = 'https://cloud.google.com/learn/training';
        const response = await axios_1.default.get(url, { timeout: 10000 });
        const $ = (0, cheerio_1.load)(response.data);
        const courses = [];
        $('div.cloud-card').slice(0, 10).each((_i, el) => {
            const title = $(el).find('h3').text().trim();
            const href = $(el).find('a').attr('href');
            const description = $(el).find('p').text().trim();
            if (title && href) {
                courses.push({
                    title,
                    platform: 'Google Cloud',
                    url: href.startsWith('http') ? href : `https://cloud.google.com${href}`,
                    level: 'intermediate',
                    description: description || `Google Cloud: ${title}`
                });
            }
        });
        return courses;
    }
    catch (error) {
        console.error('GCP scraping error:', error);
        return [];
    }
}
/**
 * Store courses in Firestore
 */
async function storeCourses(courses) {
    let stored = 0;
    const batch = db.batch();
    const collectionRef = db.collection('scraped_courses');
    for (const course of courses) {
        // Create unique ID from title and platform
        const courseId = `${course.platform}_${course.title}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 100);
        const existingDoc = await collectionRef.doc(courseId).get();
        if (!existingDoc.exists) {
            const docRef = collectionRef.doc(courseId);
            batch.set(docRef, Object.assign(Object.assign({}, course), { fetchedAt: admin.firestore.FieldValue.serverTimestamp(), processed: false }));
            stored++;
        }
        else {
            // Update existing course
            const docRef = collectionRef.doc(courseId);
            batch.update(docRef, Object.assign(Object.assign({}, course), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        }
    }
    await batch.commit();
    return stored;
}
/**
 * Scheduled function - runs every 12 hours
 */
exports.fetchResourcesScheduled = functions.pubsub
    .schedule('0 */12 * * *')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
    console.log('Starting scheduled resource scraping...');
    const searchTerms = ['programming', 'data science', 'cloud computing'];
    let totalStored = 0;
    for (const term of searchTerms) {
        console.log(`Scraping resources for: ${term}`);
        // Scrape all platforms in parallel
        const [nptel, coursera, aws, gcp] = await Promise.all([
            scrapeNPTEL(term),
            scrapeCoursera(term),
            scrapeAWS(),
            scrapeGCP()
        ]);
        const allCourses = [...nptel, ...coursera, ...aws, ...gcp];
        const stored = await storeCourses(allCourses);
        totalStored += stored;
        console.log(`Stored ${stored} new courses for "${term}"`);
    }
    // Update metadata
    await db.collection('_metadata').doc('scraped_courses').set({
        lastFetch: admin.firestore.FieldValue.serverTimestamp(),
        totalFetched: totalStored,
        platforms: ['NPTEL', 'Coursera', 'AWS Training', 'Google Cloud']
    }, { merge: true });
    console.log(`Completed! Stored ${totalStored} new courses total`);
    return { success: true, stored: totalStored };
});
/**
 * Manual trigger function for testing
 */
exports.fetchResourcesManual = functions.https.onRequest(async (req, res) => {
    try {
        console.log('Manual resource scraping triggered...');
        const searchTerm = req.query.search || 'programming';
        const [nptel, coursera, aws, gcp] = await Promise.all([
            scrapeNPTEL(searchTerm),
            scrapeCoursera(searchTerm),
            scrapeAWS(),
            scrapeGCP()
        ]);
        const allCourses = [...nptel, ...coursera, ...aws, ...gcp];
        const stored = await storeCourses(allCourses);
        res.json({
            success: true,
            searchTerm,
            fetched: allCourses.length,
            stored,
            platforms: {
                nptel: nptel.length,
                coursera: coursera.length,
                aws: aws.length,
                gcp: gcp.length
            },
            preview: allCourses.slice(0, 5)
        });
    }
    catch (error) {
        console.error('Manual fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
//# sourceMappingURL=fetchResources.js.map