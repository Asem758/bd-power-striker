import { 
  Player, 
  Match, 
  Tournament, 
  Season, 
  RatingConfig, 
  Award, 
  Trophy, 
  NewsArticle, 
  MediaItem, 
  Fixture, 
  AuditLog, 
  ClubStats,
  PlayerRanking,
  ClubAnnouncement
} from '../types';

const API_BASE = '/api';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('bdpsc_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchClubStats(seasonId?: string): Promise<ClubStats> {
  const url = seasonId ? `${API_BASE}/club-stats?seasonId=${seasonId}` : `${API_BASE}/club-stats`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch club stats');
  return res.json();
}

export async function fetchPlayers(params?: { status?: string; position?: string; search?: string }): Promise<Player[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.position) query.append('position', params.position);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/players?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function fetchPlayerDetail(idOrSlug: string): Promise<{
  player: Player;
  ratingBreakdown: any;
  matches: Match[];
  awards: Award[];
  trophies: Trophy[];
  timeline: any[];
}> {
  const res = await fetch(`${API_BASE}/players/${idOrSlug}`);
  if (!res.ok) throw new Error('Failed to fetch player detail');
  return res.json();
}

export async function savePlayer(playerData: Partial<Player>): Promise<Player> {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(playerData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save player');
  }
  return res.json();
}

export async function deletePlayer(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/players/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete player');
  }
  return res.json();
}

export async function updatePlayerStatus(id: string, status: string): Promise<{ success: boolean; player: Player; message: string }> {
  const res = await fetch(`${API_BASE}/players/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update player status');
  }
  return res.json();
}

export async function overridePlayerRating(
  id: string, 
  payload: { rating?: number; rank?: number; reason?: string }
): Promise<{ success: boolean; player: Player; message: string }> {
  const res = await fetch(`${API_BASE}/players/${id}/rating-override`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to override player rating');
  }
  return res.json();
}

export async function deleteMatch(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete match');
  }
  return res.json();
}

export async function deleteTournament(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete tournament');
  }
  return res.json();
}

export async function fetchMatches(params?: { tournamentId?: string; seasonId?: string; result?: string }): Promise<Match[]> {
  const query = new URLSearchParams();
  if (params?.tournamentId) query.append('tournamentId', params.tournamentId);
  if (params?.seasonId) query.append('seasonId', params.seasonId);
  if (params?.result) query.append('result', params.result);

  const res = await fetch(`${API_BASE}/matches?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function fetchMatchDetail(id: string): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch match');
  return res.json();
}

export async function saveMatch(matchData: Partial<Match>): Promise<{ match: Match; message: string }> {
  const res = await fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(matchData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to record match');
  }
  return res.json();
}

export async function fetchTournaments(seasonId?: string): Promise<Tournament[]> {
  const url = seasonId ? `${API_BASE}/tournaments?seasonId=${seasonId}` : `${API_BASE}/tournaments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tournaments');
  return res.json();
}

export async function fetchTournamentDetail(idOrSlug: string): Promise<{ tournament: Tournament; matches: Match[] }> {
  const res = await fetch(`${API_BASE}/tournaments/${idOrSlug}`);
  if (!res.ok) throw new Error('Failed to fetch tournament detail');
  return res.json();
}

export async function saveTournament(tournamentData: Partial<Tournament>): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(tournamentData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save tournament');
  }
  return res.json();
}

export async function fetchRankings(type: string = 'overall'): Promise<{
  type: string;
  updatedAt: string;
  algorithmVersion: string;
  rankings: PlayerRanking[];
}> {
  const res = await fetch(`${API_BASE}/rankings?type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch rankings');
  return res.json();
}

export async function fetchSeasons(): Promise<Season[]> {
  try {
    const res = await fetch(`${API_BASE}/seasons`);
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType?.includes('application/json')) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch seasons:', err);
    return [];
  }
}

export async function saveSeason(seasonData: Partial<Season>): Promise<Season> {
  const res = await fetch(`${API_BASE}/seasons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(seasonData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save season');
  }
  return res.json();
}

export async function setActiveSeason(id: string): Promise<Season> {
  const res = await fetch(`${API_BASE}/seasons/${id}/set-active`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to set active season');
  }
  return res.json();
}

export async function deleteSeason(
  id: string,
  options?: { reassignMatchesToSeasonId?: string; archiveOnly?: boolean }
): Promise<{ success: boolean; message: string; reassignedMatchesCount?: number }> {
  const res = await fetch(`${API_BASE}/seasons/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify(options || {}),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete season');
  }
  return res.json();
}

export async function fetchAwards(): Promise<Award[]> {
  try {
    const res = await fetch(`${API_BASE}/awards`);
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType?.includes('application/json')) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch awards:', err);
    return [];
  }
}

export async function saveAward(awardData: Partial<Award>): Promise<Award> {
  const isEdit = Boolean(awardData.id);
  const url = isEdit ? `${API_BASE}/awards/${awardData.id}` : `${API_BASE}/awards`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getHeaders(),
    body: JSON.stringify(awardData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save individual honor award');
  }
  return res.json();
}

export async function deleteAward(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/awards/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete award');
  }
  return res.json();
}

export async function fetchTrophies(): Promise<Trophy[]> {
  try {
    const res = await fetch(`${API_BASE}/trophies`);
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType?.includes('application/json')) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch trophies:', err);
    return [];
  }
}

export async function saveTrophy(trophyData: Partial<Trophy>): Promise<Trophy> {
  const isEdit = Boolean(trophyData.id);
  const url = isEdit ? `${API_BASE}/trophies/${trophyData.id}` : `${API_BASE}/trophies`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getHeaders(),
    body: JSON.stringify(trophyData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save trophy record');
  }
  return res.json();
}

export async function deleteTrophy(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/trophies/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete trophy');
  }
  return res.json();
}

export async function fetchNews(category?: string): Promise<NewsArticle[]> {
  const url = category && category !== 'ALL' ? `${API_BASE}/news?category=${category}` : `${API_BASE}/news`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function fetchNewsDetail(slug: string): Promise<NewsArticle> {
  const res = await fetch(`${API_BASE}/news/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch article');
  return res.json();
}

export async function saveNews(newsData: Partial<NewsArticle>): Promise<NewsArticle> {
  const res = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(newsData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save news');
  }
  return res.json();
}

export async function updateNewsStatus(id: string, status: 'PUBLISHED' | 'DRAFT'): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/news/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update article status');
  }
  return res.json();
}

export async function deleteNews(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete news article');
  }
  return res.json();
}

export async function fetchMedia(category?: string): Promise<MediaItem[]> {
  const url = category && category !== 'ALL' ? `${API_BASE}/media?category=${category}` : `${API_BASE}/media`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch media');
  return res.json();
}

export async function saveMedia(mediaData: Partial<MediaItem>): Promise<MediaItem> {
  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(mediaData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save media');
  }
  return res.json();
}

export async function deleteMedia(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete media asset');
  }
  return res.json();
}

export async function fetchFixtures(): Promise<Fixture[]> {
  const res = await fetch(`${API_BASE}/fixtures`);
  if (!res.ok) throw new Error('Failed to fetch fixtures');
  return res.json();
}

export async function saveFixture(fixtureData: Partial<Fixture>): Promise<Fixture> {
  const res = await fetch(`${API_BASE}/fixtures`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(fixtureData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save fixture');
  }
  return res.json();
}

export async function deleteFixture(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/fixtures/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete fixture');
  }
  return res.json();
}

export async function convertFixtureToMatch(
  fixtureId: string,
  matchData: Partial<Match>
): Promise<{ success: boolean; match: Match; message: string }> {
  const res = await fetch(`${API_BASE}/fixtures/${fixtureId}/convert-to-match`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(matchData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to convert fixture to match');
  }
  return res.json();
}

export async function searchGlobal(q: string): Promise<{
  players: Player[];
  matches: Match[];
  tournaments: Tournament[];
  news: NewsArticle[];
}> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

export async function fetchRatingConfig(): Promise<RatingConfig> {
  const res = await fetch(`${API_BASE}/admin/rating-config`);
  if (!res.ok) throw new Error('Failed to fetch rating config');
  return res.json();
}

export async function updateRatingConfig(config: Partial<RatingConfig>): Promise<{ config: RatingConfig; message: string }> {
  const res = await fetch(`${API_BASE}/admin/rating-config`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update rating config');
  }
  return res.json();
}

export async function triggerRecalculateRankings(reason?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/recalculate-rankings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to recalculate rankings');
  }
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function adminLogin(password: string, email?: string): Promise<{ success: boolean; token: string; user: any }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, email: email || 'admin@bdpsc.club' }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Authentication failed');
  }
  return res.json();
}

export const createMatch = saveMatch;
export const createPlayer = savePlayer;
export const recalculateAll = () => triggerRecalculateRankings('Admin manual trigger');

export async function resetToSeedData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/reset`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Reset failed');
  }
  return res.json();
}

export async function fetchMilestones(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/milestones`);
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType?.includes('application/json')) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch milestones:', err);
    return [];
  }
}

export async function saveMilestone(milestoneData: { id?: string; title: string; date?: string; description?: string; category?: string }): Promise<any> {
  const isEdit = Boolean(milestoneData.id);
  const url = isEdit ? `${API_BASE}/milestones/${milestoneData.id}` : `${API_BASE}/milestones`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getHeaders(),
    body: JSON.stringify(milestoneData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save club milestone');
  }
  return res.json();
}

export async function deleteMilestone(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/milestones/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete milestone');
  }
  return res.json();
}

// ==========================================
// CLUB ANNOUNCEMENTS (MOVING TICKER)
// ==========================================
export async function fetchAnnouncements(all: boolean = false): Promise<ClubAnnouncement[]> {
  try {
    const url = all ? `${API_BASE}/announcements?all=true` : `${API_BASE}/announcements`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch announcements from server:', err);
    return [];
  }
}

export async function fetchAnnouncementDetail(id: string): Promise<ClubAnnouncement> {
  const res = await fetch(`${API_BASE}/announcements/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch announcement');
  return await res.json();
}

export async function createAnnouncement(data: Partial<ClubAnnouncement>): Promise<{ announcement: ClubAnnouncement; message: string }> {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create announcement');
  }
  return await res.json();
}

export async function updateAnnouncement(id: string, data: Partial<ClubAnnouncement>): Promise<{ announcement: ClubAnnouncement; message: string }> {
  const res = await fetch(`${API_BASE}/announcements/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update announcement');
  }
  return await res.json();
}

export async function toggleAnnouncement(id: string): Promise<{ announcement: ClubAnnouncement; message: string }> {
  const res = await fetch(`${API_BASE}/announcements/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to toggle announcement');
  }
  return await res.json();
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/announcements/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete announcement');
  }
  return await res.json();
}

export async function fetchInitialData(): Promise<{
  stats: ClubStats;
  players: Player[];
  matches: Match[];
  fixtures: Fixture[];
  tournaments: Tournament[];
  seasons: Season[];
  awards: Award[];
  trophies: Trophy[];
  milestones: any[];
  news: NewsArticle[];
  media: MediaItem[];
  ratingConfig: RatingConfig;
  announcements: ClubAnnouncement[];
}> {
  const [
    stats,
    players,
    matches,
    fixtures,
    tournaments,
    seasons,
    awards,
    trophies,
    milestones,
    news,
    media,
    ratingConfig,
    announcements
  ] = await Promise.all([
    fetchClubStats().catch(() => ({
      seasonName: 'Season 01 — 2026',
      totalMatches: 42,
      wins: 32,
      draws: 6,
      losses: 4,
      winRate: 76.2,
      goalsScored: 114,
      goalsConceded: 38,
      goalDifference: 76,
      cleanSheets: 18,
      activePlayersCount: 8,
      tournamentsCount: 4,
      trophiesCount: 3,
    })),
    fetchPlayers().catch(() => []),
    fetchMatches().catch(() => []),
    fetchFixtures().catch(() => []),
    fetchTournaments().catch(() => []),
    fetchSeasons(),
    fetchAwards(),
    fetchTrophies(),
    fetchMilestones(),
    fetchNews().catch(() => []),
    fetchMedia().catch(() => []),
    fetchRatingConfig().catch(() => ({
      id: 'cfg-v2',
      version: '2.4.0',
      baseRating: 65,
      winWeight: 0.15,
      goalWeight: 0.28,
      assistWeight: 0.22,
      cleanSheetWeight: 0.35,
      motmWeight: 1.25,
      opponentStrengthWeight: 0.2,
      tournamentMultiplier: {
        Major: 1.3,
        Championship: 1.15,
        Cup: 1.1,
        Friendly: 0.85,
      },
      formWeight: 0.1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Engine',
    })),
    fetchAnnouncements(false).catch(() => []),
  ]);

  return {
    stats,
    players,
    matches,
    fixtures,
    tournaments,
    seasons,
    awards,
    trophies,
    milestones,
    news,
    media,
    ratingConfig,
    announcements,
  };
}

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
  mediaItem?: MediaItem;
}

export interface BatchUploadResult {
  success: boolean;
  count: number;
  files: UploadResult[];
}

export async function uploadImageFile(payload: {
  file: string; // Base64 or Data URI
  fileName?: string;
  folder?: string;
  autoCreateMedia?: boolean;
  mediaCategory?: string;
  mediaTitle?: string;
  tags?: string[];
  description?: string;
}): Promise<UploadResult> {
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Failed to upload image file');
  }
  return res.json();
}

export async function uploadImagesBatch(payload: {
  files: Array<{
    file: string;
    fileName?: string;
    title?: string;
    category?: string;
    description?: string;
  }>;
  folder?: string;
  autoCreateMedia?: boolean;
  mediaCategory?: string;
  tags?: string[];
}): Promise<BatchUploadResult> {
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Batch upload failed' }));
    throw new Error(err.error || 'Failed to batch upload images');
  }
  return res.json();
}

export async function fetchSupabaseStatus(): Promise<{
  connected: boolean;
  projectId: string;
  projectUrl: string;
  databaseOperational: boolean;
  tables: Record<string, { exists: boolean; rowCount: number; error?: string }>;
}> {
  const res = await fetch(`${API_BASE}/supabase/status`);
  if (!res.ok) throw new Error('Failed to fetch Supabase status');
  return res.json();
}

export async function triggerSupabaseSync(): Promise<any> {
  const res = await fetch(`${API_BASE}/supabase/sync`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sync failed' }));
    throw new Error(err.error || 'Failed to sync with Supabase');
  }
  return res.json();
}

export async function fetchSupabaseSqlSchema(): Promise<string> {
  const res = await fetch(`${API_BASE}/supabase/schema`);
  if (!res.ok) throw new Error('Failed to load SQL schema');
  return res.text();
}


