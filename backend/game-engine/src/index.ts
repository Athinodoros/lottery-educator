import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './database';
import { getAllGames, getGameById, playGame, getGameResult } from './gameService';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Request logging middleware
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
      service: 'game-engine',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'game-engine',
      error: 'Database connection failed',
    });
  }
});

// Get all games
app.get('/games', async (req: Request, res: Response) => {
  try {
    const games = await getAllGames();
    res.json(games);
  } catch (error: any) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games', message: error.message });
  }
});

// Get specific game
app.get('/games/:gameId', async (req: Request, res: Response) => {
  try {
    const game = await getGameById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error: any) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game', message: error.message });
  }
});

// Play a game
app.post('/games/:gameId/play', async (req: Request, res: Response) => {
  try {
    const { selectedNumbers, selectedExtra } = req.body;

    if (!selectedNumbers || !Array.isArray(selectedNumbers)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'selectedNumbers array is required',
      });
    }

    const result = await playGame(req.params.gameId, {
      selectedNumbers,
      selectedExtra,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error playing game:', error);
    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: 'Bad request', message: error.message });
    }
    res.status(500).json({ error: 'Failed to play game', message: error.message });
  }
});

// Get game result
app.get('/games/:gameId/result/:resultId', async (req: Request, res: Response) => {
  try {
    const result = await getGameResult(req.params.resultId);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result', message: error.message });
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
  console.log(`Game Engine service running on port ${port}`);
});
