import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { authMiddleware, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();
const courseController = new CourseController();

/**
 * Public Routes
 */

/**
 * GET /api/courses
 * Get all published courses (with search, category filter)
 * Query: ?search=xxx&category=xxx&limit=10&offset=0
 */
router.get('/', (req, res, next) => courseController.getAllCourses(req, res, next));

/**
 * GET /api/courses/trending
 * Get trending courses
 */
router.get('/trending', (req, res, next) => courseController.getTrendingCourses(req, res, next));

/**
 * GET /api/courses/:courseId
 * Get course details
 */
router.get('/:courseId', (req, res, next) => courseController.getCourse(req, res, next));

/**
 * GET /api/categories
 * Get all categories
 */
router.get('/categories/list', (req, res, next) => courseController.getCategories(req, res, next));

/**
 * GET /api/categories/:categoryId
 * Get category details
 */
router.get(
  '/categories/:categoryId',
  (req, res, next) => courseController.getCategory(req, res, next)
);

/**
 * Protected Routes (Teacher only)
 */

/**
 * POST /api/courses
 * Create new course
 * Body: { title, description, category_id, price, pricing_type }
 */
router.post('/', authMiddleware, (req, res, next) => courseController.createCourse(req, res, next));

/**
 * GET /api/courses/my-courses
 * Get teacher's courses
 */
router.get(
  '/my-courses',
  authMiddleware,
  (req, res, next) => courseController.getTeacherCourses(req, res, next)
);

/**
 * PUT /api/courses/:courseId
 * Update course
 */
router.put(
  '/:courseId',
  authMiddleware,
  (req, res, next) => courseController.updateCourse(req, res, next)
);

/**
 * POST /api/courses/:courseId/publish
 * Publish course
 */
router.post(
  '/:courseId/publish',
  authMiddleware,
  (req, res, next) => courseController.publishCourse(req, res, next)
);

/**
 * POST /api/courses/:courseId/archive
 * Archive course
 */
router.post(
  '/:courseId/archive',
  authMiddleware,
  (req, res, next) => courseController.archiveCourse(req, res, next)
);

/**
 * DELETE /api/courses/:courseId
 * Delete course
 */
router.delete(
  '/:courseId',
  authMiddleware,
  (req, res, next) => courseController.deleteCourse(req, res, next)
);

/**
 * GET /api/courses/:courseId/revenue
 * Get course revenue
 */
router.get(
  '/:courseId/revenue',
  authMiddleware,
  (req, res, next) => courseController.getCourseRevenue(req, res, next)
);

export default router;