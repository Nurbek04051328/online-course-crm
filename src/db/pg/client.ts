import pkg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pkg;

interface DbConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const dbConfig: DbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'online_course_db',
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(dbConfig);

// Event handlers
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('Client connected to database');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

/**
 * Test database connection
 */
export async function connectDatabase(): Promise<void> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`Database connected successfully at ${result.rows[0].now}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Close database connection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}

/**
 * Execute raw query
 */
export async function query<T>(
  sql: string,
  values?: any[]
): Promise<T[]> {
  try {
    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get single row
 */
export async function queryOne<T>(
  sql: string,
  values?: any[]
): Promise<T | null> {
  const result = await query<T>(sql, values);
  return result[0] || null;
}

export default pool;