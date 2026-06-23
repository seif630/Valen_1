const sql = require('mssql');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // Test different connection configurations
  const configs = [
    {
      name: 'Current Config',
      config: {
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
      }
    },
    {
      name: 'Windows Auth',
      config: {
        server: 'LAPTOP-R7OSH3BA\\SQLEXPRESS',
        database: 'angels_ecommerce',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        authentication: {
          type: 'ntlm',
        },
      }
    },
    {
      name: 'Localhost',
      config: {
        server: 'localhost\\SQLEXPRESS',
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
      }
    }
  ];

  for (const test of configs) {
    console.log(`\n🧪 Testing: ${test.name}`);
    try {
      const pool = await sql.connect(test.config);
      console.log('✅ Connection successful!');

      // Test the contact messages query
      const result = await pool.request().query(`
        SELECT
          id,
          name,
          email,
          subject,
          message,
          created_at,
          is_read
        FROM contact_messages
        ORDER BY created_at DESC
      `);

      console.log(`✅ Query successful! Found ${result.recordset.length} messages`);

      if (result.recordset.length > 0) {
        console.log('📋 Sample message:');
        console.log(result.recordset[0]);
      }

      await pool.close();
      console.log('🎉 This configuration works!');
      return test.config;
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }

  console.log('\n💡 All configurations failed. Please check:');
  console.log('1. Is SQL Server running?');
  console.log('2. Is TCP/IP enabled in SQL Server Configuration Manager?');
  console.log('3. Are the credentials correct?');
  console.log('4. Is the server name correct?');

  return null;
}

testConnection();
