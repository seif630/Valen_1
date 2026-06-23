import { NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Save message to database
    const pool = await getPool();
    const insertQuery = `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (@name, @email, @subject, @message)
    `;

    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('subject', sql.NVarChar, subject)
      .input('message', sql.NVarChar, message)
      .query(insertQuery);

    console.log('Contact message saved to database:', {
      name,
      email,
      subject,
      messageLength: message.length
    });

    // Create mailto link for the customer
    const encodedSubject = encodeURIComponent(`Contact Form: ${subject}`);
    const encodedBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    const mailtoLink = `mailto:angelsclosthing@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;

    console.log(`Contact form message saved successfully from ${email}`);
    return NextResponse.json({
      message: 'Contact message saved successfully',
      mailtoLink: mailtoLink
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json({ error: 'Failed to save contact message' }, { status: 500 });
  }
}
