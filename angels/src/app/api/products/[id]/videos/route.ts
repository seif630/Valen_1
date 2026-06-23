import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const pool = await getPool();
    const query = pool.request();
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    query.input('product_id', sql.Int, productId);
    const result = await query.query('SELECT video_url FROM product_videos WHERE product_id = @product_id ORDER BY id');

    const videoUrls = result.recordset.map(row => row.video_url);

    return NextResponse.json(videoUrls);
  } catch (error) {
    console.error('Error fetching product videos:', error);
    return NextResponse.json({ error: 'Failed to fetch product videos' }, { status: 500 });
  }
}
