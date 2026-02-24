import client from 'prom-client';

// Create a custom registry
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active connections gauge
const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

// Business metrics
const gamePlayTotal = new client.Counter({
  name: 'game_plays_total',
  help: 'Total number of game plays',
  labelNames: ['game_route'],
  registers: [register],
});

const adminLoginAttempts = new client.Counter({
  name: 'admin_login_attempts_total',
  help: 'Total admin login attempts',
  labelNames: ['success'],
  registers: [register],
});

const emailSubmissions = new client.Counter({
  name: 'email_submissions_total',
  help: 'Total email submissions',
  registers: [register],
});

const serviceHealthStatus = new client.Gauge({
  name: 'service_health_status',
  help: 'Health status of downstream services (1=ok, 0=error)',
  labelNames: ['service'],
  registers: [register],
});

export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
  gamePlayTotal,
  adminLoginAttempts,
  emailSubmissions,
  serviceHealthStatus,
};
