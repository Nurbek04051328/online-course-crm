import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const progressController = new ProgressController();

/**
 * Protected Routes (Student)
 */

/**
 * PUT /api/progress/lesson/:lessonId
 * Update lesson progress
 */
router.put('/lesson/:lessonId', authMiddleware, (req, res, next) =>
  progressController.updateProgress(req, res, next)
);

/**
 * GET /api/progress/lesson/:lessonId
 * Get lesson progress
 */
router.get('/lesson/:lessonId', authMiddleware, (req, res, next) =>
  progressController.getLessonProgress(req, res, next)
);

/**
 * GET /api/progress/enrollment/:enrollmentId
 * Get enrollment progress
 */
router.get('/enrollment/:enrollmentId', authMiddleware, (req, res, next) =>
  progressController.getEnrollmentProgress(req, res, next)
);

/**
 * GET /api/progress/incomplete/:enrollmentId
 * Get incomplete lessons
 */
router.get('/incomplete/:enrollmentId', authMiddleware, (req, res, next) =>
  progressController.getIncompleteLessons(req, res, next)
);

/**
 * POST /api/progress/complete/:lessonId
 * Mark lesson as completed
 */
router.post('/complete/:lessonId', authMiddleware, (req, res, next) =>
  progressController.completeLesson(req, res, next)
);

/**
 * GET /api/progress/study-time
 * Get total study time
 */
router.get('/study-time', authMiddleware, (req, res, next) =>
  progressController.getStudyTime(req, res, next)
);

/**
 * GET /api/progress/stats/daily
 * Get daily statistics
 */
router.get('/stats/daily', authMiddleware, (req, res, next) =>
  progressController.getDailyStats(req, res, next)
);

/**
 * Public Routes (Teacher)
 */

/**
 * GET /api/progress/stats/course/:courseId
 * Get course statistics
 */
router.get('/stats/course/:courseId', (req, res, next) =>
  progressController.getCourseStats(req, res, next)
);

export default router;