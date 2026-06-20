import mongoose from 'mongoose';
import { env } from './env';
import pino from 'pino';

const logger = pino({ name: 'db' });

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error(error, 'Failed to connect to MongoDB');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error(err, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}
