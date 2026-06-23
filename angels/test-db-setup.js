const sql = require('mssql');

async function testDatabaseSetup() {
  console.log('🔍 Testing database setup...\n');

  // Test 1: Try to connect with current config
  const config1 = {
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

  console.log('Test 1: Connecting with current config...');
  try {
    const pool = await sql.connect(config1);
    console.log('✅ Connection successful!');

    // Check if database exists
    const dbCheck = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = 'angels_ecommerce'
    `);

    if (dbCheck.recordset.length === 0) {
      console.log('❌ Database "angels_ecommerce" does not exist');
      console.log('Creating database...');
      await pool.request().query('CREATE DATABASE angels_ecommerce');
      console.log('✅ Database created');
    } else {
      console.log('✅ Database exists');
    }

    await pool.close();
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Trying alternative configurations...\n');

    // Test 2: Try with Windows authentication
    const config2 = {
      server: 'LAPTOP-R7OSH3BA\\SQLEXPRESS',
      database: 'angels_ecommerce',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      authentication: {
        type: 'ntlm',
      },
    };

    console.log('Test 2: Trying Windows authentication...');
    try {
      const pool = await sql.connect(config2);
      console.log('✅ Windows authentication successful!');
      await pool.close();
    } catch (error2) {
      console.log('❌ Windows authentication failed:', error2.message);

      // Test 3: Try with different server name
      const config3 = {
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
      };

      console.log('Test 3: Trying with localhost\\SQLEXPRESS...');
      try {
        const pool = await sql.connect(config3);
        console.log('✅ localhost\\SQLEXPRESS successful!');
        await pool.close();
      } catch (error3) {
        console.log('❌ localhost\\SQLEXPRESS failed:', error3.message);
        console.log('\n💡 Please check:');
        console.log('1. Is SQL Server running?');
        console.log('2. Is the server name correct?');
        console.log('3. Are the credentials correct?');
        console.log('4. Is TCP/IP enabled in SQL Server Configuration Manager?');
      }
    }
  }
}

testDatabaseSetup();
