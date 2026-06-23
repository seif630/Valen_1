import { NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();

    // Total sales
    const totalSalesResult = await pool.request().query(`
      SELECT SUM(total_amount) as total_sales FROM orders WHERE status != 'canceled'
    `);
    const totalSales = totalSalesResult.recordset[0]?.total_sales || 0;

    // Total orders
    const totalOrdersResult = await pool.request().query(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders
      FROM orders
    `);
    const orderStats = totalOrdersResult.recordset[0];

    // Revenue analytics (last 30 days)
    const revenueResult = await pool.request().query(`
      SELECT
        SUM(CASE WHEN created_at >= DATEADD(day, -30, GETDATE()) THEN total_amount ELSE 0 END) as monthly_revenue,
        SUM(CASE WHEN created_at >= DATEADD(day, -7, GETDATE()) THEN total_amount ELSE 0 END) as weekly_revenue,
        SUM(CASE WHEN created_at >= DATEADD(day, -1, GETDATE()) THEN total_amount ELSE 0 END) as daily_revenue
      FROM orders
      WHERE status != 'canceled'
    `);
    const revenue = revenueResult.recordset[0];

    // Top selling products
    const topProductsResult = await pool.request().query(`
      SELECT TOP 5
        p.name,
        p.image_url,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'canceled'
      GROUP BY p.id, p.name, p.image_url
      ORDER BY total_sold DESC
    `);
    const topProducts = topProductsResult.recordset;

    // Recent activities (last 10 orders)
    const recentActivitiesResult = await pool.request().query(`
      SELECT TOP 10
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    const recentActivities = recentActivitiesResult.recordset;

    return NextResponse.json({
      totalSales: parseFloat(totalSales),
      totalOrders: orderStats.total_orders,
      orderStats: {
        pending: orderStats.pending_orders,
        processing: orderStats.processing_orders,
        shipped: orderStats.shipped_orders,
        delivered: orderStats.delivered_orders
      },
      revenue: {
        monthly: parseFloat(revenue.monthly_revenue || 0),
        weekly: parseFloat(revenue.weekly_revenue || 0),
        daily: parseFloat(revenue.daily_revenue || 0)
      },
      topProducts: topProducts.map(p => ({
        name: p.name,
        image_url: p.image_url,
        total_sold: p.total_sold,
        total_revenue: parseFloat(p.total_revenue)
      })),
      recentActivities: recentActivities.map(a => ({
        id: a.id,
        total_amount: parseFloat(a.total_amount),
        status: a.status,
        created_at: a.created_at,
        customer_name: a.customer_name || 'Guest',
        customer_email: a.customer_email
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
