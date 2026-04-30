import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { Lesson } from '../types/index.js';


export class LessonRepository extends BaseRepository<Lesson> {
  constructor() {
    super('lessons', 'public');
    this.client = pool;
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    const query = `
      SELECT l.*
      FROM ${this.table} l
      WHERE l.course_id = $1
      ORDER BY l.order ASC
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows as Lesson[];
  }

  async findWithDetails(lessonId: string): Promise<any> {
    const query = `
      SELECT 
        l.*,
        v.youtube_video_id,
        v.youtube_url,
        v.duration as video_duration,
        v.thumbnail,
        c.title as course_title,
        c.id as course_id
      FROM ${this.table} l
      LEFT JOIN public.videos v ON l.video_id = v.id
      LEFT JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [lessonId]);
    return result.rows[0] || null;
  }

  async getNextLesson(courseId: string, currentOrder: number): Promise<Lesson | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE course_id = $1 AND "order" > $2
      ORDER BY "order" ASC
      LIMIT 1
    `;
    const result = await this.client.query(query, [courseId, currentOrder]);
    return (result.rows[0] as Lesson) || null;
  }

  async getPreviousLesson(courseId: string, currentOrder: number): Promise<Lesson | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE course_id = $1 AND "order" < $2
      ORDER BY "order" DESC
      LIMIT 1
    `;
    const result = await this.client.query(query, [courseId, currentOrder]);
    return (result.rows[0] as Lesson) || null;
  }

  async getFreeLessons(courseId: string): Promise<Lesson[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE course_id = $1 AND is_free = true
      ORDER BY "order" ASC
    `;
    const result = await this.client.query(query, [courseId]);
    return result.rows as Lesson[];
  }

  async updateOrder(lessonId: string, newOrder: number): Promise<Lesson | null> {
    return this.update(lessonId, { order: newOrder });
  }

  async getLessonCount(courseId: string): Promise<number> {
    const count = await this.count({ course_id: courseId });
    return count;
  }
}

export const lessonRepositoryInstance = new LessonRepository();
export default LessonRepository;