import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Course } from '../types/index.js';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super('courses', 'public');
    this.client = pool;
  }

  /**
   * Get course with full details (teacher, category, stats)
   */
  async findWithDetails(courseId: string): Promise<any> {
    const query = `
      SELECT 
        c.*,
        t.id as teacher_id,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name,
        u.avatar as teacher_avatar,
        cat.name as category_name,
        COUNT(DISTINCT l.id) as lesson_count,
        COUNT(DISTINCT e.id) as student_count,
        AVG(r.rating) as average_rating,
        SUM(CASE WHEN e.status = 'ACTIVE' THEN 1 ELSE 0 END) as active_students
      FROM ${this.table} c
      LEFT JOIN public.teachers t ON c.teacher_id = t.id
      LEFT JOIN public.users u ON t.user_id = u.id
      LEFT JOIN public.categories cat ON c.category_id = cat.id
      LEFT JOIN public.lessons l ON c.id = l.course_id
      LEFT JOIN public.enrollments e ON c.id = e.course_id
      LEFT JOIN public.reviews r ON c.id = r.course_id
      WHERE c.id = $1
      GROUP BY c.id, t.id, u.id, cat.id
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows[0] || null;
  }

  /**
   * Get courses by teacher
   */
  async findByTeacher(teacherId: string, limit: number = 10, offset: number = 0): Promise<Course[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) as student_count,
        COUNT(DISTINCT l.id) as lesson_count
      FROM ${this.table} c
      LEFT JOIN public.enrollments e ON c.id = e.course_id
      LEFT JOIN public.lessons l ON c.id = l.course_id
      WHERE c.teacher_id = $1 AND c.status = 'PUBLISHED'
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [teacherId, limit, offset]);
    return result.rows as Course[];
  }

  /**
   * Get courses by category
   */
  async findByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<Course[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) as student_count
      FROM ${this.table} c
      LEFT JOIN public.enrollments e ON c.id = e.course_id
      WHERE c.category_id = $1 AND c.status = 'PUBLISHED' AND c.is_published = true
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [categoryId, limit, offset]);
    return result.rows as Course[];
  }

  /**
   * Search courses by title, description
   */
  async search(searchQuery: string, limit: number = 10, offset: number = 0): Promise<Course[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) as student_count,
        AVG(r.rating) as average_rating
      FROM ${this.table} c
      LEFT JOIN public.enrollments e ON c.id = e.course_id
      LEFT JOIN public.reviews r ON c.id = r.course_id
      WHERE 
        c.title ILIKE $1 OR 
        c.description ILIKE $1 OR
        c.short_desc ILIKE $1
      AND c.status = 'PUBLISHED'
      AND c.is_published = true
      GROUP BY c.id
      ORDER BY student_count DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(query, [`%${searchQuery}%`, limit, offset]);
    return result.rows as Course[];
  }

  /**
   * Get trending courses (recently enrolled)
   */
  async getTrending(limit: number = 10): Promise<Course[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) as recent_enrollments
      FROM ${this.table} c
      LEFT JOIN public.enrollments e ON c.id = e.course_id 
        AND e.created_at > NOW() - INTERVAL '30 days'
      WHERE c.status = 'PUBLISHED' AND c.is_published = true
      GROUP BY c.id
      ORDER BY recent_enrollments DESC
      LIMIT $1
    `;
    const result = await this.client.query(query, [limit]);
    return result.rows as Course[];
  }

  /**
   * Get course revenue stats
   */
  async getCourseRevenue(courseId: string): Promise<any> {
    const query = `
      SELECT 
        c.id,
        c.title,
        COUNT(DISTINCT e.id) as total_sales,
        SUM(e.purchase_price) as gross_revenue,
        SUM(e.purchase_price * 0.8) as teacher_revenue
      FROM ${this.table} c
      LEFT JOIN public.enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE' AND e.is_paid = true
      WHERE c.id = $1
      GROUP BY c.id
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows[0] || null;
  }

  /**
   * Get all published courses
   */
  async getPublished(limit: number = 10, offset: number = 0): Promise<Course[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE status = 'PUBLISHED' AND is_published = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.client.query(query, [limit, offset]);
    return result.rows as Course[];
  }

  /**
   * Get teacher's draft courses
   */
  async getTeacherDrafts(teacherId: string): Promise<Course[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE teacher_id = $1 AND status = 'DRAFT'
      ORDER BY created_at DESC
    `;
    const result = await this.client.query(query, [teacherId]);
    return result.rows as Course[];
  }

  /**
   * Update course status
   */
  async updateStatus(courseId: string, status: string): Promise<Course | null> {
    const updateData: any = {
      status,
    };

    if (status === 'PUBLISHED') {
      updateData.is_published = true;
      updateData.published_at = new Date();
    }

    return this.update(courseId, updateData);
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string): Promise<boolean> {
    const count = await this.count({ slug });
    return count > 0;
  }
}

export const courseRepositoryInstance = new CourseRepository();
export default CourseRepository;
