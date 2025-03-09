import { Pool } from 'pg';
import logger from '@/config/logger';

// Create a connection pool
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'e9s_metastore',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432'),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// The pool will emit an error on behalf of any idle clients
// if a backend error or network partition happens
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    logger.info('PostgreSQL connected successfully');
  } finally {
    client.release();
  }
};

// Export for use in other files
export default pool;