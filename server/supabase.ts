import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ooqeoqxhogrmcbzjtmjk.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_eaycO9uNpAqK-0Oy72g15Q_X9hRolej';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function testSupabaseServerConnection(): Promise<{ ok: boolean; message: string; tables: string[] }> {
  try {
    const availableTables: string[] = [];
    const checkTables = ['profiles', 'players', 'matches', 'tournaments', 'seasons', 'trophies', 'news_articles', 'announcements'];

    for (const table of checkTables) {
      const { data, error } = await supabaseServer.from(table).select('id').limit(1);
      if (!error) {
        availableTables.push(table);
      }
    }

    return {
      ok: true,
      message: `Connected to Supabase project ooqeoqxhogrmcbzjtmjk (${availableTables.length} tables active)`,
      tables: availableTables,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || 'Supabase server connection failed',
      tables: [],
    };
  }
}
