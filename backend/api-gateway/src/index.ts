import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './logger';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`);
  logger.info('Routing to upstream services', {
    gameEngine: process.env.GAME_ENGINE_URL || 'http://localhost:3001',
    statistics: process.env.STATISTICS_URL || 'http://localhost:3002',
    emailService: process.env.EMAIL_SERVICE_URL || 'http://localhost:3003',
    metricsService: process.env.METRICS_SERVICE_URL || 'http://localhost:3004',
  });
});
