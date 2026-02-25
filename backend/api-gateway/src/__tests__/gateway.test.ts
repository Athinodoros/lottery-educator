// Mock metrics BEFORE importing app to prevent prom-client "already registered" errors
jest.mock('../metrics', () => ({
  register: { contentType: 'text/plain', metrics: jest.fn().mockResolvedValue('') },
  httpRequestDuration: { startTimer: jest.fn(() => jest.fn()) },
  httpRequestTotal: { inc: jest.fn() },
  activeConnections: { inc: jest.fn(), dec: jest.fn() },
  gamePlayTotal: { inc: jest.fn() },
  adminLoginAttempts: { inc: jest.fn() },
  emailSubmissions: { inc: jest.fn() },
  serviceHealthStatus: { set: jest.fn() },
}));

jest.mock('../logger', () => ({
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  __esModule: true,
}));

jest.mock('axios');

import request from 'supertest';
import axios from 'axios';
import app, { activeTokens } from '../app';

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper: login and get a valid token
async function getAdminToken(): Promise<string> {
  const res = await request(app)
    .post('/admin/login')
    .send({ username: 'nos', password: 'qweqweqwe' });
  return res.body.token;
}

beforeEach(() => {
  jest.clearAllMocks();
  activeTokens.clear();
});

// ────────────────────────────────────────────────────────────────────
// 1. Health Check Endpoint
// ────────────────────────────────────────────────────────────────────
describe('Health Check', () => {
  it('should return ok when all downstream services are healthy', async () => {
    (mockedAxios.get as jest.Mock).mockResolvedValue({ data: { status: 'ok' } });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('api-gateway');
    expect(res.body.services).toHaveLength(4);
    res.body.services.forEach((s: any) => {
      expect(s.status).toBe('ok');
    });
    expect(res.body.timestamp).toBeDefined();
  });

  it('should return degraded when a downstream service is down', async () => {
    (mockedAxios.get as jest.Mock)
      .mockResolvedValueOnce({ data: { status: 'ok' } })   // game-engine
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))      // statistics
      .mockResolvedValueOnce({ data: { status: 'ok' } })    // email-service
      .mockResolvedValueOnce({ data: { status: 'ok' } });   // metrics-service

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
    const statService = res.body.services.find((s: any) => s.name === 'statistics');
    expect(statService.status).toBe('error');
  });
});

// ────────────────────────────────────────────────────────────────────
// 2. Service Discovery
// ────────────────────────────────────────────────────────────────────
describe('Service Discovery', () => {
  it('should list all registered services on GET /services', async () => {
    const res = await request(app).get('/services');

    expect(res.status).toBe(200);
    expect(res.body.services).toHaveLength(4);
    const names = res.body.services.map((s: any) => s.name);
    expect(names).toEqual(
      expect.arrayContaining(['game-engine', 'statistics', 'email-service', 'metrics-service'])
    );
  });
});

// ────────────────────────────────────────────────────────────────────
// 3. Admin Login
// ────────────────────────────────────────────────────────────────────
describe('Admin Login', () => {
  it('should return a token for valid credentials', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'nos', password: 'qweqweqwe' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBe(64); // 32 random bytes = 64 hex chars
    expect(res.body.expiresIn).toBe(24 * 60 * 60 * 1000);
  });

  it('should reject invalid username', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'wrong', password: 'qweqweqwe' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'nos', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should store the token in activeTokens after login', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'nos', password: 'qweqweqwe' });

    expect(activeTokens.has(res.body.token)).toBe(true);
    const session = activeTokens.get(res.body.token);
    expect(session?.username).toBe('nos');
  });
});

// ────────────────────────────────────────────────────────────────────
// 4. Admin Auth Middleware (requireAdmin)
// ────────────────────────────────────────────────────────────────────
describe('Admin Auth Middleware', () => {
  it('should reject requests with no Authorization header', async () => {
    const res = await request(app).get('/admin/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('should reject requests with an invalid token', async () => {
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('should reject requests with an expired token', async () => {
    // Manually insert a token that expired 25 hours ago
    const expiredToken = 'expired-token-abc123';
    activeTokens.set(expiredToken, {
      username: 'nos',
      createdAt: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
    });

    // Mock axios so the dashboard handler does not throw
    (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token expired');
    // Token should be removed from the store
    expect(activeTokens.has(expiredToken)).toBe(false);
  });

  it('should allow requests with a valid token', async () => {
    const token = await getAdminToken();

    // Mock all downstream calls the dashboard makes
    (mockedAxios.get as jest.Mock).mockResolvedValue({ data: [] });

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────────────
// 5. Admin Logout
// ────────────────────────────────────────────────────────────────────
describe('Admin Logout', () => {
  it('should invalidate the token on logout', async () => {
    const token = await getAdminToken();
    expect(activeTokens.has(token)).toBe(true);

    const res = await request(app)
      .post('/admin/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
    expect(activeTokens.has(token)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────
// 6. 404 Handler
// ────────────────────────────────────────────────────────────────────
describe('404 Handler', () => {
  it('should return 404 with path for unknown routes', async () => {
    const res = await request(app).get('/this-route-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
    expect(res.body.path).toBe('/this-route-does-not-exist');
  });
});

// ────────────────────────────────────────────────────────────────────
// 7. CORS Headers
// ────────────────────────────────────────────────────────────────────
describe('CORS', () => {
  it('should set CORS headers for allowed origin', async () => {
    const res = await request(app)
      .get('/services')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should NOT set Access-Control-Allow-Origin for disallowed origin', async () => {
    const res = await request(app)
      .get('/services')
      .set('Origin', 'http://evil-site.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should respond 200 to preflight OPTIONS requests from allowed origin', async () => {
    const res = await request(app)
      .options('/services')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

// ────────────────────────────────────────────────────────────────────
// 8. Proxy Requests
// ────────────────────────────────────────────────────────────────────
describe('Proxy to Upstream Services', () => {
  it('should proxy GET /games to game-engine', async () => {
    (mockedAxios as unknown as jest.Mock).mockResolvedValue({
      status: 200,
      data: [{ id: 1, name: 'Powerball' }],
    });

    const res = await request(app).get('/games');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: 'Powerball' }]);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/games'),
      })
    );
  });

  it('should proxy GET /stats to statistics service', async () => {
    (mockedAxios as unknown as jest.Mock).mockResolvedValue({
      status: 200,
      data: { total_plays: 500 },
    });

    const res = await request(app).get('/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total_plays: 500 });
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/stats'),
      })
    );
  });

  it('should proxy GET /metrics to metrics service', async () => {
    (mockedAxios as unknown as jest.Mock).mockResolvedValue({
      status: 200,
      data: { metrics: [] },
    });

    const res = await request(app).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ metrics: [] });
  });

  it('should return 503 when upstream service is unreachable', async () => {
    const error: any = new Error('ECONNREFUSED');
    error.response = undefined;
    (mockedAxios as unknown as jest.Mock).mockRejectedValue(error);

    const res = await request(app).get('/games');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'Service unavailable' });
  });

  it('should forward upstream error status codes', async () => {
    const error: any = new Error('Bad Request');
    error.response = { status: 400, data: { error: 'Invalid game ID' } };
    (mockedAxios as unknown as jest.Mock).mockRejectedValue(error);

    const res = await request(app).get('/games');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid game ID' });
  });
});
