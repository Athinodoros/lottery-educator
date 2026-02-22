import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

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
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'game-engine', timestamp: new Date().toISOString() });
});

// TODO: Implement game endpoints
// POST /games/:type/play - Start a game
// GET /games/:type/result - Get result of a game

app.listen(port, () => {
  console.log(`Game Engine service running on port ${port}`);
});
