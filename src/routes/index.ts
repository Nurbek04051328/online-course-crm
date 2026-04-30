
import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

/**
 * Mount routes
 */
router.use('/auth', authRoutes);

// Future routes
// router.use('/courses', courseRoutes);
// router.use('/enrollments', enrollmentRoutes);
// router.use('/progress', progressRoutes);

export default router;