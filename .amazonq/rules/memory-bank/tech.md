# CareerLens Technology Stack

## Programming Languages
- **TypeScript 5**: Primary language for type-safe development (strict mode enabled)
- **JavaScript (ES2020)**: Node.js runtime, Cloud Functions
- **Python**: Skills directory utilities, data processing scripts
- **CSS**: Tailwind CSS 3.4.1 utility classes, custom glassmorphism styles

## Core Framework
### Next.js 15.5.7
- **App Router**: Modern React Server Components architecture
- **Features Used**:
  - Server-Side Rendering (SSR) for SEO-optimized pages
  - Static Site Generation (SSG) for performance
  - API Routes as serverless functions (`/app/api/*`)
  - Image Optimization (automatic WebP conversion, lazy loading)
  - Font Optimization (Google Fonts)
  - Code Splitting (dynamic imports, route-based splitting)
  - Turbopack bundler for fast builds
- **Configuration**: `next.config.ts`
  - Standalone output for containerization
  - 10MB body size limit for resume uploads
  - Server external packages: genkit, firebase-admin, pdf-parse
  - Path aliases: `@/*` → `./src/*`

### React 18.3.1
- **Features**: React Server Components, Suspense, Concurrent Rendering
- **State Management**: React Hooks (useState, useEffect, useContext, useMemo)
- **Custom Hooks**: `use-auth.tsx`, `use-toast.ts`, `use-background-jobs.ts`

## Backend Infrastructure

### Firebase 11.9.1
- **Firebase Auth**: Google OAuth 2.0, email/password authentication
- **Cloud Firestore**: NoSQL database (8 collections, real-time listeners)
- **Cloud Storage**: File uploads (resumes, profile photos)
- **Cloud Functions**: Background jobs (Node.js 20 runtime)
- **App Hosting**: Next.js deployment (2 vCPUs, 2GB RAM, 0-10 auto-scaling)
- **Cloud Messaging (FCM)**: Push notifications for calendar reminders

### Google Cloud Platform
- **Vertex AI**: AI/ML platform for model management
- **Gemini API**: 
  - Gemini 1.5 Pro (complex reasoning, long context)
  - Gemini 2.5 Flash (fast responses, chat)
- **Genkit 1.21.0**: AI workflow orchestration framework
- **Google APIs**:
  - Maps JavaScript API
  - Places API (library search)
  - Custom Search API (course/mentor discovery)
  - YouTube Data API v3 (educational content)
  - Calendar API (event sync)
- **BigQuery**: Analytics and data warehousing (planned)
- **Cloud Run**: Serverless containers (Dockerfile ready)

## UI/UX Libraries

### Component Libraries
- **shadcn/ui**: 40+ accessible components (Accordion, Alert, Badge, Button, Card, Dialog, Dropdown, Popover, Select, Tabs, Toast, Tooltip, etc.)
- **Radix UI**: Unstyled primitives (17+ packages including react-accordion, react-dialog, react-dropdown-menu, react-popover, react-tabs)

### Styling & Animation
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
  - Custom neon color palette: Cyan (#00E5FF), Purple (#A57CFF), Emerald (#00FFC6)
  - Glassmorphism utilities (backdrop-blur, background opacity)
  - Dark mode optimized
- **Framer Motion 11.18.2**: Advanced animations (page transitions, mesh wave background)
- **class-variance-authority 0.7.1**: Component variant management
- **clsx 2.1.1**: Conditional CSS classes
- **tailwind-merge 3.0.1**: Tailwind class merging
- **tailwindcss-animate 1.0.7**: Animation utilities

### Data Visualization
- **React Flow 11.11.4**: Interactive node-based career graph editor
- **Recharts 2.15.1**: Chart library (planned)
- **dagre 0.8.5**: Graph layout algorithm

## Form & Validation
- **React Hook Form 7.54.2**: Performant form handling
- **Zod 3.24.2**: TypeScript-first schema validation
- **@hookform/resolvers 4.1.3**: Form validation integration

## External API Integrations
- **@react-google-maps/api 2.19.3**: Google Maps React wrapper
- **googleapis 140.0.1**: Google APIs Node.js client (Calendar, YouTube, Search)
- **Reddit JSON API**: Server-side proxy for college reviews
- **Internet Archive API**: 20M+ eBooks search and retrieval
- **NewsAPI.org**: Industry news articles (100 requests/day free tier)

## AI & Machine Learning
- **@genkit-ai/google-genai 1.21.0**: Google Generative AI integration
- **@genkit-ai/next 1.21.0**: Next.js integration for Genkit
- **@google-cloud/vertexai 1.10.0**: Vertex AI SDK
- **@google/generative-ai 0.24.1**: Gemini API client

## Utilities & Libraries
- **date-fns 3.6.0**: Date manipulation (calendar, scheduling)
- **lucide-react 0.475.0**: Icon library (1000+ icons)
- **embla-carousel-react 8.6.0**: Carousel component
- **react-use-measure 2.1.7**: Element dimension measurement
- **file-saver 2.0.5**: Client-side file saving

## Document Processing
- **pdf-parse 2.4.5**: PDF resume parsing
- **mammoth 1.11.0**: DOCX to HTML conversion
- **jspdf 3.0.4**: PDF generation
- **jspdf-autotable 5.0.2**: Table generation for PDFs
- **html2canvas 1.4.1**: HTML to canvas rendering

## Job Queue & Background Processing
- **bullmq 5.64.1**: Redis-based job queue (background jobs, data refresh)
- **ioredis 5.8.2**: Redis client for BullMQ

## Voice & Speech
- **react-speech-recognition 3.10.0**: Speech-to-text for interview prep (planned)
- **regenerator-runtime 0.14.1**: Async/await polyfill

## Development Tools
- **TypeScript 5**: Type checking with strict mode
- **ESLint 9.39.1**: Code linting
  - @next/eslint-plugin-next 16.0.2: Next.js-specific rules
- **genkit-cli 1.21.0**: Genkit development CLI
- **firebase-functions-test 3.3.0**: Cloud Functions testing
- **PostCSS 8**: CSS transformations
- **patch-package 8.0.0**: NPM package patching

## Build & Deployment
- **Build System**: Turbopack (Next.js 15 default bundler)
- **Package Manager**: npm (package-lock.json present)
- **Deployment**: Firebase App Hosting
  - Automatic GitHub integration (main branch)
  - CDN distribution (150+ global locations)
  - HTTPS by default (automatic SSL)
- **Docker**: Dockerfiles for socket server and worker (docker-compose.yml)

## Development Commands

### Core Development
```bash
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Production build (standalone output)
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking (no emit)
```

### Genkit AI Development
```bash
npm run genkit:dev       # Start Genkit dev server with tsx
npm run genkit:watch     # Start Genkit with auto-reload
```

### Deployment & Testing
```bash
./deploy.sh              # Deploy to Firebase App Hosting
./test-apis.sh           # Test API connectivity
./setup-secrets.sh       # Configure Firebase secrets
```

### Firebase Functions
```bash
cd functions
npm install              # Install Cloud Functions dependencies
npm run build            # Compile TypeScript to JavaScript
```

## Environment Variables
Required in `.env.local`:
- Firebase config (API keys, project ID, etc.)
- Google Maps API key
- Google Custom Search API key + Engine ID
- Google Calendar API credentials
- YouTube Data API key
- NewsAPI key
- Gemini API key

## Performance Targets
- Lighthouse Score: 95+ (achieved)
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- API Response Time: < 500ms (cached), < 2s (uncached)

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- WebP image format
- CSS Grid and Flexbox

## Code Quality Standards
- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- No build errors tolerated in production
- Type safety enforced across codebase
- Component-driven architecture with React
