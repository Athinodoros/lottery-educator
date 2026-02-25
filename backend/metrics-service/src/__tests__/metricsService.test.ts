import * as db from '../database';
import {
  trackClick,
  trackSession,
  trackPlay,
  trackPageview,
  getLinkMetrics,
  getAllMetrics,
  getRecentClicks,
  getPageMetrics,
  deleteSessionMetrics,
  getSessionMetrics,
  getPlayMetrics,
} from '../metricsService';

jest.mock('../database');

describe('Metrics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Metrics Recording (4 tests) ──────────────────────────────────────────

  describe('Metrics Recording', () => {
    it('trackClick inserts a click metric and returns the created record', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await trackClick('session-1', 'link-abc', '/games');

      expect(db.query).toHaveBeenCalledTimes(1);
      const callArgs = (db.query as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO click_metrics');
      expect(callArgs[1]).toEqual(expect.arrayContaining(['session-1', 'link-abc', '/games']));

      expect(result).toMatchObject({
        session_id: 'session-1',
        link_id: 'link-abc',
        on_page: '/games',
      });
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeDefined();
    });

    it('trackSession inserts a session event and returns it', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
      const ts = new Date().toISOString();

      const result = await trackSession('session-2', 'session_start', ts);

      expect(db.query).toHaveBeenCalledTimes(1);
      const callArgs = (db.query as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO session_events');

      expect(result).toMatchObject({
        session_id: 'session-2',
        event_type: 'session_start',
        created_at: ts,
      });
      expect(result.id).toBeDefined();
    });

    it('trackPlay inserts a play event and returns it', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
      const ts = new Date().toISOString();

      const result = await trackPlay('session-3', 'game-1', 5, ts);

      expect(db.query).toHaveBeenCalledTimes(1);
      const callArgs = (db.query as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO session_events');
      expect(callArgs[0]).toContain('play');
      // Metadata should include game_id and play_count as JSON
      expect(callArgs[1]).toEqual(
        expect.arrayContaining([JSON.stringify({ game_id: 'game-1', play_count: 5 })])
      );

      expect(result).toMatchObject({
        session_id: 'session-3',
        event_type: 'play',
        created_at: ts,
      });
      expect(result.id).toBeDefined();
    });

    it('trackPageview inserts a pageview event and returns it', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
      const ts = new Date().toISOString();

      const result = await trackPageview('session-4', '/stats', ts);

      expect(db.query).toHaveBeenCalledTimes(1);
      const callArgs = (db.query as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO session_events');
      expect(callArgs[0]).toContain('pageview');
      expect(callArgs[1]).toEqual(
        expect.arrayContaining([JSON.stringify({ page: '/stats' })])
      );

      expect(result).toMatchObject({
        session_id: 'session-4',
        event_type: 'pageview',
        created_at: ts,
      });
    });
  });

  // ─── Metrics Aggregation (4 tests) ────────────────────────────────────────

  describe('Metrics Aggregation', () => {
    it('getLinkMetrics returns aggregated data for a link', async () => {
      const mockSummary = {
        link_id: 'link-abc',
        total_clicks: 42,
        unique_sessions: 10,
        average_clicks_per_session: 4.2,
        first_click: '2025-01-01T00:00:00Z',
        last_click: '2025-06-01T00:00:00Z',
      };
      (db.queryOne as jest.Mock).mockResolvedValue(mockSummary);

      const result = await getLinkMetrics('link-abc');

      expect(db.queryOne).toHaveBeenCalledTimes(1);
      const callArgs = (db.queryOne as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(['link-abc']);
      expect(result).toEqual(mockSummary);
    });

    it('getAllMetrics returns an array of metrics for all links', async () => {
      const mockData = [
        {
          link_id: 'link-1',
          total_clicks: 100,
          unique_sessions: 50,
          average_clicks_per_session: 2.0,
          first_click: '2025-01-01T00:00:00Z',
          last_click: '2025-06-01T00:00:00Z',
        },
        {
          link_id: 'link-2',
          total_clicks: 30,
          unique_sessions: 15,
          average_clicks_per_session: 2.0,
          first_click: '2025-02-01T00:00:00Z',
          last_click: '2025-05-01T00:00:00Z',
        },
      ];
      (db.queryAll as jest.Mock).mockResolvedValue(mockData);

      const result = await getAllMetrics();

      expect(db.queryAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].link_id).toBe('link-1');
      expect(result[1].link_id).toBe('link-2');
    });

    it('getSessionMetrics returns aggregate session metrics', async () => {
      const mockAggregate = {
        totalSessions: 500,
        activeSessions: 12,
        avgSessionDuration: 7.3,
        bounceRate: 35.2,
      };
      (db.queryOne as jest.Mock).mockResolvedValue(mockAggregate);

      const result = await getSessionMetrics();

      expect(db.queryOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAggregate);
      expect(result.totalSessions).toBe(500);
      expect(result.bounceRate).toBe(35.2);
    });

    it('getPlayMetrics returns aggregate play metrics', async () => {
      const mockPlay = {
        totalPlays: 2500,
        playConversionRate: 15.0,
        avgPlaysPerSession: 3.2,
        favoritGame: 'Powerball',
      };
      (db.queryOne as jest.Mock).mockResolvedValue(mockPlay);

      const result = await getPlayMetrics();

      expect(db.queryOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPlay);
      expect(result.totalPlays).toBe(2500);
      expect(result.favoritGame).toBe('Powerball');
    });
  });

  // ─── Recent Clicks (2 tests) ──────────────────────────────────────────────

  describe('Recent Clicks', () => {
    it('getRecentClicks returns an array of clicks for a link', async () => {
      const mockClicks = [
        { id: 'c1', session_id: 's1', link_id: 'link-abc', on_page: '/home', created_at: '2025-06-01T12:00:00Z' },
        { id: 'c2', session_id: 's2', link_id: 'link-abc', on_page: '/games', created_at: '2025-06-01T11:00:00Z' },
      ];
      (db.queryAll as jest.Mock).mockResolvedValue(mockClicks);

      const result = await getRecentClicks('link-abc');

      expect(db.queryAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].link_id).toBe('link-abc');
    });

    it('getRecentClicks respects the limit parameter', async () => {
      (db.queryAll as jest.Mock).mockResolvedValue([
        { id: 'c1', session_id: 's1', link_id: 'link-abc', on_page: '/home', created_at: '2025-06-01T12:00:00Z' },
      ]);

      await getRecentClicks('link-abc', 5);

      const callArgs = (db.queryAll as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('LIMIT');
      expect(callArgs[1]).toEqual(['link-abc', 5]);
    });
  });

  // ─── Page Metrics (2 tests) ───────────────────────────────────────────────

  describe('Page Metrics', () => {
    it('getPageMetrics returns metrics for a page path', async () => {
      const mockPage = {
        on_page: '/games',
        total_clicks: 200,
        unique_sessions: 80,
        unique_links: 5,
        average_clicks_per_session: 2.5,
        first_click: '2025-01-15T00:00:00Z',
        last_click: '2025-06-15T00:00:00Z',
      };
      (db.queryOne as jest.Mock).mockResolvedValue(mockPage);

      const result = await getPageMetrics('/games');

      expect(db.queryOne).toHaveBeenCalledTimes(1);
      const callArgs = (db.queryOne as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual(['/games']);
      expect(result).toEqual(mockPage);
    });

    it('getPageMetrics returns null when page has no data', async () => {
      (db.queryOne as jest.Mock).mockResolvedValue(null);

      const result = await getPageMetrics('/nonexistent');

      expect(result).toBeNull();
    });
  });

  // ─── Session Management (2 tests) ─────────────────────────────────────────

  describe('Session Management', () => {
    it('deleteSessionMetrics returns total deleted count from both tables', async () => {
      // First call: delete from click_metrics
      // Second call: delete from session_events
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rowCount: 3 })
        .mockResolvedValueOnce({ rowCount: 7 });

      const count = await deleteSessionMetrics('session-to-delete');

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(count).toBe(10);
    });

    it('deleteSessionMetrics handles sessions with no data', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({ rowCount: 0 });

      const count = await deleteSessionMetrics('empty-session');

      expect(count).toBe(0);
    });
  });

  // ─── Data Privacy (2 tests) ───────────────────────────────────────────────

  describe('Data Privacy', () => {
    it('tracked metrics do not contain personally identifiable information', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const click = await trackClick('anon-session-id', 'link-1', '/games');
      const ts = new Date().toISOString();
      const session = await trackSession('anon-session-id', 'session_start', ts);
      const pageview = await trackPageview('anon-session-id', '/learn', ts);

      const allValues = [
        ...Object.values(click),
        ...Object.values(session),
        ...Object.values(pageview),
      ].map(String);

      const hasEmail = allValues.some((v) => /@/.test(v));
      const hasPhone = allValues.some((v) => /^\d{3}-\d{3}-\d{4}$/.test(v));
      const hasName = allValues.some((v) => /^(John|Jane|Doe)\b/i.test(v));

      expect(hasEmail).toBe(false);
      expect(hasPhone).toBe(false);
      expect(hasName).toBe(false);
    });

    it('deleteSessionMetrics removes all traces of a session across tables', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce({ rowCount: 2 })   // click_metrics deletion
        .mockResolvedValueOnce({ rowCount: 5 });   // session_events deletion

      const deleted = await deleteSessionMetrics('session-gdpr');

      // Verify both tables were targeted
      const firstCallSql = (db.query as jest.Mock).mock.calls[0][0];
      const secondCallSql = (db.query as jest.Mock).mock.calls[1][0];

      expect(firstCallSql).toContain('DELETE FROM click_metrics');
      expect(firstCallSql).toContain('session_id');
      expect(secondCallSql).toContain('DELETE FROM session_events');
      expect(secondCallSql).toContain('session_id');

      expect(deleted).toBe(7);
    });
  });

  // ─── Error Handling (2 tests) ─────────────────────────────────────────────

  describe('Error Handling', () => {
    it('database errors propagate from service functions', async () => {
      (db.queryAll as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await expect(getAllMetrics()).rejects.toThrow('Database connection failed');
    });

    it('trackClick rejects when the database insert fails', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Unique constraint violation'));

      await expect(trackClick('s1', 'l1', '/home')).rejects.toThrow('Unique constraint violation');
    });
  });
});
