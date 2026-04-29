// src/db/pg/base.repository.ts

import { Pool, QueryResult } from 'pg';
import { pool } from './client.js';

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(criteria: Record<string, any>): Promise<T | null>;
  findMany(criteria: Record<string, any>): Promise<T[]>;
  count(where?: Record<string, any>): Promise<number>;
  create(data: Partial<T>): Promise<T>;
  createMany(dataArray: Partial<T>[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  updateMany(where: Record<string, any>, data: Partial<T>): Promise<T[]>;
  delete(id: string): Promise<T | null>;
  deleteMany(where: Record<string, any>): Promise<T[]>;
  query(sql: string, values?: any[]): Promise<QueryResult>;
}

export class BaseRepository<T = any> implements IBaseRepository<T> {
  protected client: Pool = pool;
  protected tableName: string;
  protected schemaName: string = 'public';
  protected table: string;

  constructor(tableName: string, schemaName: string = 'public') {
    this.tableName = tableName;
    this.schemaName = schemaName;
    this.table = `"${schemaName}"."${tableName}"`;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE id = $1
      LIMIT 1
    `;
    const result = await this.client.query(query, [id]);
    return (result.rows[0] as T) || null;
  }

  /**
   * Find one record by criteria
   */
  async findOne(criteria: Record<string, any>): Promise<T | null> {
    const { where = {}, select = '*' } = criteria;
    const selectClause = Array.isArray(select) ? select.join(', ') : select;

    const whereConditions = Object.entries(where)
      .map(([key, _], index) => `"${key}" = $${index + 1}`)
      .join(' AND ');

    const values = Object.values(where);

    const query = `
      SELECT ${selectClause}
      FROM ${this.table}
      WHERE ${whereConditions}
      LIMIT 1
    `;

    const result = await this.client.query(query, values);
    return (result.rows[0] as T) || null;
  }

  /**
   * Find many records
   */
  async findMany(criteria: any = {}): Promise<T[]> {
    const { where = {}, select = '*', orderBy, limit = 10, offset = 0 } = criteria;

    const selectClause = Array.isArray(select) ? select.join(', ') : select;

    let whereClause = '';
    const values = [];
    let paramIndex = 1;

    if (Object.keys(where).length > 0) {
      whereClause =
        'WHERE ' +
        Object.entries(where)
          .map(([key, value]) => {
            values.push(value);
            return `"${key}" = $${paramIndex++}`;
          })
          .join(' AND ');
    }

    let orderByClause = '';
    if (orderBy) {
      orderByClause =
        'ORDER BY ' +
        Object.entries(orderBy)
          .map(([key, direction]) => `"${key}" ${(direction as string).toUpperCase()}`)
          .join(', ');
    }

    values.push(limit);
    values.push(offset);
    const limitClause = `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    const query = `
      SELECT ${selectClause}
      FROM ${this.table}
      ${whereClause}
      ${orderByClause}
      ${limitClause}
    `;

    const result = await this.client.query(query, values);
    return result.rows as T[];
  }

  /**
   * Count records
   */
  async count(where: Record<string, any> = {}): Promise<number> {
    let whereClause = '';
    const values = [];
    let paramIndex = 1;

    if (Object.keys(where).length > 0) {
      whereClause =
        'WHERE ' +
        Object.entries(where)
          .map(([key, value]) => {
            values.push(value);
            return `"${key}" = $${paramIndex++}`;
          })
          .join(' AND ');
    }

    const query = `
      SELECT COUNT(*)::int as count
      FROM ${this.table}
      ${whereClause}
    `;

    const result = await this.client.query(query, values);
    return result.rows[0]?.count || 0;
  }

  /**
   * Create record
   */
  async create(data: Partial<T>): Promise<T> {
    const columns = Object.keys(data)
      .map((key) => `"${key}"`)
      .join(', ');
    const placeholders = Object.keys(data)
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    const values = Object.values(data);

    const query = `
      INSERT INTO ${this.table} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.client.query(query, values);
    return result.rows[0] as T;
  }

  /**
   * Create many records
   */
  async createMany(dataArray: Partial<T>[]): Promise<T[]> {
    if (!dataArray || dataArray.length === 0) return [];

    const firstRow = dataArray[0];
    const columns = Object.keys(firstRow)
      .map((key) => `"${key}"`)
      .join(', ');

    let values: any[] = [];
    let placeholders: string[] = [];
    let paramIndex = 1;

    dataArray.forEach((row) => {
      const rowPlaceholders = Object.keys(row)
        .map(() => `$${paramIndex++}`)
        .join(', ');
      placeholders.push(`(${rowPlaceholders})`);
      values.push(...Object.values(row));
    });

    const query = `
      INSERT INTO ${this.table} (${columns})
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await this.client.query(query, values);
    return result.rows as T[];
  }

  /**
   * Update record
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const setClauses = Object.keys(data)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(', ');

    const values = [...Object.values(data), id];

    const query = `
      UPDATE ${this.table}
      SET ${setClauses}, "updated_at" = NOW()
      WHERE id = $${Object.keys(data).length + 1}
      RETURNING *
    `;

    const result = await this.client.query(query, values);
    return (result.rows[0] as T) || null;
  }

  /**
   * Update many records
   */
  async updateMany(where: Record<string, any>, data: Partial<T>): Promise<T[]> {
    const setClauses = Object.keys(data)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(', ');

    const whereConditions = Object.entries(where)
      .map(([key, _], index) => {
        const paramIndex = Object.keys(data).length + index + 1;
        return `"${key}" = $${paramIndex}`;
      })
      .join(' AND ');

    const values = [...Object.values(data), ...Object.values(where)];

    const query = `
      UPDATE ${this.table}
      SET ${setClauses}, "updated_at" = NOW()
      WHERE ${whereConditions}
      RETURNING *
    `;

    const result = await this.client.query(query, values);
    return result.rows as T[];
  }

  /**
   * Delete record
   */
  async delete(id: string): Promise<T | null> {
    const query = `
      DELETE FROM ${this.table}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.client.query(query, [id]);
    return (result.rows[0] as T) || null;
  }

  /**
   * Delete many records
   */
  async deleteMany(where: Record<string, any>): Promise<T[]> {
    const whereConditions = Object.entries(where)
      .map(([key, _], index) => `"${key}" = $${index + 1}`)
      .join(' AND ');

    const values = Object.values(where);

    const query = `
      DELETE FROM ${this.table}
      WHERE ${whereConditions}
      RETURNING *
    `;

    const result = await this.client.query(query, values);
    return result.rows as T[];
  }

  /**
   * Execute raw query
   */
  async query(sql: string, values: any[] = []): Promise<QueryResult> {
    return this.client.query(sql, values);
  }
}

export default BaseRepository;