import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Log an event to Supabase for long-term analytics.
 * Falls back to console if not connected.
 */
export async function logToSupabase(table: string, data: any) {
  if (!supabase) {
    console.log(`[Supabase Simulation] Logging to ${table}:`, data);
    return { success: true, simulated: true };
  }

  try {
    const { error } = await supabase.from(table).insert([data]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error(`[Supabase Error] Failed to log to ${table}:`, err);
    return { success: false, error: err };
  }
}
