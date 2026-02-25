import express, { Express, Request, Response, NextFunction } from 'express';
import { healthCheck } from './database';
import { getAllGames, getGameById, playGame, getGameResult, createGame, approveGame, deleteGame } from './gameService';
import logger from './logger';

const app: Express = express();

// Middleware
app.use(express.json());

// Request logging middleware
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
    const includePending = req.query.include_pending === 'true';
    const games = await getAllGames(!includePending);
    res.json(games);
  } catch (error: any) {
    logger.error('Error fetching games', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch games', message: error.message });
  }
});

// Create a new game (user-submitted, pending approval)
app.post('/games', async (req: Request, res: Response) => {
  try {
    const { name, description, number_range, numbers_to_select, bonus_number_range, bonus_numbers_to_select } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Game name is required' });
    }
    if (!number_range || !Array.isArray(number_range) || number_range.length !== 2) {
      return res.status(400).json({ error: 'number_range must be an array of [min, max]' });
    }
    const [min, max] = number_range;
    if (min >= max || min < 1 || max > 100) {
      return res.status(400).json({ error: 'Invalid number range' });
    }
    if (!numbers_to_select || numbers_to_select < 1 || numbers_to_select >= (max - min + 1)) {
      return res.status(400).json({ error: 'Invalid numbers_to_select' });
    }
    if (bonus_number_range) {
      if (!Array.isArray(bonus_number_range) || bonus_number_range.length !== 2) {
        return res.status(400).json({ error: 'bonus_number_range must be [min, max]' });
      }
      const [bMin, bMax] = bonus_number_range;
      if (bMin >= bMax || bMin < 1 || bMax > 100) {
        return res.status(400).json({ error: 'Invalid bonus number range' });
      }
      if (!bonus_numbers_to_select || bonus_numbers_to_select < 1 || bonus_numbers_to_select >= (bMax - bMin + 1)) {
        return res.status(400).json({ error: 'Invalid bonus_numbers_to_select' });
      }
    }

    const game = await createGame({
      name: name.trim(),
      description: description?.trim(),
      number_range,
      numbers_to_select,
      bonus_number_range: bonus_number_range || undefined,
      bonus_numbers_to_select: bonus_numbers_to_select || undefined,
    });
    res.status(201).json(game);
  } catch (error: any) {
    logger.error('Error creating game', { error: error.message, stack: error.stack });
    if (error.message.includes('duplicate key') || error.message.includes('unique')) {
      return res.status(409).json({ error: 'A game with that name already exists' });
    }
    res.status(500).json({ error: 'Failed to create game', message: error.message });
  }
});

// Approve a game
app.patch('/games/:gameId/approve', async (req: Request, res: Response) => {
  try {
    const game = await approveGame(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error: any) {
    logger.error('Error approving game', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to approve game', message: error.message });
  }
});

// Delete/reject a game
app.delete('/games/:gameId', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteGame(req.params.gameId);
    if (!deleted) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted' });
  } catch (error: any) {
    logger.error('Error deleting game', { error: error.message, stack: error.stack });
    if (error.message.includes('Cannot delete')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete game', message: error.message });
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
    logger.error('Error fetching game', { error: error.message, stack: error.stack });
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
    logger.error('Error playing game', { error: error.message, stack: error.stack });
    if (error.message.includes('not found') || error.message.includes('Invalid') || error.message.includes('Expected')) {
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
    logger.error('Error fetching result', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch result', message: error.message });
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

export default app;
