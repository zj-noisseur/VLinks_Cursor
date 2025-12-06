import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aynwhrxnapmzbfpqyqec.supabase.co";
const supabaseAnonKey = "sb_publishable_WH2FCDZSsAJgoWr4KqglJA_stMljCBh";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);