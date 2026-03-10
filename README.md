# RepairPro 🔧

**A free mobile job tracker for independent appliance repair technicians.**

Built with React Native + Expo + Firebase. Runs on Android and iOS from a single codebase.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# → Fill in your Firebase config values

# 3. Start development server
npx expo start

# Scan QR code with Expo Go on your phone
```

## Project Structure

```
repairpro/
├── App.tsx                     # Entry point
├── app.json                    # Expo config
├── eas.json                    # EAS Build config
├── firebase.json               # Firebase config
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── src/
│   ├── config/firebase.ts      # Firebase init
│   ├── context/AuthContext.tsx # Auth state (login/logout/profile)
│   ├── navigation/             # React Navigation setup
│   ├── screens/auth/           # Login, Register, Splash
│   ├── screens/main/           # Dashboard, Jobs, Customers, Profile
│   ├── components/             # Reusable UI components
│   ├── services/               # Firebase service layer
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Colors, constants, formatters
└── functions/                  # Firebase Cloud Functions
    └── src/index.ts            # Push notifications logic
```

## Full Documentation

See [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) for:
- App idea evaluation and selection
- Product specification (screens, schema, API)
- Architecture diagram
- Complete setup guide (install → publish)
- UI design & color palette
- Monetization strategy
- Growth plan (first 1000 users)
- Future v2 features

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React Native + Expo | Free |
| Auth | Firebase Authentication | Free tier |
| Database | Cloud Firestore | Free tier |
| Storage | Firebase Storage | Free tier |
| Functions | Firebase Cloud Functions | Free tier |
| Push | Expo Notifications + FCM | Free |
| Build | EAS Build | Free tier |
| Hosting | GitHub | Free |

## MVP Features

- ✅ Email/password authentication
- ✅ Create and manage repair jobs
- ✅ Job status pipeline (New → In Progress → Awaiting Parts → Done → Invoiced)
- ✅ Customer database (auto-populated from jobs)
- ✅ Job notes (add text notes to any job)
- ✅ Photo uploads (before/after photos via Firebase Storage)
- ✅ Push notifications (daily digest + job reminders)
- ✅ Dashboard with job counts and today's schedule
- ✅ Search and filter jobs

## License

MIT — free to use, modify, and distribute.
