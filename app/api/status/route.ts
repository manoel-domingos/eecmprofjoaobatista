import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const databaseUrl = process.env.DATABASE_URL || '';

  const geminiConfigured = !!geminiKey && geminiKey !== 'MY_GEMINI_API_KEY';
  let geminiOk = false;
  let geminiError: string | null = null;

  if (geminiConfigured) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`,
        { method: 'GET' }
      );
      if (res.ok) {
        geminiOk = true;
      } else {
        const text = await res.text();
        geminiError = `HTTP ${res.status}: ${text.slice(0, 160)}`;
      }
    } catch (err: unknown) {
      geminiError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    gemini: {
      configured: geminiConfigured,
      reachable: geminiOk,
      error: geminiError,
    },
    database: {
      configured: !!databaseUrl,
    },
    server: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
}
