import express, { Express, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Upstream services
const GAME_ENGINE_URL = process.env.GAME_ENGINE_URL || 'http://localhost:3001';
const STATISTICS_URL = process.env.STATISTICS_URL || 'http://localhost:3002';
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3003';
const METRICS_SERVICE_URL = process.env.METRICS_SERVICE_URL || 'http://localhost:3004';

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lottery-educator-2026';

// Simple token store (in production, use JWT or sessions)
const activeTokens = new Map<string, { username: string; createdAt: number }>();
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Middleware
app.use(express.json());

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Specific allowed origins - no wildcards for security
  const allowedOrigins = [
    'http://localhost:5173',      // Vite dev server default
    'http://localhost:5174',      // Vite dev server fallback port
    'http://localhost:3000',      // Alternative dev port
    'http://127.0.0.1:5173',      // Loopback with Vite port
    'http://127.0.0.1:5174',      // Loopback Vite fallback
    'http://127.0.0.1:3000',      // Loopback alternative
    process.env.FRONTEND_URL || 'http://localhost:5173',  // Environment override
  ].filter(origin => origin); // Remove undefined
  
  const requestOrigin = req.headers.origin as string;

  // Check if origin is in allowed list
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - ${duration}ms`
    );
    return originalSend.call(this, data);
  };

  next();
});

// Health check aggregator
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check all downstream services
    const serviceChecks = await Promise.allSettled([
      axios.get(`${GAME_ENGINE_URL}/health`),
      axios.get(`${STATISTICS_URL}/health`),
      axios.get(`${EMAIL_SERVICE_URL}/health`),
      axios.get(`${METRICS_SERVICE_URL}/health`),
    ]);

    const services = [
      { name: 'game-engine', status: serviceChecks[0] },
      { name: 'statistics', status: serviceChecks[1] },
      { name: 'email-service', status: serviceChecks[2] },
      { name: 'metrics-service', status: serviceChecks[3] },
    ];

    const allHealthy = services.every(
      s => s.status.status === 'fulfilled' && (s.status as any).value.data.status === 'ok'
    );

    res.json({
      status: allHealthy ? 'ok' : 'degraded',
      service: 'api-gateway',
      services: services.map(s => ({
        name: s.name,
        status: s.status.status === 'fulfilled' ? (s.status as any).value.data.status : 'error',
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Health check error:', error.message);
    res.status(503).json({
      status: 'error',
      service: 'api-gateway',
      error: 'Health check failed',
    });
  }
});

// Proxy function
async function proxyRequest(req: Request, res: Response, targetUrl: string) {
  try {
    const response = await axios({
      method: req.method,
      url: `${targetUrl}${req.originalUrl}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
      } as any,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 503;
    const message = error.response?.data || { error: 'Service unavailable' };
    res.status(status).json(message);
  }
}

// Routes: Game Engine Service (port 3001)
app.use('/games', (req: Request, res: Response) => {
  proxyRequest(req, res, GAME_ENGINE_URL);
});

// Routes: Statistics Service (port 3002)
app.use('/stats', (req: Request, res: Response) => {
  proxyRequest(req, res, STATISTICS_URL);
});

// Routes: Email Service (port 3003)
app.use('/emails', (req: Request, res: Response) => {
  proxyRequest(req, res, EMAIL_SERVICE_URL);
});

// Routes: Metrics Service (port 3004)
app.use('/metrics', (req: Request, res: Response) => {
  proxyRequest(req, res, METRICS_SERVICE_URL);
});

// Service discovery endpoint
app.get('/services', (req: Request, res: Response) => {
  res.json({
    services: [
      { name: 'game-engine', port: 3001, routes: ['/games'] },
      { name: 'statistics', port: 3002, routes: ['/stats'] },
      { name: 'email-service', port: 3003, routes: ['/emails'] },
      { name: 'metrics-service', port: 3004, routes: ['/metrics'] },
    ],
  });
});

// ── Admin Dashboard Routes ──────────────────────────────────────────

// Admin auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const session = activeTokens.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (Date.now() - session.createdAt > TOKEN_TTL) {
    activeTokens.delete(token);
    return res.status(401).json({ error: 'Token expired' });
  }

  next();
}

// Admin login
app.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.set(token, { username, createdAt: Date.now() });

    // Clean up expired tokens
    for (const [t, s] of activeTokens.entries()) {
      if (Date.now() - s.createdAt > TOKEN_TTL) activeTokens.delete(t);
    }

    return res.json({ token, expiresIn: TOKEN_TTL });
  }

  console.log(`[ADMIN] Failed login attempt for user: ${username}`);
  res.status(401).json({ error: 'Invalid credentials' });
});

// Admin logout
app.post('/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const token = req.headers.authorization!.substring(7);
  activeTokens.delete(token);
  res.json({ message: 'Logged out' });
});

// Admin dashboard - aggregated data from all services
app.get('/admin/dashboard', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [gamesRes, statsRes, metricsRes] = await Promise.allSettled([
      axios.get(`${GAME_ENGINE_URL}/games`),
      axios.get(`${STATISTICS_URL}/stats`),
      axios.get(`${METRICS_SERVICE_URL}/metrics`),
    ]);

    const games = gamesRes.status === 'fulfilled' ? gamesRes.value.data : [];
    const stats = statsRes.status === 'fulfilled' ? statsRes.value.data : [];
    const metricsData = metricsRes.status === 'fulfilled' ? metricsRes.value.data : { metrics: [] };

    // Calculate totals from stats
    const statsArray = Array.isArray(stats) ? stats : [];
    const totalPlays = statsArray.reduce((sum: number, s: any) => sum + (s.total_plays || 0), 0);
    const totalWins = statsArray.reduce((sum: number, s: any) => sum + (s.total_wins || 0), 0);
    const globalWinRate = totalPlays > 0 ? ((totalWins / totalPlays) * 100) : 0;

    // Find top game
    const topGame = statsArray.length > 0
      ? statsArray.reduce((top: any, s: any) => (s.total_plays || 0) > (top.total_plays || 0) ? s : top, statsArray[0])
      : null;

    // Calculate click metrics with percentages
    const metrics = metricsData.metrics || [];
    const totalClicks = metrics.reduce((sum: number, m: any) => sum + (m.click_count || 0), 0);
    const metricsWithPercent = metrics.map((m: any) => ({
      ...m,
      percentage: totalClicks > 0 ? ((m.click_count / totalClicks) * 100).toFixed(1) : '0.0',
    }));

    res.json({
      overview: {
        total_games: Array.isArray(games) ? games.length : 0,
        total_plays: totalPlays,
        total_wins: totalWins,
        global_win_rate: parseFloat(globalWinRate.toFixed(2)),
        top_game: topGame ? { name: topGame.name || topGame.game_id, play_count: topGame.total_plays } : null,
      },
      games: Array.isArray(games) ? games : [],
      statistics: statsArray,
      click_metrics: {
        total_clicks: totalClicks,
        by_link: metricsWithPercent,
      },
      services: {
        game_engine: gamesRes.status === 'fulfilled' ? 'ok' : 'error',
        statistics: statsRes.status === 'fulfilled' ? 'ok' : 'error',
        metrics: metricsRes.status === 'fulfilled' ? 'ok' : 'error',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error.message);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Admin emails - list all emails
app.get('/admin/emails', requireAdmin, async (req: Request, res: Response) => {
  try {
    const adminKey = process.env.ADMIN_KEY || 'admin-key';
    const response = await axios.get(`${EMAIL_SERVICE_URL}/emails?key=${adminKey}`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 403) {
      return res.status(500).json({ error: 'Email service admin key not configured' });
    }
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch emails' });
  }
});

// Admin emails - delete an email
app.delete('/admin/emails/:emailId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const response = await axios.delete(`${EMAIL_SERVICE_URL}/emails/${req.params.emailId}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to delete email' });
  }
});

// Admin metrics - detailed click metrics
app.get('/admin/metrics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${METRICS_SERVICE_URL}/metrics`);
    const metrics = response.data.metrics || [];
    const totalClicks = metrics.reduce((sum: number, m: any) => sum + (m.click_count || 0), 0);

    res.json({
      total_clicks: totalClicks,
      total_links: metrics.length,
      metrics: metrics.map((m: any) => ({
        ...m,
        percentage: totalClicks > 0 ? ((m.click_count / totalClicks) * 100).toFixed(1) : '0.0',
      })),
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch metrics' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`Routing to:`);
  console.log(`  - Game Engine: ${GAME_ENGINE_URL}`);
  console.log(`  - Statistics: ${STATISTICS_URL}`);
  console.log(`  - Email Service: ${EMAIL_SERVICE_URL}`);
  console.log(`  - Metrics Service: ${METRICS_SERVICE_URL}`);
});
