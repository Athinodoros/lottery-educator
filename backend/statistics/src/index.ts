import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './logger';

const port = process.env.PORT || 3002;

app.listen(port, () => {
  logger.info(`Statistics service running on port ${port}`);
});
