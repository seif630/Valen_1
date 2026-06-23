import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireCustomer } from '@/lib/auth';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await requireCustomer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, parseInt(session.user.id!))
      .query('SELECT id, email, name, role, created_at FROM users WHERE id = @id');

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireCustomer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await request.json();
    const pool = await getPool();
    const userId = parseInt(session.user.id!);

    const userResult = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT password, name FROM users WHERE id = @id');

    if (userResult.recordset.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.recordset[0];
    const updates: string[] = [];
    const request_obj = pool.request().input('id', sql.Int, userId);

    if (name?.trim()) {
      request_obj.input('name', sql.NVarChar, name.trim());
      updates.push('name = @name');
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      request_obj.input('password', sql.NVarChar, hashedPassword);
      updates.push('password = @password');
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    await request_obj.query(`
      UPDATE users
      SET ${updates.join(', ')}, updated_at = GETDATE()
      WHERE id = @id
    `);

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
