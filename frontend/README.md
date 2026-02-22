# Frontend - React Native App

**Multi-platform lottery education interface (Web + iOS + Android)**

## Purpose

The frontend is a **React Native application** built with Expo that runs on:
- **Web**: Browser (desktop and tablet)
- **Mobile**: iOS and Android via Expo

Uses **TypeScript** for type safety and code quality.

## Directory Structure

```
frontend/
├── src/
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── GamePlayScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   ├── MotivationScreen.tsx
│   │   └── AdminScreen.tsx
│   ├── components/       # Reusable components
│   │   ├── NumberPad.tsx
│   │   ├── StatisticsCard.tsx
│   │   ├── ContactForm.tsx
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Shared utilities
│   ├── api/             # API client configuration
│   ├── types/           # TypeScript types
│   ├── styles/          # Global styles
│   └── App.tsx          # Main app component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── README.md (this file)
```

## Key Concepts

- **React Native**: Write once, run everywhere (web + mobile)
- **Expo**: Simplifies React Native development and build process
- **TypeScript**: Strict typing for reliability
- **Navigation**: Bottom tab navigator for main screens
- **State Management**: TBD (Redux, Context, or Zustand)
- **API Integration**: HTTP client for backend communication
- **Local Storage**: Browser storage for anonymous user tracking

## Technical Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: (To be decided)
- **HTTP Client**: Axios or Fetch API
- **Testing**: React Testing Library + Detox (E2E)

## Screens

1. **HomeScreen**: Mission statement, game selection, summary stats
2. **GamePlayScreen**: Number selection, draw progress, results
3. **StatisticsScreen**: Game stats, examples, comparisons
4. **MotivationScreen**: Project mission, contact form
5. **AdminScreen**: Hidden metrics dashboard

## Features

- ✅ Cross-platform (web, iOS, Android)
- ✅ Responsive design (mobile-first)
- ✅ Type-safe TypeScript
- ✅ Browser storage for session tracking
- ✅ Real-time draw progress feedback
- ✅ Offline support (planned)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on web
npm run web

# Run in iOS simulator
npm run ios

# Run in Android emulator
npm run android

# Run tests
npm test
```

## Deployment

- **Web**: Deploy to Vercel or similar
- **Mobile**: Build APK for Android, use TestFlight for iOS
- **CI/CD**: GitHub Actions builds and publishes

## Performance Targets

- **Page Load**: < 2 seconds
- **Draw Completion**: Minimal wait with visual feedback
- **Lighthouse Score**: 90+

---

**Status**: Phase 0 - Scaffolding pending
**Next**: Initialize Expo project and folder structure
