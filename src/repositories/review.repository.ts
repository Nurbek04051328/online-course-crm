import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Review } from '../types/index.js';
 
export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super('reviews', 'public');
    this.client = pool;
  }
 
  /**
   * Get reviews for course
   */
  async findByCourse(courseId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        r.*,
        u.first_name as student_name,
        u.avatar as student_avatar
      FROM ${this.table} r
      LEFT JOIN public.students s ON r.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      WHERE r.course_id = $1 AND r.is_verified = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [courseId, limit, offset]);
    return result.rows;
  }
 
  /**
   * Get reviews for teacher
   */
  async findByTeacher(teacherId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        r.*,
        c.title as course_title,
        u.first_name as student_name
      FROM ${this.table} r
      LEFT JOIN public.courses c ON r.course_id = c.id
      LEFT JOIN public.students s ON r.student_id = s.id
      LEFT JOIN public.users u ON s.user_id = u.id
      WHERE r.teacher_id = $1 AND r.is_verified = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [teacherId, limit, offset]);
    return result.rows;
  }
 
  /**
   * Get course rating stats
   */
  async getCourseRatingStats(courseId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM ${this.table}
      WHERE course_id = $1 AND is_verified = true
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows[0];
  }
 
  /**
   * Get teacher rating stats
   */
  async getTeacherRatingStats(teacherId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating
      FROM ${this.table}
      WHERE teacher_id = $1 AND is_verified = true
    `;
    const result = await this.client.query(query, [teacherId]);
    return result.rows[0];
  }
 
  /**
   * Check if student already reviewed course
   */
  async hasReviewed(studentId: string, courseId: string): Promise<boolean> {
    const count = await this.count({
      student_id: studentId,
      course_id: courseId,
    });
    return count > 0;
  }
 
  /**
   * Get student's review for course
   */
  async findStudentReview(studentId: string, courseId: string): Promise<Review | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE student_id = $1 AND course_id = $2
      LIMIT 1
    `;
    const result = await this.client.query(query, [studentId, courseId]);
    return (result.rows[0] as Review) || null;
  }
 
  /**
   * Get helpful reviews
   */
  async getMostHelpful(courseId: string, limit: number = 5): Promise<Review[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE course_id = $1 AND is_verified = true
      ORDER BY helpful_count DESC
      LIMIT $2
    `;
    const result = await this.client.query(query, [courseId, limit]);
    return result.rows as Review[];
  }
 
  /**
   * Increment helpful count
   */
  async incrementHelpful(reviewId: string): Promise<Review | null> {
    const query = `
      UPDATE ${this.table}
      SET helpful_count = helpful_count + 1
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.client.query(query, [reviewId]);
    return (result.rows[0] as Review) || null;
  }
}

export const reviewRepositoryInstance = new ReviewRepository();
export default ReviewRepository;