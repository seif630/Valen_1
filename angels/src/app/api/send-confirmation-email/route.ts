import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPool, sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();

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
        u.email as customer_email,
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
    const items = JSON.parse(order.items || '[]');

    // Parse shipping address (assuming format: "Name\nAddress\nCity, ZIP\nCountry")
    const shippingLines = order.shipping_address.split('\n');
    const customerName = shippingLines[0] || '';
    const address = shippingLines[1] || '';
    const cityZip = shippingLines[2] || '';
    const country = shippingLines[3] || '';

    const itemsHtml = items.map((item: any) =>
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    // Calculate subtotal (sum of item totals)
    const subtotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shipping = 5.99; // Fixed shipping
    const total = subtotal + shipping;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8b5cf6; text-align: center;">Order Confirmation</h1>
            <p>Dear ${customerName},</p>
            <p>Thank you for your order! Your order has been successfully placed and is being processed.</p>

            <h2 style="color: #8b5cf6;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8b5cf6;">Product</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8b5cf6;">Size</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8b5cf6;">Qty</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8b5cf6;">Price</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8b5cf6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Shipping:</strong> $${shipping.toFixed(2)}</p>
              <p style="margin: 5px 0; font-size: 18px; color: #8b5cf6;"><strong>Total:</strong> $${total.toFixed(2)}</p>
            </div>

            <h2 style="color: #8b5cf6;">Shipping Address</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;">${customerName}</p>
              <p style="margin: 5px 0;">${address}</p>
              <p style="margin: 5px 0;">${cityZip}</p>
              <p style="margin: 5px 0;">${country}</p>
            </div>

            <p style="margin-top: 30px;">If you have any questions about your order, please contact our customer service.</p>
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
      to: 'angelsclosthing@gmail.com', // Temporary for testing - change to order.customer_email for production
      subject: 'Order Confirmation - Angel\'s Fashion',
      html: emailHtml,
    };

    console.log('Sending email with data:', {
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      orderId: order_id
    });

    const emailResponse = await resend.emails.send(msg);

    console.log('Resend API response:', emailResponse);

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 500 });
    }

    console.log(`Order confirmation email sent successfully to ${order.customer_email}`);
    return NextResponse.json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
  }
}
