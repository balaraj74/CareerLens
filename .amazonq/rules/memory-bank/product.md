# CareerLens Product Overview

## Purpose
CareerLens is an AI-powered career development platform that empowers students and professionals with intelligent career insights, personalized learning paths, and real-time industry data. The platform bridges the gap between education and employment by leveraging Google Cloud's Generative AI and comprehensive data aggregation.

## Core Value Proposition
Students struggle to find relevant courses, mentors, and career guidance tailored to their unique goals. CareerLens solves this by providing:
- AI-driven career path recommendations
- Personalized skill gap analysis with actionable learning paths
- Live industry insights and trends
- 20M+ educational resources (eBooks, courses, certifications)
- Real-time college reviews and recommendations
- Intelligent resume optimization and interview preparation

## Key Features

### Career Management
- **Career Navigator**: AI-powered career path recommendations with Gemini 2.5 Flash integration
- **Career Graph Visualization**: Interactive node-based career mapping with React Flow, GitHub-style 365-day activity heatmap
- **Career Updates Feed**: Latest industry news, personalized content, bookmarking capabilities
- **AI Career Insights**: Comprehensive career analysis with Gemini 1.5 Pro (salary insights, job market demand, long-term planning)

### AI-Powered Tools
- **AI Skills Recommender** (620 lines): Personalized skill development paths with real-time demand analysis
- **AI Resume Optimizer**: ATS-friendly resume generation, scoring, job-specific tailoring (PDF/DOCX support)
- **AI Interview Preparation**: Mock interviews with conversational AI, role-specific questions, performance feedback
- **AI Project Generator** (580 lines): Context-aware project recommendations with implementation guides
- **AI Chat Assistant (Copilot)**: Real-time career guidance, technical problem-solving, code review

### Education & Learning
- **College Recommendations**: 42-college database (IITs, NITs, IIITs, BITS) with advanced filtering, Reddit reviews integration
- **eBooks Library**: 20M+ books from Internet Archive with bookmark management, reading progress tracking
- **Course Discovery**: NPTEL integration (12,000+ courses), Coursera, AWS Educate, Google Cloud Skills Boost
- **Certification Hub** (450 lines): 25+ curated certifications with progress tracking
- **Learning Roadmaps**: Technology-specific paths with skill progression tracking

### Resource Discovery
- **Library Finder**: Google Maps API integration with real-time location tracking, Haversine distance calculation
- **News Feed**: NewsAPI integration with category filtering, article caching (5-min TTL)
- **Mentor Discovery**: Google Custom Search integration for LinkedIn profile search

### Productivity Tools
- **AI Calendar**: Google Calendar API sync with Gemini-powered event suggestions, Firebase Cloud Messaging reminders
- **English Language Helper**: AI-powered grammar correction, pronunciation guidance, IELTS/TOEFL prep

### Profile & Gamification
- **Intelligent Profile Management**: Multi-tab editor (6 sections), 3D visual dashboard, achievement tracking, real-time Firebase sync
- **Skill Gap Analyzer**: Current skills vs. target role comparison with timeline estimation

### Community Features
- **College Reviews**: Real-time Reddit discussions with server-side CORS bypass proxy, sentiment analysis, topic extraction

## Target Users
- **Students**: Career exploration, college selection, skill development
- **Professionals**: Career transitions, upskilling, industry insights
- **Job Seekers**: Resume optimization, interview preparation, job market analysis

## Use Cases
1. **Career Planning**: Students discover career paths aligned with their interests and receive personalized roadmaps
2. **College Selection**: Prospective students filter 42 colleges by location, fees, placements with authentic Reddit reviews
3. **Skill Development**: Professionals identify skill gaps and access 20M+ learning resources
4. **Interview Preparation**: Job seekers practice with AI mock interviews and optimize resumes for ATS
5. **Learning Resource Discovery**: Users find nearby libraries, online courses, and certifications
6. **Industry Monitoring**: Professionals stay updated with AI-curated news and career trends

## Technical Highlights
- **Premium Glassmorphism UI**: Neon color scheme (Cyan #00E5FF, Purple #A57CFF, Emerald #00FFC6)
- **Real-time Features**: Firestore listeners, live data updates, push notifications (FCM)
- **Performance Optimization**: SSR/SSG, edge functions, CDN distribution, 5-min caching
- **Security**: Firebase Auth (Google OAuth 2.0), Firestore security rules, HTTPS-only, API rate limiting
- **Deployed**: Firebase App Hosting at careerlens-1.web.app
