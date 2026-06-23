import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as test');
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: result.recordset
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: (error as Error).message
    }, { status: 500 });
  }
}
