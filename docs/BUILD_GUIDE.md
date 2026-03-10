# RepairPro — Complete Build Guide

> A niche mobile app for **independent home appliance repair technicians**.  
> Stack: React Native + Expo · Firebase · Free tier only · Android + iOS

---

## 1. App Idea Selection

### Three Niche Ideas Evaluated

---

#### Idea A — RepairPro: Job Tracker for Independent Appliance Technicians
- **Target audience**: Solo/small appliance repair techs (washers, fridges, HVAC, etc.)
- **Problem**: They manage jobs on paper or WhatsApp groups; no dedicated simple CRM.
- **Why underserved**: Big CRMs (HouseCall Pro, Jobber) cost $50–$200/month. Free tools don't exist.
- **Monetization**: Freemium (unlimited jobs behind paywall), $4.99/month Pro.

#### Idea B — PlantLog: Rare Plant Collector Care Tracker
- **Target audience**: Hobbyist collectors of rare succulents/aroids
- **Problem**: No dedicated watering/fertilizing schedule app tuned for rare species.
- **Why underserved**: Generic reminder apps don't understand plant-specific care cycles.
- **Monetization**: $1.99/month premium (unlimited plants + care reminders).

#### Idea C — VanLog: Maintenance Tracker for Van-Lifers
- **Target audience**: Full-time van dwellers
- **Problem**: Hard to track maintenance intervals when you move constantly.
- **Why underserved**: Car apps target normal drivers; van-lifers have unique systems (solar, water, etc.).
- **Monetization**: One-time $2.99 purchase.

---

### ✅ Chosen: **Idea A — RepairPro**

**Reasons:**
- Technicians are high intent (it saves them money directly)
- $4.99/month is easy to justify vs pen-and-paper losses
- MVP is achievable in 1–2 weeks
- Low competition in the free tier space
- B2B-lite = less churn than consumer apps

---

## 2. Product Specification

### App Name: **RepairPro**
Tagline: *"Your jobs. Organized."*

---

### Core MVP Features

| Feature | Description |
|---|---|
| Auth | Email/password sign-up & login |
| Job Board | List of all repair jobs with status |
| Add Job | Customer name, phone, appliance, issue, address |
| Job Detail | Edit job, update status, add notes, add photos |
| Status Flow | New → In Progress → Awaiting Parts → Done → Invoiced |
| Customer DB | Auto-built from jobs (no duplicate entry) |
| Photo Upload | Attach before/after repair photos |
| Push Alerts | Remind tech of jobs scheduled for today |
| Dashboard | Count of jobs by status, daily earnings estimate |

### User Flow

```
Splash → Login/Register
         ↓
      Dashboard (job counts, today's jobs)
         ↓
      Job List (filter by status)
         ↓
      Add Job → fills customer info + appliance + issue
         ↓
      Job Detail → update status → add note/photo
         ↓
      Mark Done → enter charge amount
         ↓
      "Invoiced" status → job archived
```

### Screen List

1. `SplashScreen` — logo + auto-login check
2. `LoginScreen` — email/password
3. `RegisterScreen` — name, email, password
4. `DashboardScreen` — counts, today's jobs strip
5. `JobListScreen` — flat list, filter tabs
6. `AddJobScreen` — form to create new job
7. `JobDetailScreen` — full job view + edit + photos
8. `CustomerListScreen` — auto list from jobs
9. `CustomerDetailScreen` — all jobs for that customer
10. `ProfileScreen` — name, business name, logout

---

### Database Schema (Firestore)

```
users/{userId}
  - displayName: string
  - businessName: string
  - email: string
  - plan: "free" | "pro"
  - createdAt: timestamp

users/{userId}/jobs/{jobId}
  - customerName: string
  - customerPhone: string
  - address: string
  - appliance: string        // "Washing Machine", "Fridge", etc.
  - issue: string
  - status: "new" | "in_progress" | "awaiting_parts" | "done" | "invoiced"
  - notes: string[]
  - photoUrls: string[]
  - chargeAmount: number
  - scheduledDate: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp

users/{userId}/customers/{customerId}
  - name: string
  - phone: string
  - address: string
  - jobCount: number
  - lastJobAt: timestamp
```

### Notification Logic

- **Daily morning push** (8 AM): "You have {N} jobs scheduled for today."
- **Job reminder** (1 hour before scheduledDate): "Job for {customerName} starts in 1 hour."
- Implemented via Firebase Cloud Messaging + Expo Notifications.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   REPAIRPRO MOBILE APP                   │
│              React Native + Expo (iOS & Android)         │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS / SDK
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌────────────────┐
│ Firebase Auth│  │   Firestore DB   │  │Firebase Storage│
│  (email/pw)  │  │  (jobs/customers)│  │  (job photos)  │
└──────────────┘  └──────────────────┘  └────────────────┘
        │                                       │
        └──────────────────┬────────────────────┘
                           │
                  ┌────────▼────────┐
                  │ Firebase Cloud  │
                  │    Functions    │
                  │ (notifications, │
                  │  scheduled jobs)│
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │  Firebase Cloud │
                  │   Messaging     │
                  │  (push alerts)  │
                  └─────────────────┘

Tech Summary:
  Frontend  : React Native + Expo SDK 51
  Auth      : Firebase Authentication (email/password)
  Database  : Cloud Firestore (NoSQL, real-time)
  Storage   : Firebase Storage (photos)
  Functions : Firebase Cloud Functions (Node.js 18)
  Push      : FCM + Expo Notifications
  CI/CD     : GitHub + EAS Build (free tier)
  Stores    : Google Play + Apple TestFlight
```

---

## 4. Folder Structure

```
repairpro/
├── app.json                    # Expo config
├── App.tsx                     # Entry point
├── package.json
├── tsconfig.json
├── .env.example                # Environment variable template
├── .gitignore
│
├── assets/
│   └── images/
│       ├── logo.png
│       └── splash.png
│
├── src/
│   ├── config/
│   │   └── firebase.ts         # Firebase init
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # Auth state provider
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Root navigator
│   │   ├── AuthStack.tsx        # Login/Register stack
│   │   └── MainTabs.tsx         # Bottom tab navigator
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   └── main/
│   │       ├── DashboardScreen.tsx
│   │       ├── JobListScreen.tsx
│   │       ├── AddJobScreen.tsx
│   │       ├── JobDetailScreen.tsx
│   │       ├── CustomerListScreen.tsx
│   │       ├── CustomerDetailScreen.tsx
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── JobCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PhotoPicker.tsx
│   │   └── LoadingOverlay.tsx
│   │
│   ├── services/
│   │   ├── jobService.ts        # Firestore job CRUD
│   │   ├── customerService.ts   # Firestore customer logic
│   │   ├── storageService.ts    # Firebase Storage uploads
│   │   └── notificationService.ts # Expo push setup
│   │
│   ├── hooks/
│   │   ├── useJobs.ts
│   │   └── useAuth.ts
│   │
│   └── utils/
│       ├── colors.ts
│       ├── constants.ts
│       └── formatters.ts
│
└── functions/
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── index.ts             # Cloud Functions (scheduled notifications)
```

---

## 5. Setup Guide

### Step 1 — Install Tools

```bash
# Node.js 18+ (https://nodejs.org)
node --version   # should be v18+

# Expo CLI
npm install -g expo-cli eas-cli

# Firebase CLI
npm install -g firebase-tools

# VS Code extensions recommended:
# - React Native Tools
# - ESLint
# - Prettier
```

### Step 2 — Create the Project

```bash
# Clone or init
git init repairpro && cd repairpro

# Or use Expo template
npx create-expo-app repairpro --template blank-typescript
cd repairpro

# Install all dependencies
npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  firebase \
  expo-notifications \
  expo-image-picker \
  expo-file-system \
  react-native-screens \
  react-native-safe-area-context \
  @react-native-async-storage/async-storage \
  react-native-vector-icons \
  @expo/vector-icons \
  date-fns \
  react-native-uuid

npm install --save-dev typescript @types/react @types/react-native
```

### Step 3 — Setup Firebase Backend

```bash
# Login
firebase login

# Create project at https://console.firebase.google.com
# Project name: repairpro-prod

# Init in your project folder
firebase init

# Select: Firestore, Storage, Functions, Emulators
# Language for Functions: TypeScript
# Emulators: Auth, Firestore, Storage, Functions

# Enable Authentication in Firebase Console:
# Authentication > Sign-in method > Email/Password > Enable

# Set Firestore rules (see below)
firebase deploy --only firestore:rules
```

**Firestore Security Rules** (`firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /jobs/{jobId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /customers/{customerId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

**Storage Rules** (`storage.rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 4 — Configure Environment Variables

```bash
# Copy template
cp .env.example .env

# Fill in your Firebase config values from:
# Firebase Console > Project Settings > Your Apps > SDK setup
```

`.env` contents:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 5 — Run Locally

```bash
# Start Expo dev server
npx expo start

# Press 'a' for Android emulator
# Press 'i' for iOS simulator  
# Scan QR with Expo Go app on real device

# Run with Firebase emulators (optional for offline dev)
firebase emulators:start
```

### Step 6 — Build Android APK

```bash
# Login to EAS
eas login

# Configure EAS build
eas build:configure

# Build APK for testing (free, takes ~10 min)
eas build --platform android --profile preview

# Download APK from EAS dashboard and install on device
# Or submit to Google Play:
eas submit --platform android
```

### Step 7 — Build iOS App

```bash
# Requires Apple Developer account ($99/year)
# For free testing use Simulator or TestFlight

eas build --platform ios --profile preview
# Submit to TestFlight:
eas submit --platform ios
```

### Step 8 — Publish to Stores

**Google Play:**
1. Create app at play.google.com/console (one-time $25 fee)
2. `eas submit --platform android --latest`
3. Fill store listing, screenshots, description
4. Submit for review (2–3 days)

**Apple App Store:**
1. Enroll at developer.apple.com ($99/year)
2. `eas submit --platform ios --latest`
3. Fill App Store Connect listing
4. Submit for review (1–2 days)

---

## 6. UI Design

### Color Palette

```
Primary Blue   : #2563EB   (buttons, active tab, links)
Surface White  : #FFFFFF   (card backgrounds)
Background     : #F1F5F9   (screen background)
Text Primary   : #1E293B   (headings, body)
Text Secondary : #64748B   (labels, placeholders)
Success Green  : #16A34A   (Done status)
Warning Amber  : #D97706   (Awaiting Parts)
Error Red      : #DC2626   (overdue jobs)
Border Gray    : #E2E8F0   (card borders)
```

### Status Color Map

```
new             → #2563EB  (blue)
in_progress     → #7C3AED  (purple)
awaiting_parts  → #D97706  (amber)
done            → #16A34A  (green)
invoiced        → #64748B  (gray)
```

### UX Tips for Retention

1. **One-tap add job** — FAB button always visible, pre-fills today's date
2. **Swipe to change status** — faster than opening job detail
3. **Morning push** drives daily active use
4. **Photo proof** creates habit (before/after = professional)
5. **Customer history** makes app sticky — tech doesn't want to lose the data

---

## 7. Monetization

### Option 1 — Freemium (Recommended)

| Free | Pro ($4.99/month) |
|---|---|
| Up to 10 active jobs | Unlimited jobs |
| No photo uploads | Photo uploads |
| No customer database export | CSV export |
| Basic dashboard | Earnings analytics |

**Implementation**: Check `user.plan === "pro"` before allowing gated actions.  
**Payment SDK**: RevenueCat (free SDK) → Stripe or App Store IAP.

### Option 2 — Ads (AdMob)

- Show banner ad on Dashboard screen for free users
- Use `react-native-google-mobile-ads` (free SDK, requires Firebase account)
- Expected RPM: $2–5 for blue-collar professional audience

### Option 3 — One-Time Unlock ($9.99)

- Single payment to unlock all features forever
- Better conversion for older audience who distrust subscriptions
- Implement via App Store IAP + `expo-in-app-purchases`

---

## 8. Growth Strategy — First 1000 Users

### Week 1–2: Seeding
1. Post in **Facebook Groups** for appliance repair technicians (100k+ members in "Appliance Repair Professionals" group)
2. Share on **r/appliancerepair** and **r/HVAC** subreddits
3. Post YouTube Shorts: "I built a free app for appliance techs"

### Week 3–4: Social Proof
4. Give **unlimited free Pro** to first 50 users who review it
5. Post before/after screenshots in groups: "Before: sticky notes. After: RepairPro"

### Month 2: SEO + ASO
6. App Store title: "Repair Job Tracker — Technician CRM"
7. Keywords: "appliance repair tracker", "field service app free", "job management app"
8. Create a simple landing page (GitHub Pages = free)

### Month 3: Referral
9. "Invite a fellow tech, get 1 month Pro free" referral link via dynamic links
10. Partner with small appliance parts suppliers — offer app as free tool to their contractor customers

### Cost: $0 (all organic/community)

---

## 9. Future Features (v2)

| Feature | Value |
|---|---|
| Invoice PDF generator | Tech can send invoice via WhatsApp from app |
| Parts inventory tracker | Track spare parts stock |
| Route optimization | Google Maps integration for multi-job days |
| Team accounts | Small shops with 2–5 techs, $14.99/month |
| Recurring maintenance reminders | Annual service reminders to customers |
| QuickBooks / Wave integration | Sync invoices to accounting |
| Offline mode | Full Firestore offline persistence |
| WhatsApp integration | Auto-send job confirmation to customer |
| Analytics dashboard | Earnings per appliance type, busiest days |
| Web dashboard | Admin view from browser (React + Firebase) |
