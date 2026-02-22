# PostgreSQL Database Setup

**PostgreSQL schema and migrations for Lottery Educator**

## Overview

This directory contains the PostgreSQL database schema, migrations, and seed data for the Lottery Educator platform.

## Database Configuration

- **Development**: `lottery_dev` on `localhost:5432`
- **Testing**: `lottery_test` on `localhost:5432`
- **Test Credentials**: postgres/postgres (dev/test only!)

## Directory Structure

```
database/
├── schema.sql              # Complete schema with tables, indexes, views
├── seed.sql                # Initial game definitions and sample data
├── migrations/             # Knex.js migration files (TODO)
│   └── [timestamp]_*.js
├── README.md               # This file
└── sql-scripts/            # Additional utility scripts (TODO)
    ├── cleanup.sql         # Reset database
    ├── backup.sql          # Backup procedures
    └── monitoring.sql      # Performance queries
```

## Schema Overview

### Tables

#### `games`
Defines available lottery games and their parameters.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(255) NOT NULL UNIQUE
description     TEXT
number_range    INTEGER[] NOT NULL           -- [min, max]
numbers_to_select INTEGER NOT NULL          -- How many numbers to select
extra_numbers   INTEGER                      -- Bonus numbers (Powerball, Mega Ball, etc.)
probability_of_winning NUMERIC(20, 19)      -- Scientific notation for very small odds
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Examples:**
- Powerball: 5 numbers (1-69) + 1 Powerball (1-26)
- Mega Millions: 5 numbers (1-70) + 1 Mega Ball (1-25)
- EuroMillions: 5 numbers (1-50) + 2 Lucky Stars (1-12)
- UK Lotto: 6 numbers (1-59)
- French Loto: 5 numbers (1-49) + 1 Chance (1-10)

#### `game_results`
Records individual game plays and outcomes.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
game_id         UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT
selected_numbers INTEGER[] NOT NULL         -- Numbers chosen by player
winning_numbers INTEGER[] NOT NULL          -- Actual winning numbers
extra_number    INTEGER                     -- Bonus number (if applicable)
draws_to_win    INTEGER NOT NULL            -- How many draws until winning
is_winner       BOOLEAN GENERATED ALWAYS AS (draws_to_win = 1) STORED
played_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

**Note**: This table grows rapidly. Consider partitioning by date or game_id for high-volume scenarios.

#### `emails`
Contact form submissions with GDPR soft-delete support.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
sender_email    VARCHAR(255) NOT NULL       -- User's email
subject         VARCHAR(255) NOT NULL       -- Message subject
body            TEXT NOT NULL               -- Message content
is_deleted      BOOLEAN DEFAULT FALSE       -- Soft delete flag
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
deleted_at      TIMESTAMP WITH TIME ZONE    -- When deleted
deleted_reason  VARCHAR(255)                -- Why deleted (e.g., 'user_request')
```

**GDPR Compliance**: Users can request deletion via API, which soft-deletes the record.

#### `click_metrics`
Tracks user interactions without storing IP addresses.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
link_id         VARCHAR(255) NOT NULL       -- What was clicked (button, page, etc.)
user_session_id UUID                        -- Anonymous session ID
click_count     INTEGER DEFAULT 1           -- Clicks (for aggregation)
created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
UNIQUE(link_id, user_session_id, DATE(created_at))
```

**Privacy**: No IP addresses stored, only anonymous session IDs from browser storage.

### Indexes

Created for performance on frequently queried columns:

```sql
idx_game_results_game_id           -- Filter by game
idx_game_results_created_at        -- Time-based queries
idx_game_results_is_winner         -- Win rate calculations
idx_emails_created_at              -- Timeline queries
idx_emails_is_deleted              -- Exclude soft-deleted records
idx_click_metrics_link_id          -- Aggregate by link
idx_click_metrics_user_session_id  -- Per-session analysis
idx_click_metrics_created_at       -- Time-based analysis
```

### Views

#### `game_statistics`
Aggregated statistics per game type.

```sql
SELECT game_id, name, total_plays, total_wins,
       avg_draws_to_win, win_rate_percent, last_play_at
FROM game_statistics;
```

#### `click_metrics_summary`
Aggregated click metrics without IP tracking.

```sql
SELECT link_id, unique_sessions, total_clicks,
       avg_clicks_per_session, last_click_at
FROM click_metrics_summary;
```

## Key Design Principles

- **UUID Primary Keys**: Better for distributed systems and replication
- **No IP Tracking**: GDPR compliant - only anonymous session IDs
- **Soft Deletes**: Records marked deleted, not destroyed (audit trail)
- **Generated Columns**: `is_winner` automatically derived from `draws_to_win`
- **Timestamps**: All UTC (`TIMESTAMP WITH TIME ZONE`)
- **Automatic Updates**: Trigger maintains `updated_at` column

## Setup Instructions

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create development database
CREATE DATABASE lottery_dev;

# Create test database
CREATE DATABASE lottery_test;
```

### 2. Initialize Schema

```bash
# Run schema setup
psql -U postgres -d lottery_dev -f database/schema.sql

# Load seed data
psql -U postgres -d lottery_dev -f database/seed.sql
```

### 3. Verify Setup

```bash
# List tables
psql -U postgres -d lottery_dev -c "\dt"

# Check views
psql -U postgres -d lottery_dev -c "\dv"

# List games
psql -U postgres -d lottery_dev -c "SELECT name FROM games;"
```

## Connection from Backend

### Connection String (Environment Variable)

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lottery_dev
```

### Connection Pool Settings (All Services)

```
Min Connections: 2
Max Connections: 10
Idle Timeout: 30 seconds
Connection Timeout: 10 seconds
```

## Docker Setup

For local development with Docker (see P0-005):

```bash
# Start PostgreSQL service
docker-compose up -d postgres

# Initialize database
docker exec postgres psql -U postgres -d lottery_dev -f /database/schema.sql
```

## Performance Optimization

1. **Partitioning**: Consider partitioning `game_results` by month for 100M+ records
2. **Archiving**: Move results older than 12 months to archive table
3. **Materialized Views**: Pre-aggregate statistics daily
4. **Batch Operations**: Use `INSERT ... SELECT` or `COPY` for bulk data
5. **Regular Maintenance**: PostgreSQL's `VACUUM ANALYZE` (auto-enabled)

## Backup & Recovery

```bash
# Full backup
pg_dump -U postgres lottery_dev > backup.sql

# Compressed backup
pg_dump -U postgres --compress=9 lottery_dev > backup.sql.gz

# Restore from backup
psql -U postgres lottery_dev < backup.sql
```

## Monitoring Queries

```sql
-- Table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Slow queries (requires pg_stat_statements)
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Testing Database

```bash
# Create test database
psql -U postgres -c "CREATE DATABASE lottery_test;"

# Initialize test database
psql -U postgres -d lottery_test -f database/schema.sql

# CI/CD pipeline uses this for isolated testing
```

## Migration Strategy

For schema changes (Phase 1+):

1. Create migration file: `migrations/001_add_column.sql`
2. Include UP and DOWN scripts
3. Version control and commit
4. Run before deployment
5. Plan: Implement Knex.js migration tool (P0-006)

## Data Type Standards

- **IDs**: UUID (distributed systems)
- **Timestamps**: TIMESTAMP WITH TIME ZONE (always UTC)
- **Numbers**: INTEGER for counts, NUMERIC for probabilities
- **Lists**: INTEGER arrays for number collections
- **Email**: VARCHAR(255)
- **Booleans**: BOOLEAN (generated where possible)

## Status

- ✅ Schema designed with all tables and indexes
- ✅ Seed data for initial game definitions
- ✅ GDPR compliance with soft deletes
- ✅ Views for aggregated statistics
- ✅ Automatic timestamp triggers
- ⏳ Migration tool setup (P0-006 - Knex.js)
- ⏳ Docker integration (P0-005)
- ⏳ CI/CD database service (GitHub Actions)

---

**Next**: P0-005 - Docker & Docker Compose setup with PostgreSQL service
