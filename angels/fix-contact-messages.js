const sql = require('mssql');

const config = {
  server: 'LAPTOP-R7OSH3BA\\SQLEXPRESS',
  database: 'angels_ecommerce',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'default',
    options: {
      userName: 'angels_user',
      password: 'Seif@1234',
    },
  },
};

async function fixContactMessages() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);

    console.log('✅ Connected successfully!');

    // Check if contact_messages table exists
    console.log('📋 Checking contact_messages table...');
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'contact_messages'
    `);

    if (tableCheck.recordset.length === 0) {
      console.log('❌ contact_messages table does not exist');
      console.log('Creating table...');
      await pool.request().query(`
        CREATE TABLE contact_messages (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          email NVARCHAR(255) NOT NULL,
          subject NVARCHAR(255) NOT NULL,
          message NVARCHAR(MAX) NOT NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          is_read BIT DEFAULT 0 NOT NULL
        );
      `);
      console.log('✅ contact_messages table created');
    } else {
      console.log('✅ contact_messages table exists');

      // Check if is_read column exists
      const columnCheck = await pool.request().query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'contact_messages' AND COLUMN_NAME = 'is_read'
      `);

      if (columnCheck.recordset.length === 0) {
        console.log('Adding is_read column...');
        await pool.request().query(`
          ALTER TABLE contact_messages
          ADD is_read BIT DEFAULT 0 NOT NULL;
        `);
        console.log('✅ is_read column added');
      } else {
        console.log('✅ is_read column exists');
      }
    }

    // Check for existing messages
    console.log('📬 Checking for existing messages...');
    const messageCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM contact_messages
    `);

    console.log(`📊 Total messages in database: ${messageCount.recordset[0].count}`);

    if (messageCount.recordset[0].count === 0) {
      console.log('📝 No messages found. Adding sample messages...');
      await pool.request().query(`
        INSERT INTO contact_messages (name, email, subject, message, is_read)
        VALUES
        ('John Doe', 'john@example.com', 'Product Inquiry', 'I would like to know more about your products.', 0),
        ('Jane Smith', 'jane@example.com', 'Support Request', 'I need help with my recent order.', 0),
        ('Bob Johnson', 'bob@example.com', 'Feedback', 'Great service! Keep up the good work.', 1);
      `);
      console.log('✅ Sample messages added');
    }

    // Show all messages
    console.log('📋 Current messages:');
    const messages = await pool.request().query(`
      SELECT id, name, email, subject, message, created_at, is_read
      FROM contact_messages
      ORDER BY created_at DESC
    `);

    messages.recordset.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.is_read ? 'READ' : 'UNREAD'}] ${msg.subject} - From: ${msg.name} (${msg.email})`);
    });

    await pool.close();
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixContactMessages();
