import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/db';
import { startScheduledJobs } from './jobs/scheduler';

async function start() {
  await connectDB();
  startScheduledJobs();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
