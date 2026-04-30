
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import courseRoutes from './course.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

/**
 * Mount routes
 */
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
// Future routes
// router.use('/courses', courseRoutes);
// router.use('/enrollments', enrollmentRoutes);
// router.use('/progress', progressRoutes);

export default router;