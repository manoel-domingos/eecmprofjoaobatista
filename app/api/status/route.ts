import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const v0ApiKey = process.env.V0_API_KEY || '';
  const databaseUrl = process.env.DATABASE_URL || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // v0 API validation
  const v0ApiConfigured = !!v0ApiKey && v0ApiKey !== 'MY_V0_API_KEY';
  let v0ApiOk = false;
  let v0ApiError: string | null = null;

  if (v0ApiConfigured) {
    try {
      const res = await fetch('https://api.v0.dev/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${v0ApiKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        v0ApiOk = true;
      } else {
        const text = await res.text();
        v0ApiError = `HTTP ${res.status}: ${text.slice(0, 160)}`;
      }
    } catch (err: unknown) {
      v0ApiError = err instanceof Error ? err.message : String(err);
    }
  }

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

  return NextResponse.json({
    v0Api: {
      configured: v0ApiConfigured,
      reachable: v0ApiOk,
      error: v0ApiError,
    },
    supabase: {
      configured: supabaseConfigured,
      hasServiceKey: !!supabaseServiceKey,
      reachable: supabaseReachable,
      queryTest: supabaseQueryTest,
      error: supabaseError,
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
