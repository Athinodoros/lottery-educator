---

# Frontend - Lottery Educator React Native App

**Multi-platform lottery education interface (Web + iOS + Android)**

## Overview

This is the React Native + Expo frontend for the Lottery Educator platform. It provides a cross-platform mobile and web interface for users to learn about lottery odds through interactive simulations.

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Storage**: AsyncStorage (for anonymous session tracking)
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + TypeScript

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Expo Router app directory (file-based routing)
│   │   ├── _layout.tsx        # Root layout with tab navigation
│   │   ├── index.tsx          # Home screen
│   │   ├── games.tsx          # Games/Play screen
│   │   ├── statistics.tsx     # Statistics screen
│   │   ├── motivation.tsx     # Educational resources screen
│   │   └── admin.tsx          # Admin dashboard screen
│   ├── components/            # Reusable UI components
│   │   ├── NumberPad.tsx      # Number selection input (TODO)
│   │   ├── StatisticsCard.tsx # Statistics display card (TODO)
│   │   ├── ContactForm.tsx    # Contact/feedback form (TODO)
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── useGames.ts        # Games data fetching (TODO)
│   │   ├── useStatistics.ts   # Statistics data fetching (TODO)
│   │   └── ...
│   ├── api/                   # API client and service functions
│   │   ├── client.ts          # Axios configuration
│   │   ├── games.ts           # Game API endpoints
│   │   ├── email.ts           # Email/contact endpoints
│   │   └── metrics.ts         # Metrics/tracking endpoints
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared types (Game, GameResult, Statistics, etc.)
│   ├── utils/                 # Utility functions
│   │   └── session.ts         # Anonymous session ID management
│   └── store/                 # State management (Zustand)
│       └── useAppStore.ts     # Global app state
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # Node TypeScript configuration
├── .eslintrc.cjs              # ESLint configuration
└── README.md                  # This file
```

## Features

### Screens (Expo Router)

1. **Home Screen** (`index.tsx`)
   - Project overview and introduction
   - Educational summary cards
   - Quick start button to begin playing

2. **Games/Play Screen** (`games.tsx`)
   - List of available lottery games (Powerball, Mega Millions, EuroMillions, etc.)
   - Game selection interface
   - NumberPad component for selecting numbers
   - Results display with draws-to-win counter

3. **Statistics Screen** (`statistics.tsx`)
   - Aggregated statistics for each game type
   - Human-readable probability examples
   - StatisticsCard components with visual representations
   - Comparison of odds vs. actual outcomes

4. **educational Resources Screen** (`motivation.tsx`)
   - Articles and resources about probability
   - Probability explanations with examples
   - Contact form for user feedback
   - "Forget Me" GDPR option for data deletion

5. **Admin Dashboard Screen** (`admin.tsx`)
   - View overall metrics and analytics (requires hardcoded credentials)
   - Monitor user engagement and click tracking
   - System health checks

### Components (To Be Implemented)

- **NumberPad**: Interactive number selection widget (supports 0-99 range)
- **StatisticsCard**: Card displaying game statistics with visual elements
- **ContactForm**: GDPR-compliant contact form with email validation
- Additional UI components as needed

### Hooks (To Be Implemented)

- **useGames**: Fetch available games from /api/games
- **useStatistics**: Fetch and cache game statistics from /api/stats
- **useSession**: Manage anonymous session tracking
- **useApi**: Abstract error handling and loading states

## API Integration

The frontend communicates with the backend via the API Gateway (port 3000):

```typescript
// Base URL: http://localhost:3000/api (configurable via EXPO_PUBLIC_API_URL)

// Games API
GET /api/games              # Get all available games
GET /api/games/:id          # Get specific game
POST /api/games/:id/play    # Play a game (submit numbers)

// Statistics API
GET /api/stats/:gameId              # Get aggregated statistics
GET /api/stats/:gameId/examples     # Get human-readable examples

// Email API (Contact Form + GDPR)
POST /api/emails                # Submit contact form
DELETE /api/emails/:id          # Delete email (GDPR "Forget Me")
GET /api/emails                 # Get all emails (admin only)

// Metrics API (Click Tracking)
POST /api/metrics/click/:linkId # Track a click
GET /api/metrics/summary        # Get analytics summary (admin only)
```

## Privacy & GDPR Compliance

- **No IP tracking**: Anonymous session IDs used instead
- **Forget Me**: Users can delete their email and data via `/api/emails/:id` DELETE
- **Local session tracking**: Session ID stored in device AsyncStorage
- **No external APIs**: All data stays within the application
- **No cookies**: State managed through Zustand + AsyncStorage

## Performance Targets

- **Page load time**: < 2 seconds
- **Concurrent users**: Support thousands
- **Responsive design**: Mobile-first approach
- **Smooth animations**: 60 FPS frame rate

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Install root and workspace dependencies
npm install --workspaces

# OR from the frontend directory
cd frontend
npm install
```

### Development

```bash
# Start Expo development server (all platforms)
npm run dev

# Run on web only
npm run web

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android
```

### Building

```bash
# Build for all platforms
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_ENV=development
```

## State Management

Global state uses Zustand for simplicity and performance:

```typescript
import { useAppStore } from '@store/useAppStore';

const { games, currentGame, setCurrentGame } = useAppStore();
```

## Anonymous Session Tracking

Session IDs are automatically created on first app launch and stored locally:

```typescript
import { getOrCreateSessionId } from '@utils/session';

const sessionId = await getOrCreateSessionId();
```

No IP addresses are tracked. Users can clear their session anytime.

## Development Commands

```bash
npm run dev           # Start dev server
npm run web          # Web development
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run build        # Production build
npm run lint         # Linting
npm run type-check   # TypeScript check
npm test             # Run tests
```

## Testing

```bash
# Unit and component tests
npm test

# Type checking
npm run type-check

# Code quality
npm run lint
```

## Contributing

- Use TypeScript strict mode for all components
- Follow ESLint rules for code consistency
- All components should be functional with hooks
- Add unit tests for complex logic
- Document custom hooks and utilities

## License

MIT - Part of Lottery Educator project

---

**Status**: Phase 0 - Frontend Scaffolding Complete
**Next Phase**: P0-004 - Database setup with PostgreSQL schema

