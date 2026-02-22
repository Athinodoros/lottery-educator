# Backend Services

**Node.js + Express Microservices Architecture**

## Purpose

The backend is organized as **4 independent microservices**, each handling a specific domain:
- Game simulations
- Statistical aggregation
- Email/Contact handling
- Metrics and tracking

All services are containerized and coordinated through an **API Gateway**.

## Directory Structure

```
backend/
├── api-gateway/        # Central request router
├── game-engine/        # Lottery simulation logic
├── statistics/         # Stats aggregation and caching
├── email-service/      # Contact form and GDPR compliance
├── metrics-service/    # Click tracking and aggregation
└── shared/            # Shared utilities and types
```

## Key Concepts

- **Microservices**: Each service is independent and deployable
- **API Gateway**: Single entry point for all frontend requests
- **Database per Service**: Each service has its own database access layer
- **TypeScript**: All code is strictly typed
- **Express.js**: Lightweight HTTP framework for each service
- **Environment-Driven**: Configuration via environment variables

## Service Responsibilities

### API Gateway (`api-gateway/`)
Routes requests to appropriate services, handles CORS, request logging

### Game Engine (`game-engine/`)
Simulates lottery games, validates numbers, runs draw simulations

### Statistics (`statistics/`)
Aggregates game results, calculates percentiles, generates examples

### Email Service (`email-service/`)
Validates and stores contact form submissions, handles deletion

### Metrics Service (`metrics-service/`)
Tracks user clicks, aggregates by link, calculates percentages

## Dependencies

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching in production)
- Docker (for local development)

## Quick Start

```bash
# Install each service's dependencies
cd backend/api-gateway && npm install
cd ../game-engine && npm install
# ... repeat for other services

# Start all services locally
npm run docker:up
npm run dev

# View logs
npm run docker:logs
```

## Testing

```bash
# Run tests for all backend services
npm test --workspaces

# Run tests for specific service
cd backend/game-engine && npm test
```

## Deployment

Each service is containerized and can be deployed independently via CI/CD pipeline.

---

**Status**: Phase 0 - Scaffolding in progress
**Next**: Create individual service directories and package.json files
