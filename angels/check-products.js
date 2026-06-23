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

async function checkProducts() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);

    console.log('✅ Connected successfully!');

    // Check if products table exists
    console.log('📋 Checking products table...');
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'products'
    `);

    if (tableCheck.recordset.length === 0) {
      console.log('❌ products table does not exist');
      console.log('Please run the schema.sql to create the tables');
    } else {
      console.log('✅ products table exists');

      // Check for existing products
      console.log('📦 Checking for existing products...');
      const productCount = await pool.request().query(`
        SELECT COUNT(*) as count FROM products
      `);

      console.log(`📊 Total products in database: ${productCount.recordset[0].count}`);

      if (productCount.recordset[0].count === 0) {
        console.log('❌ No products found. Please add some sample products.');
      } else {
        console.log('✅ Products found. Listing first 5:');
        const products = await pool.request().query(`
          SELECT TOP 5 id, name, price FROM products ORDER BY id
        `);
        products.recordset.forEach((p, index) => {
          console.log(`${index + 1}. ${p.name} - EGP ${p.price}`);
        });
      }
    }

    await pool.close();
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProducts();
