import 'module-alias/register';
import dotenv from 'dotenv';
dotenv.config();

import app from '@/app';
import logger from '@/config/logger';
import { testConnection } from '@/db/pool';

const PORT = process.env.PORT || 5000;

// Test database connection
testConnection()
  .then(() => {
    
    const server = app.listen(PORT, () => {
      logger.info(`E9sMetaStore server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  })
  .catch(err => {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });