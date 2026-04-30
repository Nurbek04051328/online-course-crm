// src/repositories/user.repository.ts

import BaseRepository from '../db/pg/base.repository.js';
import { pool } from '../db/pg/client.js';
import { User } from '../types/index.js';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', 'public');
    this.client = pool;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE email = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [email]);
    return (result.rows[0] as User) || null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE username = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [username]);
    return (result.rows[0] as User) || null;
  }

  /**
   * Find user by telegram ID
   */
  async findByTelegramId(telegramId: number): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE telegram_id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [telegramId]);
    return (result.rows[0] as User) || null;
  }

  /**
   * Find user by telegram username
   */
  async findByTelegramUsername(telegramUsername: string): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE telegram_username = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [telegramUsername]);
    return (result.rows[0] as User) || null;
  }

  /**
   * Search users by name, email, username
   */
  async search(query: string, limit: number = 10, offset: number = 0): Promise<User[]> {
    const sql = `
      SELECT *
      FROM ${this.table}
      WHERE 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        username ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.client.query(sql, [`%${query}%`, limit, offset]);
    return result.rows as User[];
  }

  /**
   * Get user with full details
   */
  async findWithDetails(userId: string): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [userId]);
    return (result.rows[0] as User) || null;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.count({ email });
    return count > 0;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const count = await this.count({ username });
    return count > 0;
  }

  /**
   * Get all users by type (TEACHER, STUDENT, ADMIN)
   */
  async findByUserType(userType: string, limit: number = 10, offset: number = 0): Promise<User[]> {
    const result = await this.findMany({
      where: { user_type: userType },
      orderBy: { created_at: 'DESC' },
      limit,
      offset,
    });
    return result as User[];
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE ${this.table}
      SET updated_at = NOW()
      WHERE id = $1
    `;
    await this.client.query(query, [userId]);
  }
}

export const userRepositoryInstance = new UserRepository();
export default UserRepository;