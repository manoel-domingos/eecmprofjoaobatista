import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

async function test() {
  const { data, error } = await supabase.from('occurrences').select('*').limit(1);
  console.log('Select:', data, error);
}

test();
