import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Progress } from '../types/index.js';

export class ProgressRepository extends BaseRepository<Progress> {
  constructor() {
    super('progress', 'public');
    this.client = pool;
  }

  async findByEnrollment(enrollmentId: string): Promise<Progress[]> {
    const query = `
      SELECT p.*
      FROM ${this.table} p
      WHERE p.enrollment_id = $1
      ORDER BY p.created_at ASC
    `;
    const result = await this.client.query(query, [enrollmentId]);
    return result.rows as Progress[];
  }

  async findByLessonStudent(lessonId: string, studentId: string): Promise<Progress | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE lesson_id = $1 AND student_id = $2
      LIMIT 1
    `;
    const result = await this.client.query(query, [lessonId, studentId]);
    return (result.rows[0] as Progress) || null;
  }

  async getCourseStats(courseId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(DISTINCT p.student_id) as total_students,
        AVG(p.watched_percentage) as average_completion
      FROM ${this.table} p
      LEFT JOIN public.lessons l ON p.lesson_id = l.id
      WHERE l.course_id = $1
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows[0];
  }

  async getStudentCourseProgress(enrollmentId: string): Promise<any> {
    const query = `
      SELECT 
        e.id as enrollment_id,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN p.is_completed = true THEN l.id END) as completed_lessons,
        AVG(p.watched_percentage) as average_watched
      FROM public.enrollments e
      LEFT JOIN public.lessons l ON e.course_id = l.course_id
      LEFT JOIN public.progress p ON e.id = p.enrollment_id AND l.id = p.lesson_id
      WHERE e.id = $1
      GROUP BY e.id
    `;
    const result = await this.client.query(query, [enrollmentId]);
    return result.rows[0];
  }

  async getIncompleteLessons(enrollmentId: string): Promise<Progress[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE enrollment_id = $1 AND is_completed = false
    `;
    const result = await this.client.query(query, [enrollmentId]);
    return result.rows as Progress[];
  }

  async getDailyStats(studentId: string): Promise<any[]> {
    const query = `
      SELECT 
        DATE(p.last_watched_at) as study_date,
        COUNT(DISTINCT p.lesson_id) as lessons_studied
      FROM ${this.table} p
      WHERE p.student_id = $1 AND p.last_watched_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(p.last_watched_at)
      ORDER BY study_date DESC
    `;
    const result = await this.client.query(query, [studentId]);
    return result.rows;
  }
}

export const progressRepositoryInstance = new ProgressRepository();
export default ProgressRepository;