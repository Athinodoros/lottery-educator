import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './logger';

const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`Game Engine service running on port ${port}`);
});
