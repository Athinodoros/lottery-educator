# Lottery Educator 🎰

**An educational platform to simulate lottery games and teach users about the unlikeliness of winning**

## 🎯 Project Purpose

Lottery Educator helps users understand the improbability of winning by simulating realistic lottery games and presenting statistical results in human-understandable ways (e.g., "would take 123 lifetimes of daily plays to win").

The platform targets:
- Young people not yet addicted to gambling
- Adults struggling to understand odds
- Psychology professionals using it as an educational tool

## 📊 Project Status

- **Start Date**: February 22, 2026
- **Target Launch**: March 31, 2026
- **Team**: Solo developer + LLM assistance
- **Phase**: Phase 0 - Project Setup & Infrastructure (Week 1)

## 🏗️ Project Structure

```
lottery-educator/
├── backend/              # Node.js microservices
│   ├── api-gateway/     # Central request router
│   ├── game-engine/     # Lottery simulation logic
│   ├── statistics/      # Analytics and aggregation
│   ├── email-service/   # Contact form handling
│   └── metrics-service/ # User interaction tracking
├── frontend/            # React Native app (web + mobile)
├── database/            # PostgreSQL schemas & migrations
├── .github/workflows/   # CI/CD pipelines
├── docker-compose.yml   # Local development setup
└── README.md           # This file
```

## 🔧 Tech Stack (Fixed)

- **Language**: TypeScript (all layers)
- **Frontend**: React Native + Expo (web and mobile)
- **Backend**: Node.js + Express.js (4 microservices)
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring**: Prometheus + Grafana
- **Testing**: Jest (unit/integration) + Detox/Cypress (E2E)

## 📖 Documentation

- **[PHASE-ROADMAP.md](../PHASE-ROADMAP.md)** - Timeline and sequential phases
- **[ARCHITECTURAL-LAYERS.md](../ARCHITECTURAL-LAYERS.md)** - Services organized by technical concern
- **[FEATURE-BREAKDOWN.md](../FEATURE-BREAKDOWN.md)** - Features with implementation details
- **[MasterPrompt.txt](../MasterPrompt.txt)** - Comprehensive project prompt for LLM
- **[lottery-prompt.txt](../lottery-prompt.txt)** - Project requirements and specifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Local Development

```bash
# Clone repository (already initialized)
cd lottery-educator

# Install all dependencies
npm run install:all

# Start local development environment
npm run docker:up
npm run dev

# Stop local environment
npm run docker:down
```

## 🎯 Current Phase Tasks

### Phase 0: Project Setup & Infrastructure (Feb 22-28)

- [x] P0-001: Project & Git Repository Setup
- [ ] P0-002: Backend Service Scaffolding
- [ ] P0-003: Frontend (React Native) Scaffolding
- [ ] P0-004: PostgreSQL Setup & Schema Design
- [ ] P0-005: Docker & Docker Compose Setup

See [PHASE-ROADMAP.md](../PHASE-ROADMAP.md) for complete timeline.

## 📝 Key Features

1. **Lottery Game Simulation** - Play different lottery games (Lotto, Powerball, etc.)
2. **Educational Statistics** - See how many draws it took to win with human-readable examples
3. **Contact & Motivation** - Contact the creator, learn the mission
4. **Admin Dashboard** - Track metrics, emails, and game statistics (hidden page)
5. **User Tracking** - Anonymous session tracking with GDPR compliance

## 🔐 Privacy & Compliance

- ✅ **No IP tracking** (except for logging contact form rate limiting)
- ✅ **No user identification** required
- ✅ **GDPR compliant** with "Forget Me" option
- ✅ **Data minimization** - only store what's necessary
- ✅ **Voluntary contact form** - no forced data collection

## 📊 Success Metrics

- Site visits (primary metric - more visits = more people educated)
- User engagement (time on site, game plays per session)
- Feature adoption (which games are played most)
- Contact form submissions (people wanting more info)

## 🛠️ Development Workflow

1. **Check current phase** in [PHASE-ROADMAP.md](../PHASE-ROADMAP.md)
2. **Pick a task** for your sprint
3. **Reference architectural/feature documents** for implementation details
4. **Create README.md in each directory** as you add services/modules
5. **Keep documentation in sync** across all three task documents
6. **Commit frequently** with task IDs (e.g., "P0-001: repo setup")

## 📚 Directory Documentation

Each directory contains a `README.md` explaining its purpose and contents:

- [backend/README.md](./backend/README.md) - Backend architecture overview
- [frontend/README.md](./frontend/README.md) - Frontend structure and patterns
- [database/README.md](./database/README.md) - Database schema and design

## 🤝 Contributing (Solo Development)

This is a solo project with LLM assistance. Use the task documents as your specification and the LLM for:
- Code generation and scaffolding
- Project management and task breakdown
- Architecture decisions
- Testing strategies
- Documentation

## 📅 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0 | Feb 22-28 | 🔄 In Progress |
| Phase 1 | Mar 1-14 | Planned |
| Phase 2 | Mar 7-20 | Planned |
| Phase 3 | Mar 14-27 | Planned |
| Phase 4 | Mar 21-27 | Planned |
| Phase 5 | Mar 27-31 | Planned |
| Phase 6 | Mar 31+ | Planned |

## 📝 Notes

- Phases **intentionally overlap** for efficiency
- Tasks are **1-3 days each** for realistic solo development
- **Use LLM assistance** for code generation and guidance
- **Commit after each task** for checkpoint recovery
- **Keep README.md files updated** in each directory

---

**Last Updated**: February 22, 2026
**Phase**: 0 - Project Setup & Infrastructure
**Next Task**: P0-002 - Backend Service Scaffolding
