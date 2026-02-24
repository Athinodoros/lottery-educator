import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function queryOne(text: string, params?: any[]): Promise<any> {
  const result = await query(text, params);
  return result.rows[0] || null;
}

export async function queryAll(text: string, params?: any[]): Promise<any[]> {
  const result = await query(text, params);
  return result.rows;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

export default pool;
