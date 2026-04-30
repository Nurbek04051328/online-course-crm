import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Category } from '../types/index.js';


export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories', 'public');
    this.client = pool;
  }

  /**
   * Get all active categories
   */
  async getActive(limit: number = 50): Promise<Category[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE is_active = true
      ORDER BY "order" ASC
      LIMIT $1
    `;
    const result = await this.client.query(query, [limit]);
    return result.rows as Category[];
  }

  /**
   * Find by slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE slug = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [slug]);
    return (result.rows[0] as Category) || null;
  }

  /**
   * Get category with course count
   */
  async findWithStats(categoryId: string): Promise<any> {
    const query = `
      SELECT 
        cat.*,
        COUNT(DISTINCT c.id) as course_count,
        COUNT(DISTINCT e.id) as student_count
      FROM ${this.table} cat
      LEFT JOIN public.courses c ON cat.id = c.category_id AND c.is_published = true
      LEFT JOIN public.enrollments e ON c.id = e.course_id
      WHERE cat.id = $1
      GROUP BY cat.id
    `;
    const result = await this.client.query(query, [categoryId]);
    return result.rows[0] || null;
  }

  /**
   * Check if name exists
   */
  async nameExists(name: string): Promise<boolean> {
    const count = await this.count({ name });
    return count > 0;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string): Promise<boolean> {
    const count = await this.count({ slug });
    return count > 0;
  }
}

export const categoryRepositoryInstance = new CategoryRepository();
export default CategoryRepository;