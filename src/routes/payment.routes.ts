import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const paymentController = new PaymentController();

/**
 * Protected Routes (Student)
 */

/**
 * POST /api/payments/initiate
 * Initiate payment
 */
router.post('/initiate', authMiddleware, (req, res, next) =>
  paymentController.initiatePayment(req, res, next)
);

/**
 * GET /api/payments
 * Get my payments
 */
router.get('/', authMiddleware, (req, res, next) =>
  paymentController.getMyPayments(req, res, next)
);

/**
 * GET /api/payments/:paymentId
 * Get payment details
 */
router.get('/:paymentId', authMiddleware, (req, res, next) =>
  paymentController.getPayment(req, res, next)
);

/**
 * Public Routes (Webhooks - no auth needed)
 */

/**
 * POST /api/payments/click/callback
 * Click payment gateway webhook
 */
router.post('/click/callback', (req, res, next) =>
  paymentController.clickCallback(req, res, next)
);

/**
 * POST /api/payments/payme/callback
 * Payme payment gateway webhook
 */
router.post('/payme/callback', (req, res, next) =>
  paymentController.paymeCallback(req, res, next)
);

/**
 * Admin Routes
 */

/**
 * GET /api/payments/admin/pending
 * Get pending manual payments
 */
router.get('/admin/pending', authMiddleware, (req, res, next) =>
  paymentController.getPendingPayments(req, res, next)
);

/**
 * POST /api/payments/:paymentId/approve
 * Approve manual payment
 */
router.post('/:paymentId/approve', authMiddleware, (req, res, next) =>
  paymentController.approveManualPayment(req, res, next)
);

/**
 * POST /api/payments/:paymentId/reject
 * Reject manual payment
 */
router.post('/:paymentId/reject', authMiddleware, (req, res, next) =>
  paymentController.rejectManualPayment(req, res, next)
);

/**
 * GET /api/payments/admin/stats
 * Get payment statistics
 */
router.get('/admin/stats', authMiddleware, (req, res, next) =>
  paymentController.getStatistics(req, res, next)
);

export default router;