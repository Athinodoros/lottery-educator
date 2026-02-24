import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './database';
import { getGameStats, getAllGameStats, generateExamples } from './statisticsService';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
    console.error('Error fetching statistics:', error);
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
    console.error('Error fetching game statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

// Get human-readable examples for a game
app.get('/stats/:gameId/examples', async (req: Request, res: Response) => {
  try {
    const examples = await generateExamples(req.params.gameId);
    res.json(examples);
  } catch (error: any) {
    console.error('Error generating examples:', error);
    res.status(500).json({ error: 'Failed to generate examples', message: error.message });
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
  console.log(`Statistics service running on port ${port}`);
});
