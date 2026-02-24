import { queryOne, queryAll } from './database';
import { GameStats, StatisticsExample } from './types';
import logger from './logger';

const CACHE: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600') * 1000; // Convert to ms

function getFromCache<T>(key: string): T | null {
  const cached = CACHE.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    CACHE.delete(key);
    return null;
  }
  return cached.data;
}

function setCache<T>(key: string, data: T): void {
  CACHE.set(key, { data, timestamp: Date.now() });
}

/**
 * Get statistics for a specific game
 */
export async function getGameStats(gameId: string): Promise<GameStats | null> {
  const cacheKey = `stats:${gameId}`;
  
  // Check cache first
  const cached = getFromCache<GameStats>(cacheKey);
  if (cached) {
    logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }

  const stats = await queryOne(
    `SELECT
      gr.game_id,
      g.name,
      COUNT(*) as total_plays,
      COUNT(CASE WHEN gr.is_winner THEN 1 END) as total_wins,
      ROUND(AVG(gr.draws_to_win), 2) as avg_draws_to_win,
      MAX(gr.draws_to_win) as max_draws_to_win,
      MIN(gr.draws_to_win) as min_draws_to_win,
      ROUND(COUNT(CASE WHEN gr.is_winner THEN 1 END)::NUMERIC / COUNT(*) * 100, 4) as win_rate_percent,
      MAX(gr.created_at) as last_play_at
    FROM game_results gr
    JOIN games g ON gr.game_id = g.id
    WHERE gr.game_id = $1
    GROUP BY gr.game_id, g.name`,
    [gameId]
  );

  if (stats) {
    setCache(cacheKey, stats);
  }

  return stats;
}

/**
 * Get statistics for all games
 */
export async function getAllGameStats(): Promise<GameStats[]> {
  const cacheKey = 'stats:all';
  
  const cached = getFromCache<GameStats[]>(cacheKey);
  if (cached) {
    logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }

  const stats = await queryAll(
    `SELECT 
      gr.game_id,
      g.name,
      COUNT(*) as total_plays,
      COUNT(CASE WHEN gr.is_winner THEN 1 END) as total_wins,
      ROUND(AVG(gr.draws_to_win), 2) as avg_draws_to_win,
      MAX(gr.draws_to_win) as max_draws_to_win,
      MIN(gr.draws_to_win) as min_draws_to_win,
      ROUND(COUNT(CASE WHEN gr.is_winner THEN 1 END)::NUMERIC / COUNT(*) * 100, 4) as win_rate_percent,
      MAX(gr.created_at) as last_play_at
    FROM game_results gr
    JOIN games g ON gr.game_id = g.id
    GROUP BY gr.game_id, g.name
    ORDER BY total_plays DESC`
  );

  if (stats.length > 0) {
    setCache(cacheKey, stats);
  }

  return stats;
}

/**
 * Generate human-readable examples for a game's statistics
 */
export async function generateExamples(gameId: string): Promise<StatisticsExample[]> {
  const stats = await getGameStats(gameId);
  if (!stats || stats.total_plays === 0) {
    return [];
  }

  const avgDraws = Math.round(stats.avg_draws_to_win as number);
  
  const examples: StatisticsExample[] = [
    {
      timeframe: 'per week',
      description: `Playing once per week, would take ~${Math.round(avgDraws / 52)} years to win on average`,
      drawCount: avgDraws,
    },
    {
      timeframe: 'per day',
      description: `Playing once daily, would take ~${Math.round(avgDraws / 365)} years to win on average`,
      drawCount: avgDraws,
    },
    {
      timeframe: 'per lifetime',
      description: `In a 70-year lifetime of daily plays, approximately ${Math.round((70 * 365) / avgDraws)} wins expected`,
      drawCount: avgDraws,
    },
    {
      timeframe: 'comparison',
      description: `You're more likely to be struck by lightning (1 in ~500,000) than to win this lottery`,
      drawCount: avgDraws,
    },
  ];

  return examples;
}

/**
 * Clear all caches (for testing or admin purposes)
 */
export function clearCache(): void {
  CACHE.clear();
  logger.info('Statistics cache cleared');
}
