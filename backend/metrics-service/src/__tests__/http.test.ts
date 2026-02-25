import request from 'supertest';
import app from '../app';
import { healthCheck } from '../database';
import {
  trackClick,
  trackSession,
  trackPlay,
  trackPageview,
  getLinkMetrics,
  getAllMetrics,
  getRecentClicks,
  getSessionMetrics,
  getPlayMetrics,
  getPageMetrics,
  deleteSessionMetrics,
} from '../metricsService';

jest.mock('../database');
jest.mock('../metricsService');
jest.mock('../logger');

const mockHealthCheck = healthCheck as jest.MockedFunction<typeof healthCheck>;
const mockTrackClick = trackClick as jest.MockedFunction<typeof trackClick>;
const mockTrackSession = trackSession as jest.MockedFunction<typeof trackSession>;
const mockTrackPlay = trackPlay as jest.MockedFunction<typeof trackPlay>;
const mockTrackPageview = trackPageview as jest.MockedFunction<typeof trackPageview>;
const mockGetLinkMetrics = getLinkMetrics as jest.MockedFunction<typeof getLinkMetrics>;
const mockGetAllMetrics = getAllMetrics as jest.MockedFunction<typeof getAllMetrics>;
const mockGetRecentClicks = getRecentClicks as jest.MockedFunction<typeof getRecentClicks>;
const mockGetSessionMetrics = getSessionMetrics as jest.MockedFunction<typeof getSessionMetrics>;
const mockGetPlayMetrics = getPlayMetrics as jest.MockedFunction<typeof getPlayMetrics>;
const mockGetPageMetrics = getPageMetrics as jest.MockedFunction<typeof getPageMetrics>;
const mockDeleteSessionMetrics = deleteSessionMetrics as jest.MockedFunction<typeof deleteSessionMetrics>;

describe('Metrics Service HTTP Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Health Check ──────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns ok status when database is healthy', async () => {
      mockHealthCheck.mockResolvedValue(true);

      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('metrics-service');
      expect(res.body.database).toBe('connected');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // ─── POST /metrics/click ──────────────────────────────────────────────────

  describe('POST /metrics/click', () => {
    it('returns 201 with created metric on valid payload', async () => {
      const mockMetric = {
        id: 'uuid-1',
        session_id: 'sess-1',
        link_id: 'link-1',
        on_page: '/games',
        created_at: '2025-06-01T00:00:00.000Z',
      };
      mockTrackClick.mockResolvedValue(mockMetric);

      const res = await request(app)
        .post('/metrics/click')
        .send({ sessionId: 'sess-1', linkId: 'link-1', onPage: '/games' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMetric);
      expect(mockTrackClick).toHaveBeenCalledWith('sess-1', 'link-1', '/games');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/metrics/click')
        .send({ sessionId: 'sess-1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad request');
      expect(res.body.message).toContain('sessionId');
      expect(mockTrackClick).not.toHaveBeenCalled();
    });
  });

  // ─── POST /metrics/session ────────────────────────────────────────────────

  describe('POST /metrics/session', () => {
    it('returns 201 with created session event on valid payload', async () => {
      const mockEvent = {
        id: 'uuid-2',
        session_id: 'sess-2',
        event_type: 'session_start',
        created_at: '2025-06-01T00:00:00.000Z',
      };
      mockTrackSession.mockResolvedValue(mockEvent);

      const res = await request(app)
        .post('/metrics/session')
        .send({ session_id: 'sess-2', event_type: 'session_start' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockEvent);
      expect(mockTrackSession).toHaveBeenCalledWith(
        'sess-2',
        'session_start',
        expect.any(String)
      );
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/metrics/session')
        .send({ session_id: 'sess-2' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad request');
      expect(res.body.message).toContain('session_id');
      expect(mockTrackSession).not.toHaveBeenCalled();
    });
  });

  // ─── POST /metrics/play ───────────────────────────────────────────────────

  describe('POST /metrics/play', () => {
    it('returns 201 with created play event on valid payload', async () => {
      const mockEvent = {
        id: 'uuid-3',
        session_id: 'sess-3',
        event_type: 'play',
        created_at: '2025-06-01T00:00:00.000Z',
      };
      mockTrackPlay.mockResolvedValue(mockEvent);

      const res = await request(app)
        .post('/metrics/play')
        .send({ session_id: 'sess-3', game_id: 'game-1' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockEvent);
      expect(mockTrackPlay).toHaveBeenCalledWith(
        'sess-3',
        'game-1',
        1,
        expect.any(String)
      );
    });
  });

  // ─── POST /metrics/pageview ───────────────────────────────────────────────

  describe('POST /metrics/pageview', () => {
    it('returns 201 with created pageview event on valid payload', async () => {
      const mockEvent = {
        id: 'uuid-4',
        session_id: 'sess-4',
        event_type: 'pageview',
        created_at: '2025-06-01T00:00:00.000Z',
      };
      mockTrackPageview.mockResolvedValue(mockEvent);

      const res = await request(app)
        .post('/metrics/pageview')
        .send({ session_id: 'sess-4', page: '/stats' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockEvent);
      expect(mockTrackPageview).toHaveBeenCalledWith(
        'sess-4',
        '/stats',
        expect.any(String)
      );
    });
  });

  // ─── GET /metrics/link/:linkId ────────────────────────────────────────────

  describe('GET /metrics/link/:linkId', () => {
    it('returns metrics for the specified link', async () => {
      const mockSummary = {
        link_id: 'link-abc',
        total_clicks: 42,
        unique_sessions: 10,
        average_clicks_per_session: 4.2,
        first_click: '2025-01-01T00:00:00Z',
        last_click: '2025-06-01T00:00:00Z',
      };
      mockGetLinkMetrics.mockResolvedValue(mockSummary as any);

      const res = await request(app).get('/metrics/link/link-abc');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockSummary);
      expect(mockGetLinkMetrics).toHaveBeenCalledWith('link-abc');
    });
  });

  // ─── GET /metrics ─────────────────────────────────────────────────────────

  describe('GET /metrics', () => {
    it('returns all metrics with total_links count', async () => {
      const mockData = [
        { link_id: 'link-1', total_clicks: 100 },
        { link_id: 'link-2', total_clicks: 50 },
      ];
      mockGetAllMetrics.mockResolvedValue(mockData as any);

      const res = await request(app).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body.metrics).toEqual(mockData);
      expect(res.body.total_links).toBe(2);
    });
  });

  // ─── GET /metrics/sessions ────────────────────────────────────────────────

  describe('GET /metrics/sessions', () => {
    it('returns session aggregate metrics', async () => {
      const mockAggregate = {
        totalSessions: 500,
        activeSessions: 12,
        avgSessionDuration: 7.3,
        bounceRate: 35.2,
      };
      mockGetSessionMetrics.mockResolvedValue(mockAggregate);

      const res = await request(app).get('/metrics/sessions');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAggregate);
    });
  });

  // ─── GET /metrics/plays ───────────────────────────────────────────────────

  describe('GET /metrics/plays', () => {
    it('returns play aggregate metrics', async () => {
      const mockPlay = {
        totalPlays: 2500,
        playConversionRate: 15.0,
        avgPlaysPerSession: 3.2,
        favoritGame: 'Powerball',
      };
      mockGetPlayMetrics.mockResolvedValue(mockPlay);

      const res = await request(app).get('/metrics/plays');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPlay);
    });
  });

  // ─── DELETE /metrics/session/:sessionId ───────────────────────────────────

  describe('DELETE /metrics/session/:sessionId', () => {
    it('deletes session data and returns deleted count', async () => {
      mockDeleteSessionMetrics.mockResolvedValue(10);

      const res = await request(app).delete('/metrics/session/sess-delete');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Session data deleted');
      expect(res.body.deleted).toBe(10);
      expect(mockDeleteSessionMetrics).toHaveBeenCalledWith('sess-delete');
    });
  });

  // ─── GET /metrics/page ────────────────────────────────────────────────────

  describe('GET /metrics/page', () => {
    it('returns 400 when path query parameter is missing', async () => {
      const res = await request(app).get('/metrics/page');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad request');
      expect(res.body.message).toContain('path');
      expect(mockGetPageMetrics).not.toHaveBeenCalled();
    });
  });

  // ─── 404 Handler ──────────────────────────────────────────────────────────

  describe('Unknown routes', () => {
    it('returns 404 for unregistered paths', async () => {
      const res = await request(app).get('/nonexistent/route');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.path).toBe('/nonexistent/route');
    });
  });
});
