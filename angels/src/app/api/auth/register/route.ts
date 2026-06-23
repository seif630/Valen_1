import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email?.trim() || !password || !name?.trim()) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pool = await getPool();

    const existing = await pool.request()
      .input('email', sql.NVarChar, normalizedEmail)
      .query('SELECT id, password, role FROM users WHERE email = @email');

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing.recordset.length > 0) {
      const user = existing.recordset[0];

      if (user.password && user.role !== 'guest') {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      await pool.request()
        .input('id', sql.Int, user.id)
        .input('name', sql.NVarChar, name.trim())
        .input('password', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, 'customer')
        .query(`
          UPDATE users
          SET name = @name, password = @password, role = @role, updated_at = GETDATE()
          WHERE id = @id
        `);

      return NextResponse.json({ message: 'Account created successfully' });
    }

    await pool.request()
      .input('email', sql.NVarChar, normalizedEmail)
      .input('name', sql.NVarChar, name.trim())
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'customer')
      .query(`
        INSERT INTO users (email, name, password, role)
        VALUES (@email, @name, @password, @role)
      `);

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
