import { writeFile } from 'fs/promises';
import path from 'path';

const UPLOAD_STORE = 'uploads';

function isNetlifyRuntime(): boolean {
  return process.env.NETLIFY === 'true' || process.env.NETLIFY_DEV === 'true';
}

async function getBlobStore() {
  const { getStore } = await import('@netlify/blobs');
  return getStore(UPLOAD_STORE);
}

export async function saveUpload(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (isNetlifyRuntime()) {
    const store = await getBlobStore();
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    await store.set(filename, arrayBuffer, {
      metadata: { contentType },
    });
    return `/api/media/${filename}`;
  }

  const filepath = path.join(process.cwd(), 'public', 'images', filename);
  await writeFile(filepath, buffer);
  return `/images/${filename}`;
}

export async function readUpload(
  filename: string
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  if (isNetlifyRuntime()) {
    const store = await getBlobStore();
    const data = await store.get(filename, { type: 'arrayBuffer' });
    if (!data) return null;

    const metadata = await store.getMetadata(filename);
    const contentType =
      (metadata?.metadata?.contentType as string) || 'application/octet-stream';

    return { data, contentType };
  }

  const { readFile } = await import('fs/promises');
  const filepath = path.join(process.cwd(), 'public', 'images', filename);

  try {
    const buffer = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
    };

    return {
      data: buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer,
      contentType: contentTypeMap[ext] || 'application/octet-stream',
    };
  } catch {
    return null;
  }
}
