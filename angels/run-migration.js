const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  user: 'sa',
  password: 'Seif@1234',
  server: 'localhost',
  database: 'shop',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function runMigration() {
  try {
    await sql.connect(config);
    const migrationPath = path.join(__dirname, 'database', 'migration_add_read_status.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await sql.query(migrationSQL);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.close();
  }
}

runMigration();
