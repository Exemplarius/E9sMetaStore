import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from '@/middleware/errorHandler';

// Import routes
import actorRoutes from '@/routes/actorRoutes';
import actorConfigRoutes from '@/routes/actorConfigRoutes';
//import parameterRoutes from '@/routes/parameterRoutes';
//import backtestRoutes from '@/routes/backtestRoutes';
//import liveTradeRoutes from '@/routes/liveTradeRoutes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
//app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/actor', actorRoutes);
app.use('/api/actor-config', actorConfigRoutes);
//app.use('/api/parameters', parameterRoutes);
//app.use('/api/backtests', backtestRoutes);
//app.use('/api/live-trades', liveTradeRoutes);

// Home route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to E9sMetaStore API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;