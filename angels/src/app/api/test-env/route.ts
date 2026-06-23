import { NextResponse } from 'next/server';

export async function GET() {
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const resendApiKey = process.env.RESEND_API_KEY;

  return NextResponse.json({
    GMAIL_APP_PASSWORD: {
      exists: !!gmailAppPassword,
      length: gmailAppPassword ? gmailAppPassword.length : 0,
      value: gmailAppPassword ? '***' + gmailAppPassword.slice(-4) : null
    },
    RESEND_API_KEY: {
      exists: !!resendApiKey,
      length: resendApiKey ? resendApiKey.length : 0,
      value: resendApiKey ? '***' + resendApiKey.slice(-4) : null
    },
    allEnvVars: Object.keys(process.env).filter(key => key.includes('GMAIL') || key.includes('RESEND'))
  });
}
