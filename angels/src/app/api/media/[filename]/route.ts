import { NextRequest, NextResponse } from 'next/server';
import { readUpload } from '@/lib/storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const file = await readUpload(filename);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new NextResponse(file.data, {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media serve error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
