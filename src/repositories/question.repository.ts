import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';

export interface Question {
  id: string;
  test_id: string;
  title: string;
  description?: string;
  question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  score: number;
  order: number;
  created_at: Date;
}

export class QuestionRepository extends BaseRepository<Question> {
  constructor() {
    super('questions', 'public');
    this.client = pool;
  }

  async findByTest(testId: string): Promise<Question[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE test_id = $1
      ORDER BY "order" ASC
    `;
    const result = await this.client.query(query, [testId]);
    return result.rows as Question[];
  }

  async findWithOptions(questionId: string): Promise<any> {
    const query = `
      SELECT 
        q.*,
        json_agg(
          json_build_object('id', o.id, 'text', o.text, 'is_correct', o.is_correct)
          ORDER BY o.order
        ) as options
      FROM ${this.table} q
      LEFT JOIN public.options o ON q.id = o.question_id
      WHERE q.id = $1
      GROUP BY q.id
    `;
    const result = await this.client.query(query, [questionId]);
    return result.rows[0] || null;
  }
}

export const questionRepositoryInstance = new QuestionRepository();
export default QuestionRepository;