import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'ooqeoqxhogrmcbzjtmjk';
export const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  'https://ooqeoqxhogrmcbzjtmjk.supabase.co';

export const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  'sb_publishable_eaycO9uNpAqK-0Oy72g15Q_X9hRolej';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseHealthCheck {
  connected: boolean;
  projectUrl: string;
  projectId: string;
  authOperational: boolean;
  databaseOperational: boolean;
  tablesDetected: string[];
  error?: string;
}

/**
 * Perform a live check against the Supabase project to verify connectivity
 * and query table availability.
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealthCheck> {
  const result: SupabaseHealthCheck = {
    connected: false,
    projectUrl: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    authOperational: false,
    databaseOperational: false,
    tablesDetected: [],
  };

  try {
    // 1. Verify Auth endpoint
    const { data: sessionData, error: authError } = await supabase.auth.getSession();
    if (!authError) {
      result.authOperational = true;
    }

    // 2. Probe database tables
    const probeTables = [
      'profiles', 
      'players', 
      'matches', 
      'tournaments', 
      'seasons', 
      'trophies', 
      'news_articles', 
      'media_items', 
      'fixtures', 
      'announcements'
    ];

    for (const table of probeTables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (!error) {
          result.tablesDetected.push(table);
        }
      } catch {
        // Table not ready yet
      }
    }

    result.databaseOperational = result.tablesDetected.length > 0;
    result.connected = result.authOperational;
    return result;
  } catch (err: any) {
    result.error = err.message || 'Connection test failed';
    return result;
  }
}
