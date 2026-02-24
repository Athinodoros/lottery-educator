import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './database';
import { getGameStats, getAllGameStats, generateExamples } from './statisticsService';
import logger from './logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
    return originalSend.call(this, data);
  };

  next();
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await healthCheck();
    res.json({
      status: dbHealthy ? 'ok' : 'degraded',
      service: 'statistics',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'statistics',
      error: 'Database connection failed',
    });
  }
});

// Get all game statistics
app.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getAllGameStats();
    res.json(stats);
  } catch (error: any) {
    logger.error('Error fetching statistics', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

// Get statistics for a specific game
app.get('/stats/:gameId', async (req: Request, res: Response) => {
  try {
    const stats = await getGameStats(req.params.gameId);
    if (!stats) {
      return res.status(404).json({ error: 'No statistics found for this game' });
    }
    res.json(stats);
  } catch (error: any) {
    logger.error('Error fetching game statistics', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

// Get human-readable examples for a game
app.get('/stats/:gameId/examples', async (req: Request, res: Response) => {
  try {
    const examples = await generateExamples(req.params.gameId);
    res.json(examples);
  } catch (error: any) {
    logger.error('Error generating examples', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to generate examples', message: error.message });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(port, () => {
  logger.info(`Statistics service running on port ${port}`);
});
