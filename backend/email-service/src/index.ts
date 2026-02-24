import express, { Express, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { healthCheck } from './database';
import { submitEmail, getEmail, getAllEmails, deleteEmail, isValidEmail } from './emailService';
import logger from './logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(express.json());

// Rate limiting for email submission
const emailLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests per window
  message: 'Too many emails submitted, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

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
      service: 'email-service',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'email-service',
      error: 'Database connection failed',
    });
  }
});

// Submit email
app.post('/emails', emailLimiter, async (req: Request, res: Response) => {
  try {
    const { senderEmail, subject, body } = req.body;

    // Validation
    if (!senderEmail || !subject || !body) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'senderEmail, subject, and body are required',
      });
    }

    if (!isValidEmail(senderEmail)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid email address',
      });
    }

    if (subject.length > 255 || body.length > 10000) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Subject or body too long',
      });
    }

    const email = await submitEmail(senderEmail, subject, body);
    res.status(201).json(email);
  } catch (error: any) {
    logger.error('Error submitting email', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to submit email', message: error.message });
  }
});

// Get single email
app.get('/emails/:emailId', async (req: Request, res: Response) => {
  try {
    const email = await getEmail(req.params.emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error: any) {
    logger.error('Error fetching email', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch email', message: error.message });
  }
});

// Get all emails (admin - hardcoded check)
app.get('/emails', async (req: Request, res: Response) => {
  try {
    // TODO: Add proper authentication
    const adminKey = req.query.key;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const emails = await getAllEmails();
    res.json(emails);
  } catch (error: any) {
    logger.error('Error fetching emails', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch emails', message: error.message });
  }
});

// Delete email (GDPR)
app.delete('/emails/:emailId', async (req: Request, res: Response) => {
  try {
    const success = await deleteEmail(req.params.emailId);
    if (!success) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json({ message: 'Email deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting email', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to delete email', message: error.message });
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
  logger.info(`Email Service running on port ${port}`);
});
