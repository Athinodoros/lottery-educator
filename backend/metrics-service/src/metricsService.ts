import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, queryAll } from './database';

export interface ClickMetric {
  id: string;
  session_id: string;
  link_id: string;
  on_page: string;
  created_at: string;
}

export interface MetricsSummary {
  link_id: string;
  total_clicks: number;
  unique_sessions: number;
  average_clicks_per_session: number;
  first_click: string;
  last_click: string;
}

/**
 * Track a click event
 */
export async function trackClick(
  sessionId: string,
  linkId: string,
  onPage: string
): Promise<ClickMetric> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await query(
    `INSERT INTO click_metrics (id, session_id, link_id, on_page, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, sessionId, linkId, onPage, now]
  );

  return {
    id,
    session_id: sessionId,
    link_id: linkId,
    on_page: onPage,
    created_at: now,
  };
}

/**
 * Get metrics summary for a specific link
 */
export async function getLinkMetrics(linkId: string): Promise<MetricsSummary | null> {
  return queryOne(
    `SELECT
      link_id,
      COUNT(*) as total_clicks,
      COUNT(DISTINCT session_id) as unique_sessions,
      ROUND(COUNT(*)::numeric / GREATEST(COUNT(DISTINCT session_id), 1), 2) as average_clicks_per_session,
      MIN(created_at) as first_click,
      MAX(created_at) as last_click
     FROM click_metrics
     WHERE link_id = $1
     GROUP BY link_id`,
    [linkId]
  );
}

/**
 * Get summary for all links
 */
export async function getAllMetrics(): Promise<MetricsSummary[]> {
  return queryAll(
    `SELECT
      link_id,
      COUNT(*) as total_clicks,
      COUNT(DISTINCT session_id) as unique_sessions,
      ROUND(COUNT(*)::numeric / GREATEST(COUNT(DISTINCT session_id), 1), 2) as average_clicks_per_session,
      MIN(created_at) as first_click,
      MAX(created_at) as last_click
     FROM click_metrics
     GROUP BY link_id
     ORDER BY total_clicks DESC`
  );
}

/**
 * Get recent clicks for a link
 */
export async function getRecentClicks(linkId: string, limit: number = 100): Promise<ClickMetric[]> {
  return queryAll(
    `SELECT * FROM click_metrics
     WHERE link_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [linkId, limit]
  );
}

/**
 * Track a session event (session_start, etc.)
 */
export async function trackSession(
  sessionId: string,
  eventType: string,
  timestamp: string
): Promise<any> {
  const id = uuidv4();
  await query(
    `INSERT INTO session_events (id, session_id, event_type, created_at)
     VALUES ($1, $2, $3, $4)`,
    [id, sessionId, eventType, timestamp]
  );
  return { id, session_id: sessionId, event_type: eventType, created_at: timestamp };
}

/**
 * Track a play event
 */
export async function trackPlay(
  sessionId: string,
  gameId: string,
  playCount: number,
  timestamp: string
): Promise<any> {
  const id = uuidv4();
  await query(
    `INSERT INTO session_events (id, session_id, event_type, metadata, created_at)
     VALUES ($1, $2, 'play', $3, $4)`,
    [id, sessionId, JSON.stringify({ game_id: gameId, play_count: playCount }), timestamp]
  );
  return { id, session_id: sessionId, event_type: 'play', created_at: timestamp };
}

/**
 * Track a page view event
 */
export async function trackPageview(
  sessionId: string,
  page: string,
  timestamp: string
): Promise<any> {
  const id = uuidv4();
  await query(
    `INSERT INTO session_events (id, session_id, event_type, metadata, created_at)
     VALUES ($1, $2, 'pageview', $3, $4)`,
    [id, sessionId, JSON.stringify({ page }), timestamp]
  );
  return { id, session_id: sessionId, event_type: 'pageview', created_at: timestamp };
}

/**
 * Delete all metrics for a given session (GDPR "Forget Me")
 */
export async function deleteSessionMetrics(sessionId: string): Promise<number> {
  let total = 0;
  try {
    const clickResult = await query(
      `DELETE FROM click_metrics WHERE session_id = $1`,
      [sessionId]
    );
    total += clickResult.rowCount || 0;
  } catch (_) { /* session_id may not be a valid UUID for click_metrics */ }
  const eventResult = await query(
    `DELETE FROM session_events WHERE session_id = $1`,
    [sessionId]
  );
  total += eventResult.rowCount || 0;
  return total;
}

/**
 * Get session-level aggregate metrics
 */
export async function getSessionMetrics(): Promise<any> {
  const result = await queryOne(
    `SELECT
      COUNT(DISTINCT session_id) AS "totalSessions",
      COUNT(DISTINCT session_id) FILTER (
        WHERE session_end > NOW() - INTERVAL '30 minutes'
      ) AS "activeSessions",
      COALESCE(
        ROUND(
          AVG(EXTRACT(EPOCH FROM (session_end - session_start)) / 60)::numeric, 1
        ), 0
      ) AS "avgSessionDuration",
      CASE
        WHEN COUNT(DISTINCT session_id) = 0 THEN 0
        ELSE ROUND(
          COUNT(DISTINCT session_id) FILTER (WHERE event_count = 1)::numeric
          / COUNT(DISTINCT session_id) * 100, 1
        )
      END AS "bounceRate"
     FROM (
       SELECT
         session_id,
         COUNT(*) AS event_count,
         MIN(created_at) AS session_start,
         MAX(created_at) AS session_end
       FROM session_events
       GROUP BY session_id
     ) sessions`
  );
  return result;
}

/**
 * Get play-level aggregate metrics (from game_results)
 */
export async function getPlayMetrics(): Promise<any> {
  const result = await queryOne(
    `SELECT
      COUNT(*) AS "totalPlays",
      CASE
        WHEN (SELECT COUNT(DISTINCT session_id) FROM click_metrics) = 0 THEN 0
        ELSE ROUND(
          COUNT(DISTINCT gr.id)::numeric
          / (SELECT COUNT(DISTINCT session_id) FROM click_metrics) * 100, 1
        )
      END AS "playConversionRate",
      CASE
        WHEN (SELECT COUNT(DISTINCT session_id) FROM click_metrics) = 0 THEN 0
        ELSE ROUND(
          COUNT(*)::numeric
          / GREATEST((SELECT COUNT(DISTINCT session_id) FROM click_metrics), 1), 1
        )
      END AS "avgPlaysPerSession",
      (
        SELECT g.name FROM games g
        JOIN game_results gr2 ON gr2.game_id = g.id
        GROUP BY g.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS "favoritGame"
     FROM game_results gr`
  );
  return result;
}

/**
 * Get page-level metrics (all clicks on a page)
 */
export async function getPageMetrics(pagePath: string): Promise<any> {
  return queryOne(
    `SELECT
      on_page,
      COUNT(*) as total_clicks,
      COUNT(DISTINCT session_id) as unique_sessions,
      COUNT(DISTINCT link_id) as unique_links,
      ROUND(COUNT(*)::numeric / GREATEST(COUNT(DISTINCT session_id), 1), 2) as average_clicks_per_session,
      MIN(created_at) as first_click,
      MAX(created_at) as last_click
     FROM click_metrics
     WHERE on_page = $1
     GROUP BY on_page`,
    [pagePath]
  );
}
