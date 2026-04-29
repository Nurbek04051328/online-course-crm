// src/index.ts

import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './db/pg/client.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(` ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// API Routes (TODO - will add later)
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Online Course Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      progress: '/api/progress',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database (optional)
    try {
      await connectDatabase();
      console.log('✅ Database connected successfully');
    } catch (dbError: any) {
      console.warn('⚠️ Database connection failed:', dbError.message);
      console.warn('⚠️ Server will continue without database. Some features may not work.');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
        ╔════════════════════════════════════════════════════╗
        ║  🎓 ONLINE COURSE PLATFORM - API SERVER            ║
        ║  ✅ Running on port ${PORT}                        ║
        ║  🌐 http://localhost:${PORT}                       ║
        ║  📊 Health check: http://localhost:${PORT}/health  ║
        ╚════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await disconnectDatabase();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      await disconnectDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();