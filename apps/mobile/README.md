# CareerLens Mobile — Developer Documentation & Build Guide

CareerLens Mobile is a premium, cross-platform React Native Expo application built to complement the CareerLens web platform. It shares Firebase, Firestore, and Gemini AI backend capabilities.

---

## 1. Directory Structure

```text
apps/mobile/
 ├─ assets/                 # Brand assets & splash resources
 ├─ app/                    # File-based App Router screens
 │   ├─ (auth)/             # Authentication views (login, register)
 │   ├─ (tabs)/             # Main dashboard views
 │   │   ├─ index.tsx       # Home dashboard (streaks, heatmap, SVG circular scores)
 │   │   ├─ explore.tsx     # Hub directing to all sub-features
 │   │   ├─ copilot.tsx     # Gemini AI chat interface with streaming text
 │   │   ├─ calendar.tsx    # Google Calendar schedule agenda
 │   │   └─ profile.tsx     # Settings & biometric toggle page
 │   ├─ features/           # Sibling screens for modular stack routing
 │   │   ├─ navigator.tsx   # Milestone planner timeline
 │   │   ├─ skillgap.tsx    # Custom polygon SVG Radar charts
 │   │   ├─ resume.tsx      # ATS optimizer & bullet-point rewriter
 │   │   ├─ interview.tsx   # Live Mock interviews graded by Gemini
 │   │   ├─ mentors.tsx     # LinkedIn mentor search index
 │   │   ├─ colleges.tsx    # Indian college matching rank predictor
 │   │   ├─ courses.tsx     # Coursera, NPTEL, YouTube course finder
 │   │   ├─ library.tsx     # Geolocation nearest libraries distance calculator
 │   │   ├─ ebooks.tsx      # Internet Archive textbook catalog
 │   │   ├─ projects.tsx    # Custom project proposals generator
 │   │   ├─ certifications.tsx # Cloud credentials progress tracker
 │   │   ├─ news.tsx        # Career news with AI outline dropdowns
 │   │   └─ analytics.tsx   # Growth analytics and SVG study charts
 │   ├─ _layout.tsx         # Root router provider configurations
 │   ├─ index.tsx           # Logo-fade splash navigator
 │   └─ onboarding.tsx      # Parallax swipe onboarding slides
 ├─ src/
 │   ├─ components/         # Premium B&W Glassmorphism card & loading visuals
 │   ├─ services/           # REST Gemini client, Firestore API, and Auth SDK
 │   └─ store/              # Global Zustand state stores (auth, chat)
```

---

## 2. Local Installation & Development

To launch the app on your local developer machine:

1. **Navigate to the app folder:**
   ```bash
   cd apps/mobile
   ```

2. **Restore local packages:**
   ```bash
   npm install
   ```

3. **Verify Typescript compilation:**
   ```bash
   npm run typecheck
   ```

4. **Start the Expo Metro Bundler:**
   ```bash
   npm run start
   ```

5. **Load on physical device or emulator:**
   * Scan the terminal's QR code using the **Expo Go** application on your iOS or Android device.
   * Press `a` to load on an active Android Emulator, or `i` for iOS Simulator.

---

## 3. Configuration & Environment Variables

Create a `.env.local` file inside `apps/mobile/` to overwrite default credentials:

```ini
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

EXPO_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
EXPO_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

*Note: Default testing configurations are compiled inside `src/services/` to prevent crashes when environment variables are omitted during quick runs.*

---

## 4. Build & Production Deployment Guide

We use **Expo Application Services (EAS)** to compile production-grade native packages.

### Prerequisites
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log into your Expo Account:
   ```bash
   eas login
   ```
3. Initialize build configurations:
   ```bash
   eas build:configure
   ```

### Compile Android APK (for local device testing)
To generate an installable `.apk` file for Android devices without uploading to the Google Play Console, use the **preview** profile configured in `eas.json`:
```bash
eas build --platform android --profile preview
```

### Compile Android App Bundle (AAB for Google Play Store)
To build the official release distribution bundle for the Google Play Store:
```bash
eas build --platform android --profile production
```

### Compile iOS Build (IPA for Apple App Store / TestFlight)
To compile the release bundle for iOS (requires an Apple Developer Account):
```bash
eas build --platform ios --profile production
```

### Submit to App Stores
Submit the compiled binaries directly using submission CLI hooks:
```bash
eas submit --platform android
eas submit --platform ios
```
