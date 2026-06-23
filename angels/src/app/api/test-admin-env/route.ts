import { NextResponse } from 'next/server';

export async function GET() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const nextauthSecret = process.env.NEXTAUTH_SECRET;
  const nextauthUrl = process.env.NEXTAUTH_URL;

  return NextResponse.json({
    ADMIN_USERNAME: {
      exists: !!adminUsername,
      value: adminUsername
    },
    ADMIN_PASSWORD_HASH: {
      exists: !!adminPasswordHash,
      length: adminPasswordHash ? adminPasswordHash.length : 0,
      value: adminPasswordHash ? '***' + adminPasswordHash.slice(-4) : null
    },
    NEXTAUTH_SECRET: {
      exists: !!nextauthSecret,
      length: nextauthSecret ? nextauthSecret.length : 0,
      value: nextauthSecret ? '***' + nextauthSecret.slice(-4) : null
    },
    NEXTAUTH_URL: {
      exists: !!nextauthUrl,
      value: nextauthUrl
    }
  });
}
