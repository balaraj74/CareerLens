"use strict";
/**
 * Firebase Cloud Functions for CareerLens
 * Real-time data intelligence automation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.notifyUsersTrigger = exports.summarizeDataTrigger = exports.fetchMentorsScheduled = exports.fetchResourcesScheduled = exports.fetchReviewsScheduled = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
// Export all cloud functions
var fetchReviews_1 = require("./fetchReviews");
Object.defineProperty(exports, "fetchReviewsScheduled", { enumerable: true, get: function () { return fetchReviews_1.fetchReviewsScheduled; } });
var fetchResources_1 = require("./fetchResources");
Object.defineProperty(exports, "fetchResourcesScheduled", { enumerable: true, get: function () { return fetchResources_1.fetchResourcesScheduled; } });
var fetchMentors_1 = require("./fetchMentors");
Object.defineProperty(exports, "fetchMentorsScheduled", { enumerable: true, get: function () { return fetchMentors_1.fetchMentorsScheduled; } });
var summarizeData_1 = require("./summarizeData");
Object.defineProperty(exports, "summarizeDataTrigger", { enumerable: true, get: function () { return summarizeData_1.summarizeDataTrigger; } });
var notifyUsers_1 = require("./notifyUsers");
Object.defineProperty(exports, "notifyUsersTrigger", { enumerable: true, get: function () { return notifyUsers_1.notifyUsersTrigger; } });
/**
 * Health check function
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        functions: [
            'fetchReviewsScheduled',
            'fetchResourcesScheduled',
            'fetchMentorsScheduled',
            'summarizeDataTrigger',
            'notifyUsersTrigger'
        ]
    });
});
//# sourceMappingURL=index.js.map