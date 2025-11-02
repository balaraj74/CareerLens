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

**CareerLens** is a comprehensive, AI-powered career development platform that leverages Google's cutting-edge AI technologies to provide personalized career guidance, skill development recommendations, interview preparation, and intelligent resume optimization.

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
