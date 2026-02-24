# Phase 2 Summary - Web Frontend Implementation

**Status**: Starting Phase 2 (Reset to React Web)
**Timeline**: Feb 22 onwards (Revised for web-only approach)
**Team**: Solo developer + LLM guidance

---

## Overview of Change

We've pivoted from **React Native + Expo** to **React + Vite** for web-only development. This eliminates Metro bundler compatibility issues and leverages industry-standard web tooling.

### Why React Web?
- ✅ **No platform conflicts** - No Expo/React Native incompatibilities
- ✅ **Modern tooling** - Vite provides fast HMR and optimized builds
- ✅ **Type safety** - Full TypeScript support for all dependencies
- ✅ **Easier debugging** - Browser DevTools vs Metro bundler issues
- ✅ **Web-focused** - Perfect for educational web platform

---

## Frontend Technology Stack (Revised)

### Core Dependencies
- **React 18.3.0** - UI library
- **React Router 6.22.0** - Client-side routing (replaces Expo Router)
- **Vite 5.1.0** - Build tool and dev server
- **TypeScript 5.5.0** - Type safety
- **Zustand 4.5.0** - State management
- **Axios 1.7.0** - HTTP client
- **Lucide React 0.344.0** - Icon library

### Project Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx              ✅ Created
│   │   ├── HomePage.css              ✅ Created
│   │   ├── GamesPage.tsx             ✅ Created
│   │   ├── GamePlayPage.tsx          ✅ Created
│   │   ├── StatsPage.tsx             ✅ Created
│   │   ├── StatisticsDetailPage.tsx  ✅ Created
│   │   ├── LearnPage.tsx             ✅ Created
│   │   └── AdminPage.tsx             ✅ Created
│   ├── layout/
│   │   ├── Layout.tsx                ✅ Created
│   │   └── Layout.css                ✅ Created
│   ├── components/                   📋 To implement
│   ├── hooks/                        📋 To implement
│   ├── store/                        📋 To implement
│   ├── api/                          📋 To implement
│   ├── utils/                        📋 To implement
│   ├── types/
│   │   └── index.ts                  ✅ Exists
│   ├── App.tsx                       ✅ Created
│   ├── main.tsx                      ✅ Created
│   └── index.css                     ✅ Created
├── vite.config.ts                    ✅ Created
├── tsconfig.json                     ✅ Updated
├── index.html                        ✅ Created
└── package.json                      ✅ Updated
```

---

## Current Status

### ✅ Phase 2 Foundation Complete
- [x] Removed Expo/React Native dependencies
- [x] Set up Vite + React boilerplate
- [x] Created basic routing with React Router
- [x] Implemented navigation layout with bottom nav bar (mobile) and side nav (desktop)
- [x] Created all 7 main pages (Home, Games, GamePlay, Stats, StatsDetail, Learn, Admin)
- [x] Updated TypeScript configuration for web
- [x] Added basic styling and responsive design

### 📋 Phase 2 Implementation Tasks

#### P2-001: Navigation & Layout ✅ COMPLETE
**Objective**: Create responsive navigation structure
- [x] React Router setup with 7 main routes
- [x] Bottom tab navigation bar (mobile responsive)
- [x] Side navigation bar (desktop responsive at 768px+)
- [x] Layout component with Outlet for page content
- [x] Active page highlighting with useLocation() hook

**Files Created**:
- `src/layout/Layout.tsx` (40 lines)
- `src/layout/Layout.css` (65 lines)
- `src/App.tsx` (28 lines)

**What It Does**:
- Routes users between 7 pages via React Router
- Shows bottom navigation on mobile devices (80px fixed bar)
- Shows side navigation on desktop (200px fixed sidebar)
- Highlights current page in navigation

---

#### P2-002: Home Page & Game Fetching 🔄 IN PROGRESS
**Objective**: Create home page and integrate game API

**Tasks**:
- [x] Create HomePage.tsx with hero section and CTA
- [ ] Implement Zustand store for games list
- [ ] Fetch games from `GET /api/games`
- [ ] Display game cards in grid layout
- [ ] Add "Play" button to each game card
- [ ] Handle loading and error states

**Expected Output**:
- Hero section with tagline and "Play Games" button
- Grid of game cards showing:
  - Game name
  - Number range (e.g., "Pick 6 from 1-49")
  - Quick stats (win rate, avg draws)
  - Play button linking to `/games/:id`

**Files to Create**:
- `src/store/gamesStore.ts` - Games state management
- `src/api/games.ts` - API client for game endpoints
- `src/components/GameCard.tsx` - Reusable game card component

---

#### P2-003: Game Play Screen 📋 TO DO
**Objective**: Create interactive number selection and play simulation

**Tasks**:
- [ ] Create number selection UI (dynamic grid)
- [ ] Implement toggle-based number selection with visual feedback
- [ ] Show selected count indicator
- [ ] Implement "Play" button (disabled until correct count)
- [ ] Create draw simulation visualization
- [ ] Display results (your numbers vs winning numbers)
- [ ] Show match count and prize status
- [ ] API integration: `POST /api/games/:id/play`

**Expected Output**:
- Dynamic grid of numbers based on game spec
- Toggle numbers on/off with highlight effect
- Progress indicator (e.g., "5 of 6 selected")
- Animated draw simulation (0-100% progress)
- Results display with clear winner/loser indication

**Files to Create**:
- `src/pages/GamePlayPage.tsx` (full implementation, currently stub)
- `src/components/NumberSelector.tsx`
- `src/components/DrawAnimation.tsx`
- `src/components/ResultsDisplay.tsx`
- `src/store/gamePlayStore.ts`

---

#### P2-004: Statistics Display 📋 TO DO
**Objective**: Show game statistics and probability information

**Tasks**:
- [ ] Fetch stats from `GET /api/stats/:gameId`
- [ ] Display game statistics page
- [ ] Show probability and odds information
- [ ] Create probability examples section
- [ ] Link stats to individual game pages
- [ ] Educational content about lottery odds

**Expected Output**:
- Stats page showing all games with:
  - Total plays
  - Win rate percentage
  - Average draws to win
  - Winning odds (calculated probability)
- Individual stats page (`/stats/:id`) with detailed breakdown
- Educational explanations of probabilities

**Files to Create**:
- `src/pages/StatsPage.tsx` (full implementation, currently stub)
- `src/pages/StatisticsDetailPage.tsx` (full implementation, currently stub)
- `src/components/StatCard.tsx`
- `src/components/ProbabilityExplainer.tsx`
- `src/store/statsStore.ts`
- `src/api/stats.ts`

---

#### P2-005: Browser Storage & User Tracking 📋 TO DO
**Objective**: Initialize sessions and track user interactions

**Tasks**:
- [ ] Generate and store user session UUID
- [ ] Track game plays and navigation
- [ ] Store user interaction metrics
- [ ] Implement GDPR "Forget Me" deletion
- [ ] Save user preferences (theme, language)
- [ ] Sync tracking data to Metrics service

**Expected Output**:
- Session UUID persisted in localStorage
- User interactions sent to Metrics API
- Ability to delete all user data via admin panel
- Preference persistence across sessions

**Files to Create**:
- `src/utils/session.ts`
- `src/store/sessionStore.ts`
- `src/api/metrics.ts`

---

#### P2-006: Learn Page Content 📋 TO DO
**Objective**: Educational resources about lottery mathematics

**Tasks**:
- [ ] Create educational content pages
- [ ] Explain probability fundamentals
- [ ] Show odds calculation examples
- [ ] Create interactive probability visualizer
- [ ] Link to external resources

---

#### P2-007: Admin Dashboard 📋 TO DO
**Objective**: Administrative tools and metrics

**Tasks**:
- [ ] Create admin login/authentication
- [ ] Display system metrics
- [ ] User management tools
- [ ] Game statistics overview
- [ ] Email submission logs

---

## Running the Application

### Development
```bash
cd frontend
npm run dev
```

Server runs on `http://localhost:5173` with instant HMR (Hot Module Replacement)

### Build for Production
```bash
npm run build      # TypeScript compile + Vite build
npm run preview    # Test production build locally
```

### Proxy Configuration
- API calls to `/api/*` are automatically proxied to `http://localhost:3000` (backend API Gateway)
- Configured in `vite.config.ts`

### Backend: Ensure services are running
```bash
docker-compose up
```

Verify backend on:
- API Gateway: http://localhost:3000
- Should respond to: `GET /api/games`

---

## Key Improvements Over React Native Approach

| Aspect | React Native (Abandoned) | React Web (Current) |
|--------|--------------------------|-------------------|
| Bundler | Metro (platform conflicts) | Vite (zero-config) |
| Development | Slow HMR, Metro crashes | Instant HMR, stable |
| Dependencies | Expo, RN, incompatible versions | React, Router, standard web libs |
| Type Safety | Limited by RN types | Full TypeScript ecosystem |
| Debugging | Metro bundler black box | Browser DevTools |
| Platform Support | Mobile-primarily | Web-first + responsive mobile |
| Maintenance | Frequent Expo SDK updates | Stable, mature libraries |

---

## Architecture

```
React Web Frontend (Port 5173 - Vite)
│
├── Pages (React Router)
│   ├── / → HomePage
│   ├── /games → GamesPage (fetch from API)
│   ├── /games/:id → GamePlayPage (play game)
│   ├── /stats → StatsPage (view statistics)
│   ├── /stats/:id → StatisticsDetailPage
│   ├── /learn → LearnPage
│   └── /admin → AdminPage
│
├── State Management
│   ├── Zustand stores (games, playHistory, stats)
│   └── React Context (session, auth)
│
├── HTTP Client
│   └── Axios with base URL http://localhost:3000
│
└── Styling
    ├── CSS modules/plain CSS
    ├── Responsive design (mobile-first)
    └── Color scheme: Indigo primary (#6366f1)


API Gateway (Port 3000 - Express)
│
├── GET /api/games - Fetch all games
├── GET /api/games/:id - Get game details
├── POST /api/games/:id/play - Play a game
├── GET /api/stats/:gameId - Get game statistics
├── GET /api/stats - Get all statistics
├── GET /api/metrics/:sessionId - Get user metrics
└── POST /api/email - Submit contact form


PostgreSQL Database
├── games (name, description, min_number, max_number, numbers_to_select)
├── game_results (game_id, selected_numbers, winning_numbers, is_winner)
├── statistics (game_id, aggregated stats)
├── click_metrics (user_id, action, timestamp)
└── emails (sender, subject, body)
```

---

## Notes & Decisions

### Why No Global Authentication Yet?
- Admin page is public (no login) for Phase 2
- User tracking is session-based using UUID (not database users)
- Full authentication can be added in Phase 3 if needed

### Why Zustand + Context Mix?
- **Zustand** for large, complex state (games, results, stats)
- **React Context** for simple shared state (session, auth, theme)
- Both are lightweight and compose well together

### Why Responsive CSS Instead of Framework?
- Vite is framework-agnostic, CSS is portable
- Responsive design is simple with flexbox/grid
- No dependency on Bootstrap/Material UI
- Can add CSS framework later if needed

### Development Speed
- **React Native Phase 2**: ~6 hours (constant bundler troubleshooting)
- **React Web Phase 2**: Estimated ~4 hours (web stack is stable and fast)
- **Productivity gain**: +50% faster development cycle

---

## Testing Strategy

Each completed page will be tested:
1. ✅ Navigates correctly from other pages
2. ✅ Displays content without console errors
3. ✅ API calls return expected data
4. ✅ Responsive on mobile (width <= 768px) and desktop
5. ✅ TypeScript strict mode passes

---

## Next Actions

**Priority 1** (Immediate):
1. Implement Zustand store for games list
2. Create API client for `/api/games`
3. Complete P2-002 (Home page + game list)

**Priority 2** (Day 2):
1. Build game play screen (P2-003)
2. Implement number selection UI
3. Add draw simulation animation

**Priority 3** (Day 3):
1. Statistics page integration (P2-004)
2. User session tracking (P2-005)
3. Admin dashboard skeleton (P2-007)

**Priority 4** (Day 4):
1. Learn page content (P2-006)
2. Polish and refinement
3. Cross-browser testing

