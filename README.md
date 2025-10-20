
# CareerLens: Your AI-Powered Career Co-Pilot

Welcome to CareerLens, a modern web application built with Next.js and Firebase, designed to be your personal AI-powered career assistant. This project leverages the power of Google's generative AI models to provide a comprehensive suite of tools for career exploration, skill development, and interview preparation.

This document provides a detailed overview of the application's architecture, features, and the development journey.

## 🚀 Core Features

CareerLens is packed with features designed to assist users at every stage of their career journey.

### 1. User Authentication & Profile Management
- **Secure Authentication:** Users can sign up and log in using email/password or Google (OAuth).
- **Comprehensive User Profile:** A multi-step form allows users to input their personal details, educational background, work experience, skills, and career goals. This profile data is securely stored in Firebase Firestore and serves as the foundation for all personalized AI recommendations.

### 2. AI-Powered Career Services
- **Career Recommendations:** Based on the user's profile, the AI suggests the top 3 career paths, providing reasons for the fit, identifying skill gaps, and offering a preliminary 3-month learning plan.
- **Skill Gap Analysis:** Users can input their current skills and the requirements for a target role. The AI analyzes the two, highlights overlapping skills, identifies missing ones, and suggests a logical learning order.
- **Personalized Learning Roadmap:** Generates a detailed 12-week learning plan to bridge identified skill gaps, complete with weekly topics and links to both free and paid online resources.
- **ATS-Optimized Resume Builder:** Creates a professional, ATS-friendly resume by merging the user's stored profile with manual overrides. It can also tailor the resume to a specific job description and provides an ATS score with recommendations for improvement.
- **Interview Prep:** Generates a list of role-specific interview questions categorized by difficulty (Easy, Medium, Hard), complete with model answers to help users prepare.

### 3. AI Learning Helper
- **PDF-to-Study-Guide:** Users can upload a PDF (e.g., lecture notes, a chapter from a book), and the AI processes it to generate a multi-faceted study guide, including:
  - **Quick Points:** A bulleted summary of key takeaways.
  - **Deep Dive:** A detailed explanation of core concepts.
  - **Mind Map:** A hierarchical JSON structure of the document's topics.
  - **Exam Mode:** An interactive quiz with multiple-choice questions based on the document content.

### 4. The AI Interviewer
- **Conversational Mock Interviews:** Users can engage in a mock interview with a conversational AI. The AI asks questions based on the user's profile and the job they are applying for. The architecture is built to support a full conversational loop.

---

## 🛠️ Technology Stack

CareerLens is built on a modern, robust, and scalable technology stack.

- **Frontend:** [Next.js](https://nextjs.org/) (with App Router) & [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [ShadCN/UI](https://ui.shadcn.com/) for a sleek, component-based design system.
- **AI Orchestration:** [Genkit](https://firebase.google.com/docs/genkit)
- **Generative AI Models:**
  - **Language:** Google's `gemini-2.5-flash-lite` for all text-based generation, analysis, and reasoning.
- **Backend-as-a-Service:** [Firebase](https://firebase.google.com/)
  - **Authentication:** Firebase Authentication for secure user management.
  - **Database:** Firestore for storing user profiles and application data.
- **Deployment:** The application is configured for deployment via Firebase App Hosting and includes a GitHub Actions workflow for continuous deployment.

---

## 🧑‍💻 Development Process & Architecture

This application was developed iteratively, starting with a basic Next.js and Firebase foundation and progressively adding layers of functionality.

### Initial Setup
The project began by setting up a Next.js application and integrating Firebase for authentication and database services. A `FirebaseProvider` was created to manage the Firebase app initialization and provide the Auth and Firestore instances to the rest of the application via React Context.

### Building Core AI Features
The initial development focused on creating the core AI-powered career services. For each feature, a similar pattern was followed:
1.  **Genkit Flow:** An AI flow was defined in a `src/ai/flows/*.ts` file using Genkit. This flow encapsulates the logic for interacting with the Gemini model, including the prompt, input/output schemas (using Zod), and any data transformation.
2.  **Server Action:** A Next.js Server Action was created in `src/lib/actions.ts` to act as a bridge between the client and the server-side Genkit flow. This action handles input validation and error handling.
3.  **React Component:** A client-side React component was built in the `src/components/` directory to provide the user interface for the feature, manage form state, and call the Server Action.

### The AI Interviewer - An Advanced Implementation
The AI Interviewer feature represents a complex integration in the app.
1.  **Initial UI:** The UI was scaffolded to resemble a chat application, with a main window for the transcript.
2.  **Conversational Logic:** A dedicated flow, `ai-interviewer-flow.ts`, was created to handle the conversational aspect. It takes the entire conversation transcript as context to generate relevant follow-up questions, making the interaction feel like a real interview.

### Firebase Integration Details
- **Project ID:** The application is connected to the Firebase project with the ID `careerlens-1`.
- **Services:** It uses **Firebase Authentication** for user sign-in and **Firestore** as the database.
- **Data Model:** A `users` collection in Firestore stores a document for each user (keyed by their `uid`), which contains the profile data conforming to the `userProfileSchema` defined in `src/lib/types.ts`.
- **Client-Side SDK:** All interactions with Firebase from the frontend are handled through the official Firebase client-side SDK, managed via the `FirebaseProvider`.
