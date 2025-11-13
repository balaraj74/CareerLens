# CareerLens Product Overview

## Purpose
CareerLens is an AI-powered career development platform that democratizes access to personalized career coaching, learning paths, and intelligent job search tools. Built for the Google GenAI Hackathon 2025, it bridges the gap between education and employment using Google Cloud's Generative AI.

## Core Value Proposition
- **Personalized AI Career Guidance**: Gemini 2.5 Flash-powered recommendations tailored to individual skills, goals, and interests
- **Real-Time Industry Insights**: Live data aggregation from Reddit, Google Search, and 5+ educational platforms
- **Comprehensive Learning Ecosystem**: 20M+ free books, 12,000+ courses, 42 college recommendations
- **End-to-End Career Tools**: From skill gap analysis to resume building to interview preparation

## Key Features

### AI-Powered Career Services
- **AI Skills Recommender**: Personalized skill development paths with relevance scoring
- **AI Project Generator**: Context-aware project recommendations matching skill levels
- **AI Interview Preparation**: Role-specific mock interviews with real-time feedback
- **AI Learning Helper**: PDF document analysis with 4 modes (Quick Points, Deep Dive, Mind Map, Exam Mode)
- **AI Career Calendar**: Google Calendar integration with Gemini-powered event suggestions

### Resource Discovery
- **Free Course Discovery**: Real-time web scraping from NPTEL (12,000+ courses), Coursera, AWS Educate, Google Cloud Skills Boost, YouTube
- **eBooks Library**: 20M+ books from Internet Archive with advanced filtering (15 genres, 10 languages, 6 formats)
- **College Recommendations**: 42 colleges database covering JEE, KCET, COMEDK, NEET, CET, GATE with AI-powered ranking
- **Mentor Discovery**: Industry mentor matching with Google Search integration
- **Library Finder**: Nearby study spaces via Google Maps

### Career Development Tools
- **Interactive Resume Builder**: ATS-friendly templates with AI content suggestions and JSON-based generation
- **Career Graph & Analytics**: GitHub-style 365-day activity heatmap, skill network visualization, AI readiness scores
- **Personalized Learning Roadmap**: Step-by-step paths with time estimates and difficulty levels
- **Skill Gap Analysis**: Identify missing skills with prioritized learning recommendations
- **Progress Tracking**: Visual journey tracking with achievement badges and milestones

### Community & Reviews
- **Reddit Reviews Integration**: Live student reviews with sentiment analysis and topic extraction
- **AI Summarization**: Auto-summarize reviews and articles with credibility scoring
- **Bookmark System**: Save favorite books and resources with localStorage persistence
- **Search History**: Track last 20 searches with AI-powered recommendations

### Productivity Features
- **Task Management**: Google Calendar sync with smart scheduling and conflict detection
- **Event Reminders**: Firebase Cloud Messaging push notifications
- **Learning Streaks**: Track productivity with streak counters and scores
- **Today's Tasks Widget**: Interactive task completion tracking

## Target Users

### Primary Audience
- **Students**: College students seeking career guidance, course recommendations, and interview preparation
- **Recent Graduates**: Job seekers needing resume optimization, skill development, and mentor connections
- **Career Switchers**: Professionals exploring new career paths with personalized roadmaps

### Use Cases
1. **Career Exploration**: Discover career paths aligned with skills and interests
2. **Skill Development**: Identify gaps and access curated learning resources
3. **College Selection**: Research colleges with authentic student reviews and AI-powered matching
4. **Interview Preparation**: Practice with AI interviewer and role-specific questions
5. **Resource Discovery**: Find free courses, books, and educational content
6. **Mentor Connection**: Discover industry professionals for guidance
7. **Resume Optimization**: Build ATS-friendly resumes with AI suggestions
8. **Learning Management**: Track progress with calendar integration and analytics

## Unique Selling Points

### Fully Google Cloud Integrated
- Leverages Gemini 2.5 Flash for lightning-fast AI responses
- Built on Firebase (Authentication, Firestore, Cloud Functions, App Hosting)
- Integrated with Google Calendar, Google Maps, YouTube API
- Ready for BigQuery analytics and Looker Studio dashboards

### Real-Time AI Insights
- Live data aggregation from Reddit, Google Search, 5+ course platforms
- AI-powered summarization in seconds
- Instant course recommendations based on profile
- Background Cloud Functions refresh data every 24 hours
- No stale data - always latest industry insights

### Personalization at Scale
- Every recommendation uniquely tailored to user profile
- Context-aware AI understands career goals and adapts
- Multi-dimensional matching: skills, interests, experience, location
- Continuous learning from user interactions and feedback

## Technology Highlights
- **Next.js 15.3.3** with React 18 and TypeScript 5
- **Gemini 2.5 Flash Lite** for fast AI responses
- **Firebase 11.9.1** (Auth, Firestore, Cloud Functions, Hosting)
- **Genkit 1.21.0** for AI workflow orchestration
- **Modern UI**: Tailwind CSS, Framer Motion, shadcn/ui components
- **Glassmorphic Design**: Purple/pink gradient theme with smooth animations

## Performance
- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Bundle Size: < 300KB
- Global CDN Distribution via Firebase App Hosting

## Future Roadmap
- AI Chat Mentor with conversational guidance
- AI Interview Simulator with speech-to-text and video analysis
- AI-Driven Course Planner with Google Calendar sync
- BigQuery Analytics Dashboard for platform-wide trends
- Looker Studio Dashboards for visual analytics
- Mobile App (React Native iOS/Android)
- Blockchain Certifications with NFT badges
