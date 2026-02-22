import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'statistics', timestamp: new Date().toISOString() });
});

// TODO: Implement statistics endpoints
// GET /stats/:gameType - Get aggregated stats for a game
// GET /stats/:gameType/examples - Get human-readable examples

app.listen(port, () => {
  console.log(`Statistics service running on port ${port}`);
});
