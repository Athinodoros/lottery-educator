# Lottery Educator - Feature-Based Breakdown

**Project Timeline**: Feb 22, 2026 - Mar 31, 2026
**Team**: Solo developer + LLM guidance
**Cross-reference**: See [PHASE-ROADMAP.md](PHASE-ROADMAP.md) for phasing and [ARCHITECTURAL-LAYERS.md](ARCHITECTURAL-LAYERS.md) for layer organization

---

## Feature 1: Lottery Game Simulation

**Business Purpose**: Allow users to play different lottery games and see how many draws it takes to win

**Related Phases**: Phase 1 (backend), Phase 2 (frontend), Phase 3 (testing)

### Backend Tasks

#### FEATURE-GAMES-001: Game Engine Service - Core Logic
**Equivalent to**: P1-001, GAMES-001
- **Phase**: Phase 1
- **Responsible Microservice**: Game Engine Service
- **Depends On**: Database schema (P0-004), Express template (P0-002)
- **Skills Needed**: Backend TypeScript, Domain Logic

**Deliverables**:
1. Game configuration module (Lotto, Powerball, Euromillions, etc.)
2. Number input validator (max numbers, range, duplicates, jokers)
3. Draw simulator (incremental drawing until match)
4. Database persistence for results
5. Service README.md explaining game logic

**RALF Loop**:
- **Retrieval**: Lottery game rules from business requirements, probability calculations
- **Analysis**: Game parameters (number ranges, draw count limits)
- **Logical Reasoning**: Stateless game logic, simulate draws incrementally, track iteration count
- **Feedback**: Play test games, verify draw counts are realistic

**Testing**:
- Unit tests: Number validation (invalid ranges, duplicates)
- Unit tests: Draw simulation (correct winning detection)
- Unit tests: Game configuration loading
- Integration tests: Database persistence of results
- Edge case: Zero draws (impossible), very large draw counts

**Logging & Metrics**:
- Log game session start/end with game type and selected numbers
- Log final draw count and win detection
- Metrics: average draw count per game type, min/max draws

**Acceptance Criteria**:
- ✅ All 3+ lottery games playable with accurate draw counts
- ✅ Results persist correctly to database
- ✅ Number validation catches invalid inputs
- ✅ Draw simulation mathematically correct for game rules

---

#### FEATURE-GAMES-002: Game Results Storage
**Equivalent to**: P1-001 (database portion)
- **Phase**: Phase 1 (overlaps with game logic)
- **Responsible Microservice**: Game Engine Service + Database
- **Depends On**: Database schema per game (P0-004)
- **Skills Needed**: Backend, Database

**Deliverables**:
1. Create game result tables (one per game type)
2. Add indexes for frequent queries (winner detection, aggregation)
3. Document schema in database/README.md
4. Create seed data script for each game

**RALF Loop**:
- **Retrieval**: Game result schema requirements, indexing strategy
- **Analysis**: Query patterns (aggregation for stats, trend analysis)
- **Logical Reasoning**: One table per game for easy per-game aggregation
- **Feedback**: Queries are fast, aggregations efficient

**Testing**:
- Database operation tests (insert, select, aggregate)
- Index performance tests
- Migration tests (rollback/forward)

**Logging & Metrics**:
- Query execution time logging
- Table row count tracking

**Acceptance Criteria**:
- ✅ All game result tables created with proper indexes
- ✅ Queries return results in < 100ms

---

### Frontend Tasks

#### FEATURE-GAMES-003: Game Selection Screen
**Equivalent to**: P2-002 (game selection portion)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Navigation setup (P2-001), API Gateway (P1-002)
- **Skills Needed**: Frontend TypeScript, UI/UX

**Deliverables**:
1. Game selection screen with card-based UI
2. Game description and difficulty indicator
3. Fetch game list from backend
4. Navigate to game play screen on selection
5. Create screens/games/README.md

**RALF Loop**:
- **Retrieval**: Game list API contract, game descriptions, UI patterns
- **Analysis**: Information architecture (game details vs selection)
- **Logical Reasoning**: Simple card layout, game selection triggers game screen
- **Feedback**: Browse games, select one, navigate to play screen

**Testing**:
- Component tests: Game card renders with data
- Integration tests: Game selection navigation
- API mock tests: Handle missing game data

**Logging & Metrics**:
- Track which games are selected (for admin metrics)
- Page render time
- Game selection count per session

**Acceptance Criteria**:
- ✅ Game list loads and displays correctly
- ✅ Selecting a game navigates to play screen
- ✅ Selection tracked in metrics

---

#### FEATURE-GAMES-004: Game Play Screen
**Equivalent to**: P2-003
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Game Selection (FEATURE-GAMES-003), Game Engine Service (FEATURE-GAMES-001)
- **Skills Needed**: Frontend UI/UX, State Management

**Deliverables**:
1. Number selection UI (keyboard pad or grid)
2. Quick pick button (random numbers)
3. Selected numbers display
4. Joker/bonus number selection (if applicable)
5. Play/Submit button

**RALF Loop**:
- **Retrieval**: Number selection UX patterns, game rules
- **Analysis**: User experience for number entry
- **Logical Reasoning**: Simple touch targets, clear selected numbers, quick pick option
- **Feedback**: Select numbers easily, see selection clearly

**Testing**:
- Component tests: Number button presses
- Validation tests: Can't submit invalid selection
- Accessibility tests: Touch target sizes, labels

**Logging & Metrics**:
- Track number selections (for UX analysis)
- Track how long user spends selecting

**Acceptance Criteria**:
- ✅ Can select all required numbers
- ✅ Quick pick generates valid numbers
- ✅ Can't submit invalid selection
- ✅ Touch targets appropriate for mobile

---

#### FEATURE-GAMES-005: Draw Progress & Results Display
**Equivalent to**: P2-003 (results portion), P2-004
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Game Engine Service (FEATURE-GAMES-001)
- **Skills Needed**: Frontend, Animation, UX

**Deliverables**:
1. Draw progress indicator (shows draw count incrementing)
2. Progress animation with visual feedback
3. Results display screen
4. Win condition display
5. Statistics summary after result

**RALF Loop**:
- **Retrieval**: Progress indication patterns, result display UI
- **Analysis**: How long draw takes (from backend responsiveness)
- **Logical Reasoning**: Show real-time draw count, when complete show result clearly
- **Feedback**: Watch draw progress, get immediate result

**Testing**:
- Component tests: Progress display updates
- Animation tests: Smooth 60 FPS animation
- Result display tests: Data shows correctly

**Logging & Metrics**:
- Track draw completion time
- Track result display latency
- Track user wait time perception

**Acceptance Criteria**:
- ✅ Draw progress displays incrementally
- ✅ Results show immediately when complete
- ✅ 60 FPS animation (no stuttering)

---

## Feature 2: Educational Statistics & Examples

**Business Purpose**: Display statistics and human-readable examples to educate users on improbability of winning

**Related Phases**: Phase 1 (backend), Phase 2 (frontend), Phase 3 (testing)

### Backend Tasks

#### FEATURE-STATS-001: Statistics Aggregation Queries
**Equivalent to**: P1-003 (aggregation portion)
- **Phase**: Phase 1
- **Responsible Microservice**: Statistics / Analytics Service
- **Depends On**: Game results tables (FEATURE-GAMES-002)
- **Skills Needed**: Backend, SQL, Database Optimization

**Deliverables**:
1. Average draws per game type query
2. Min/max draws per game type
3. Percentile calculations (25th, 50th, 75th, 95th)
4. Trend analysis (recent draws vs historical)
5. Create queries/README.md documenting all queries

**RALF Loop**:
- **Retrieval**: SQL aggregation patterns, statistical calculations
- **Analysis**: Performance-critical queries (will be called frequently)
- **Logical Reasoning**: Pre-calculate popular stats, cache results
- **Feedback**: Query results match manual calculations

**Testing**:
- Accuracy tests: Compare calculated stats to raw data
- Performance tests: Queries run in < 100ms
- Edge case tests: Empty games, single result

**Logging & Metrics**:
- Query execution time
- Result cache hit rate
- Query frequency tracking

**Acceptance Criteria**:
- ✅ All statistics calculated correctly
- ✅ Queries run in < 100ms
- ✅ Results match manual verification

---

#### FEATURE-STATS-002: Example Generation Engine
**Equivalent to**: P1-003 (examples portion)
- **Phase**: Phase 1
- **Responsible Microservice**: Statistics / Analytics Service
- **Depends On**: Aggregated statistics (FEATURE-STATS-001)
- **Skills Needed**: Backend TypeScript

**Deliverables**:
1. Example formatter (number of lifetimes, years of daily play)
2. Logic to generate 3-5 compelling examples per game
3. Limit examples to max 5000 draws as per requirements
4. Store examples in cache
5. Create examples/README.md

**RALF Loop**:
- **Retrieval**: Human-understandable number representations, psychological impact
- **Analysis**: Which examples resonate with users
- **Logical Reasoning**: Use relatable time units (lifetimes of 80 years, years of daily play)
- **Feedback**: Examples are compelling and accurate

**Testing**:
- Example calculation tests (correct conversions)
- Limit enforcement tests (max 5000)
- Format tests (readable strings)

**Logging & Metrics**:
- Example generation time
- Example requests tracked

**Acceptance Criteria**:
- ✅ Examples generate in < 500ms
- ✅ Examples respect 5000-draw limit
- ✅ Examples are humanly understandable

---

#### FEATURE-STATS-003: Caching & Performance
**Equivalent to**: P1-003 (caching portion), overlaps with optimization
- **Phase**: Phase 1 (initial), Phase 3 (optimization)
- **Responsible Microservice**: Statistics Service
- **Depends On**: Statistics Queries (FEATURE-STATS-001)
- **Skills Needed**: Backend, Cache Design

**Deliverables**:
1. In-memory cache for popular game stats (MVP)
2. Cache invalidation strategy (time-based TTL)
3. Cache hit/miss logging
4. Redis integration skeleton (for future)
5. Create cache/README.md

**RALF Loop**:
- **Retrieval**: Caching strategies, cache invalidation patterns
- **Analysis**: What to cache vs calculate on-demand
- **Logical Reasoning**: Cache popular game stats, refresh hourly
- **Feedback**: Cache hits help with response time

**Testing**:
- Cache hit/miss tests
- TTL expiration tests
- Data consistency tests

**Logging & Metrics**:
- Cache hit rate
- Cache size/memory usage
- Cache refresh time

**Acceptance Criteria**:
- ✅ Cache hit rate > 80% for popular games
- ✅ Response times < 200ms with cache

---

### Frontend Tasks

#### FEATURE-STATS-004: Statistics Display Component
**Equivalent to**: P2-004 (stats display)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Statistics Service (FEATURE-STATS-001)
- **Skills Needed**: Frontend, UI/UX

**Deliverables**:
1. Statistics card component showing avg/min/max draws
2. Percentile breakdown visualization
3. Fetch stats from backend API
4. Responsive layout for mobile and web
5. Create components/stats/README.md

**RALF Loop**:
- **Retrieval**: Statistics API contract, data visualization best practices
- **Analysis**: Which statistics matter most to users
- **Logical Reasoning**: Highlight average (most important), show range
- **Feedback**: Statistics display clearly, no confusion

**Testing**:
- Component tests: Data renders correctly
- API integration tests: Fetch from backend
- Responsive tests: Mobile and web layout

**Logging & Metrics**:
- Component render time
- API response time
- Statistics view duration

**Acceptance Criteria**:
- ✅ Statistics display correctly and clearly
- ✅ Responsive on mobile and web
- ✅ Loads in < 500ms

---

#### FEATURE-STATS-005: Examples Display & Explanation
**Equivalent to**: P2-004 (examples portion)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Example Generation (FEATURE-STATS-002)
- **Skills Needed**: Frontend, Content Layout

**Deliverables**:
1. Examples section showing 3-5 human-readable examples
2. Scrollable list for more examples
3. Example formatting (bold key numbers, readable text)
4. Examples update after each game play
5. Create components/examples/README.md

**RALF Loop**:
- **Retrieval**: Example API contract, layout patterns for educational content
- **Analysis**: Example presentation for maximum impact
- **Logical Reasoning**: Clear, bold numbers, relatable time units
- **Feedback**: Examples are eye-opening and understandable

**Testing**:
- Component tests: Examples render and format correctly
- API tests: Example data displays
- Scroll tests: Can view all examples

**Logging & Metrics**:
- Examples view time (engagement metric)
- Scroll depth into examples
- Examples per session

**Acceptance Criteria**:
- ✅ Examples display clearly and compellingly
- ✅ Users spend time reading examples (tracked)

---

## Feature 3: Contact & Motivation Page

**Business Purpose**: Explain the site mission, allow contact submissions, educate about gambling addiction

**Related Phases**: Phase 1 (backend), Phase 2 (frontend)

### Backend Tasks

#### FEATURE-CONTACT-001: Email Storage & Management
**Equivalent to**: P1-004
- **Phase**: Phase 1
- **Responsible Microservice**: Email Service
- **Depends On**: Email table schema (P0-004)
- **Skills Needed**: Backend, Data Privacy

**Deliverables**:
1. Email submission endpoint (NO IP tracking)
2. Input validation (email format, content length)
3. Database storage with timestamp
4. Email deletion endpoint (by ID, with verification)
5. Create email/README.md explaining GDPR compliance

**RALF Loop**:
- **Retrieval**: Email validation, GDPR requirements, secure deletion
- **Analysis**: Data minimization approach
- **Logical Reasoning**: Store only essentials (sender, title, body, timestamp), no enrichment
- **Feedback**: Email stores and deletes correctly, no privacy violation

**Testing**:
- Validation tests: Email format, content length
- Persistence tests: Email stores and retrieves correctly
- Deletion tests: Email fully deleted from database
- Privacy tests: No IP or PII stored

**Logging & Metrics**:
- Email submissions logged (sender email, title truncated)
- Deletion logging
- Failed validations logged

**Acceptance Criteria**:
- ✅ Emails validate and store correctly
- ✅ Deletion removes all email data
- ✅ No IP tracking, GDPR compliant

---

#### FEATURE-CONTACT-002: Rate Limiting & Spam Protection
**Equivalent to**: P1-004 (rate limiting portion)
- **Phase**: Phase 1
- **Responsible Microservice**: Email Service
- **Depends On**: Email endpoint (FEATURE-CONTACT-001)
- **Skills Needed**: Backend, Security

**Deliverables**:
1. Rate limiting (e.g., 5 emails per IP per hour)
2. Failed attempts tracking
3. Temporary blocking after threshold exceeded
4. Clear error messages for rate-limited users
5. Logging of rate limit events

**RALF Loop**:
- **Retrieval**: Rate limiting strategies, IP-based tracking (contact form only)
- **Analysis**: Balance between spam protection and user accessibility
- **Logical Reasoning**: Generous rate limit (5 per hour), temporary block, log for monitoring
- **Feedback**: Can't spam endpoint, legitimate users not blocked

**Testing**:
- Rate limit enforcement tests
- Blocking mechanism tests
- Error message clarity tests

**Logging & Metrics**:
- Rate limit violations logged
- Blocked IP tracking
- Contact form success rate

**Acceptance Criteria**:
- ✅ Rate limiting prevents spam
- ✅ Legitimate users not impacted

---

### Frontend Tasks

#### FEATURE-CONTACT-003: Motivation / Mission Page
**Equivalent to**: Related to P2-001 navigation, P2-005 (but creation in Phase 2)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Navigation setup (P2-001)
- **Skills Needed**: Frontend, Content Layout

**Deliverables**:
1. Motivation page screen with mission statement
2. Information about gambling addiction facts
3. Resources for addiction help (links)
4. Visual design to emphasize message
5. Create screens/motivation/README.md

**RALF Loop**:
- **Retrieval**: Content from project brief, addiction facts, psychological education
- **Analysis**: Messaging hierarchy and emotional impact
- **Logical Reasoning**: Lead with mission, provide facts, offer resources
- **Feedback**: Page conveys message powerfully, users engaged

**Testing**:
- Component tests: Content renders correctly
- Layout tests: Responsive design
- Link tests: External resources accessible

**Logging & Metrics**:
- Page view tracking
- Time spent on page
- Resource link clicks

**Acceptance Criteria**:
- ✅ Mission statement clear and compelling
- ✅ Page responsive on mobile and web

---

#### FEATURE-CONTACT-004: Contact Form
**Equivalent to**: FEATURE-CONTACT-001 (frontend portion)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Motivation page (FEATURE-CONTACT-003), Email Service (FEATURE-CONTACT-001)
- **Skills Needed**: Frontend, Form Handling

**Deliverables**:
1. Contact form with fields: sender email, subject, message
2. Form validation (email format, content required)
3. Submit button and loading state
4. Success/error messages
5. Create components/contact/README.md

**RALF Loop**:
- **Retrieval**: Form patterns, validation libraries, submission handling
- **Analysis**: Required fields and validation rules
- **Logical Reasoning**: Simple form, clear validation feedback
- **Feedback**: Submit test email, see success message

**Testing**:
- Validation tests: Format checks
- Submission tests: Backend receives email
- Error handling tests: Display user-friendly errors
- Accessibility tests: Form labels, input focus

**Logging & Metrics**:
- Form submission tracking
- Validation error counts
- Submission success rate

**Acceptance Criteria**:
- ✅ Form validates and submits correctly
- ✅ User gets clear feedback (success/error)
- ✅ Backend receives emails

---

## Feature 4: Admin Metrics Dashboard

**Business Purpose**: Track site traffic, user behavior, and email submissions for the creator

**Related Phases**: Phase 1 (backend metrics), Phase 4 (admin dashboard)

### Backend Tasks

#### FEATURE-ADMIN-001: Click Metrics Collection
**Equivalent to**: P1-005
- **Phase**: Phase 1
- **Responsible Microservice**: Metrics Service
- **Depends On**: Metrics table schema (P0-004)
- **Skills Needed**: Backend, Analytics

**Deliverables**:
1. Click tracking endpoint (POST /metrics/click/:linkId)
2. Metrics table with click events (link_id, timestamp, no PII)
3. Data aggregation (clicks per link, total clicks)
4. Percentage calculation API
5. Create metrics/README.md

**RALF Loop**:
- **Retrieval**: Metrics tracking patterns, analytics design
- **Analysis**: Which interactions to track
- **Logical Reasoning**: Track by link ID, aggregate for admin view
- **Feedback**: Clicks tracked accurately, percentages correct

**Testing**:
- Click tracking tests: Data persists correctly
- Aggregation tests: Percentages calculated right
- Volume tests: Handle high click volume

**Logging & Metrics**:
- Click submission success/failures logged
- Aggregation cache hits/misses

**Acceptance Criteria**:
- ✅ Clicks tracked and aggregated correctly
- ✅ Percentages accurate

---

#### FEATURE-ADMIN-002: Admin Data APIs
**Equivalent to**: P4-004
- **Phase**: Phase 4
- **Responsible Microservice**: Multiple services (aggregation)
- **Depends On**: Metrics (FEATURE-ADMIN-001), Emails (FEATURE-CONTACT-001), Stats (FEATURE-STATS-001)
- **Skills Needed**: Backend, Security

**Deliverables**:
1. Protected admin endpoint requiring hardcoded auth check
2. Metrics endpoint: GET /admin-dash/metrics (click percentages)
3. Emails endpoint: GET /admin-dash/emails (recent emails)
4. Statistics endpoint: GET /admin-dash/stats (aggregated game stats)
5. Email deletion endpoint: DELETE /admin-dash/emails/:id
6. Create admin-api/README.md

**RALF Loop**:
- **Retrieval**: Admin dashboard requirements, hardcoded auth implementation
- **Analysis**: Critical admin views and data
- **Logical Reasoning**: Simple password check, aggregate data from services
- **Feedback**: Authenticated admin can see all relevant metrics

**Testing**:
- Auth tests: Unauthorized requests rejected
- Data accuracy tests: Endpoint results match source data
- Performance tests: Aggregation queries fast

**Logging & Metrics**:
- Admin endpoint access logging
- Failed auth attempts logged
- Admin view frequency tracking

**Acceptance Criteria**:
- ✅ Admin endpoints protected and working
- ✅ Data accurate and up-to-date

---

### Frontend Tasks

#### FEATURE-ADMIN-003: Admin Login & Interface
**Equivalent to**: P4-005
- **Phase**: Phase 4
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Navigation (P2-001), Admin APIs (FEATURE-ADMIN-002)
- **Skills Needed**: Frontend, UI/UX

**Deliverables**:
1. Hidden admin URL/secret screen
2. Admin login form (hardcoded credentials)
3. Metrics view (click percentages by link)
4. Email view (recent contact submissions, inline deletion)
5. Game statistics view (by game type)
6. Create screens/admin/README.md

**RALF Loop**:
- **Retrieval**: Admin dashboard patterns, data visualization
- **Analysis**: Critical admin metrics and displays
- **Logical Reasoning**: Simple login, read-only data views, inline deletion
- **Feedback**: Admin can see all site data

**Testing**:
- Login flow tests
- Data display tests
- Deletion action tests
- Permission tests (admin-only access)

**Logging & Metrics**:
- Admin login attempts (success/failure)
- Admin view tracking by section

**Acceptance Criteria**:
- ✅ Admin login works with hardcoded credentials
- ✅ All metrics and data visible and accurate
- ✅ Deletion of emails works

---

## Feature 5: Browser-Based User Tracking

**Business Purpose**: Track user behavior without storing PII (for understanding user patterns)

**Related Phases**: Phase 2 (frontend implementation)

### Frontend Tasks

#### FEATURE-TRACKING-001: Anonymous Session Tracking
**Equivalent to**: P2-005
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Navigation setup (P2-001), Metrics Service (FEATURE-ADMIN-001)
- **Skills Needed**: Frontend, Data Privacy

**Deliverables**:
1. Generate anonymous session ID on first visit
2. Store session ID in browser localStorage
3. Track page visits and game plays in local storage
4. Store accumulated metrics locally
5. Create tracking/README.md documenting GDPR approach

**RALF Loop**:
- **Retrieval**: Browser storage APIs, privacy-compliant tracking
- **Analysis**: What user behavior to track (page visits, game plays)
- **Logical Reasoning**: Random session ID, local storage, no server-side user DB
- **Feedback**: Session ID persists across visits, plays tracked

**Testing**:
- Session ID generation tests
- Storage operation tests (save/load)
- Data structure tests

**Logging & Metrics**:
- Session tracking validation
- Storage efficiency checks

**Acceptance Criteria**:
- ✅ Session ID persists across visits
- ✅ Plays tracked locally
- ✅ No PII collected

---

#### FEATURE-TRACKING-002: Metrics Submission to Backend
**Equivalent to**: P2-005 (submission portion)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Session Tracking (FEATURE-TRACKING-001), Metrics Service (FEATURE-ADMIN-001)
- **Skills Needed**: Frontend, API Integration

**Deliverables**:
1. Batch metrics from local storage
2. Submit accumulated metrics to Metrics Service periodically
3. Handle offline scenarios (queue for re-submission)
4. Clear local metrics after successful submission
5. Error handling and retry logic

**RALF Loop**:
- **Retrieval**: API submission patterns, offline-first patterns
- **Analysis**: When to submit (after each action, batched, timed)
- **Logical Reasoning**: Batch submissions reduce server load, queue offline metrics
- **Feedback**: Metrics appear in admin dashboard after submission

**Testing**:
- Submission tests: Metrics reach backend
- Offline tests: Queue metrics when offline
- Retry tests: Eventually submit when back online

**Logging & Metrics**:
- Submission success rate
- Offline time tracking
- Queued metrics size

**Acceptance Criteria**:
- ✅ Metrics reliably submitted to backend
- ✅ Offline scenarios handled gracefully

---

#### FEATURE-TRACKING-003: User Data Deletion / "Forget Me"
**Equivalent to**: P2-005 (deletion portion)
- **Phase**: Phase 2
- **Responsible Microservice**: Frontend / React Native
- **Depends On**: Session Tracking (FEATURE-TRACKING-001)
- **Skills Needed**: Frontend, Privacy

**Deliverables**:
1. Add "Forget Me" button in settings or motivation page
2. On click, clear all localStorage data (session ID, metrics)
3. Optionally submit deletion request to contact/email service
4. Confirm deletion to user
5. Document GDPR compliance in privacy/README.md

**RALF Loop**:
- **Retrieval**: GDPR data deletion requirements, user control patterns
- **Analysis**: What data to delete, how to verify
- **Logical Reasoning**: Clear all local storage, optional server-side notification
- **Feedback**: User can delete all personal data in one click

**Testing**:
- Deletion tests: All localStorage cleared
- Confirmation tests: User gets clear feedback
- Server sync tests: Optional server-side deletion

**Logging & Metrics**:
- Deletion event logging (count, frequency)

**Acceptance Criteria**:
- ✅ "Forget Me" clears all local data
- ✅ User gets confirmation
- ✅ No data persists after deletion

---

## Cross-Feature Integration Points

### Data Flow Between Features

```
Game Simulation → Statistics Aggregation → Statistics Display
     ↓                  ↓                         ↓
[DB: Game Results] [Caching Layer]      [Frontend Charts]
     ↓                                          
[Metrics Service] → Click Tracking
     ↓
[Admin Dashboard]

Contact Form → Email Service → Email Storage → Admin View
(FEATURE-CONTACT) → (FEATURE-CONTACT-001) → (FEATURE-CONTACT-001) → (FEATURE-ADMIN)

User Activity → Session Tracking → Metrics Submission → Admin Metrics
(All Features) → (FEATURE-TRACKING-001) → (FEATURE-TRACKING-002) → (FEATURE-ADMIN)
```

---

## Feature Completion Criteria Matrix

| Feature | Backend Ready (Phase 1) | Frontend Ready (Phase 2) | Tested (Phase 3) | Launched (Phase 5+) |
|---------|-------------------------|--------------------------|------------------|-------------------|
| Lottery Games | P1-001 ✅ | P2-003 ✅ | P3-001/003 ✅ | Phase 6 ✅ |
| Statistics | P1-003 ✅ | P2-004 ✅ | P3-001/003 ✅ | Phase 6 ✅ |
| Contact | P1-004 ✅ | P2-003/004 ✅ | P3-001/002 ✅ | Phase 6 ✅ |
| Admin Dashboard | P1-005 + P4-004 ✅ | P4-005 ✅ | P3-001 ✅ | Phase 6 ✅ |
| User Tracking | (Implicit) | P2-005 ✅ | P3-002 ✅ | Phase 6 ✅ |

---

## Notes for Implementation

- **Feature Dependencies**: Some features depend on others (e.g., statistics display depends on statistics aggregation)
- **Parallel Development**: Many features can be developed in parallel (game engine while building frontend)
- **Testing Strategy**: Each feature has unit tests in Phase 3, then integration and E2E testing
- **Documentation**: Create feature-specific README.md files in appropriate service directories
- **Logging**: Every feature includes logging for operational visibility
- **Metrics**: Most features track user interaction metrics for the admin dashboard

