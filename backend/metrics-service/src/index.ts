import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'metrics-service', timestamp: new Date().toISOString() });
});

// TODO: Implement metrics endpoints
// POST /metrics/click/:linkId - Track a click
// GET /metrics/summary - Get aggregated metrics (for admin)

app.listen(port, () => {
  console.log(`Metrics Service running on port ${port}`);
});
