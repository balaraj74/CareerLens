# CareerLens Project Structure

## Architecture Overview

```
Client Layer (Next.js 15 App Router)
      ↓
Server Actions & API Routes (Type-safe)
      ↓
Genkit AI Flows (Orchestration)
      ↓
Google Gemini API (AI Processing)
      ↓
Firebase Services (Backend)
      ↓
External APIs (Reddit, Internet Archive, etc.)
```

## Directory Structure

### Root Level
```
CareerLens/
├── src/                    # Application source code
├── functions/              # Firebase Cloud Functions
├── docs/                   # Comprehensive documentation
├── scripts/                # Deployment and verification scripts
├── .amazonq/               # Amazon Q rules and memory bank
├── .firebase/              # Firebase configuration cache
├── .github/                # GitHub Actions workflows
├── .next/                  # Next.js build output
├── apphosting.yaml         # Firebase App Hosting config
├── firebase.json           # Firebase project config
├── firestore.rules         # Firestore security rules
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

### Source Directory (`src/`)

#### AI Layer (`src/ai/`)
- **flows/**: Genkit AI workflow definitions
- **schemas/**: Zod schemas for AI input/output validation
- **genkit.ts**: Genkit initialization and configuration
- **dev.ts**: Development server for AI flows

#### Application Layer (`src/app/`)
Next.js 15 App Router structure with route-based organization:

**Core Pages:**
- `page.tsx` - Landing page
- `layout.tsx` - Root layout with providers
- `globals.css` - Global styles and Tailwind imports

**Feature Routes:**
- `ai-career-hub/` - AI skills recommender, project generator, certifications
- `ai-interviewer/` - Mock interview with conversational AI
- `calendar/` - AI calendar with Google Calendar integration
- `career-graph/` - Analytics dashboard with heatmap and skill graph
- `colleges/` - College recommendations with Reddit reviews
- `community/` - Community reviews and discussions
- `ebooks/` - Internet Archive book search (20M+ books)
- `interview-prep/` - Interview preparation resources
- `learning-helper/` - PDF analysis with AI (4 modes)
- `library-finder/` - Google Maps library locator
- `mentors/` - Mentor discovery and matching
- `profile/` - User profile management (6 tabs)
- `recommendations/` - Career path recommendations
- `resources/` - Course discovery hub
- `resume/` - Resume builder and parser
- `roadmap/` - Personalized learning roadmap
- `skill-gap/` - Skill gap analysis
- `login/` & `signup/` - Authentication pages

**API Routes (`src/app/api/`):**
- `reddit-search/` - Server-side Reddit API proxy (CORS bypass)
- `college-recommendations/` - College search endpoint (42 colleges)
- `parse-resume/` - Resume parsing service

#### Components Layer (`src/components/`)

**Feature Components:**
- `ai-interviewer/` - Interview UI components
- `auth/` - Login/signup forms
- `calendar/` - Calendar widgets and event forms
- `career-graph/` - Heatmap, skill graph, analytics charts
- `community/` - College cards, review displays
- `dashboard/` - Dynamic dashboard with gamification
- `interview-prep/` - Interview question cards
- `learning-helper/` - PDF viewer and analysis modes
- `library-finder/` - Map integration
- `profile/` - Profile editor tabs
- `recommendations/` - Recommendation cards
- `resume/` - Resume templates and editor
- `roadmap/` - Learning path visualization
- `skill-gap/` - Gap analysis charts

**UI Components (`src/components/ui/`):**
Reusable shadcn/ui components:
- Buttons, Cards, Dialogs, Dropdowns
- Forms (Input, Select, Checkbox, Radio)
- Navigation (Tabs, Accordion, Collapsible)
- Feedback (Toast, Alert, Progress)
- Data Display (Avatar, Badge, Separator)
- Layout (ScrollArea, Sheet, Popover)

**Layout Components:**
- `nav.tsx` - Desktop navigation
- `nav-mobile.tsx` - Mobile navigation
- `modern-bottom-nav.tsx` - Bottom navigation bar
- `app-layout.tsx` - Main layout wrapper
- `splash-screen.tsx` - Loading screen

#### Library Layer (`src/lib/`)

**Services (`src/lib/services/`):**
Business logic organized by domain:

- `reddit-service.ts` (358 lines) - Reddit API client with mock data
- `internet-archive-service.ts` (180 lines) - Book search API
- `bookmark-service.ts` (100 lines) - LocalStorage bookmark management
- `google-search-service.ts` (516 lines) - Google Custom Search integration
- `web-scraper-service.ts` (612 lines) - Multi-platform course scraping
- `ai-summarizer-service.ts` (501 lines) - AI-powered summarization
- `community-service.ts` (410 lines) - Community features
- `resource-hub-service.ts` (382 lines) - Resource aggregation
- `mentor-chat-service.ts` (475 lines) - Mentor matching
- `fetch-career-data.ts` - Career data aggregation

**Core Services:**
- `firebase.ts` - Firebase initialization
- `firebase-provider.tsx` - Firebase context provider
- `enhanced-profile-service.ts` (566 lines) - Profile management with XP/achievements
- `profile-service.ts` - Basic profile operations
- `calendar-service.ts` - Calendar logic
- `google-calendar-service.ts` (485 lines) - Google Calendar API integration
- `ai-calendar-suggestions.ts` (398 lines) - AI event recommendations
- `career-graph-service.ts` - Career analytics
- `fcm-service.ts` - Firebase Cloud Messaging
- `notifications.ts` - Notification handling

**AI Services:**
- `ai-skill-recommender.ts` (620 lines) - Skill recommendations
- `ai-project-generator.ts` (580 lines) - Project suggestions
- `certification-recommender.ts` (450 lines) - Certification recommendations

**Resume Services:**
- `resume-parser.ts` - Client-side resume parsing
- `resume-parser-server.ts` - Server-side parsing
- `resume-pdf-generator.ts` - PDF generation

**Utilities:**
- `types.ts` - TypeScript type definitions
- `calendar-types.ts` - Calendar-specific types
- `utils.ts` - Helper functions
- `actions.ts` - Server actions
- `placeholder-images.json` - Image placeholders

#### Hooks (`src/hooks/`)
- `use-auth.tsx` - Authentication hook with Firebase Auth
- `use-toast.ts` - Toast notification hook

### Cloud Functions (`functions/`)

**Structure:**
```
functions/
├── src/                    # TypeScript source
│   ├── services/           # Service layer
│   │   └── learning-service.ts
│   ├── fetchCareerIntelligence.ts
│   ├── fetchMentors.ts
│   ├── fetchResources.ts
│   ├── fetchReviews.ts
│   ├── notifyUsers.ts
│   ├── summarizeData.ts
│   └── index.ts            # Function exports
├── lib/                    # Compiled JavaScript
├── event-reminders.ts      # Calendar reminder function
├── package.json            # Function dependencies
└── tsconfig.json           # TypeScript config
```

**Functions:**
1. `fetchCareerIntelligence` - Aggregate career data (scheduled)
2. `fetchMentors` - Scrape mentor profiles (scheduled)
3. `fetchResources` - Update course catalog (scheduled)
4. `fetchReviews` - Collect community reviews (scheduled)
5. `notifyUsers` - Send push notifications (triggered)
6. `summarizeData` - AI summarization (triggered)
7. `eventReminders` - Calendar reminders (scheduled)

### Documentation (`docs/`)

**Setup Guides:**
- `QUICK_START.md` - Getting started guide
- `DATABASE-SETUP.md` - Firestore setup
- `DEPLOYMENT-CHECKLIST.md` - Deployment steps
- `TESTING-GUIDE.md` - Testing instructions

**Feature Documentation:**
- `COLLEGE-RECOMMENDATIONS-FEATURE.md` - College system
- `EBOOKS-FEATURE.md` - eBooks library
- `REDDIT-INTEGRATION-COMPLETE.md` - Reddit API
- `ai-calendar-setup.md` - Calendar integration
- `career-graph-feature.md` - Analytics dashboard
- `CAREER-INTELLIGENCE-HUB.md` - Intelligence features

**Technical Docs:**
- `FIREBASE-PERMISSIONS-FIX.md` - Security rules
- `CLOUD-FUNCTIONS-DEPLOYMENT.md` - Function deployment
- `REAL_TIME_DATA_SYSTEM.md` - Data aggregation
- `REDDIT-API-LIMITATIONS.md` - API constraints

## Architectural Patterns

### Component Architecture
- **Atomic Design**: UI components built from atoms to organisms
- **Feature-Based**: Components organized by feature domain
- **Composition**: Reusable components with props and children
- **Server/Client Split**: RSC for data fetching, client components for interactivity

### Data Flow
1. **User Action** → Component event handler
2. **Service Call** → Business logic in `src/lib/services/`
3. **API Request** → Firebase/External API
4. **State Update** → React state or Firebase real-time listener
5. **UI Render** → Component re-renders with new data

### State Management
- **Local State**: React useState for component-level state
- **Context**: Firebase context for auth, user profile
- **Server State**: Next.js server components for initial data
- **Real-time**: Firestore listeners for live updates
- **Cache**: LocalStorage for bookmarks, search history

### Authentication Flow
1. User signs in via Google OAuth or email/password
2. Firebase Auth creates session token
3. Token stored in browser (httpOnly cookie)
4. Protected routes check auth state
5. User data synced to Firestore

### AI Integration Pattern
1. User input → Zod schema validation
2. Genkit flow invocation with context
3. Gemini API call with structured prompts
4. Response parsing and formatting
5. Result caching in Firestore (optional)
6. UI update with AI-generated content

## Key Integration Points

### Firebase Services
- **Authentication**: Google OAuth, email/password
- **Firestore Collections**: users, profiles, resumes, interviews, activities, eventReminders, fcmTokens, cache, colleges
- **Cloud Functions**: 7 scheduled/triggered functions
- **App Hosting**: Next.js deployment on Cloud Run
- **Cloud Messaging**: Push notifications

### External APIs
- **Reddit JSON API**: College reviews (server-side proxy)
- **Internet Archive API**: 20M+ book search
- **Google Custom Search API**: Content discovery
- **Google Calendar API**: Event management
- **Google Maps API**: Library finder
- **YouTube Data API**: Video recommendations
- **NPTEL/Coursera APIs**: Course scraping

### AI Services
- **Gemini 2.5 Flash Lite**: Primary AI model
- **Genkit 1.21.0**: AI workflow orchestration
- **Use Cases**: Career recommendations, skill analysis, project generation, interview prep, document analysis, summarization

## Configuration Files

### Next.js (`next.config.ts`)
- TypeScript/ESLint build error ignoring (for rapid development)
- Image optimization for external domains
- Standalone output for Firebase App Hosting
- Webpack alias for `@/` imports

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- Incremental compilation
- Excludes: node_modules, functions

### Firebase (`firebase.json`)
- Hosting configuration
- Firestore rules and indexes
- Cloud Functions settings
- Emulator configuration

### App Hosting (`apphosting.yaml`)
- Cloud Run configuration
- Auto-scaling: 0-3 instances
- Resources: 1 CPU, 1024 MiB memory
- Environment: Node.js 18+

## Deployment Architecture

### Production Environment
- **Hosting**: Firebase App Hosting (Cloud Run)
- **URL**: careerlens--careerlens-1.us-central1.hosted.app
- **Database**: Firestore (multi-region)
- **Functions**: Cloud Functions (us-central1)
- **CDN**: Global Firebase CDN
- **CI/CD**: GitHub Actions → Firebase deploy

### Development Environment
- **Local Server**: `npm run dev` (localhost:3000)
- **AI Dev Server**: `npm run genkit:dev` (Genkit UI)
- **Emulators**: Firebase emulators for local testing
- **Hot Reload**: Next.js Fast Refresh
