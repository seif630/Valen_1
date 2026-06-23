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
    const query = `
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
    `;

    const result = await pool.request().query(query);

    return NextResponse.json({
      messages: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_read } = body;

    if (typeof id !== 'number' || typeof is_read !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const pool = await getPool();
    const query = `
      UPDATE contact_messages
      SET is_read = @is_read
      WHERE id = @id
    `;

    const result = await pool.request()
      .input('id', id)
      .input('is_read', is_read)
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message read status:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (typeof id !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const pool = await getPool();
    const query = `
      DELETE FROM contact_messages
      WHERE id = @id
    `;

    const result = await pool.request()
      .input('id', id)
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
