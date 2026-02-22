# Database

**PostgreSQL schema and migrations for Lottery Educator**

## Purpose

Centralized database design and migration management for all services. Each service accesses its own tables but shares the same PostgreSQL instance locally.

## Directory Structure

```
database/
├── migrations/          # Knex.js migrations
│   └── [timestamp]_create_tables.js
├── seeds/              # Test data scripts
├── schema/             # Schema documentation
│   ├── games.sql
│   ├── results.sql
│   ├── emails.sql
│   └── metrics.sql
├── knexfile.js         # Knex configuration
├── package.json        # DB utilities
└── README.md (this file)
```

## Database Design

### Core Tables

#### `games`
Defines available lottery games

```sql
id: UUID (primary key)
name: String (e.g., "EuroMillions", "Powerball")
description: String
number_range: Integer (max number)
numbers_to_select: Integer (how many)
extra_numbers: Integer (jokers, etc.)
min_required: Integer (minimum draws simulated)
created_at: Timestamp
```

#### `[game_results_*]` (per game type)
Results of individual game plays

```sql
-- One table per game (e.g., game_results_euromillions)
id: UUID
user_session_id: String (anonymous session ID)
selected_numbers: Integer[] (numbers played)
draws_to_win: Integer (resulting draw count)
created_at: Timestamp
```

#### `emails`
Contact form submissions

```sql
id: UUID
sender_email: String (required)
subject: String (required)
body: Text (required)
created_at: Timestamp
is_deleted: Boolean (soft delete for GDPR)
deleted_at: Timestamp (when user requested deletion)
```

#### `click_metrics`
User interaction tracking

```sql
id: UUID
link_id: String (which button/link was clicked)
user_session_id: String (anonymous)
created_at: Timestamp
```

## Key Design Principles

- **No IP Tracking**: GDPR compliant - no user identification except for rate limiting
- **One Results Table Per Game**: Enables efficient per-game aggregation
- **Timestamps**: All records timestamped for analytics
- **Soft Deletes**: Emails can be marked deleted without losing audit trail
- **Indexes**: All frequently-queried columns indexed for performance

## Migrations

Using **Knex.js** for migrations:

```bash
# Create new migration
npx knex migrate:make create_games_table

# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback
```

## Performance Considerations

- Indexes on: game_type, created_at, user_session_id
- Aggregation queries cached in statistics service
- Time-based partitioning possible for large result tables

## Relationships

```
games
  └── game_results_* (per game)
      └── statistics (cached aggregations)

metrics
  └── click_aggregations (cached percentages)

emails
  └── (standalone, no relationships)
```

## Development

```bash
# Install DB utilities
npm install

# Initialize local PostgreSQL
docker-compose up postgres

# Run migrations
npm run migrate

# Seed test data
npm run seed

# Check current status
npx knex migrate:currentVersion
```

## Backup & Recovery

- Local: Docker container persists to `postgres_data/`
- Production: Automated backups (TBD)

## Querying

Queries are handled by each service directly:
- **Game Engine**: Writes to game_results_* tables
- **Statistics**: Reads and aggregates for stats
- **Metrics**: Tracks and aggregates clicks
- **Email**: Manages contact submissions

## Documentation

Each service documents its table-specific queries in its own README.

---

**Status**: Phase 0 - Schema design pending
**Next**: Create migration files and schema documentation
