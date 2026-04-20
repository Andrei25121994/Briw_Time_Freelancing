import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Folosim <any> pentru a evita erorile de tip "never" în Dashboard
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);