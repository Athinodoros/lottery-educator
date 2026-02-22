import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Service routing
const services = {
  gameEngine: process.env.GAME_ENGINE_URL || 'http://localhost:3001',
  statistics: process.env.STATISTICS_URL || 'http://localhost:3002',
  emailService: process.env.EMAIL_SERVICE_URL || 'http://localhost:3003',
  metricsService: process.env.METRICS_SERVICE_URL || 'http://localhost:3004',
};

// Proxy middleware for game engine
app.use('/api/games', async (req: Request, res: Response) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.gameEngine}/games${req.path.substring(5)}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Game Engine Service Error',
      message: error.message,
    });
  }
});

// Proxy middleware for statistics
app.use('/api/stats', async (req: Request, res: Response) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.statistics}/stats${req.path.substring(10)}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Statistics Service Error',
      message: error.message,
    });
  }
});

// Proxy middleware for emails
app.use('/api/emails', async (req: Request, res: Response) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.emailService}/emails${req.path.substring(10)}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Email Service Error',
      message: error.message,
    });
  }
});

// Proxy middleware for metrics
app.use('/api/metrics', async (req: Request, res: Response) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.metricsService}/metrics${req.path.substring(11)}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Metrics Service Error',
      message: error.message,
    });
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
  console.log(`API Gateway running on port ${port}`);
});
