# Lottery Educator

**An educational platform that simulates lottery games to teach users about the statistical improbability of winning**

## Project Purpose

Lottery Educator helps users understand the real odds of winning through interactive simulations. Players select their numbers, watch simulated draws, and see firsthand how many attempts it takes to match their selection.

The platform targets:
- Young people learning about probability and financial literacy
- Adults who want to better understand lottery odds
- Educators and psychology professionals using it as a teaching tool

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router, Zustand
- **Backend**: 5 Node.js/Express microservices (TypeScript)
- **Database**: PostgreSQL 15 (Docker)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston (structured JSON in production)
- **Testing**: Vitest (frontend, 176 tests), Jest (backend, 69 tests)
- **CI/CD**: GitHub Actions

## Project Structure

```
lottery-educator/
├── backend/
│   ├── api-gateway/       # Central router & admin auth (PORT 3000)
│   ├── game-engine/       # Lottery simulation logic (PORT 3001)
│   ├── statistics/        # Analytics & aggregation (PORT 3002)
│   ├── email-service/     # Contact form + GDPR (PORT 3003)
│   └── metrics-service/   # Click & session tracking (PORT 3004)
├── frontend/
│   └── src/
│       ├── pages/         # 9 route pages (Home, Games, GamePlay, Stats, etc.)
│       ├── components/    # Reusable UI (NumberSelector, DrawAnimation, etc.)
│       ├── layout/        # Layout shell with bottom/side navigation
│       ├── api/           # Axios HTTP client & service methods
│       ├── store/         # Zustand state management
│       └── utils/         # Session, storage helpers
├── database/
│   ├── schema.sql         # 4 tables, 2 views, 8 indexes
│   └── seeds/             # Initial game data
├── monitoring/
│   └── prometheus.yml     # Scrape config
├── .github/workflows/
│   └── ci-cd.yml          # Matrix-strategy CI pipeline
└── docker-compose.yml     # Full stack orchestration
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker & Docker Compose (for database)

### Development

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Install dependencies
npm run install:all

# Start backend services (each in a separate terminal)
npm run dev:gateway    # API Gateway on :3000
npm run dev:games      # Game Engine on :3001
npm run dev:stats      # Statistics on :3002
npm run dev:email      # Email Service on :3003
npm run dev:metrics    # Metrics Service on :3004

# Start frontend (separate terminal)
cd frontend && npm run dev
```

The frontend dev server proxies `/api` requests to the API Gateway at `localhost:3000`.

### Full Docker Stack

```bash
docker-compose up        # Start everything
docker-compose down      # Stop everything
```

### Running Tests

```bash
# Frontend tests (176 tests)
cd frontend && npx vitest run

# Backend tests (per service)
cd backend/api-gateway && npx jest
cd backend/game-engine && npx jest
cd backend/statistics && npx jest
cd backend/email-service && npx jest
cd backend/metrics-service && npx jest
```

## Features

### Pages
- **Home** - Landing page with feature overview and CTA
- **Games** - Browse available lottery games (Powerball, Mega Millions, etc.)
- **Game Play** - Interactive number picker with draw simulation
- **Statistics** - Session metrics, play metrics, and per-game stats
- **Statistics Detail** - Deep-dive probability analysis for each game
- **Learn** - Educational content about probability, expected value, gambler's fallacy
- **Contact** - Contact form with email validation
- **Admin** - Authenticated dashboard with overview, emails, metrics, and games tabs

### Backend
- **API Gateway** - Routes requests to microservices, admin auth, Prometheus metrics endpoint
- **Game Engine** - CRUD for games, play simulation with configurable rules
- **Statistics** - Aggregated stats per game with caching
- **Email Service** - Contact form storage with rate limiting and GDPR soft-delete
- **Metrics Service** - Anonymous click and session tracking

### Admin Dashboard
- Login with environment-configured credentials
- Overview: total games, plays, wins, win rate, service health
- Email management with deletion
- Click metrics with distribution visualization
- Per-game statistics table

## Database Schema

| Table | Purpose |
|-------|---------|
| `games` | Lottery game definitions (number ranges, selection count) |
| `game_results` | Individual play records with draws-to-win |
| `emails` | Contact form submissions (GDPR soft-delete) |
| `click_metrics` | Anonymous interaction tracking |

Views: `game_statistics` (aggregated per-game stats), `click_metrics_summary` (click distribution)

## Accessibility

- Skip-to-main-content link
- `aria-current="page"` on active navigation
- `role="alert"` on error messages and form validation
- `role="status"` with screen-reader text on loading states
- Loading skeleton placeholders (shimmer animation)
- `prefers-reduced-motion` media query support
- Focus-visible outlines on all interactive elements
- Semantic HTML (`header`, `section`, `nav`, `main`, `aside`)

## Privacy & Compliance

- No IP address tracking
- Anonymous UUID-based sessions
- GDPR-compliant with soft-delete pattern
- No user accounts or identification required
- "Forget Me" data deletion support

## Environment Variables

### API Gateway
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Service port |
| `GAME_ENGINE_URL` | http://localhost:3001 | Game engine service URL |
| `STATISTICS_URL` | http://localhost:3002 | Statistics service URL |
| `EMAIL_SERVICE_URL` | http://localhost:3003 | Email service URL |
| `METRICS_SERVICE_URL` | http://localhost:3004 | Metrics service URL |
| `ADMIN_USERNAME` | admin | Admin login username |
| `ADMIN_PASSWORD` | lottery-educator-2026 | Admin login password |

### All Backend Services
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgres://postgres:postgres@localhost:5432/lottery_dev | PostgreSQL connection |
| `LOG_LEVEL` | info | Winston log level |
| `NODE_ENV` | development | Environment mode |

## Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Project Setup & Infrastructure | Complete |
| Phase 1 | Backend Services Core | Complete |
| Phase 2 | Frontend UI Implementation | Complete |
| Phase 3 | Testing & Quality Assurance | Complete |
| Phase 4 | Logging, Monitoring & DevOps | Complete |
| Phase 5 | Polish, Performance & A11y | Complete |
| Phase 6 | Deployment & Production | Not started |

All 245 tests passing (176 frontend + 69 backend).
