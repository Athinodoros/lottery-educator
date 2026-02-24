import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { healthCheck } from './database';
import { trackClick, getLinkMetrics, getAllMetrics, getRecentClicks, getPageMetrics } from './metricsService';
import logger from './logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3004;

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
      service: 'metrics-service',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'metrics-service',
      error: 'Database connection failed',
    });
  }
});

// Track a click
app.post('/metrics/click', async (req: Request, res: Response) => {
  try {
    const { sessionId, linkId, onPage } = req.body;

    // Validation
    if (!sessionId || !linkId || !onPage) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'sessionId, linkId, and onPage are required',
      });
    }

    const metric = await trackClick(sessionId, linkId, onPage);
    res.status(201).json(metric);
  } catch (error: any) {
    logger.error('Error tracking click', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to track click', message: error.message });
  }
});

// Get metrics for a specific link
app.get('/metrics/link/:linkId', async (req: Request, res: Response) => {
  try {
    const metrics = await getLinkMetrics(req.params.linkId);
    if (!metrics) {
      return res.status(404).json({ error: 'No metrics found for this link' });
    }
    res.json(metrics);
  } catch (error: any) {
    logger.error('Error fetching link metrics', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch metrics', message: error.message });
  }
});

// Get recent clicks for a link
app.get('/metrics/link/:linkId/recent', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const clicks = await getRecentClicks(req.params.linkId, limit);
    res.json({ link_id: req.params.linkId, recent_clicks: clicks, count: clicks.length });
  } catch (error: any) {
    logger.error('Error fetching recent clicks', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch recent clicks', message: error.message });
  }
});

// Get metrics for all links
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await getAllMetrics();
    res.json({ metrics, total_links: metrics.length });
  } catch (error: any) {
    logger.error('Error fetching all metrics', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch metrics', message: error.message });
  }
});

// Get page-level metrics
app.get('/metrics/page', async (req: Request, res: Response) => {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'path query parameter is required',
      });
    }

    const metrics = await getPageMetrics(path as string);
    if (!metrics) {
      return res.status(404).json({ error: 'No metrics found for this page' });
    }
    res.json(metrics);
  } catch (error: any) {
    logger.error('Error fetching page metrics', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch page metrics', message: error.message });
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
  logger.info(`Metrics Service running on port ${port}`);
});
