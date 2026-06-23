import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import { saveUpload } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    let file: File | null = data.get('image') as unknown as File;
    if (!file) {
      file = data.get('video') as unknown as File;
    }

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (![...allowedImageTypes, ...allowedVideoTypes].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxImageSize = 5 * 1024 * 1024;
    const maxVideoSize = 50 * 1024 * 1024;
    if (allowedImageTypes.includes(file.type) && file.size > maxImageSize) {
      return NextResponse.json({ error: 'Image file too large' }, { status: 400 });
    }
    if (allowedVideoTypes.includes(file.type) && file.size > maxVideoSize) {
      return NextResponse.json({ error: 'Video file too large' }, { status: 400 });
    }

    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const prefix = allowedImageTypes.includes(file.type) ? 'product' : 'video';
    const filename = `${prefix}-${timestamp}${extension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await saveUpload(filename, buffer, file.type);

    return NextResponse.json({
      message: 'File uploaded successfully',
      url,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
