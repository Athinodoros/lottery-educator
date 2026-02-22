import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'email-service', timestamp: new Date().toISOString() });
});

// TODO: Implement email endpoints
// POST /emails - Submit contact form
// DELETE /emails/:id - Delete email (GDPR compliance)
// GET /emails - Get all emails (admin only)

app.listen(port, () => {
  console.log(`Email Service running on port ${port}`);
});
