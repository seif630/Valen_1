import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const pool = await getPool();
    const query = pool.request();
    const resolvedParams = await params;
    query.input('id', sql.Int, parseInt(resolvedParams.id));

    const result = await query.query(`
      SELECT
        o.id,
        o.total_amount,
        o.status,
        o.stripe_payment_id,
        o.shipping_address,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.created_at,
        o.updated_at,
        JSON_QUERY((
          SELECT
            oi.quantity,
            oi.price,
            oi.size,
            p.name as product_name,
            p.image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
          FOR JSON PATH
        )) as items
      FROM orders o
      WHERE o.id = @id
    `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const pool = await getPool();
    const query = pool.request();
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);
    query.input('id', sql.Int, orderId);
    query.input('status', sql.NVarChar, status);

    await query.query(`
      UPDATE orders
      SET status = @status, updated_at = GETDATE()
      WHERE id = @id
    `);

    // Send status update email if status changed to processing, shipped, or delivered
    if (['processing', 'shipped', 'delivered'].includes(status)) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || process.env.URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-status-update-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            new_status: status
          }),
        });
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const query = pool.request();
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);
    query.input('id', sql.Int, orderId);

    // First check if the order exists
    const checkResult = await query.query(`
      SELECT id FROM orders WHERE id = @id
    `);

    if (checkResult.recordset.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items to restore stock quantities
    const orderItemsResult = await query.query(`
      SELECT product_id, quantity FROM order_items WHERE order_id = @id
    `);

    console.log('Order items found:', orderItemsResult.recordset);

    // Restore stock quantities for each product
    for (const item of orderItemsResult.recordset) {
      console.log(`Restoring stock for product ${item.product_id}: +${item.quantity}`);
      const updateQuery = pool.request();
      updateQuery.input('product_id', sql.Int, item.product_id);
      updateQuery.input('quantity', sql.Int, item.quantity);
      const updateResult = await updateQuery.query(`
        UPDATE products
        SET stock_quantity = stock_quantity + @quantity
        WHERE id = @product_id
      `);
      console.log('Update result:', updateResult.rowsAffected);
    }

    // Delete order items first (due to foreign key constraint)
    await query.query(`
      DELETE FROM order_items WHERE order_id = @id
    `);

    // Then delete the order
    await query.query(`
      DELETE FROM orders WHERE id = @id
    `);

    return NextResponse.json({ message: 'Order deleted successfully and stock quantities restored' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
