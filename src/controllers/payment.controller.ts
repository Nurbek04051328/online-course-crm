import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * POST /api/payments/initiate
   * Initiate payment
   */
  async initiatePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { enrollmentId, amount, method } = req.body;

      if (!enrollmentId || !amount || !method) {
        res.status(400).json({
          error: 'Missing required fields: enrollmentId, amount, method',
        });
        return;
      }

      const payment = await this.paymentService.createPayment({
        studentId,
        enrollmentId,
        amount,
        method,
      });

      res.status(201).json({
        success: true,
        message: 'Payment initiated',
        data: payment,
      });
    } catch (error: any) {
      console.error('❌ Initiate payment error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/payments
   * Get my payments
   */
  async getMyPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const payments = await this.paymentService.getStudentPayments(studentId, limit, offset);

      res.status(200).json({
        success: true,
        data: payments,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get payments error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/payments/:paymentId
   * Get payment details
   */
  async getPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.params;

      const payment = await this.paymentService.getPaymentDetails(paymentId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('❌ Get payment error:', error.message);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * POST /api/payments/click/callback
   * Click payment gateway callback
   */
  async clickCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { merchant_trans_id, transaction_id, status } = req.body;

      if (status === 0) {
        await this.paymentService.handleClickCallback({
          merchant_trans_id,
          transaction_id,
          status,
        });

        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: 'Payment failed' });
      }
    } catch (error: any) {
      console.error('❌ Click callback error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/payments/payme/callback
   * Payme payment gateway callback
   */
  async paymeCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, result } = req.body;

      await this.paymentService.handlePaymeCallback({ id, result });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('❌ Payme callback error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/payments/:paymentId/approve
   * Approve manual payment (admin only)
   */
  async approveManualPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.params;

      await this.paymentService.approveManualPayment(paymentId);

      res.status(200).json({
        success: true,
        message: 'Payment approved',
      });
    } catch (error: any) {
      console.error('❌ Approve payment error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/payments/:paymentId/reject
   * Reject manual payment (admin only)
   */
  async rejectManualPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      await this.paymentService.rejectManualPayment(paymentId, reason);

      res.status(200).json({
        success: true,
        message: 'Payment rejected',
      });
    } catch (error: any) {
      console.error('❌ Reject payment error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/payments/admin/pending
   * Get pending manual payments (admin only)
   */
  async getPendingPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const payments = await this.paymentService.getPendingManualPayments(limit, offset);

      res.status(200).json({
        success: true,
        data: payments,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get pending payments error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/payments/admin/stats
   * Get payment statistics (admin only)
   */
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const stats = await this.paymentService.getStatistics(days);
      const dailyRevenue = await this.paymentService.getDailyRevenue(days);

      res.status(200).json({
        success: true,
        data: {
          stats,
          dailyRevenue,
        },
      });
    } catch (error: any) {
      console.error('❌ Get statistics error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
}

export const paymentControllerInstance = new PaymentController();
export default PaymentController;