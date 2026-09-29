import { supabaseServer } from './supabase';
import { db } from './db';
import { 
  Player, 
  Match, 
  Tournament, 
  Season, 
  Trophy, 
  NewsArticle, 
  MediaItem, 
  Fixture, 
  ClubAnnouncement 
} from '../src/types';

export interface SupabaseSyncReport {
  timestamp: string;
  connected: boolean;
  tablesStatus: Record<string, { exists: boolean; rowCount: number; error?: string }>;
  syncedRecords: Record<string, number>;
  message: string;
}

/**
 * Check which tables exist in Supabase and count their rows
 */
export async function getSupabaseTablesStatus(): Promise<Record<string, { exists: boolean; rowCount: number; error?: string }>> {
  const tables = [
    'profiles', 
    'players', 
    'matches', 
    'match_performances', 
    'tournaments', 
    'seasons', 
    'trophies', 
    'news_articles', 
    'media_items', 
    'fixtures', 
    'announcements',
    'rating_configs'
  ];

  const report: Record<string, { exists: boolean; rowCount: number; error?: string }> = {};

  for (const table of tables) {
    try {
      const { count, error } = await supabaseServer
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        report[table] = { exists: false, rowCount: 0, error: error.message };
      } else {
        report[table] = { exists: true, rowCount: count || 0 };
      }
    } catch (err: any) {
      report[table] = { exists: false, rowCount: 0, error: err.message };
    }
  }

  return report;
}

/**
 * Seed or synchronize current state to Supabase tables if they exist
 */
export async function syncStateToSupabase(): Promise<SupabaseSyncReport> {
  const report: SupabaseSyncReport = {
    timestamp: new Date().toISOString(),
    connected: false,
    tablesStatus: {},
    syncedRecords: {},
    message: '',
  };

  try {
    const status = await getSupabaseTablesStatus();
    report.tablesStatus = status;
    report.connected = Object.values(status).some(s => s.exists);

    const state = db.getState();

    // 1. Sync Players
    if (status.players?.exists) {
      const playerRows = state.players.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        gaming_name: p.gamingName,
        squad_number: p.jerseyNumber,
        position: p.position,
        dominant_foot: 'Right',
        age: 22,
        nationality: 'Bangladesh',
        avatar_url: p.photoUrl,
        card_image_url: p.photoUrl,
        status: p.status,
        bio: p.bio,
        rating: p.rating,
        power_ranking: p.overallRank,
        matches_played: p.totalMatches,
        goals: p.goals,
        assists: p.assists,
        clean_sheets: p.cleanSheets,
        wins: p.wins,
        draws: p.draws,
        losses: p.losses,
        win_rate: p.winRate,
        mvp_awards: p.motmCount,
        specialties: [p.playstyle || 'Counter Attack'],
        joined_date: p.joinDate || '2025-01-01',
      }));

      const { error } = await supabaseServer.from('players').upsert(playerRows);
      if (!error) report.syncedRecords['players'] = playerRows.length;
    }

    // 2. Sync Seasons
    if (status.seasons?.exists) {
      const seasonRows = state.seasons.map(s => ({
        id: s.id,
        name: s.name,
        year: s.code || '2026',
        start_date: s.startDate,
        end_date: s.endDate,
        is_active: s.isCurrent,
        total_matches: s.totalMatches,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goals_for: s.goalsScored,
        goals_against: s.goalsConceded,
      }));

      const { error } = await supabaseServer.from('seasons').upsert(seasonRows);
      if (!error) report.syncedRecords['seasons'] = seasonRows.length;
    }

    // 3. Sync Tournaments
    if (status.tournaments?.exists) {
      const tournamentRows = state.tournaments.map(t => ({
        id: t.id,
        title: t.name,
        edition: t.tier || 'National',
        season_id: t.seasonId,
        format: t.format,
        status: t.status,
        start_date: t.startDate,
        end_date: t.endDate,
        teams_count: t.participantsCount || 16,
        champion: t.championTeam,
        runner_up: t.runnerUpTeam,
      }));

      const { error } = await supabaseServer.from('tournaments').upsert(tournamentRows);
      if (!error) report.syncedRecords['tournaments'] = tournamentRows.length;
    }

    // 4. Sync Matches
    if (status.matches?.exists) {
      const matchRows = state.matches.map(m => ({
        id: m.id,
        match_code: m.slug,
        opponent: m.opponentClub,
        date: m.date,
        time: m.time,
        competition_type: 'LEAGUE',
        season_id: m.seasonId,
        tournament_id: m.tournamentId,
        score_bdpsc: m.scoreClub,
        score_opponent: m.scoreOpponent,
        result: m.result,
        stream_url: m.matchVideoUrl,
        highlight_url: m.matchVideoUrl,
        notes: m.matchReport,
        mvp_player_id: m.motmPlayerId,
      }));

      const { error } = await supabaseServer.from('matches').upsert(matchRows);
      if (!error) report.syncedRecords['matches'] = matchRows.length;
    }

    // 5. Sync Trophies
    if (status.trophies?.exists) {
      const trophyRows = state.trophies.map(t => ({
        id: t.id,
        title: t.tournamentName,
        tournament: t.tournamentName,
        year: String(t.year),
        category: t.position,
        image_url: t.trophyImageUrl,
        description: t.achievementDescription,
      }));

      const { error } = await supabaseServer.from('trophies').upsert(trophyRows);
      if (!error) report.syncedRecords['trophies'] = trophyRows.length;
    }

    // 6. Sync News Articles
    if (status.news_articles?.exists) {
      const newsRows = state.news.map(n => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        content: n.content,
        cover_image: n.coverImageUrl,
        category: n.category,
        author: n.author,
        published_at: n.publishedAt,
        is_featured: true,
        tags: n.tags,
      }));

      const { error } = await supabaseServer.from('news_articles').upsert(newsRows);
      if (!error) report.syncedRecords['news_articles'] = newsRows.length;
    }

    // 7. Sync Media Items
    if (status.media_items?.exists) {
      const mediaRows = state.media.map(m => ({
        id: m.id,
        title: m.title,
        type: m.category,
        url: m.mediaUrl,
        thumbnail: m.thumbnailUrl || m.mediaUrl,
        description: m.title,
        tags: [m.category],
        uploaded_at: new Date().toISOString(),
        views: 100,
      }));

      const { error } = await supabaseServer.from('media_items').upsert(mediaRows);
      if (!error) report.syncedRecords['media_items'] = mediaRows.length;
    }

    // 8. Sync Announcements
    if (status.announcements?.exists) {
      const announcementRows = state.announcements.map(a => ({
        id: a.id,
        text: a.content || a.title,
        type: a.type,
        is_active: a.isActive,
        priority: a.priority,
        link: a.actionLink,
      }));

      const { error } = await supabaseServer.from('announcements').upsert(announcementRows);
      if (!error) report.syncedRecords['announcements'] = announcementRows.length;
    }

    // 9. Sync Rating Config
    if (status.rating_configs?.exists) {
      const rc = state.ratingConfig;
      const rcRow = {
        id: 'current',
        version: rc.version,
        base_rating: rc.baseRating,
        win_bonus: rc.winWeight,
        draw_penalty: 0.5,
        loss_penalty: 2.0,
        goal_weight: rc.goalWeight,
        assist_weight: rc.assistWeight,
        clean_sheet_bonus: rc.cleanSheetWeight,
        mvp_multiplier: rc.motmWeight,
      };

      const { error } = await supabaseServer.from('rating_configs').upsert(rcRow);
      if (!error) report.syncedRecords['rating_configs'] = 1;
    }

    report.message = report.connected
      ? `Supabase synchronization finished. Updated ${Object.keys(report.syncedRecords).length} tables.`
      : 'Supabase project reached, but tables are pending migration. Use the provided schema.sql in Supabase SQL editor.';

    return report;
  } catch (err: any) {
    report.message = `Sync error: ${err.message}`;
    return report;
  }
}

/**
 * Automatically remove a user's details and profile from Supabase
 */
export async function deleteUserFromSupabase(userId: string, email: string): Promise<{
  supabaseDeleted: boolean;
  details: string[];
  error?: string;
}> {
  const details: string[] = [];
  let supabaseDeleted = false;
  const cleanEmail = (email || '').toLowerCase().trim();

  try {
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    let resolvedUuid = isUuid(userId) ? userId : null;

    // If local userId is not a UUID, check if Supabase profile has a UUID for this email
    if (!resolvedUuid && cleanEmail) {
      try {
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profile?.id && isUuid(profile.id)) {
          resolvedUuid = profile.id;
        }
      } catch {}
    }

    // 1. Delete from public.profiles table by email
    if (cleanEmail) {
      try {
        const { error, count } = await supabaseServer
          .from('profiles')
          .delete({ count: 'exact' })
          .eq('email', cleanEmail);

        if (!error) {
          details.push(`Profiles by email deleted: ${count ?? 0} record(s)`);
          supabaseDeleted = true;
        } else {
          details.push(`profiles (email) note: ${error.message}`);
        }
      } catch (e: any) {
        details.push(`profiles (email) err: ${e.message}`);
      }
    }

    // 2. Delete from public.profiles table by UUID if available
    if (resolvedUuid) {
      try {
        const { error, count } = await supabaseServer
          .from('profiles')
          .delete({ count: 'exact' })
          .eq('id', resolvedUuid);

        if (!error && (count ?? 0) > 0) {
          details.push(`Profiles by UUID deleted: ${count} record(s)`);
          supabaseDeleted = true;
        }
      } catch (e: any) {
        details.push(`profiles (id) err: ${e.message}`);
      }
    }

    // 3. Clear user_id on players table if linked
    if (resolvedUuid) {
      try {
        await supabaseServer
          .from('players')
          .update({ user_id: null })
          .eq('user_id', resolvedUuid);
        details.push('Cleared user_id link on players table');
      } catch {}
    }

    // 4. Try auth.admin.deleteUser if service role credentials are present
    if (resolvedUuid) {
      try {
        const authAdmin = (supabaseServer.auth as any)?.admin;
        if (authAdmin && typeof authAdmin.deleteUser === 'function') {
          const { error: authErr } = await authAdmin.deleteUser(resolvedUuid);
          if (!authErr) {
            details.push('Auth record deleted from auth.users');
            supabaseDeleted = true;
          }
        }
      } catch {}
    }

    return { supabaseDeleted, details };
  } catch (err: any) {
    return { supabaseDeleted: false, details, error: err.message };
  }
}

