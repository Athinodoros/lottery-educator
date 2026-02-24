import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Query helper with logging
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  name?: string
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (name) {
      console.log(`Executed query ${name}`, { duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  }
}

// Get single row
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Get all rows
export async function queryAll<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Close pool
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
