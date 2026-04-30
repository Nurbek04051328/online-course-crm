import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Enrollment } from '../types/index.js';

export class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() {
    super('enrollments', 'public');
    this.client = pool;
  }

  /**
   * Get enrollment with course details
   */
  async findWithDetails(enrollmentId: string): Promise<any> {
    const query = `
      SELECT 
        e.*,
        c.title as course_title,
        c.price,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        t.id as teacher_id,
        tu.first_name as teacher_first_name,
        tu.last_name as teacher_last_name
      FROM ${this.table} e
      LEFT JOIN public.courses c ON e.course_id = c.id
      LEFT JOIN public.students s ON e.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      LEFT JOIN public.teachers t ON c.teacher_id = t.id
      LEFT JOIN public.users tu ON t.user_id = tu.id
      WHERE e.id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [enrollmentId]);
    return result.rows[0] || null;
  }

  /**
   * Get student's enrollments
   */
  async findByStudent(studentId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        e.*,
        c.title as course_title,
        c.image as course_image,
        t.id as teacher_id,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT p.id) as completed_lessons
      FROM ${this.table} e
      LEFT JOIN public.courses c ON e.course_id = c.id
      LEFT JOIN public.teachers t ON c.teacher_id = t.id
      LEFT JOIN public.users u ON t.user_id = u.id
      LEFT JOIN public.lessons l ON c.id = l.course_id
      LEFT JOIN public.progress p ON e.id = p.enrollment_id AND p.is_completed = true
      WHERE e.student_id = $1
      GROUP BY e.id, c.id, t.id, u.id
      ORDER BY e.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [studentId, limit, offset]);
    return result.rows;
  }

  /**
   * Get course enrollments (for teacher)
   */
  async findByCourse(courseId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        e.*,
        u.email as student_email,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.avatar as student_avatar
      FROM ${this.table} e
      LEFT JOIN public.students s ON e.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      WHERE e.course_id = $1 AND e.status = 'ACTIVE'
      ORDER BY e.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [courseId, limit, offset]);
    return result.rows;
  }

  /**
   * Check if student already enrolled
   */
  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${this.table}
      WHERE student_id = $1 AND course_id = $2 AND status = 'ACTIVE'
    `;
    const result = await this.client.query(query, [studentId, courseId]);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Get student's active enrollment for course
   */
  async findActiveEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE student_id = $1 AND course_id = $2 AND status = 'ACTIVE'
      LIMIT 1
    `;
    const result = await this.client.query(query, [studentId, courseId]);
    return (result.rows[0] as Enrollment) || null;
  }

  /**
   * Get enrolled courses count for student
   */
  async getStudentCoursesCount(studentId: string): Promise<number> {
    const count = await this.count({ 
      student_id: studentId,
      status: 'ACTIVE'
    });
    return count;
  }

  /**
   * Get course total students
   */
  async getCourseStudentsCount(courseId: string): Promise<number> {
    const count = await this.count({
      course_id: courseId,
      status: 'ACTIVE',
      is_paid: true
    });
    return count;
  }
}

export const enrollmentRepositoryInstance = new EnrollmentRepository();
export default EnrollmentRepository;