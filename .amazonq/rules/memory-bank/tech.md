# CareerLens Technology Stack

## Programming Languages

### Primary Languages
- **TypeScript 5.0** - Main development language for type safety
- **JavaScript (ES2020)** - Runtime target and legacy support
- **CSS** - Styling via Tailwind CSS utility classes

### Language Configuration
- **Target**: ES2020 for modern JavaScript features
- **Module System**: ESNext with bundler resolution
- **JSX**: Preserve mode for Next.js transformation
- **Strict Mode**: Enabled for type safety

## Core Framework

### Next.js 15.3.3
- **Type**: React meta-framework
- **Router**: App Router (file-based routing)
- **Rendering**: Server Components (RSC) + Client Components
- **Features**:
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Image optimization
  - Font optimization
  - Automatic code splitting

### React 18.3.1
- **UI Library**: Component-based architecture
- **Features**:
  - Concurrent rendering
  - Automatic batching
  - Suspense for data fetching
  - Server Components support

## AI & Machine Learning

### Google Gemini AI
- **Model**: Gemini 2.5 Flash Lite
- **SDK**: @google/generative-ai ^0.16.0
- **Use Cases**:
  - Career recommendations
  - Skill gap analysis
  - Project generation
  - Interview preparation
  - Document analysis
  - Content summarization

### Genkit 1.21.0
- **Purpose**: AI workflow orchestration
- **Packages**:
  - `genkit` - Core framework
  - `@genkit-ai/google-genai` - Gemini integration
  - `@genkit-ai/next` - Next.js integration
  - `genkit-cli` - Development tools
- **Features**:
  - Flow definitions
  - Schema validation (Zod)
  - Prompt management
  - Streaming responses

## Backend Services

### Firebase 11.9.1
Complete backend-as-a-service platform:

#### Firebase Authentication
- Google OAuth 2.0
- Email/Password authentication
- Session management
- Protected routes

#### Cloud Firestore
- NoSQL document database
- Real-time synchronization
- Offline support
- Collections:
  - users, profiles, resumes, interviews
  - activities, eventReminders, fcmTokens
  - cache, colleges

#### Firebase Cloud Functions
- **Runtime**: Node.js 18+
- **Packages**:
  - `firebase-functions` ^5.1.1
  - `firebase-admin` ^12.3.0
  - `firebase-functions-test` ^3.3.0
- **Functions**: 7 scheduled/triggered functions

#### Firebase Hosting
- Static asset hosting
- CDN distribution
- Custom domain support
- SSL certificates

#### Firebase App Hosting
- Next.js deployment on Cloud Run
- Auto-scaling (0-3 instances)
- 1 CPU, 1024 MiB memory
- Standalone output mode

#### Firebase Cloud Messaging (FCM)
- Push notifications
- Event reminders
- Cross-platform support

## Google Cloud Services

### APIs Used
- **Vertex AI / Gemini API**: Generative AI
- **Google Calendar API**: Event management (googleapis ^140.0.1)
- **Google Maps API**: Library finder (@react-google-maps/api ^2.19.3)
- **Google Custom Search API**: Content discovery
- **YouTube Data API**: Video recommendations

### Infrastructure
- **Cloud Run**: App hosting runtime
- **Cloud Functions**: Serverless functions
- **Cloud Storage**: File storage (planned)
- **BigQuery**: Analytics (planned)
- **Looker Studio**: Dashboards (planned)

## UI Framework & Styling

### Tailwind CSS 3.4.1
- **Utility-first CSS framework**
- **Plugins**:
  - `tailwindcss-animate` ^1.0.7 - Animation utilities
- **Configuration**: Custom theme with purple/pink gradients
- **PostCSS**: ^8 for processing

### Component Library - shadcn/ui
Radix UI primitives with Tailwind styling:
- `@radix-ui/react-accordion` ^1.2.3
- `@radix-ui/react-alert-dialog` ^1.1.6
- `@radix-ui/react-avatar` ^1.1.3
- `@radix-ui/react-checkbox` ^1.1.4
- `@radix-ui/react-collapsible` ^1.1.11
- `@radix-ui/react-dialog` ^1.1.6
- `@radix-ui/react-dropdown-menu` ^2.1.6
- `@radix-ui/react-label` ^2.1.2
- `@radix-ui/react-menubar` ^1.1.6
- `@radix-ui/react-popover` ^1.1.6
- `@radix-ui/react-progress` ^1.1.2
- `@radix-ui/react-radio-group` ^1.2.3
- `@radix-ui/react-scroll-area` ^1.2.3
- `@radix-ui/react-select` ^2.1.6
- `@radix-ui/react-separator` ^1.1.2
- `@radix-ui/react-slider` ^1.2.3
- `@radix-ui/react-slot` ^1.2.3
- `@radix-ui/react-switch` ^1.1.3
- `@radix-ui/react-tabs` ^1.1.3
- `@radix-ui/react-toast` ^1.2.6
- `@radix-ui/react-tooltip` ^1.1.8

### Animation & Motion
- **Framer Motion** ^11.18.2
  - Declarative animations
  - Gesture support
  - Layout animations
  - Variants system

### Icons
- **Lucide React** ^0.475.0
  - 1000+ consistent icons
  - Tree-shakeable
  - TypeScript support

## Form Management

### React Hook Form 7.54.2
- **Features**:
  - Performant form validation
  - Minimal re-renders
  - Easy integration with UI libraries
- **Validation**: @hookform/resolvers ^4.1.3
- **Schema**: Zod ^3.24.2 for type-safe validation

## Data Visualization

### Recharts 2.15.1
- **Purpose**: Charts and graphs
- **Components**:
  - Line charts (career progress)
  - Bar charts (skill levels)
  - Radar charts (skill assessment)
  - Heatmaps (activity calendar)
  - Network graphs (skill relationships)

## Document Processing

### PDF Handling
- **jsPDF** ^3.0.3 - PDF generation
- **jspdf-autotable** ^5.0.2 - Table generation
- **pdf-parse** ^2.4.5 - PDF parsing
- **file-saver** ^2.0.5 - File downloads

### Document Parsing
- **mammoth** ^1.11.0 - DOCX to HTML conversion

## Utility Libraries

### Date & Time
- **date-fns** ^3.6.0
  - Date manipulation
  - Formatting
  - Timezone support
- **react-day-picker** ^8.10.1 - Calendar picker

### Styling Utilities
- **clsx** ^2.1.1 - Conditional classNames
- **tailwind-merge** ^3.0.1 - Merge Tailwind classes
- **class-variance-authority** ^0.7.1 - Component variants

### UI Utilities
- **react-use-measure** ^2.1.7 - Element measurements
- **embla-carousel-react** ^8.6.0 - Carousel component

### Voice Recognition
- **react-speech-recognition** ^3.10.0
  - Speech-to-text
  - Interview voice input
- **regenerator-runtime** ^0.14.1 - Async/await polyfill

## External APIs

### Reddit API
- **Endpoint**: reddit.com/r/{subreddit}/search.json
- **Method**: Server-side proxy to bypass CORS
- **Features**: College reviews, sentiment analysis

### Internet Archive API
- **Endpoint**: archive.org/advancedsearch.php
- **Dataset**: 20M+ books
- **Features**: Advanced search, multiple formats

### Google APIs
- **Custom Search**: Content discovery
- **Calendar**: Event management
- **Maps**: Location services
- **YouTube**: Video recommendations

## Development Tools

### Build Tools
- **Next.js Compiler**: Built-in SWC compiler
- **Webpack**: Module bundler (configured via Next.js)
- **PostCSS**: CSS processing
- **TypeScript Compiler**: Type checking

### Development Scripts
```json
{
  "dev": "next dev",                    // Development server
  "genkit:dev": "genkit start -- tsx src/ai/dev.ts",  // AI dev server
  "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",  // AI watch mode
  "build": "next build",                // Production build
  "start": "next start",                // Production server
  "lint": "next lint",                  // ESLint
  "typecheck": "tsc --noEmit"          // Type checking
}
```

### Code Quality
- **ESLint**: Linting (next lint)
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (optional)

### Package Management
- **npm**: Primary package manager
- **patch-package** ^8.0.0 - Patch node_modules

## Testing Tools

### Firebase Testing
- **firebase-functions-test** ^3.3.0
  - Unit test Cloud Functions
  - Mock Firebase services

## Configuration Files

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Next.js Configuration
- **Output**: Standalone (for Docker/Cloud Run)
- **TypeScript**: Build errors ignored (rapid development)
- **ESLint**: Build warnings ignored
- **Images**: Remote patterns for external images
- **Webpack**: Custom alias resolution

### Firebase Configuration
- **Project ID**: careerlens-1
- **Hosting**: Static + App Hosting
- **Functions**: us-central1 region
- **Firestore**: Multi-region

## Environment Variables

### Required Variables
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Google AI
GOOGLE_GENAI_API_KEY
GEMINI_API_KEY

# Google APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID
NEXT_PUBLIC_YOUTUBE_API_KEY

# Environment
NODE_ENV
```

## Deployment Configuration

### Firebase App Hosting (apphosting.yaml)
```yaml
runConfig:
  minInstances: 0
  maxInstances: 3
  cpu: 1
  memoryMiB: 1024
```

### Build Output
- **Directory**: .next/
- **Mode**: Standalone
- **Size**: ~300KB (optimized)

## Performance Optimizations

### Next.js Optimizations
- Automatic code splitting
- Image optimization
- Font optimization
- Tree shaking
- Minification

### Bundle Size
- First Load JS: ~300KB
- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s

### Caching Strategy
- Static assets: CDN caching
- API responses: 5-minute cache
- LocalStorage: Bookmarks, search history
- Firestore: Real-time listeners

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features required
- No IE11 support

## Node.js Requirements
- **Version**: 18+ (LTS)
- **Package Manager**: npm or yarn
- **Runtime**: Node.js for Cloud Functions

## Security

### Authentication
- Firebase Auth with secure tokens
- httpOnly cookies for sessions
- OAuth 2.0 for Google sign-in

### API Security
- Firestore security rules
- API route authentication
- Rate limiting on write operations
- CORS configuration for API routes

### Data Protection
- User data isolation
- Encrypted connections (HTTPS)
- Environment variable protection
- No credentials in code
