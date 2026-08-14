import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import { seedDatabase } from './seed/seedData.js';

import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import testRoutes from './routes/testRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for resumes and avatars
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/cms', cmsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MindMend Academy API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Initialize database & start server
async function start() {
  try {
    initDatabase();
    await seedDatabase();

    let currentPort = Number(PORT);

    function attemptListen(portToTry: number) {
      const server = app.listen(portToTry, () => {
        try {
          fs.writeFileSync(path.resolve(process.cwd(), '.active-port'), String(portToTry));
        } catch (e) {}
        console.log(`🚀 MindMend Server is running on http://localhost:${portToTry}`);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`⚠️ Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
          attemptListen(portToTry + 1);
        } else {
          console.error('Fatal error starting server:', err);
          process.exit(1);
        }
      });
    }

    attemptListen(currentPort);
  } catch (err) {
    console.error('Fatal error starting database or server:', err);
    process.exit(1);
  }
}

start();
