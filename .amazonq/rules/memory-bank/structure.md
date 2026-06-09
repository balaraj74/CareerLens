# CareerLens Project Structure

## Repository Overview
CareerLens is a Next.js 15 monorepo with Firebase backend, organized into source code, documentation, Firebase functions, and reusable skills/patterns.

## Directory Structure

### `/src` - Main Application Source
```
src/
├── ai/                    # Genkit AI workflows and schemas
│   ├── flows/            # AI flow definitions (rewrite-resume-section, etc.)
│   ├── schemas/          # Zod validation schemas for AI inputs/outputs
│   ├── dev.ts            # Genkit development server
│   └── genkit.ts         # Genkit configuration (Gemini 1.5 Pro, 2.5 Flash)
│
├── app/                   # Next.js 15 App Router pages
│   ├── api/              # API routes (college-recommendations, reddit-search, news, ebooks, etc.)
│   ├── ai-career-hub/    # AI career insights hub
│   ├── ai-interviewer/   # AI mock interview feature
│   ├── calendar/         # AI-powered calendar with Google Calendar sync
│   ├── career-graph/     # Interactive career visualization (React Flow)
│   ├── career-navigator/ # AI career path recommendations
│   ├── career-updates/   # Industry news feed
│   ├── colleges/         # College recommendations (42 colleges)
│   ├── community/        # Reddit reviews integration
│   ├── ebooks/           # Internet Archive eBooks library (20M+)
│   ├── english-helper/   # AI language learning assistant
│   ├── interview-prep/   # Interview preparation tools
│   ├── learning-helper/  # Learning resource discovery
│   ├── library-finder/   # Google Maps library search
│   ├── mentors/          # Mentor discovery feature
│   ├── news/             # NewsAPI integration
│   ├── profile/          # User profile management (gamified)
│   ├── recommendations/  # Course recommendations
│   ├── resume/           # AI resume builder and optimizer
│   ├── roadmap/          # Learning roadmaps
│   ├── skill-gap/        # Skill gap analyzer
│   ├── globals.css       # Global styles (Tailwind, glassmorphism)
│   ├── layout.tsx        # Root layout with Firebase provider
│   └── page.tsx          # Dashboard homepage
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components (40+ components: button, card, dialog, etc.)
│   ├── ai-interviewer/   # AI interview components
│   ├── auth/             # Authentication components
│   ├── calendar/         # Calendar widgets
│   ├── career-graph/     # Career graph visualization components
│   ├── community/        # Community/Reddit components
│   ├── dashboard/        # Dashboard widgets
│   ├── interview-prep/   # Interview prep components
│   ├── learning-helper/  # Learning helper components
│   ├── library-finder/   # Library finder map components
│   ├── profile/          # Profile editor components
│   ├── resume/           # Resume builder components
│   └── [shared components] # nav.tsx, splash-screen.tsx, etc.
│
├── hooks/                 # Custom React hooks
│   ├── use-auth.tsx      # Firebase authentication hook
│   ├── use-background-jobs.ts # Background job management
│   └── use-toast.ts      # Toast notification hook
│
├── lib/                   # Core libraries and services
│   ├── services/         # Service layer (reddit-api-service, resource-hub-service, etc.)
│   ├── queue/            # BullMQ job queue implementation
│   ├── bigquery/         # BigQuery analytics integration
│   ├── types/            # TypeScript type definitions
│   ├── firebase.ts       # Firebase client SDK initialization
│   ├── firebase-admin.ts # Firebase Admin SDK (server-side)
│   ├── firebase-provider.tsx # Firebase context provider
│   ├── actions.ts        # Server actions
│   ├── ai-*.ts           # AI service files (calendar, project generator, skill recommender, etc.)
│   ├── calendar-service.ts   # Calendar business logic
│   ├── google-calendar-service.ts # Google Calendar API integration
│   ├── google-search-service.ts   # Google Custom Search API
│   ├── resume-parser.ts  # Resume parsing logic
│   ├── web-scraper-service.ts     # Course scraping service
│   └── utils.ts          # Utility functions
│
├── scripts/               # Utility scripts
│   ├── list-models.ts    # List available Gemini models
│   └── test-gemini.ts    # Test Gemini API connectivity
│
└── types/                 # Global TypeScript types
    └── modules.d.ts      # Module declarations
```

### `/functions` - Firebase Cloud Functions
```
functions/
├── src/                   # TypeScript source for Cloud Functions
├── lib/                   # Compiled JavaScript output
├── index.js              # Main Cloud Functions entry point
├── event-reminders.ts    # Calendar reminder Cloud Function
├── package.json          # Cloud Functions dependencies (Node.js 20)
└── tsconfig.json         # TypeScript config for functions
```

### `/docs` - Comprehensive Documentation
- 80+ markdown files covering features, deployment, APIs, architecture
- Key docs: README.md, QUICK_START.md, API-SETUP-GUIDE.md, GCP_SETUP_GUIDE.md

### `/skills` - Reusable Development Skills
- 600+ skill directories with patterns, templates, and best practices
- Categories: Azure, AWS, backend, frontend, security, testing, AI/ML, etc.
- Notable: `docx/`, `notebooklm/`, `app-store-optimization/`

### `/apps` - Monorepo Applications
```
apps/
└── mobile/               # React Native/Expo mobile app (planned)
```

### `/scripts` - Automation Scripts
- `check-firestore.js`: Firestore connection verification
- `create-secrets.sh`: Firebase secret setup
- `deploy-*.sh`: Deployment automation scripts
- `setup-bigquery.sh`: BigQuery configuration

### `/tests` - Test Suites
```
tests/
├── integration/          # Integration tests
└── job-manager.test.ts  # Background job tests
```

### Root Configuration Files
- `next.config.ts`: Next.js configuration (standalone output, image domains, webpack aliases)
- `tsconfig.json`: TypeScript config (ES2020, bundler resolution, path aliases)
- `tailwind.config.ts`: Tailwind CSS config (glassmorphism utilities, neon colors)
- `firebase.json`: Firebase project configuration (hosting, Firestore rules)
- `firestore.rules`: Firestore security rules for 8 collections
- `apphosting.yaml`: Firebase App Hosting config (2 vCPUs, 2GB RAM, auto-scaling 0-10)
- `package.json`: Dependencies (Next.js 15.5.7, React 18, Firebase 11.9.1, Genkit 1.21.0)

## Architectural Patterns

### Multi-Layer Architecture
1. **Presentation Layer**: React components, Next.js pages (19+ pages)
2. **Application Layer**: API routes (10+ routes), server actions
3. **Service Layer**: Business logic in `/lib/services` (14 services)
4. **Infrastructure Layer**: Firebase (Auth, Firestore, Storage, Hosting, Functions)
5. **Integration Layer**: External APIs (Google, Reddit, Internet Archive, NewsAPI)

### Key Design Patterns
- **API Proxy Pattern**: CORS bypass for Reddit, NewsAPI (server-side proxies in `/app/api`)
- **Service Layer Pattern**: Separation of concerns (calendar-service.ts, profile-service.ts, etc.)
- **Repository Pattern**: Firestore data access abstraction
- **Observer Pattern**: Firestore real-time listeners for live updates
- **Singleton Pattern**: Firebase initialization (firebase.ts, firebase-admin.ts)
- **Factory Pattern**: AI service creation (genkit.ts)

### Data Flow
1. User Action → Client Component (React)
2. Client → API Route (Next.js server-side)
3. API Route → Service Layer (business logic)
4. Service → External APIs / Firestore / Gemini AI
5. Response → API Route → Client → UI Update

### Core Component Relationships
- **Authentication**: `use-auth.tsx` ↔ `firebase.ts` ↔ Firebase Auth
- **AI Features**: Components ↔ `/app/api/ai/*` ↔ `genkit.ts` ↔ Gemini API
- **College Finder**: `colleges/page.tsx` ↔ `/app/api/college-recommendations` ↔ `community-service.ts` ↔ `/app/api/reddit-search`
- **Calendar**: `calendar/page.tsx` ↔ `/app/api/calendar/*` ↔ `google-calendar-service.ts` ↔ Google Calendar API
- **eBooks**: `ebooks/page.tsx` ↔ `/app/api/ebooks/archive/*` ↔ Internet Archive API

## Firestore Collections
- `users`: User accounts
- `profiles`: User profile data (6 sections)
- `reviews`: College reviews
- `colleges`: 42 colleges database
- `cache`: API response caching (5-min TTL)
- `activities`: User activity tracking
- `eventReminders`: Calendar reminders
- `fcmTokens`: Push notification tokens

## Technology Stack Summary
- **Frontend**: Next.js 15.5.7 (App Router), React 18, TypeScript 5
- **Styling**: Tailwind CSS 3.4.1, Framer Motion, shadcn/ui (40+ components)
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting, Functions)
- **AI**: Genkit 1.21.0, Gemini 1.5 Pro, Gemini 2.5 Flash
- **APIs**: Google Maps, Calendar, Custom Search, YouTube; Reddit, Internet Archive, NewsAPI
- **Build**: Turbopack (Next.js 15), TypeScript, PostCSS
- **Deployment**: Firebase App Hosting (CDN, auto-scaling)
