import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
 
export interface Test {
  id: string;
  title: string;
  description?: string;
  lesson_id?: string;
  teacher_id: string;
  course_id: string;
  total_questions: number;
  passing_score?: number;
  duration?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
 
export class TestRepository extends BaseRepository<Test> {
  constructor() {
    super('tests', 'public');
    this.client = pool;
  }
 
  /**
   * Get tests for course
   */
  async findByCourse(courseId: string): Promise<Test[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE course_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows as Test[];
  }
 
  /**
   * Get test with questions
   */
  async findWithQuestions(testId: string): Promise<any> {
    const query = `
      SELECT 
        t.*,
        json_agg(
          json_build_object(
            'id', q.id,
            'title', q.title,
            'type', q.question_type,
            'score', q.score,
            'options', (
              SELECT json_agg(
                json_build_object('id', o.id, 'text', o.text)
              )
              FROM public.options o
              WHERE o.question_id = q.id
            )
          ) ORDER BY q.order
        ) as questions
      FROM ${this.table} t
      LEFT JOIN public.questions q ON t.id = q.test_id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    const result = await this.client.query(query, [testId]);
    return result.rows[0] || null;
  }
 
  /**
   * Get test by lesson
   */
  async findByLesson(lessonId: string): Promise<Test | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE lesson_id = $1 AND is_active = true
      LIMIT 1
    `;
    const result = await this.client.query(query, [lessonId]);
    return (result.rows[0] as Test) || null;
  }
 
  /**
   * Get total questions count
   */
  async getQuestionCount(testId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM public.questions
      WHERE test_id = $1
    `;
    const result = await this.client.query(query, [testId]);
    return parseInt(result.rows[0].count, 10);
  }
 
  /**
   * Get teacher's tests
   */
  async findByTeacher(teacherId: string): Promise<Test[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE teacher_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.client.query(query, [teacherId]);
    return result.rows as Test[];
  }
}
 
export const testRepositoryInstance = new TestRepository();
export default TestRepository;