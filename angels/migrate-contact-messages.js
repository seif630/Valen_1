const sql = require('mssql');
const config = {
  server: process.env.DB_SERVER || 'LAPTOP-R7OSH3BA\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'angels_ecommerce',
  options: {
    encrypt: false,
    trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'True' || true,
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'angels_user',
      password: process.env.DB_PASSWORD || 'Seif@1234',
    },
  },
};

async function migrateContactMessages() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);

    console.log('Creating contact_messages table...');
    const createTableQuery = `
      CREATE TABLE contact_messages (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        subject NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE()
      );
    `;

    await pool.request().query(createTableQuery);
    console.log('✅ Contact messages table created successfully!');

    await pool.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateContactMessages();
