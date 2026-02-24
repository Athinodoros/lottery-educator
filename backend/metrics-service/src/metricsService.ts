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
      ROUND(COUNT(*) / COUNT(DISTINCT session_id)::float, 2) as average_clicks_per_session,
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
      ROUND(COUNT(*) / COUNT(DISTINCT session_id)::float, 2) as average_clicks_per_session,
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
 * Get page-level metrics (all clicks on a page)
 */
export async function getPageMetrics(pagePath: string): Promise<any> {
  return queryOne(
    `SELECT
      on_page,
      COUNT(*) as total_clicks,
      COUNT(DISTINCT session_id) as unique_sessions,
      COUNT(DISTINCT link_id) as unique_links,
      ROUND(COUNT(*) / COUNT(DISTINCT session_id)::float, 2) as average_clicks_per_session,
      MIN(created_at) as first_click,
      MAX(created_at) as last_click
     FROM click_metrics
     WHERE on_page = $1
     GROUP BY on_page`,
    [pagePath]
  );
}
