import sql from 'mssql';

function getConfig(): sql.config {
  if (!process.env.DB_SERVER || !process.env.DB_DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error('Database environment variables are required: DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD');
  }

  return {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    pool: {
      max: 1,
      min: 0,
      idleTimeoutMillis: 10000,
    },
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
    },
    authentication: {
      type: 'default',
      options: {
        userName: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    },
  };
}

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) {
    return pool;
  }

  if (pool) {
    try {
      await pool.close();
    } catch {
      // ignore stale pool cleanup errors
    }
    pool = null;
  }

  pool = await sql.connect(getConfig());
  return pool;
}

export { sql };
