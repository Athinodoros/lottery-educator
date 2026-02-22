# Lottery Educator - Architectural Layers Task Breakdown

**Project Timeline**: Feb 22, 2026 - Mar 31, 2026
**Team**: Solo developer + LLM guidance
**Cross-reference**: See [PHASE-ROADMAP.md](PHASE-ROADMAP.md) for timeline and phasing

---

## Infrastructure & Platform Layer

### Database Layer

#### DB-001: PostgreSQL Schema & Migrations
**Alias**: P0-004
- **Responsibility**: Design and initialize PostgreSQL database with proper schema
- **Phase**: Phase 0
- **Depends On**: None
- **Skills Needed**: Database Design, SQL

**Task Scope**:
1. Design tables: lottery_games, game_results (per game), emails, click_metrics
2. Create Knex.js migration files
3. Set up Docker Postgres service
4. Create database initialization script
5. Document schema in database/README.md

**RALF Loop**:
- **Retrieval**: Analyze data model requirements from business specs
- **Analysis**: Normalize schema, identify primary/foreign keys, plan for aggregation queries
- **Logical Reasoning**: One results table per game type for easy aggregation, metrics table indexed by link_id
- **Feedback**: Tables created, sample data loads, queries performant

**Testing**:
- Schema integrity tests
- Migration rollback/forward tests
- Sample data loading

**Logging & Metrics**:
- Migration execution logging
- Query execution time tracking

**Acceptance Criteria**: Schema matches design, all tables created, migrations work correctly

---

### Docker & Containerization

#### INFRA-001: Docker Service Configuration
**Alias**: P0-005
- **Responsibility**: Containerize all services and create local development environment
- **Phase**: Phase 0
- **Depends On**: P0-002, P0-003, P0-004
- **Skills Needed**: DevOps, Docker

**Task Scope**:
1. Create Dockerfile for backend services (Node.js)
2. Create Dockerfile for frontend (React Native web & build)
3. Create docker-compose.yml with all services
4. Configure volumes for hot reload
5. Create DevOps directory README.md

**RALF Loop**:
- **Retrieval**: Docker best practices, Node.js container patterns, React Native builds
- **Analysis**: Dev vs prod Dockerfile differences
- **Logical Reasoning**: Single compose file, environment variables for service discovery
- **Feedback**: `docker-compose up` starts entire stack

**Testing**:
- Service health checks
- Volume mount verification
- Network connectivity between services

**Logging & Metrics**:
- Container startup logs
- Health check status

**Acceptance Criteria**: All services start, communicate, and serve traffic locally

---

#### INFRA-002: Git Repository & CI/CD Skeleton
**Alias**: P0-001
- **Responsibility**: Initialize git repo and basic CI/CD workflows
- **Phase**: Phase 0
- **Depends On**: None
- **Skills Needed**: DevOps, Git

**Task Scope**:
1. Initialize git with .gitignore for Node/React/Docker
2. Create monorepo structure (backend/, frontend/, database/)
3. Create initial GitHub Actions workflow skeleton
4. Add root README.md
5. Create directory-specific README.md files

**RALF Loop**:
- **Retrieval**: Git workflows, monorepo best practices, GitHub Actions syntax
- **Analysis**: Branching strategy for solo dev, when to run tests
- **Logical Reasoning**: Simple trunk-based development, run all tests on PR
- **Feedback**: Clone repo, can run `docker-compose up`

**Testing**:
- Git workflow tests
- CI trigger verification

**Logging & Metrics**:
- CI pipeline execution logs

**Acceptance Criteria**: Repository initialized, CI skeleton runs, directory structure complete

---

## Backend Services Layer

### API Gateway / Router Service

#### GATEWAY-001: API Gateway Setup
**Alias**: P1-002
- **Responsibility**: Central request router to all backend services
- **Phase**: Phase 1
- **Depends On**: P0-002
- **Skills Needed**: Backend Architecture, Express.js

**Task Scope**:
1. Create Express app for API gateway
2. Implement routing middleware to game-engine, statistics, email, metrics services
3. Add CORS configuration for frontend
4. Add request logging middleware
5. Create Swagger/OpenAPI documentation skeleton

**RALF Loop**:
- **Retrieval**: API Gateway patterns, service routing, request logging
- **Analysis**: Mapping frontend API calls to backend services
- **Logical Reasoning**: Centralized entry point reduces frontend complexity
- **Feedback**: Frontend makes requests, routed to correct service

**Testing**:
- Routing accuracy tests
- CORS functionality tests
- Request logging verification

**Logging & Metrics**:
- All request logging with method, path, duration
- Error logging

**Acceptance Criteria**: All services routable through gateway, requests logged

---

### Game Engine Service

#### GAMES-001: Lottery Game Logic Engine
**Alias**: P1-001
- **Responsibility**: Implement core lottery game simulation logic
- **Phase**: Phase 1
- **Depends On**: P0-002, P0-004
- **Skills Needed**: Backend TypeScript, Domain Logic

**Task Scope**:
1. Design game type configurations (Lotto, Powerball, Euromillions)
2. Implement number validation (max, duplicates, jokers)
3. Implement draw simulation algorithm
4. Create API endpoints: POST /games/:type/play, GET /games/:type/result
5. Add transactional database writes

**RALF Loop**:
- **Retrieval**: Lottery game rules, draw probability
- **Analysis**: Game parameter ranges, validation rules
- **Logical Reasoning**: Simulate draws incrementally until winning combo, track iteration count
- **Feedback**: Can play games and get accurate draw counts

**Testing**:
- Unit tests for game logic
- Input validation tests
- Integration tests with database

**Logging & Metrics**:
- Game session logging (start, end, iterations)
- Draw count accuracy metrics
- GameEngine README.md with logic explanation

**Acceptance Criteria**: All games playable, draw counts correct, data persists

---

### Statistics & Analytics Service

#### STATS-001: Statistics Aggregation Engine
**Alias**: P1-003
- **Responsibility**: Calculate and cache game statistics
- **Phase**: Phase 1
- **Depends On**: P0-004, P1-001
- **Skills Needed**: Backend, Database Optimization

**Task Scope**:
1. Create aggregation queries for each game (avg, min, max, percentiles)
2. Design caching layer (Redis or in-memory for MVP)
3. Implement API endpoints: GET /stats/:gameType, GET /stats/:gameType/examples
4. Generate human-readable examples (e.g., "123 lifetimes")
5. Implement example limit (max 5000)

**RALF Loop**:
- **Retrieval**: SQL aggregation patterns, caching strategies, statistical calculations
- **Analysis**: Which stats to pre-compute vs on-demand
- **Logical Reasoning**: Cache popular stats, calculate examples on first request
- **Feedback**: Stats match database calculations, examples within limits

**Testing**:
- Aggregation accuracy tests
- Cache hit/miss tests
- Example generation logic tests

**Logging & Metrics**:
- Aggregation query execution time
- Cache hit rate
- Example generation metrics

**Acceptance Criteria**: Stats accurate, cached, examples well-formatted and limited

---

### Email Service

#### EMAIL-001: Contact Form Email Handler
**Alias**: P1-004
- **Responsibility**: Receive, validate, and store contact form emails
- **Phase**: Phase 1
- **Depends On**: P0-002, P0-004
- **Skills Needed**: Backend, Data Privacy

**Task Scope**:
1. Create email submission endpoint: POST /emails/submit
2. Validate input (email format, title, body)
3. Store in database (NO IP tracking as per requirements)
4. Create deletion endpoint: DELETE /emails/:id
5. Implement rate limiting (e.g., 5 per IP per hour)

**RALF Loop**:
- **Retrieval**: Email validation patterns, GDPR compliance, rate limiting
- **Analysis**: Required fields, privacy constraints
- **Logical Reasoning**: Minimal data storage, achievable deletion, rate limiting for spam
- **Feedback**: Submit test email, see in database, delete works

**Testing**:
- Validation tests (format, length)
- Database persistence tests
- Deletion tests
- Rate limiting tests

**Logging & Metrics**:
- Email submissions logged (without sensitive data)
- Deletion logging
- Failed submissions logging

**Acceptance Criteria**: Emails stored/deleted correctly, no sensitive data, rate limiting works

---

### Metrics Service

#### METRICS-001: Click Tracking & Aggregation
**Alias**: P1-005
- **Responsibility**: Track user interaction metrics and provide aggregated views
- **Phase**: Phase 1
- **Depends On**: P0-002, P0-004
- **Skills Needed**: Backend, Analytics

**Task Scope**:
1. Design click event data model (link_id, timestamp, no PII)
2. Create tracking endpoint: POST /metrics/click/:linkId
3. Aggregate clicks by link: GET /metrics/summary
4. Calculate click percentages (% of total clicks per link)
5. Expose metrics for admin dashboard

**RALF Loop**:
- **Retrieval**: Event tracking patterns, aggregation strategies
- **Analysis**: Which links to track (game selections, navigation)
- **Logical Reasoning**: Track by link ID, no user identification
- **Feedback**: Click tracked in frontend, appears in aggregation

**Testing**:
- Click tracking accuracy tests
- Aggregation calculation tests
- Percentage accuracy tests

**Logging & Metrics**:
- Click submission logging
- Aggregation refresh logging
- Query performance tracking

**Acceptance Criteria**: Clicks tracked, aggregation accurate, percentages correct

---

## Frontend Layer

### Navigation & Core Application

#### FRONTEND-001: Navigation Structure & App Shell
**Alias**: P2-001
- **Responsibility**: Build navigation and overall app structure
- **Phase**: Phase 2
- **Depends On**: P0-003, P1-002
- **Skills Needed**: Frontend TypeScript, React Navigation

**Task Scope**:
1. Create screen navigation hierarchy
2. Implement bottom tab navigator (Home, Games, Motivation, Admin)
3. Create reusable Header component
4. Set up navigation state management
5. Create screens/ directory README.md

**RALF Loop**:
- **Retrieval**: React Navigation documentation, mobile patterns
- **Analysis**: Screen hierarchy and transitions
- **Logical Reasoning**: Tabbed navigation for main screens, nested stack for game types
- **Feedback**: Navigate smoothly between screens, state persists

**Testing**:
- Navigation flow tests
- Screen render tests
- State management tests

**Logging & Metrics**:
- Screen transitions logged
- Navigation timing

**Acceptance Criteria**: All screens accessible, smooth navigation, state managed

---

### Home & Game Selection Screens

#### FRONTEND-002: Home Page & Game Selection
**Alias**: P2-002
- **Responsibility**: Build home page with game selection UI
- **Phase**: Phase 2
- **Depends On**: P2-001, P1-003
- **Skills Needed**: Frontend UI/UX

**Task Scope**:
1. Design home page layout
2. Fetch game list from backend
3. Display summary statistics
4. Create game selection cards/buttons
5. Implement lazy loading for performance

**RALF Loop**:
- **Retrieval**: Game configuration API contract, UI patterns
- **Analysis**: What stats to show on home vs detail pages
- **Logical Reasoning**: High-level stats on home, detailed stats on game pages
- **Feedback**: Home loads in < 2 seconds, games selectable

**Testing**:
- Component render tests
- API integration tests
- Loading state tests

**Logging & Metrics**:
- Home page load time
- Game selection tracking
- API response time

**Acceptance Criteria**: Home loads fast, games displayed, selection triggers play

---

### Game Play Screens

#### FRONTEND-003: Game Play Screen
**Alias**: P2-003
- **Responsibility**: Build interactive lottery game UI
- **Phase**: Phase 2
- **Depends On**: P2-001, P1-001
- **Skills Needed**: Frontend UI/UX, State Management

**Task Scope**:
1. Create number selection UI (number pad, grid, quick picks)
2. Implement joker/bonus number selection
3. Create Play button and draw progress display
4. Show real-time progress with visual feedback
5. Display results with explanation

**RALF Loop**:
- **Retrieval**: Number input patterns, progress indication, animation libraries
- **Analysis**: How to show draw progress without blocking UI
- **Logical Reasoning**: Async draw request, show progress updates, display results when complete
- **Feedback**: Play full game, watch progress animation, see results

**Testing**:
- Number validation tests
- Draw request tests
- Result display tests
- Progress animation tests

**Logging & Metrics**:
- Game play duration
- Number of attempts
- Draw completion time
- Results display time

**Acceptance Criteria**: Numbers validated, draw progresses, results accurate

---

#### FRONTEND-004: Statistics & Examples Display
**Alias**: P2-004
- **Responsibility**: Display game statistics and human-readable examples
- **Phase**: Phase 2
- **Depends On**: P2-003, P1-003
- **Skills Needed**: Frontend, Data Visualization

**Task Scope**:
1. Create statistics display (avg, min, max, percentiles)
2. Fetch recent examples from statistics service
3. Format examples in human-readable way
4. Display game comparisons
5. Create scrollable examples list

**RALF Loop**:
- **Retrieval**: Data visualization patterns, example formatting
- **Analysis**: How to present odds in understandable way
- **Logical Reasoning**: Use analogies (lifetimes, years of daily plays), show progression
- **Feedback**: Stats accurate, examples understandable, comparisons clear

**Testing**:
- Statistics display tests
- Example formatting tests
- Comparison accuracy tests

**Logging & Metrics**:
- Statistics view time
- Examples scroll depth
- Comparison view tracking

**Acceptance Criteria**: Stats display correctly, examples readable, comparisons accurate

---

### Motivation & Information Screen

#### FRONTEND-005: Motivation & Contact Page
**Alias**: Related to P1-004
- **Responsibility**: Build motivation page with contact form
- **Phase**: Phase 2
- **Depends On**: P2-001, P1-004
- **Skills Needed**: Frontend

**Task Scope**:
1. Create motivation/mission statement page
2. Build contact form (email, title, body)
3. Implement form validation
4. Handle form submission to email service
5. Show success/error messages

**RALF Loop**:
- **Retrieval**: Form patterns, validation libraries, privacy-compliant contact forms
- **Analysis**: Form fields required, validation rules
- **Logical Reasoning**: Simple form, no IP logging, secure submission
- **Feedback**: Submit test email, see success message

**Testing**:
- Form validation tests
- Submission tests
- Error handling tests

**Logging & Metrics**:
- Form submission tracking
- Validation error tracking

**Acceptance Criteria**: Form submits correctly, backend receives email, user gets feedback

---

### User Tracking & Session Management

#### FRONTEND-006: Browser Storage & User Tracking
**Alias**: P2-005
- **Responsibility**: Implement local user tracking without PII
- **Phase**: Phase 2
- **Depends On**: P2-001, P1-005
- **Skills Needed**: Frontend, Data Privacy

**Task Scope**:
1. Create browser storage wrapper
2. Generate anonymous session ID
3. Track game plays and page visits
4. Send metrics to metrics service
5. Create "Forget Me" data deletion option

**RALF Loop**:
- **Retrieval**: Browser storage APIs, privacy considerations, metric tracking
- **Analysis**: What data to track locally vs send to server
- **Logical Reasoning**: Generate random session ID, track plays locally, send summaries
- **Feedback**: Session persists across visits, metrics appear in backend

**Testing**:
- Storage operation tests
- Session ID generation tests
- Metric send tests
- Deletion tests

**Logging & Metrics**:
- Session tracking accuracy
- Metric send success rate
- Storage efficiency

**Acceptance Criteria**: Session tracking works, metrics sent, can delete all data

---

### Admin Interface

#### FRONTEND-007: Admin Login & Dashboard
**Alias**: P4-005
- **Responsibility**: Build hidden admin interface
- **Phase**: Phase 4
- **Depends On**: P2-001, P4-004
- **Skills Needed**: Frontend, UI

**Task Scope**:
1. Create hidden admin URL/screen
2. Build login form (hardcoded credentials)
3. Build metrics view (click percentages)
4. Build email view (contact submissions)
5. Build game statistics view

**RALF Loop**:
- **Retrieval**: Admin dashboard patterns, data visualization
- **Analysis**: Admin-critical metrics and views
- **Logical Reasoning**: Simple authentication, read-only data views
- **Feedback**: Login to admin, see real data

**Testing**:
- Login flow tests
- Data display tests
- Permission tests (admin-only screens)

**Logging & Metrics**:
- Admin access logging
- Data view tracking

**Acceptance Criteria**: Admin login works, all data visible and accurate

---

## Testing Infrastructure Layer

#### TESTING-001: Backend Unit & Integration Tests
**Alias**: P3-001
- **Responsibility**: Comprehensive backend test suite
- **Phase**: Phase 3
- **Depends On**: P1-001 through P1-005
- **Skills Needed**: Backend Testing, Jest

**Task Scope**:
1. Set up Jest for each service
2. Write unit tests for business logic
3. Write integration tests between services
4. Test database operations
5. Achieve 80%+ code coverage

**RALF Loop**:
- **Retrieval**: Jest patterns, mocking strategies, integration testing
- **Analysis**: Critical logic for unit testing, service interactions for integration tests
- **Logical Reasoning**: Test game logic precisely, mock external services
- **Feedback**: All tests pass, coverage > 80%

**Testing**:
- Test framework validation
- Coverage measurement

**Logging & Metrics**:
- Test execution time
- Code coverage percentage

**Acceptance Criteria**: Tests pass, coverage > 80%, CI integration working

---

#### TESTING-002: Frontend Component & Integration Tests
**Alias**: P3-002
- **Responsibility**: React Native component test suite
- **Phase**: Phase 3
- **Depends On**: P2-001 through P2-005
- **Skills Needed**: Frontend Testing

**Task Scope**:
1. Set up React Testing Library
2. Write component tests
3. Write screen/integration tests
4. Test user journeys (select game → play → results)
5. Test accessibility

**RALF Loop**:
- **Retrieval**: React Testing Library patterns, a11y testing
- **Analysis**: Critical user journeys, component interactions
- **Logical Reasoning**: Test screen-level flows, mock backend
- **Feedback**: Key user paths tested end-to-end

**Testing**:
- Test framework validation
- a11y issues detection

**Logging & Metrics**:
- Test execution time
- Test coverage

**Acceptance Criteria**: Critical user journeys tested, a11y issues found and fixed

---

#### TESTING-003: End-to-End Testing
**Alias**: P3-003
- **Responsibility**: Complete system integration testing
- **Phase**: Phase 3
- **Depends On**: P3-001, P3-002
- **Skills Needed**: Testing, QA

**Task Scope**:
1. Set up E2E framework (Detox/Cypress)
2. Test complete game play flows
3. Verify statistics accuracy E2E
4. Test contact form flow
5. Automate E2E in CI/CD

**RALF Loop**:
- **Retrieval**: E2E framework setup, test data management
- **Analysis**: Critical paths requiring E2E verification
- **Logical Reasoning**: Spin up full stack, execute user scenarios
- **Feedback**: E2E tests catch regressions automatically

**Testing**:
- E2E framework validation
- Test automation verification

**Logging & Metrics**:
- E2E test execution time
- Pass/fail tracking

**Acceptance Criteria**: Critical flows E2E tested, automated in CI

---

## Observability Stack

#### OPS-001: Logging Infrastructure (ELK Stack)
**Alias**: P4-001
- **Responsibility**: Set up centralized logging
- **Phase**: Phase 4
- **Depends On**: P0-005
- **Skills Needed**: DevOps, Logging

**Task Scope**:
1. Set up ELK Stack in Docker Compose
2. Configure Winston logger with ELK output
3. Add structured logging to all services
4. Create Kibana dashboards
5. Create Ops README.md

**RALF Loop**:
- **Retrieval**: ELK setup, Winston patterns, structured logging
- **Analysis**: What fields to log, log levels
- **Logical Reasoning**: JSON structured logs, context-aware fields (request ID, service)
- **Feedback**: Services log to Kibana, searchable dashboards

**Testing**:
- Log ingestion tests
- Dashboard functionality tests

**Logging & Metrics**:
- Log volume tracking
- ELK storage usage

**Acceptance Criteria**: All services logging to ELK, searchable in Kibana

---

#### OPS-002: Metrics & Monitoring (Prometheus + Grafana)
**Alias**: P4-002
- **Responsibility**: Set up metrics collection and visualization
- **Phase**: Phase 4
- **Depends On**: P0-005, P1-001 through P1-005
- **Skills Needed**: DevOps, Monitoring

**Task Scope**:
1. Set up Prometheus in Docker Compose
2. Add Prometheus client to services
3. Define key metrics (latency, error rate, database queries)
4. Set up Grafana with Prometheus datasource
5. Create operational dashboards

**RALF Loop**:
- **Retrieval**: Prometheus metrics, Grafana dashboard design
- **Analysis**: Critical metrics by service
- **Logical Reasoning**: Request latency, error rates, database query times
- **Feedback**: Metrics visible in Grafana, updated in real-time

**Testing**:
- Metric scraping tests
- Dashboard functionality tests

**Logging & Metrics**:
- Prometheus storage growth
- Query performance

**Acceptance Criteria**: All services exporting metrics, visible in Grafana

---

#### OPS-003: CI/CD Pipeline
**Alias**: P4-003
- **Responsibility**: Complete GitHUb Actions CI/CD workflow
- **Phase**: Phase 4
- **Depends On**: P3-001, P3-002, P3-003
- **Skills Needed**: DevOps, CI/CD

**Task Scope**:
1. Create build stage (lint, compile)
2. Create test stage (unit, integration, E2E)
3. Create security scanning stage
4. Create Docker image build stage
5. Create deployment stage skeleton

**RALF Loop**:
- **Retrieval**: GitHub Actions patterns, pipeline design
- **Analysis**: What checks must pass
- **Logical Reasoning**: Lint → Test → Build → Security → Package
- **Feedback**: Push code, pipeline runs automatically

**Testing**:
- Pipeline execution tests
- Stage advancement verification

**Logging & Metrics**:
- Pipeline runtime
- Pass rate tracking

**Acceptance Criteria**: Push code, automated pipeline runs through all stages

---

## Documentation Layer

#### DOCS-001: Architecture & Operations Documentation
**Alias**: P5-004
- **Responsibility**: Complete project documentation
- **Phase**: Phase 5
- **Depends On**: All phases
- **Skills Needed**: Technical Writing

**Task Scope**:
1. Write architecture documentation
2. Create deployment runbook
3. Create troubleshooting guide
4. Export API documentation (Swagger)
5. Create emergency procedures

**RALF Loop**:
- **Retrieval**: System components, operation procedures
- **Analysis**: Critical documentation for maintenance
- **Logical Reasoning**: Document service responsibilities, common issues, fix procedures
- **Feedback**: New dev understands system, ops can handle incidents

**Testing**:
- Documentation completeness review

**Logging & Metrics**:
- Documentation coverage

**Acceptance Criteria**: Complete architecture docs, deployment runbook, troubleshooting guide

---

## Cross-Layer Dependencies

### Service Communication Map

```
Frontend (React Native)
  ├─→ API Gateway
       ├─→ Game Engine Service → Database (lottery_games, results tables)
       ├─→ Statistics Service → Database (cached results)
       ├─→ Email Service → Database (emails table)
       └─→ Metrics Service → Database (click_metrics table)
```

### Data Flow

1. **Game Play Flow**: Frontend → Gateway → Game Engine → DB → Statistics Cache
2. **Metrics Flow**: Frontend → Gateway → Metrics Service → DB
3. **Contact Flow**: Frontend → Gateway → Email Service → DB
4. **Admin View**: Frontend (Admin) → Gateway → Stats/Metrics Services → DB

---

## Notes

- **Task IDs**: Format is LAYER-###, mapping to Phase-Task format for sync with [PHASE-ROADMAP.md](PHASE-ROADMAP.md)
- **Dependencies**: Include both within-layer and cross-layer dependencies
- **Testing**: Each layer has dedicated testing tasks in Phase 3
- **Documentation**: Directory-specific README.md files required (see [MasterPrompt.txt](MasterPrompt.txt))
- **Monitoring**: From Phase 4 onwards, all services instrumented with logging and metrics

