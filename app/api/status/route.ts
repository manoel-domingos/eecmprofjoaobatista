import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const databaseUrl = process.env.DATABASE_URL || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // Supabase validation
  const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
  let supabaseReachable = false;
  let supabaseError: string | null = null;
  let supabaseQueryTest: { success: boolean; tableCount?: number; error?: string } | null = null;

  if (supabaseConfigured) {
    try {
      // Test health endpoint
      let url = supabaseUrl;
      if (!url.startsWith('http')) url = `https://${url}`;
      const healthRes = await fetch(`${url.replace(/\/$/, '')}/auth/v1/health`, {
        headers: { apikey: supabaseAnonKey },
      });
      
      if (healthRes.ok) {
        supabaseReachable = true;
        
        // Test query using service role key if available
        const keyToUse = supabaseServiceKey || supabaseAnonKey;
        const supabase = createClient(url, keyToUse);
        
        // Simple query to list tables (test database connectivity)
        const { data, error } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          supabaseQueryTest = { success: false, error: error.message };
        } else {
          supabaseQueryTest = { success: true, tableCount: data?.length ?? 0 };
        }
      } else {
        supabaseError = `Health check failed: HTTP ${healthRes.status}`;
      }
    } catch (err: unknown) {
      supabaseError = err instanceof Error ? err.message : String(err);
    }
  }

  // Gemini validation
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
    supabase: {
      configured: supabaseConfigured,
      hasServiceKey: !!supabaseServiceKey,
      reachable: supabaseReachable,
      queryTest: supabaseQueryTest,
      error: supabaseError,
    },
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
