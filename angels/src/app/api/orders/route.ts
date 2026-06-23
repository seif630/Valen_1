import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { getSession, requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { items, customer, shippingAddress, customer_phone, totalAmount } = await request.json();

    const pool = await getPool();
    const session = await getSession();

    let userId: number | undefined;

    if (session?.user?.id && session.user.id !== 'admin' && session.user.role !== 'admin') {
      userId = parseInt(session.user.id);
    }

    // Check if user exists, if not create guest user
    const userResult = await pool.request()
      .input('email', sql.NVarChar, customer.email.toLowerCase().trim())
      .query('SELECT id FROM users WHERE email = @email');

    if (!userId) {
      if (userResult.recordset.length === 0) {
        const insertUserResult = await pool.request()
          .input('email', sql.NVarChar, customer.email.toLowerCase().trim())
          .input('name', sql.NVarChar, `${customer.firstName} ${customer.lastName}`)
          .input('password', sql.NVarChar, '')
          .input('role', sql.NVarChar, 'guest')
          .query(`
            INSERT INTO users (email, name, password, role)
            OUTPUT INSERTED.id
            VALUES (@email, @name, @password, @role)
          `);
        userId = insertUserResult.recordset[0].id;
      } else {
        userId = userResult.recordset[0].id;
      }
    }

    // Format shipping address
    const shippingAddr = `${customer.firstName} ${customer.lastName}\n${shippingAddress}\n${customer.city}, ${customer.zipCode}\n${customer.country}`;

    // Insert order
    const orderResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('totalAmount', sql.Decimal(10,2), totalAmount)
      .input('shippingAddress', sql.NVarChar, shippingAddr)
      .input('customerName', sql.NVarChar, `${customer.firstName} ${customer.lastName}`)
      .input('customerEmail', sql.NVarChar, customer.email)
      .input('customerPhone', sql.NVarChar, customer_phone)
      .input('items', sql.NVarChar, JSON.stringify(items))
      .query(`
        INSERT INTO orders (user_id, total_amount, shipping_address, customer_name, customer_email, customer_phone, items)
        OUTPUT INSERTED.id
        VALUES (@userId, @totalAmount, @shippingAddress, @customerName, @customerEmail, @customerPhone, @items)
      `);

    const orderId = orderResult.recordset[0].id;

    // Check stock availability and update stock
    for (const item of items) {
      // Check current stock
      const stockResult = await pool.request()
        .input('productId', sql.Int, item.id)
        .query('SELECT stock_quantity FROM products WHERE id = @productId');

      if (stockResult.recordset.length === 0) {
        throw new Error(`Product ${item.id} not found`);
      }

      const currentStock = stockResult.recordset[0].stock_quantity;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.id}. Available: ${currentStock}, Requested: ${item.quantity}`);
      }

      // Update stock
      await pool.request()
        .input('productId', sql.Int, item.id)
        .input('quantity', sql.Int, item.quantity)
        .query('UPDATE products SET stock_quantity = stock_quantity - @quantity WHERE id = @productId');
    }

    // Insert order items
    for (const item of items) {
      await pool.request()
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.id)
        .input('quantity', sql.Int, item.quantity)
        .input('price', sql.Decimal(10,2), item.price)
        .input('size', sql.NVarChar, item.size)
        .query(`
          INSERT INTO order_items (order_id, product_id, quantity, price, size)
          VALUES (@orderId, @productId, @quantity, @price, @size)
        `);
    }

    return NextResponse.json({ orderId, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();

    // First get the orders
    const ordersQuery = `
      SELECT
        o.id,
        o.total_amount,
        o.status,
        o.stripe_payment_id,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.items
      FROM orders o
      ORDER BY o.created_at DESC
    `;

    const ordersResult = await pool.request().query(ordersQuery);
    const orders = ordersResult.recordset;

    // For each order, get the detailed items from order_items table
    for (const order of orders) {
      const itemsQuery = `
        SELECT
          oi.quantity,
          oi.price,
          oi.size,
          p.name as product_name,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = @orderId
      `;

      const itemsResult = await pool.request()
        .input('orderId', sql.Int, order.id)
        .query(itemsQuery);

      order.items = JSON.stringify(itemsResult.recordset);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const pool = await getPool();

    // First, get the order items to restore stock
    const itemsResult = await pool.request()
      .input('orderId', sql.Int, parseInt(orderId))
      .query('SELECT product_id, quantity FROM order_items WHERE order_id = @orderId');

    // Restore stock for each item
    for (const item of itemsResult.recordset) {
      await pool.request()
        .input('productId', sql.Int, item.product_id)
        .input('quantity', sql.Int, item.quantity)
        .query('UPDATE products SET stock_quantity = stock_quantity + @quantity WHERE id = @productId');
    }

    // Then delete order items (due to foreign key constraints)
    await pool.request()
      .input('orderId', sql.Int, parseInt(orderId))
      .query('DELETE FROM order_items WHERE order_id = @orderId');

    // Then delete the order
    const result = await pool.request()
      .input('orderId', sql.Int, parseInt(orderId))
      .query('DELETE FROM orders WHERE id = @orderId');

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return NextResponse.json({ message: 'Order deleted successfully and stock restored' });
    } else {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
