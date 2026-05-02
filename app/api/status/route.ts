import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const nvidiaApiKey = process.env.NVIDIA_API_KEY || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // --- NVIDIA DeepSeek validation ---
  const nvidiaConfigured = !!nvidiaApiKey;
  let nvidiaReachable = false;
  let nvidiaError: string | null = null;

  if (nvidiaConfigured) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
        headers: {
          Authorization: `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        nvidiaReachable = true;
      } else {
        const text = await res.text();
        nvidiaError = `HTTP ${res.status}: ${text.slice(0, 160)}`;
      }
    } catch (err: unknown) {
      nvidiaError = err instanceof Error ? err.message : String(err);
    }
  }

  // --- Supabase validation ---
  const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
  let supabaseReachable = false;
  let supabaseError: string | null = null;
  let supabaseQueryTest: { success: boolean; error?: string } | null = null;

  if (supabaseConfigured) {
    try {
      let url = supabaseUrl;
      if (!url.startsWith('http')) url = `https://${url}`;
      const healthRes = await fetch(`${url.replace(/\/$/, '')}/auth/v1/health`, {
        headers: { apikey: supabaseAnonKey },
        signal: AbortSignal.timeout(8000),
      });

      if (healthRes.ok) {
        supabaseReachable = true;
        const keyToUse = supabaseServiceKey || supabaseAnonKey;
        const supabase = createClient(url, keyToUse);
        const { error } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true });
        supabaseQueryTest = error
          ? { success: false, error: error.message }
          : { success: true };
      } else {
        supabaseError = `Health check failed: HTTP ${healthRes.status}`;
      }
    } catch (err: unknown) {
      supabaseError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    nvidia: {
      configured: nvidiaConfigured,
      reachable: nvidiaReachable,
      error: nvidiaError,
    },
    supabase: {
      configured: supabaseConfigured,
      hasServiceKey: !!supabaseServiceKey,
      reachable: supabaseReachable,
      queryTest: supabaseQueryTest,
      error: supabaseError,
    },
    server: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
}
