import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Earning, EarningStatus } from '../types/index.js';

export class EarningRepository extends BaseRepository<Earning> {
  constructor() {
    super('earnings', 'public');
    this.client = pool;
  }

  /**
   * Get teacher earnings
   */
  async findByTeacher(teacherId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        e.*,
        c.title as course_title,
        u.email as student_email
      FROM ${this.table} e
      LEFT JOIN public.courses c ON e.course_id = c.id
      LEFT JOIN public.enrollments en ON e.enrollment_id = en.id
      LEFT JOIN public.students s ON en.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      WHERE e.teacher_id = $1
      ORDER BY e.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [teacherId, limit, offset]);
    return result.rows;
  }

  /**
   * Get teacher total earnings
   */
  async getTeacherTotalEarnings(teacherId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'PAID' THEN net_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'PENDING' THEN net_amount ELSE 0 END) as total_pending,
        SUM(gross_amount) as total_gross
      FROM ${this.table}
      WHERE teacher_id = $1
    `;
    const result = await this.client.query(query, [teacherId]);
    return result.rows[0];
  }

  /**
   * Get monthly earnings
   */
  async getMonthlyEarnings(teacherId: string): Promise<any[]> {
    const query = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(CASE WHEN status = 'PAID' THEN net_amount ELSE 0 END) as monthly_earnings,
        COUNT(*) as transactions
      FROM ${this.table}
      WHERE teacher_id = $1
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;
    const result = await this.client.query(query, [teacherId]);
    return result.rows;
  }

  /**
   * Mark as paid
   */
  async markAsPaid(earningId: string, paymentId: string): Promise<Earning | null> {
    return this.update(earningId, {
      status: EarningStatus.PAID,
      paid_at: new Date(),
      payment_id: paymentId,
    });
  }
}

export const earningRepositoryInstance = new EarningRepository();
export default EarningRepository;