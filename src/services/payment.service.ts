import { PaymentRepository } from '../repositories/payment.repository.js';
import { EnrollmentRepository } from '../repositories/enrollment.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { EarningRepository } from '../repositories/earning.repository.js';
import { EarningStatus, EnrollmentStatus, Payment, PaymentMethod, PaymentStatus } from '../types/index.js';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private enrollmentRepository: EnrollmentRepository;
  private courseRepository: CourseRepository;
  private earningRepository: EarningRepository;

  private PLATFORM_COMMISSION = 0.2; // 20%

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.enrollmentRepository = new EnrollmentRepository();
    this.courseRepository = new CourseRepository();
    this.earningRepository = new EarningRepository();
  }

  /**
   * Create payment record
   */
  async createPayment(data: {
    studentId: string;
    enrollmentId: string;
    amount: number;
    method: 'CLICK' | 'PAYME' | 'UZCARD' | 'MANUAL';
  }): Promise<Payment> {
    const payment = await this.paymentRepository.create({
      student_id: data.studentId,
      enrollment_id: data.enrollmentId,
      amount: data.amount,
      currency: 'UZS',
      method: data.method as PaymentMethod,
      status: data.method === 'MANUAL'
        ? PaymentStatus.PENDING
        : PaymentStatus.PROCESSING,
    });

    return payment;
  }

  /**
   * Complete payment and create earning
   */
  async completePayment(paymentId: string): Promise<void> {
    // 1. Get payment
    const payment = await this.paymentRepository.findWithDetails(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // 2. Mark payment as completed
    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.COMPLETED,
    });

    // 3. Mark enrollment as paid
    await this.enrollmentRepository.update(payment.enrollment_id, {
      is_paid: true,
      paid_at: new Date(),
    });

    // 4. Initialize progress for enrollment
    const query = `
      SELECT l.id FROM public.lessons l
      WHERE l.course_id = $1
      ORDER BY l.order ASC
    `;
    const lessonsResult = await (this.paymentRepository as any).client.query(
      query,
      [payment.course_id]
    );
    
    for (const lesson of lessonsResult.rows) {
      await (this.paymentRepository as any).client.query(
        `INSERT INTO public.progress (student_id, enrollment_id, lesson_id, watched_percentage, watched_duration, total_duration, is_completed, is_started)
        VALUES ($1, $2, $3, 0, 0, 0, false, false)
        ON CONFLICT DO NOTHING`,
        [payment.student_id, payment.enrollment_id, lesson.id]
      );
    }

    // 5. Create earning record
    const grossAmount = payment.amount;
    const platformFee = grossAmount * this.PLATFORM_COMMISSION;
    const netAmount = grossAmount - platformFee;

    const course = await this.courseRepository.findById(payment.course_id);
    if (course) {
      await this.earningRepository.create({
        teacher_id: course.teacher_id,
        enrollment_id: payment.enrollment_id,
        course_id: payment.course_id,
        gross_amount: grossAmount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: EarningStatus.PENDING,
      });
    }
  }

  /**
   * Fail payment
   */
  async failPayment(paymentId: string, reason: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.FAILED,
    });
  }

  /**
   * Approve manual payment
   */
  async approveManualPayment(paymentId: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.method !== 'MANUAL') {
      throw new Error('Only manual payments can be approved manually');
    }

    if (payment.status !== 'PENDING') {
      throw new Error('Only pending payments can be approved');
    }

    await this.completePayment(paymentId);
  }

  /**
   * Reject manual payment
   */
  async rejectManualPayment(paymentId: string, reason: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.CANCELLED,
    });

    // Cancel enrollment
    await this.enrollmentRepository.update(payment.enrollment_id, {
      status: EnrollmentStatus.CANCELLED,
    });
  }

  /**
   * Get student payments
   */
  async getStudentPayments(studentId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    return this.paymentRepository.findByStudent(studentId, limit, offset);
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    return this.paymentRepository.findWithDetails(paymentId);
  }

  /**
   * Get payment statistics
   */
  async getStatistics(days: number = 30): Promise<any> {
    return this.paymentRepository.getStats(days);
  }

  /**
   * Get daily revenue
   */
  async getDailyRevenue(days: number = 30): Promise<any[]> {
    return this.paymentRepository.getDailyRevenue(days);
  }

  /**
   * Get pending manual payments
   */
  async getPendingManualPayments(limit: number = 10, offset: number = 0): Promise<any[]> {
    return this.paymentRepository.getPendingManualPayments(limit, offset);
  }

  /**
   * Handle Click payment callback
   */
  async handleClickCallback(data: {
    merchant_trans_id: string;
    transaction_id: string;
    status: number;
  }): Promise<void> {
    // Status: 0 = success, other = failed
    if (data.status === 0) {
      await this.completePayment(data.merchant_trans_id);
    } else {
      await this.failPayment(data.merchant_trans_id, 'Payment failed via Click');
    }
  }

  /**
   * Handle Payme payment callback
   */
  async handlePaymeCallback(data: {
    id: string;
    result: {
      state: number; // 1 = completed
    };
  }): Promise<void> {
    if (data.result.state === 1) {
      const payment = await this.paymentRepository.findByExternalId(data.id);
      if (payment) {
        await this.completePayment(payment.id);
      }
    }
  }
}

export const paymentServiceInstance = new PaymentService();
export default PaymentService;