import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import taxonomyRoutes from './routes/taxonomyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        // Allow any vercel deployment, localhost, or configured client URL
        if (
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          (config.clientUrl && origin === config.clientUrl)
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      app: config.appName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/taxonomy', taxonomyRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 & Error Handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
