import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
 
const router = Router();
const reviewController = new ReviewController();
 
/**
 * Public Routes
 */
 
/**
 * GET /api/courses/:courseId/reviews
 * Get course reviews
 */
router.get('/course/:courseId', (req, res, next) =>
  reviewController.getCourseReviews(req, res, next)
);
 
/**
 * GET /api/courses/:courseId/rating
 * Get course rating stats
 */
router.get('/course/:courseId/rating', (req, res, next) =>
  reviewController.getCourseRating(req, res, next)
);
 
/**
 * GET /api/courses/:courseId/reviews/helpful
 * Get most helpful reviews
 */
router.get('/course/:courseId/helpful', (req, res, next) =>
  reviewController.getMostHelpful(req, res, next)
);
 
/**
 * GET /api/teachers/:teacherId/reviews
 * Get teacher reviews
 */
router.get('/teacher/:teacherId', (req, res, next) =>
  reviewController.getTeacherReviews(req, res, next)
);
 
/**
 * GET /api/teachers/:teacherId/rating
 * Get teacher rating stats
 */
router.get('/teacher/:teacherId/rating', (req, res, next) =>
  reviewController.getTeacherRating(req, res, next)
);
 
/**
 * Protected Routes (Student)
 */
 
/**
 * POST /api/reviews
 * Create review
 */
router.post('/', authMiddleware, (req, res, next) =>
  reviewController.createReview(req, res, next)
);
 
/**
 * PUT /api/reviews/:reviewId
 * Update review
 */
router.put('/:reviewId', authMiddleware, (req, res, next) =>
  reviewController.updateReview(req, res, next)
);
 
/**
 * DELETE /api/reviews/:reviewId
 * Delete review
 */
router.delete('/:reviewId', authMiddleware, (req, res, next) =>
  reviewController.deleteReview(req, res, next)
);
 
/**
 * POST /api/reviews/:reviewId/helpful
 * Mark as helpful
 */
router.post('/:reviewId/helpful', (req, res, next) =>
  reviewController.markHelpful(req, res, next)
);
 
export default router;