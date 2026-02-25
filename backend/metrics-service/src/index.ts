import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './logger';

const port = process.env.PORT || 3004;

app.listen(port, () => {
  logger.info(`Metrics Service running on port ${port}`);
});
