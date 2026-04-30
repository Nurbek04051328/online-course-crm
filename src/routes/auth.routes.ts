import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

/**
 * Public Routes (no authentication needed)
 */

/**
 * POST /api/auth/register
 * Register new user
 * Body: { email, username, password, first_name, last_name, user_type }
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * POST /api/auth/login
 * User login
 * Body: { email, password }
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * POST /api/auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));

/**
 * Protected Routes (authentication required)
 */

/**
 * GET /api/auth/profile
 * Get current user profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/profile', authMiddleware, (req, res, next) =>
  authController.getProfile(req, res, next)
);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Headers: Authorization: Bearer <token>
 * Body: { first_name?, last_name?, avatar?, bio? }
 */
router.put('/profile', authMiddleware, (req, res, next) =>
  authController.updateProfile(req, res, next)
);

/**
 * POST /api/auth/change-password
 * Change user password
 * Headers: Authorization: Bearer <token>
 * Body: { oldPassword, newPassword }
 */
router.post('/change-password', authMiddleware, (req, res, next) =>
  authController.changePassword(req, res, next)
);

/**
 * POST /api/auth/logout
 * Logout user
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', authMiddleware, (req, res, next) =>
  authController.logout(req, res, next)
);

export default router;