# Multi-stage build for Node.js backend services
# Production: Lightweight image with only required dependencies
# Development: Full image with dev tools for hot reload

FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production

# Rebuild node modules with production dependencies
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci

# Build stage: Compile TypeScript
FROM base AS builder
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image: Lightweight with only needed files
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
EXPOSE 3004
CMD ["node", "dist/index.js"]

# Development image: Full features with hot reload
FROM base AS development
ENV NODE_ENV=development
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install
EXPOSE 3004
CMD ["npm", "run", "dev"]
