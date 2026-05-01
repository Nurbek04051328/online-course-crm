
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import courseRoutes from './course.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import progressRoutes from './progress.routes.js';
import reviewRoutes from './review.routes.js';
import paymentRoutes from './payment.routes.js';
import lessonRoutes from './lesson.routes.js';
import telegramRoutes from './telegram.routes.js';

const router = Router();

/**
 * Mount routes
 */
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/reviews', reviewRoutes);
router.use('/lessons', lessonRoutes);
router.use('/payments', paymentRoutes);
router.use('/telegram', telegramRoutes);

export default router;