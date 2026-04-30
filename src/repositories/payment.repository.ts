import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Payment } from '../types/index.js';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments', 'public');
    this.client = pool;
  }

  /**
   * Get payment with enrollment details
   */
  async findWithDetails(paymentId: string): Promise<any> {
    const query = `
      SELECT 
        p.*,
        e.student_id,
        e.course_id,
        c.title as course_title,
        c.price as course_price,
        u.email as student_email,
        u.first_name as student_first_name,
        u.last_name as student_last_name
      FROM ${this.table} p
      LEFT JOIN public.enrollments e ON p.enrollment_id = e.id
      LEFT JOIN public.courses c ON e.course_id = c.id
      LEFT JOIN public.students s ON e.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      WHERE p.id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [paymentId]);
    return result.rows[0] || null;
  }

  /**
   * Get student's payments
   */
  async findByStudent(studentId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        p.*,
        c.title as course_title,
        c.image as course_image
      FROM ${this.table} p
      LEFT JOIN public.enrollments e ON p.enrollment_id = e.id
      LEFT JOIN public.courses c ON e.course_id = c.id
      WHERE e.student_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [studentId, limit, offset]);
    return result.rows;
  }

  /**
   * Get payments by status
   */
  async findByStatus(status: string, limit: number = 10, offset: number = 0): Promise<Payment[]> {
    const result = await this.findMany({
      where: { status },
      orderBy: { created_at: 'DESC' },
      limit,
      offset,
    });
    return result as Payment[];
  }

  /**
   * Get payments by method
   */
  async findByMethod(method: string, limit: number = 10, offset: number = 0): Promise<Payment[]> {
    const result = await this.findMany({
      where: { method },
      orderBy: { created_at: 'DESC' },
      limit,
      offset,
    });
    return result as Payment[];
  }

  /**
   * Find by external ID (from payment gateway)
   */
  async findByExternalId(externalId: string): Promise<Payment | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE external_id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [externalId]);
    return (result.rows[0] as Payment) || null;
  }

  /**
   * Get payment statistics
   */
  async getStats(days: number = 30): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as successful_payments,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_payments,
        SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'COMPLETED' THEN amount ELSE NULL END) as average_payment
      FROM ${this.table}
      WHERE created_at > NOW() - INTERVAL '${days} days'
    `;
    const result = await this.client.query(query);
    return result.rows[0];
  }

  /**
   * Get daily revenue
   */
  async getDailyRevenue(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(created_at) as payment_date,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) as daily_revenue
      FROM ${this.table}
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY payment_date DESC
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  /**
   * Get pending manual payments (for admin approval)
   */
  async getPendingManualPayments(limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        p.*,
        u.email as student_email,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        c.title as course_title
      FROM ${this.table} p
      LEFT JOIN public.enrollments e ON p.enrollment_id = e.id
      LEFT JOIN public.students s ON e.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      LEFT JOIN public.courses c ON e.course_id = c.id
      WHERE p.method = 'MANUAL' AND p.status = 'PENDING'
      ORDER BY p.created_at ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.client.query(query, [limit, offset]);
    return result.rows;
  }
}

export const paymentRepositoryInstance = new PaymentRepository();
export default PaymentRepository;