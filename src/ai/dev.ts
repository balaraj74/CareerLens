'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-career-recommendations.ts';
import '@/ai/flows/perform-skill-gap-analysis.ts';
import '@/ai/flows/create-personalized-roadmap.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/generate-resume-from-json.ts';
import '@/ai/flows/learning-helper.ts';
