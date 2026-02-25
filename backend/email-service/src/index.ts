import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './logger';

const port = process.env.PORT || 3003;

app.listen(port, () => {
  logger.info(`Email Service running on port ${port}`);
});
