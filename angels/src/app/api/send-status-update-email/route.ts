import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPool, sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { order_id, new_status } = await request.json();

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('Resend API key not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    // Fetch order details from database
    const pool = await getPool();
    const orderQuery = `
      SELECT
        o.id,
        o.total_amount,
        o.shipping_address,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = @orderId
    `;

    const orderResult = await pool.request()
      .input('orderId', sql.Int, order_id)
      .query(orderQuery);

    if (orderResult.recordset.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult.recordset[0];

    // Parse shipping address
    const shippingLines = order.shipping_address.split('\n');
    const customerName = shippingLines[0] || '';

    let subject = '';
    let message = '';

    switch (new_status) {
      case 'processing':
        subject = 'Order Processing Started - Angel\'s Fashion';
        message = 'Your order is now being processed. We will keep you updated on the progress.';
        break;
      case 'shipped':
        subject = 'Order Shipped - Angel\'s Fashion';
        message = 'Your order has been shipped! You will receive tracking information soon.';
        break;
      case 'delivered':
        subject = 'Order Delivered - Angel\'s Fashion';
        message = 'Your order has been delivered. Thank you for shopping with us!';
        break;
      default:
        subject = `Order Status Update - Angel\'s Fashion`;
        message = `Your order status has been updated to: ${new_status}`;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8b5cf6; text-align: center;">Order Status Update</h1>
            <p>Dear ${customerName},</p>
            <p>${message}</p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Status:</strong> ${new_status.charAt(0).toUpperCase() + new_status.slice(1)}</p>
            </div>

            <p>If you have any questions about your order, please contact our customer service.</p>
            <p>Thank you for shopping with Angel's Fashion!</p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">Angel's Fashion - Your Style, Our Passion</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const msg = {
      from: 'angelsclosthing@gmail.com',
      to: order.customer_email,
      subject: subject,
      html: emailHtml,
    };

    await resend.emails.send(msg);

    console.log(`Order status update email sent successfully to ${order.customer_email} for status: ${new_status}`);
    return NextResponse.json({ message: 'Status update email sent successfully' });
  } catch (error) {
    console.error('Error sending status update email:', error);
    return NextResponse.json({ error: 'Failed to send status update email' }, { status: 500 });
  }
}
