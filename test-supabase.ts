import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('occurrences').insert([{
    student_id: '1',
    date: '2026-04-27',
    rule_code: [1], // << array
    registered_by: 'admin',
    hour: "10:00",
    location: "pátio",
    located_by: "joão"
  }]).select().single();
  console.log(data, error);
}

test();
