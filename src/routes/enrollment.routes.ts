import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const enrollmentController = new EnrollmentController();

/**
 * Protected Routes (Student)
 */

/**
 * POST /api/enrollments
 * Enroll in course
 */
router.post('/', authMiddleware, (req, res, next) => enrollmentController.enrollCourse(req, res, next));

/**
 * GET /api/enrollments
 * Get my enrollments
 */
router.get('/', authMiddleware, (req, res, next) => enrollmentController.getEnrollments(req, res, next));

/**
 * GET /api/enrollments/:enrollmentId
 * Get enrollment details
 */
router.get('/:enrollmentId', authMiddleware, (req, res, next) =>
  enrollmentController.getEnrollment(req, res, next)
);

/**
 * DELETE /api/enrollments/:enrollmentId
 * Cancel enrollment
 */
router.delete('/:enrollmentId', authMiddleware, (req, res, next) =>
  enrollmentController.cancelEnrollment(req, res, next)
);

/**
 * GET /api/enrollments/check-access/:courseId
 * Check if can access course
 */
router.get('/check-access/:courseId', authMiddleware, (req, res, next) =>
  enrollmentController.checkAccess(req, res, next)
);

/**
 * Protected Routes (Teacher)
 */

/**
 * GET /api/courses/:courseId/enrollments
 * Get course enrollments
 */
router.get('/course/:courseId', authMiddleware, (req, res, next) =>
  enrollmentController.getCourseEnrollments(req, res, next)
);

export default router;