import { NextResponse } from 'next/server';
import { requireCustomer } from '@/lib/auth';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await requireCustomer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const userId = parseInt(session.user.id!);

    const ordersResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          o.id,
          o.total_amount,
          o.status,
          o.shipping_address,
          o.created_at,
          o.customer_name,
          o.customer_email,
          o.customer_phone
        FROM orders o
        WHERE o.user_id = @userId
        ORDER BY o.created_at DESC
      `);

    const orders = ordersResult.recordset;

    for (const order of orders) {
      const itemsResult = await pool.request()
        .input('orderId', sql.Int, order.id)
        .query(`
          SELECT
            oi.quantity,
            oi.price,
            oi.size,
            p.name as product_name,
            p.image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = @orderId
        `);

      order.items = JSON.stringify(itemsResult.recordset);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
