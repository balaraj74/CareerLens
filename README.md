# 🚀 CareerLens: AI-Powered Career Development Platform

<div align="center">

![CareerLens Banner](https://img.shields.io/badge/CareerLens-AI%20Career%20Platform-blue?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-purple?style=flat-square&logo=google)](https://ai.google.dev/)

**Your Personal AI-Powered Career Co-Pilot**

[Live Demo](https://careerlens--careerlens-1.us-central1.hosted.app) | [Documentation](#-documentation) | [Features](#-core-features)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Technology Stack](#️-technology-stack)
- [Google Cloud Services](#-google-cloud-services-used)
- [Architecture](#-architecture)
- [AI Features Deep Dive](#-ai-features-deep-dive)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)

---

## 🌟 Overview

# 🎓 CareerLens - AI-Powered Career Guidance Platform

> **Mission**: Empowering students and professionals with AI-driven career insights, personalized learning paths, and real-time industry data to bridge the gap between education and employment.

**Problem We Solve**: Students often struggle to find relevant courses, mentors, and career guidance tailored to their unique goals. CareerLens uses Google Cloud's Generative AI and real-time data aggregation to provide personalized career recommendations, skill gap analysis, and live industry insights—all in one platform.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Next.js 15 + React 18)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND SERVICES                           │
│  • Authentication (Firebase Auth + Google OAuth)                │
│  • Real-time Data Fetching (Reddit, Google Search, Web Scraper)│
│  • AI-Powered Recommendations (Gemini 2.5 Flash)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE SERVICES                            │
│  • Firestore (User Profiles, Reviews, Cached Data)             │
│  • Firebase Auth (User Management)                             │
│  • Cloud Functions (Automated Data Collection)                 │
│  • App Hosting (Next.js Deployment)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD SERVICES                        │
│  • Vertex AI / Gemini AI (Career Recommendations, Summarization)│
│  • Cloud Storage (Resume Storage, Assets)                      │
│  • Cloud Functions (Background Jobs, Schedulers)               │
│  • BigQuery (Analytics - Future)                               │
│  • Looker Studio (Dashboards - Future)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIs                                │
│  • Reddit JSON API (College Reviews)                           │
│  • Google Custom Search API (Course Discovery, Mentor Profiles)│
│  • NPTEL/Coursera/AWS/GCP APIs (Course Scraping)              │
│  • YouTube API (Educational Content)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧰 Tech Stack

### **Frontend**
- **Next.js 15** (React 18, App Router)
- **TypeScript** (Type-safe development)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **shadcn/ui** (Component library)

### **Backend & Cloud**
- **Firebase**
  - Firestore (NoSQL Database)
  - Firebase Auth (Authentication)
  - Cloud Functions (Serverless functions)
  - App Hosting (Next.js deployment)
- **Google Cloud Platform**
  - **Vertex AI / Gemini 2.5 Flash** (Generative AI)
  - **Cloud Storage** (File storage)
  - **Cloud Functions** (Background processing)
  - **BigQuery** (Analytics - Planned)
  - **Looker Studio** (Data visualization - Planned)

### **AI & Data**
- **Genkit** (AI workflow orchestration)
- **Gemini 2.5 Flash Lite** (Fast AI responses)
- **Web Scraping** (NPTEL, Coursera, AWS, GCP)
- **Real-time Data Aggregation** (Reddit, Google Search)

### **APIs & Services**
- Reddit JSON API
- Google Custom Search API
- YouTube Data API
- NPTEL/SWAYAM API
- Firebase Cloud Messaging (Push notifications)

---

## 🚀 Key Features

### 🎯 **Core Features**

#### 1. **AI-Powered Career Recommendations**
- Personalized career path suggestions based on skills, goals, and interests
- Gemini AI analyzes your profile to recommend roles, companies, and growth paths
- Real-time job market insights and salary trends

#### 2. **Skill Gap Analysis**
- Identify missing skills for your target role
- Get prioritized learning recommendations
- Track your skill development progress

#### 3. **Personalized Learning Roadmap**
- AI-generated step-by-step learning paths
- Curated courses from NPTEL, Coursera, AWS, GCP, edX
- Time estimates and difficulty levels for each step

#### 4. **AI Interview Preparation**
- Role-specific interview questions generated by Gemini AI
- Mock interview practice with feedback
- Technical and behavioral question banks
- Real-time answer evaluation

#### 5. **Interactive Resume Builder**
- ATS-friendly resume templates
- AI-powered content suggestions
- JSON-based resume generation
- One-click download in multiple formats

### 📚 **Resource Hub**

#### 6. **Free Course Discovery**
- **AI Recommendations**: Personalized course suggestions based on your profile
- **Live Web Scraping**: Real-time course data from 5+ platforms
  - NPTEL (12,000+ courses)
  - Coursera (Free audit options)
  - AWS Educate (Cloud computing)
  - Google Cloud Skills Boost (GCP certifications)
  - YouTube (Educational content)
- Smart filtering by provider, level, and topic
- Certificate availability indicators

#### 7. **Community & Reviews**
- **Reddit Integration**: Live student reviews from 7+ education subreddits
  - r/Indian_Academia, r/JEENEETards, r/Indian_Engg, etc.
- **College Reviews**: KCET, NEET, JEE, COMEDK, GATE-specific reviews
- AI-powered sentiment analysis
- Verified student experiences
- Real-time data refresh (last 24 hours)

#### 8. **Mentor Discovery**
- Find industry mentors and educators
- Filter by role, company, expertise
- Google Search integration for LinkedIn profiles
- AI-powered mentor-mentee matching (Coming soon)

### 🤖 **AI-Powered Services**

#### 9. **AI Summarization**
- Auto-summarize lengthy reviews and articles
- Sentiment analysis (positive/neutral/negative)
- Key points extraction
- Credibility scoring

#### 10. **Smart Search**
- Google Custom Search integration
- Context-aware search results
- Multi-platform course discovery
- Review aggregation from multiple sources

#### 11. **Learning Helper**
- AI-powered doubt clearing
- Explain complex concepts in simple terms
- Step-by-step problem solving
- Resource recommendations based on queries

### 📅 **Productivity Tools**

#### 12. **AI Calendar & Task Management** (New!)
- Google Calendar integration
- AI-suggested events based on career goals
- Smart scheduling with conflict detection
- Event reminders and notifications
- Track learning streaks and productivity

#### 13. **Progress Tracking**
- Visual career graph showing your journey
- Skill progression over time
- Achievement badges and milestones
- Goal completion tracking

### 🔍 **Discovery Features**

#### 14. **Real-Time Data Aggregation**
- **Reddit API Service**: Fetch live college reviews
- **Web Scraper Service**: Scrape 5 platforms for fresh courses
- **Google Search Service**: Discover mentors and resources
- Automated background refresh via Cloud Functions

#### 15. **Library Finder**
- Find nearby libraries and study spaces
- Google Maps integration
- Distance calculation and directions

### 🎨 **UI/UX Features**

#### 16. **Modern Interface**
- Dark mode optimized
- Smooth animations (Framer Motion)
- Responsive design (mobile-first)
- Glassmorphic cards and gradients
- Loading states and skeletons

#### 17. **Profile Management**
- Comprehensive user profiles
- Skills and interests tracking
- Experience and education history
- Career goals and objectives
- Photo upload and customization

---

## 🔐 Authentication & Security

### **Firebase Authentication**
- **Google OAuth 2.0** (One-click sign-in)
- **Email/Password** authentication
- Protected routes and API endpoints
- Secure token-based sessions

### **Firestore Security Rules**
- User data isolation (read/write own documents only)
- Public read access for reviews and resources
- Role-based access control
- Rate limiting on write operations

---

## 🧩 Unique Selling Points (USP)

### ⭐ **Fully Google Cloud Integrated**
- Leverages **Gemini 2.5 Flash** for lightning-fast AI responses
- Built on **Firebase** (Google's BaaS platform)
- Uses **Google Cloud Functions** for serverless automation
- Integrated with **Google Calendar**, **Google Maps**, **YouTube API**
- Ready for **BigQuery** analytics and **Looker Studio** dashboards
- Deployed on **Firebase App Hosting** with auto-scaling

### ⚡ **Real-Time AI Insights**
- **Live data aggregation** from Reddit, Google Search, and 5+ course platforms
- **AI-powered summarization** of reviews and articles in seconds
- **Instant course recommendations** based on your profile
- **Real-time scraping** of NPTEL, Coursera, AWS, GCP, YouTube
- **Background Cloud Functions** refresh data every 24 hours automatically
- **No stale data** - always get the latest industry insights

### 🎯 **Personalization at Scale**
- Every recommendation is **uniquely tailored** to your profile
- **Context-aware AI** understands your career goals and adapts
- **Multi-dimensional matching**: skills, interests, experience, location
- **Continuous learning** from your interactions and feedback

---

## 🧠 Future Enhancements

### 🚧 **Planned Features**

#### 1. **AI Chat Mentor** 💬
- Real-time conversational AI mentor powered by Gemini
- Context-aware career guidance
- Natural language interaction
- Personalized advice based on your profile and goals
- Integration with Google Workspace for calendar scheduling

#### 2. **AI Interview Simulator** 🎙️
- Live mock interviews with AI interviewer
- Speech-to-text for answer recording
- Real-time feedback on communication skills
- Role-play different interview scenarios (technical, behavioral, HR)
- Video analysis for body language tips

#### 3. **AI-Driven Course Planner** 📚
- Automatically generate learning schedules
- Sync with Google Calendar
- Adaptive difficulty based on progress
- Spaced repetition for skill retention
- Integration with learning platforms (NPTEL, Coursera)

#### 4. **BigQuery Analytics Dashboard** 📊
- Track platform-wide trends
- Analyze user behavior patterns
- Course popularity metrics
- Career path success rates
- Mentor effectiveness scoring

#### 5. **Looker Studio Dashboards** 📈
- Visual analytics for admins
- Real-time user engagement metrics
- Course completion rates
- Skill gap trending analysis
- Geographic distribution of users

#### 6. **Mobile App** 📱
- React Native iOS/Android apps
- Offline mode for resumes and roadmaps
- Push notifications for interview prep
- Quick access to learning resources

#### 7. **Blockchain Certifications** 🔗
- Issue verifiable certificates on blockchain
- NFT badges for achievements
- Tamper-proof credential verification

---

## 🧭 Setup Instructions

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Firebase account
- Google Cloud account
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/balaraj74/CareerLens.git
cd CareerLens
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Configure Environment Variables**

Create a `.env.local` file in the root directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google AI (Gemini) API Key
GOOGLE_GENAI_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# Google Maps API Key (for library finder)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Google Custom Search API
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_search_api_key
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# YouTube API (optional)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

# Environment
NODE_ENV=development
```

### **4. Get API Keys**

#### **Firebase Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable **Firestore Database**, **Authentication**, **Storage**
4. Get your Firebase config from Project Settings
5. Enable **Google OAuth** in Authentication > Sign-in method

#### **Gemini AI API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into `.env.local`

#### **Google Custom Search API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Custom Search API**
3. Create credentials > API Key
4. Create a Custom Search Engine at [cse.google.com](https://cse.google.com/cse/)
5. Copy Search Engine ID

#### **Google Maps API** (Optional)
1. Enable **Maps JavaScript API** in Google Cloud
2. Create an API key
3. Restrict to Maps JavaScript API

### **5. Deploy Firestore Security Rules**
```bash
firebase deploy --only firestore:rules
```

### **6. Run Development Server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### **7. Build for Production**
```bash
npm run build
npm run start
```

### **8. Deploy to Firebase App Hosting**
```bash
# Login to Firebase
firebase login

# Deploy
firebase apphosting:rollouts:create <backend-name>
```

---

## 🌐 Demo & Deployment

### **Live Demo**
🔗 **Production URL**: [https://careerlens--careerlens-1.us-central1.hosted.app](https://careerlens--careerlens-1.us-central1.hosted.app)

### **Deployment Platform**
- **Hosting**: Firebase App Hosting (powered by Cloud Run)
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Cloud Storage
- **Functions**: Firebase Cloud Functions + Google Cloud Functions
- **CI/CD**: Automatic deployment from GitHub `main` branch

### **Performance Metrics**
- ⚡ First Load JS: ~300 KB (optimized)
- 🚀 Lighthouse Score: 90+ (Performance)
- 📱 Fully Responsive (mobile, tablet, desktop)
- 🌍 Global CDN Distribution

---

## 📊 Project Stats

- **Total Lines of Code**: ~26,000+ lines
- **Services Built**: 9 production services
  - Reddit API Service (321 lines)
  - Google Search Service (516 lines)
  - Web Scraper Service (612 lines)
  - AI Summarizer Service (501 lines)
  - Community Service (410 lines)
  - Resource Hub Service (382 lines)
  - Mentor Chat Service (475 lines)
  - Google Calendar Service (485 lines)
  - AI Calendar Suggestions (398 lines)
- **Cloud Functions**: 5 automated functions (1,132 lines)
- **UI Components**: 50+ reusable components
- **Pages**: 15+ main pages
- **Integration Points**: 7 external APIs

---

## 👥 Credits & Team

### **Developer**
**Balaraj R**  
📧 Email: [balarajr483@gmail.com](mailto:balarajr483@gmail.com)  
🐙 GitHub: [@balaraj74](https://github.com/balaraj74)

### **Built For**
🏆 **Google GenAI Hackathon 2025**

### **Powered By**
- 🤖 **Google Gemini AI** (Generative AI)
- 🔥 **Firebase** (Backend as a Service)
- ☁️ **Google Cloud Platform** (Infrastructure)
- ⚛️ **Next.js** (React Framework)

### **Special Thanks**
- Google Cloud Team for Gemini API access
- Firebase team for excellent documentation
- Next.js team for the amazing framework
- shadcn/ui for beautiful components

---

## 📄 License

This project is built for educational purposes as part of the **Google GenAI Hackathon 2025**.

---

## 🤝 Contributing

While this is primarily a hackathon project, contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact & Support

For questions, feedback, or collaboration:
- 📧 Email: [balarajr483@gmail.com](mailto:balarajr483@gmail.com)
- 🐙 GitHub: [@balaraj74](https://github.com/balaraj74)
- 💼 LinkedIn: [Connect with me](https://www.linkedin.com/in/balaraj-r)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by Balaraj R for Google GenAI Hackathon 2025**

</div>

### 🎯 Mission

To democratize career development by providing every professional with access to AI-powered career coaching, personalized learning paths, and intelligent job search tools.

---

## 🚀 Core Features

### 1. 👤 **Intelligent Profile Management**
- Multi-tab profile editor (6 comprehensive sections)
- Gamified dashboard with 3D visuals
- Achievement tracking and milestones
- Real-time Firebase sync

### 2. 🎓 **AI Career Hub**
- **AI Skills Recommender** (620 lines): Personalized skill development paths
- **AI Project Generator** (580 lines): Context-aware project recommendations
- **Certification Hub** (450 lines): 25+ curated certifications

### 3. 🧠 **AI Learning Helper**
- PDF document analysis with 4 modes
- Quick Points, Deep Dive, Mind Map, Exam Mode
- Powered by Gemini 2.5 Flash Lite

### 4. 📊 **Career Graph & Analytics**
- GitHub-style 365-day activity heatmap
- Skill network graph visualization
- AI-powered readiness score
- Personalized recommendations

### 5. 📄 **ATS-Optimized Resume Builder**
- Smart resume generation from profile
- ATS score analysis
- Job-specific tailoring
- Resume parser for existing resumes

### 6. 🎤 **AI Interview Preparation**
- Mock interview with conversational AI
- Role-specific questions with model answers
- Voice recognition support

### 7. 📅 **AI Career Calendar** 🆕
- **Google Calendar Integration**: Sync events, create/edit tasks
- **AI Event Suggestions**: Gemini-powered personalized recommendations
- **Smart Reminders**: Firebase Cloud Messaging notifications
- **Today's Tasks Widget**: Interactive task completion tracking
- **Productivity Analytics**: Streak tracking, scores, insights
- **Modern UI**: Glassmorphic design with smooth animations

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.3.3** - React framework
- **React 18.3.1** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### AI & Machine Learning
- **Google Gemini 2.5 Flash Lite** - Primary AI model
- **Genkit 1.21.0** - AI orchestration

### Backend & Services
- **Firebase 11.9.1**
  - Authentication
  - Firestore Database
  - Hosting & App Hosting

---

## ☁️ Google Cloud Services Used

### 1. 🤖 **Vertex AI & Gemini API**
- **Gemini 2.5 Flash Lite** for all AI features
- Career recommendations
- Resume optimization
- Interview preparation
- Document analysis

### 2. 🔥 **Firebase Suite**

#### Authentication
- Email/Password & Google OAuth 2.0
- Session management

#### Cloud Firestore
```
firestore/
├── users/{userId}/profile
├── resumes/{resumeId}
└── interviews/{interviewId}
```

#### Firebase Hosting
- **Static**: `careerlens-1.web.app`
- **App Hosting**: `careerlens--careerlens-1.us-central1.hosted.app`

#### Configuration
```yaml
runConfig:
  minInstances: 0
  maxInstances: 3
  cpu: 1
  memoryMiB: 1024
```

---

## 🏗️ Architecture

```
Client Layer (Next.js 15)
      ↓
Server Actions (Type-safe API)
      ↓
Genkit AI Flows
      ↓
Google Gemini API
      ↓
Firebase Firestore
```

---

## 🤖 AI Features Deep Dive

### AI Skills Recommender
**Algorithm**:
1. Analyze user profile
2. Query Gemini with context
3. Generate 6 personalized recommendations
4. Calculate relevance scores
5. Fallback to curated data

### AI Project Generator
**Strategy**:
- Match complexity to skill level
- Use existing skills + 1-2 new ones
- Provide implementation guides
- 7 curated templates as fallback

### Resume Intelligence
**Components**:
- Parser (PDF/DOCX)
- Generator (Template-based)
- ATS Analyzer (Scoring algorithm)

### Conversational AI Interviewer
- Context-aware questions
- Real-time feedback
- Voice recognition
- Performance scoring

---

## 📁 Project Structure

```
CareerLens/
├── src/
│   ├── ai/flows/              # Genkit AI Flows
│   ├── app/                   # Next.js Pages
│   ├── components/            # React Components
│   ├── hooks/                 # Custom Hooks
│   └── lib/                   # Services & Utils
├── apphosting.yaml            # Firebase Config
├── next.config.ts             # Next.js Config
└── package.json               # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase account
- Google Cloud with Gemini API

### Installation

1. Clone repository
```bash
git clone https://github.com/balaraj74/CareerLens.git
cd CareerLens
```

2. Install dependencies
```bash
npm install
```

3. Setup environment
```bash
cp .env.local.example .env.local
```

4. Configure Firebase
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
GOOGLE_GENAI_API_KEY=your_gemini_key
```

5. Run development server
```bash
npm run dev
```

6. Open browser
```
http://localhost:3000
```

---

## 📦 Deployment

### Firebase App Hosting
```bash
npm run build
firebase apphosting:rollouts:create careerlens -b main -f
```

---

## 📊 Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Bundle Size: < 300KB

---

## 👥 Team

- **Developer**: Balaraj R
- **GitHub**: [@balaraj74](https://github.com/balaraj74)
- **Email**: balarajr483@gmail.com

---

## 🙏 Acknowledgments

- Next.js - React Framework
- Firebase - Backend Infrastructure
- Google Gemini - AI/ML Models
- Genkit - AI Orchestration
- Shadcn/UI - Components
- Tailwind CSS - Styling

---

<div align="center">

**Built with ❤️ using Google Cloud Technologies**

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
![Google AI](https://img.shields.io/badge/Google%20AI-purple?style=flat-square&logo=google)

</div>
