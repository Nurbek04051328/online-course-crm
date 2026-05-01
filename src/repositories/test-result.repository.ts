import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';

export interface TestResult {
  id: string;
  student_id: string;
  test_id: string;
  score: number;
  total_score: number;
  percentage: number;
  passed: boolean;
  started_at: Date;
  completed_at?: Date;
  created_at: Date;
}

export class TestResultRepository extends BaseRepository<TestResult> {
  constructor() {
    super('test_results', 'public');
    this.client = pool;
  }

  async findByStudentTest(studentId: string, testId: string): Promise<TestResult | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE student_id = $1 AND test_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await this.client.query(query, [studentId, testId]);
    return (result.rows[0] as TestResult) || null;
  }

  async findByStudent(studentId: string): Promise<TestResult[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE student_id = $1
      ORDER BY completed_at DESC
    `;
    const result = await this.client.query(query, [studentId]);
    return result.rows as TestResult[];
  }

  async getStudentTestStats(studentId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_tests,
        COUNT(CASE WHEN passed = true THEN 1 END) as passed_tests,
        AVG(percentage) as average_score
      FROM ${this.table}
      WHERE student_id = $1 AND completed_at IS NOT NULL
    `;
    const result = await this.client.query(query, [studentId]);
    return result.rows[0];
  }
}

export const testResultRepositoryInstance = new TestResultRepository();
export default TestResultRepository;