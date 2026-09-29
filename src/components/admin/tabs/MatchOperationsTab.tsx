import React, { useState } from 'react';
import { Match, Player, Tournament, Season, PlayerMatchStats, HomeAway, Fixture } from '../../../types';
import { saveMatch, deleteMatch, saveFixture, deleteFixture, convertFixtureToMatch } from '../../../services/api';
import { FileAttachmentUpload } from '../common/FileAttachmentUpload';
import { OpponentLogoUploader } from '../common/OpponentLogoUploader';

interface MatchOperationsTabProps {
  matches: Match[];
  fixtures: Fixture[];
  players: Player[];
  tournaments: Tournament[];
  seasons: Season[];
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

export const MatchOperationsTab: React.FC<MatchOperationsTabProps> = ({
  matches,
  fixtures,
  players,
  tournaments,
  seasons,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  // Navigation within Match Management: 'fixtures' or 'matches'
  const [subView, setSubView] = useState<'fixtures' | 'matches'>('fixtures');

  // Filters
  const [tournamentFilter, setTournamentFilter] = useState('ALL');
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FIXTURE MODALS & STATE
  // ==========================================
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);
  const [deletingFixture, setDeletingFixture] = useState<Fixture | null>(null);
  const [convertingFixture, setConvertingFixture] = useState<Fixture | null>(null);

  // Fixture Form Fields
  const [fixTournamentId, setFixTournamentId] = useState(tournaments[0]?.id || '');
  const [fixStage, setFixStage] = useState('Group Stage - Matchday 1');
  const [fixHomeTeam, setFixHomeTeam] = useState('BD Power Strikers');
  const [fixHomeTeamLogo, setFixHomeTeamLogo] = useState('/logo.svg');
  const [fixAwayTeam, setFixAwayTeam] = useState('');
  const [fixOpponentLogo, setFixOpponentLogo] = useState('');
  const [fixDate, setFixDate] = useState(new Date().toISOString().split('T')[0]);
  const [fixTime, setFixTime] = useState('20:00');
  const [fixVenue, setFixVenue] = useState('Discord Room 1 / Online Arena');
  const [fixStreamUrl, setFixStreamUrl] = useState('');
  const [fixRoomCode, setFixRoomCode] = useState('');
  const [fixStatus, setFixStatus] = useState<'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'>('SCHEDULED');
  const [fixLineup, setFixLineup] = useState<string[]>([]);
  const [fixNotes, setFixNotes] = useState('');

  // ==========================================
  // MATCH (RESULTS) MODALS & STATE
  // ==========================================
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);

  // Match Form Fields
  const [formTournamentId, setFormTournamentId] = useState(tournaments[0]?.id || '');
  const [formSeasonId, setFormSeasonId] = useState(seasons[0]?.id || '');
  const [formClubName, setFormClubName] = useState('BD Power Strikers');
  const [formClubLogo, setFormClubLogo] = useState('/logo.svg');
  const [formOpponent, setFormOpponent] = useState('');
  const [formOpponentLogo, setFormOpponentLogo] = useState('');
  const [formScoreClub, setFormScoreClub] = useState<number>(0);
  const [formScoreOpponent, setFormScoreOpponent] = useState<number>(0);
  const [formHalfTimeScore, setFormHalfTimeScore] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('20:00');
  const [formHomeAway, setFormHomeAway] = useState<HomeAway>('NEUTRAL');
  const [formOpponentStrength, setFormOpponentStrength] = useState<number>(80);
  const [formMotmPlayerId, setFormMotmPlayerId] = useState<string>('');
  const [formMatchReport, setFormMatchReport] = useState('');
  const [formMatchScreenshot, setFormMatchScreenshot] = useState('');
  const [formMatchVideo, setFormMatchVideo] = useState('');

  // Granular Player Performance entries
  const [playerPerformances, setPlayerPerformances] = useState<
    Array<{
      playerId: string;
      goals: number;
      assists: number;
      cleanSheet: boolean;
      saves: number;
      yellowCards: number;
      redCards: number;
      performanceScore: number;
      minutesPlayed: number;
      notes?: string;
    }>
  >([]);

  // Permissions
  const canCreate = hasPermission('matches.create') || isSuperAdmin;
  const canEdit = hasPermission('matches.edit') || isSuperAdmin;
  const canDelete = hasPermission('matches.delete') || isSuperAdmin;

  // ==========================================
  // FIXTURE HANDLERS
  // ==========================================
  const openNewFixtureModal = () => {
    setEditingFixture(null);
    setFixTournamentId(tournaments[0]?.id || '');
    setFixStage('Group Stage - Matchday 1');
    setFixHomeTeam('BD Power Strikers');
    setFixHomeTeamLogo('/logo.svg');
    setFixAwayTeam('');
    setFixOpponentLogo('');
    setFixDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setFixTime('20:00');
    setFixVenue('Discord Room 1 / Online Arena');
    setFixStreamUrl('');
    setFixRoomCode('');
    setFixStatus('SCHEDULED');
    setFixLineup(players.slice(0, 3).map(p => p.id));
    setFixNotes('');
    setIsFixtureModalOpen(true);
  };

  const openEditFixtureModal = (f: Fixture) => {
    setEditingFixture(f);
    setFixTournamentId(f.tournamentId || tournaments[0]?.id || '');
    setFixStage(f.stage || 'Group Stage - Matchday 1');
    setFixHomeTeam(f.homeTeam || 'BD Power Strikers');
    setFixHomeTeamLogo(f.homeTeamLogo || '/logo.svg');
    setFixAwayTeam(f.awayTeam || f.opponent || '');
    setFixOpponentLogo(f.opponentLogo || '');
    setFixDate(f.date);
    setFixTime(f.time || '20:00');
    setFixVenue(f.venue || f.venuePlatform || 'Online Arena');
    setFixStreamUrl(f.streamUrl || '');
    setFixRoomCode(f.roomCode || f.roomLink || '');
    setFixStatus(f.status || 'SCHEDULED');
    setFixLineup(f.lineupPlayerIds || []);
    setFixNotes(f.notes || '');
    setIsFixtureModalOpen(true);
  };

  const handleSaveFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixAwayTeam.trim()) {
      showFeedback('error', 'Away team / opponent name is required.');
      return;
    }
    if (!fixDate) {
      showFeedback('error', 'Fixture match date is required.');
      return;
    }

    setLoading(true);
    try {
      const selectedTournament = tournaments.find(t => t.id === fixTournamentId);
      const payload: Partial<Fixture> = {
        id: editingFixture ? editingFixture.id : undefined,
        tournament: selectedTournament ? selectedTournament.name : 'eFootball Pro Circuit',
        tournamentId: fixTournamentId,
        stage: fixStage.trim() || 'Group Stage',
        homeTeam: fixHomeTeam.trim() || 'BD Power Strikers',
        homeTeamLogo: fixHomeTeamLogo.trim() || '/logo.svg',
        awayTeam: fixAwayTeam.trim(),
        opponent: fixAwayTeam.trim(),
        opponentLogo: fixOpponentLogo.trim() || undefined,
        date: fixDate,
        time: fixTime,
        bstTime: `${fixTime} BST`,
        venue: fixVenue.trim() || 'Online Arena',
        venuePlatform: fixVenue.trim() || 'Online Arena',
        streamUrl: fixStreamUrl.trim() || undefined,
        roomLink: fixRoomCode.trim() || undefined,
        roomCode: fixRoomCode.trim() || undefined,
        status: fixStatus,
        lineupPlayerIds: fixLineup,
        notes: fixNotes.trim() || undefined,
      };

      await saveFixture(payload);
      showFeedback('success', editingFixture ? `Fixture vs ${payload.opponent} updated!` : `Upcoming fixture vs ${payload.opponent} scheduled!`);
      setIsFixtureModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save fixture.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixtureConfirm = async () => {
    if (!deletingFixture) return;
    setLoading(true);
    try {
      await deleteFixture(deletingFixture.id);
      showFeedback('success', `Fixture vs ${deletingFixture.opponent} cancelled and removed.`);
      setDeletingFixture(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete fixture.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CONVERT FIXTURE TO MATCH HANDLERS
  // ==========================================
  const startConvertingFixture = (f: Fixture) => {
    setConvertingFixture(f);
    setEditingMatch(null);
    setFormTournamentId(f.tournamentId || tournaments[0]?.id || '');
    setFormSeasonId(seasons[0]?.id || '');
    setFormClubName(f.homeTeam || 'BD Power Strikers');
    setFormClubLogo(f.homeTeamLogo || '/logo.svg');
    setFormOpponent(f.awayTeam || f.opponent);
    setFormOpponentLogo(f.opponentLogo || '');
    setFormScoreClub(0);
    setFormScoreOpponent(0);
    setFormHalfTimeScore('0-0');
    setFormDate(f.date);
    setFormTime(f.time || '20:00');
    setFormHomeAway(f.homeTeam === 'BD Power Strikers' ? 'HOME' : 'AWAY');
    setFormOpponentStrength(80);
    setFormMotmPlayerId('');
    setFormMatchReport(`Scheduled fixture match between BD Power Strikers and ${f.opponent} in the ${f.tournament} (${f.stage || 'Official Match'}).`);
    setFormMatchScreenshot('');
    setFormMatchVideo(f.streamUrl || '');

    // Pre-populate lineup players if available, or first 3 roster players
    const initialPlayers = f.lineupPlayerIds && f.lineupPlayerIds.length > 0
      ? players.filter(p => f.lineupPlayerIds.includes(p.id))
      : players.slice(0, 3);

    setPlayerPerformances(
      initialPlayers.map(p => ({
        playerId: p.id,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        saves: 0,
        yellowCards: 0,
        redCards: 0,
        performanceScore: 7.5,
        minutesPlayed: 90,
      }))
    );
    setIsMatchModalOpen(true);
  };

  // ==========================================
  // MATCH RECORD HANDLERS
  // ==========================================
  const openNewMatchModal = () => {
    setConvertingFixture(null);
    setEditingMatch(null);
    setFormTournamentId(tournaments[0]?.id || '');
    setFormSeasonId(seasons[0]?.id || '');
    setFormClubName('BD Power Strikers');
    setFormClubLogo('/logo.svg');
    setFormOpponent('');
    setFormOpponentLogo('');
    setFormScoreClub(0);
    setFormScoreOpponent(0);
    setFormHalfTimeScore('0-0');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('20:00');
    setFormHomeAway('NEUTRAL');
    setFormOpponentStrength(80);
    setFormMotmPlayerId('');
    setFormMatchReport('');
    setFormMatchScreenshot('');
    setFormMatchVideo('');

    // Pre-populate with first 3 roster players
    setPlayerPerformances(
      players.slice(0, 3).map((p) => ({
        playerId: p.id,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        saves: 0,
        yellowCards: 0,
        redCards: 0,
        performanceScore: 7.5,
        minutesPlayed: 90,
      }))
    );
    setIsMatchModalOpen(true);
  };

  const openEditMatchModal = (m: Match) => {
    setConvertingFixture(null);
    setEditingMatch(m);
    setFormTournamentId(m.tournamentId || tournaments[0]?.id || '');
    setFormSeasonId(m.seasonId || seasons[0]?.id || '');
    setFormClubName(m.clubName || 'BD Power Strikers');
    setFormClubLogo(m.clubLogo || '/logo.svg');
    setFormOpponent(m.opponentClub);
    setFormOpponentLogo(m.opponentLogo || '');
    setFormScoreClub(m.scoreClub);
    setFormScoreOpponent(m.scoreOpponent);
    setFormHalfTimeScore(m.halfTimeScore || '');
    setFormDate(m.date);
    setFormTime(m.time || '20:00');
    setFormHomeAway(m.homeAway || 'NEUTRAL');
    setFormOpponentStrength(m.opponentStrength || 80);
    setFormMotmPlayerId(m.motmPlayerId || '');
    setFormMatchReport(m.matchReport || '');
    setFormMatchScreenshot(m.matchScreenshot || '');
    setFormMatchVideo(m.matchVideoUrl || '');

    if (m.playerStats && m.playerStats.length > 0) {
      setPlayerPerformances(
        m.playerStats.map((ps) => ({
          playerId: ps.playerId,
          goals: ps.goals || 0,
          assists: ps.assists || 0,
          cleanSheet: ps.cleanSheet || false,
          saves: ps.saves || 0,
          yellowCards: ps.yellowCards || 0,
          redCards: ps.redCards || 0,
          performanceScore: ps.performanceScore || 7.0,
          minutesPlayed: ps.minutesPlayed || 90,
          notes: ps.notes,
        }))
      );
    } else {
      setPlayerPerformances([]);
    }
    setIsMatchModalOpen(true);
  };

  const addPlayerPerformanceRow = () => {
    const available = players.find(p => !playerPerformances.some(row => row.playerId === p.id));
    if (!available) {
      showFeedback('error', 'All roster athletes have already been added to this match.');
      return;
    }
    setPlayerPerformances([
      ...playerPerformances,
      {
        playerId: available.id,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        saves: 0,
        yellowCards: 0,
        redCards: 0,
        performanceScore: 7.0,
        minutesPlayed: 90,
      },
    ]);
  };

  const removePlayerPerformanceRow = (index: number) => {
    setPlayerPerformances(playerPerformances.filter((_, i) => i !== index));
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOpponent.trim()) {
      showFeedback('error', 'Opponent club name is required.');
      return;
    }

    setLoading(true);
    try {
      const selectedTournament = tournaments.find(t => t.id === formTournamentId);
      const motmPlayer = players.find(p => p.id === formMotmPlayerId);

      const matchPayload: Partial<Match> = {
        id: editingMatch?.id,
        tournamentId: formTournamentId,
        tournamentName: selectedTournament?.name || 'BDPSC Tournament',
        seasonId: formSeasonId,
        date: formDate,
        time: formTime,
        clubName: formClubName.trim() || 'BD Power Strikers',
        clubLogo: formClubLogo.trim() || '/logo.svg',
        opponentClub: formOpponent.trim(),
        opponentLogo: formOpponentLogo.trim() || undefined,
        opponentStrength: Number(formOpponentStrength) || 80,
        homeAway: formHomeAway,
        scoreClub: Number(formScoreClub) || 0,
        scoreOpponent: Number(formScoreOpponent) || 0,
        halfTimeScore: formHalfTimeScore.trim() || undefined,
        motmPlayerId: formMotmPlayerId || undefined,
        motmPlayerName: motmPlayer ? motmPlayer.gamingName : undefined,
        matchReport: formMatchReport.trim() || undefined,
        matchScreenshot: formMatchScreenshot.trim() || undefined,
        matchVideoUrl: formMatchVideo.trim() || undefined,
        isPublished: true,
        playerStats: playerPerformances.map((p, idx) => ({
          id: `ps-${Date.now()}-${idx}`,
          matchId: editingMatch?.id || '',
          playerId: p.playerId,
          goals: Number(p.goals) || 0,
          assists: Number(p.assists) || 0,
          cleanSheet: Boolean(p.cleanSheet),
          saves: Number(p.saves) || 0,
          conceded: Number(formScoreOpponent) || 0,
          yellowCards: Number(p.yellowCards) || 0,
          redCards: Number(p.redCards) || 0,
          motm: p.playerId === formMotmPlayerId,
          minutesPlayed: Number(p.minutesPlayed) || 90,
          performanceScore: Number(p.performanceScore) || 7.0,
          notes: p.notes,
        })),
      };

      if (convertingFixture) {
        await convertFixtureToMatch(convertingFixture.id, matchPayload);
        showFeedback('success', `Fixture converted to match vs ${formOpponent}! Stats & rankings recalculated.`);
      } else {
        await saveMatch(matchPayload);
        showFeedback(
          'success',
          editingMatch
            ? `Match record vs ${formOpponent} updated! Leaderboard positions synchronized.`
            : `Match record logged vs ${formOpponent}! Automated ranking engine computed ratings.`
        );
      }

      setIsMatchModalOpen(false);
      setConvertingFixture(null);
      setEditingMatch(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save match.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatchConfirm = async () => {
    if (!deletingMatch) return;
    setLoading(true);
    try {
      await deleteMatch(deletingMatch.id);
      showFeedback('success', `Match vs ${deletingMatch.opponentClub} deleted. Club statistics re-indexed.`);
      setDeletingMatch(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete match.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered fixtures and matches
  const filteredFixtures = fixtures.filter(f => {
    if (tournamentFilter !== 'ALL' && f.tournamentId !== tournamentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.opponent.toLowerCase().includes(q) ||
        (f.awayTeam && f.awayTeam.toLowerCase().includes(q)) ||
        (f.stage && f.stage.toLowerCase().includes(q)) ||
        (f.venue && f.venue.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredMatches = matches.filter(m => {
    if (tournamentFilter !== 'ALL' && m.tournamentId !== tournamentFilter) return false;
    if (seasonFilter !== 'ALL' && m.seasonId !== seasonFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.opponentClub.toLowerCase().includes(q) ||
        (m.tournamentName && m.tournamentName.toLowerCase().includes(q)) ||
        (m.motmPlayerName && m.motmPlayerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Fixtures & Match Management
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Schedule upcoming tournament fixtures, update live game rooms, record match outcomes, and granular player stats.
          </p>
        </div>

        {/* View Switcher: Upcoming Fixtures vs Completed Matches */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex">
            <button
              onClick={() => setSubView('fixtures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subView === 'fixtures'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📅</span> Upcoming Fixtures
              <span className="ml-1 px-1.5 py-0.2 bg-zinc-900/60 rounded-full text-[10px]">
                {fixtures.length}
              </span>
            </button>
            <button
              onClick={() => setSubView('matches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subView === 'matches'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🏆</span> Match Results & Logs
              <span className="ml-1 px-1.5 py-0.2 bg-zinc-900/60 rounded-full text-[10px]">
                {matches.length}
              </span>
            </button>
          </div>

          {subView === 'fixtures' ? (
            <button
              onClick={openNewFixtureModal}
              disabled={!canCreate}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>➕</span> Schedule Fixture
            </button>
          ) : (
            <button
              onClick={openNewMatchModal}
              disabled={!canCreate}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>➕</span> Log Match Result
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder={subView === 'fixtures' ? "Search opponent, stage, venue..." : "Search opponent, tournament, MOTM..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
          </div>

          {/* Tournament Filter */}
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Season Filter for Matches */}
          {subView === 'matches' && (
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Seasons</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '⭐' : ''}</option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-zinc-500">
          Showing {subView === 'fixtures' ? filteredFixtures.length : filteredMatches.length} records
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: UPCOMING FIXTURES */}
      {/* ======================================================== */}
      {subView === 'fixtures' && (
        <div className="space-y-4">
          {filteredFixtures.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
              <span className="text-4xl">📅</span>
              <h3 className="text-base font-bold text-white mt-3">No Scheduled Fixtures</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                No upcoming matches match the selected criteria. Click "Schedule Fixture" above to announce an upcoming fixture.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFixtures.map((f) => {
                const isCompleted = f.status === 'COMPLETED';
                const isLive = f.status === 'LIVE';
                const isCancelled = f.status === 'CANCELLED';

                return (
                  <div
                    key={f.id}
                    className={`bg-zinc-900/90 rounded-2xl border p-5 transition-all hover:border-zinc-700 flex flex-col justify-between ${
                      isLive
                        ? 'border-red-500/50 shadow-lg shadow-red-500/10'
                        : isCompleted
                        ? 'border-zinc-800/80 opacity-75'
                        : 'border-zinc-800'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Tournament & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 truncate">
                          {f.tournament}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isLive
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                              : isCompleted
                              ? 'bg-zinc-800 text-zinc-400'
                              : isCancelled
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>

                      {/* Stage info */}
                      {f.stage && (
                        <div className="text-[11px] font-bold text-emerald-400 mb-3">
                          {f.stage}
                        </div>
                      )}

                      {/* Teams Matchup Header */}
                      <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 mb-3">
                        <div className="flex items-center justify-between gap-3 text-center">
                          {/* Home Team */}
                          <div className="flex-1 text-left flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-amber-500/40 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_6px_rgba(245,158,11,0.2)]">
                              <img
                                src={f.homeTeamLogo || '/logo.svg'}
                                alt={f.homeTeam || 'BD Power Strikers'}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate">
                                {f.homeTeam || 'BD Power Strikers'}
                              </div>
                              <span className="text-[10px] text-zinc-500 uppercase font-bold">Club</span>
                            </div>
                          </div>

                          <span className="text-xs font-black text-zinc-600 px-2 py-0.5 bg-zinc-900 rounded shrink-0">
                            VS
                          </span>

                          {/* Away Team */}
                          <div className="flex-1 text-right flex items-center justify-end gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate">
                                {f.awayTeam || f.opponent}
                              </div>
                              <span className="text-[10px] text-zinc-500 uppercase font-bold">Opponent</span>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={f.opponentLogo || '/opponent-logos/generic-opponent.svg'}
                                alt={f.awayTeam || f.opponent}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Meta: Date, BST Time, Venue */}
                      <div className="space-y-1.5 text-xs text-zinc-300 mb-4 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/40">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">🗓 Date:</span>
                          <span className="font-semibold text-white">{f.date}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">⏰ BST Time:</span>
                          <span className="font-bold text-emerald-400">{f.bstTime || `${f.time} BST`}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">📍 Venue:</span>
                          <span className="text-zinc-300 truncate max-w-[170px]">{f.venue || f.venuePlatform}</span>
                        </div>
                        {f.roomCode && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500">🔑 Room / Code:</span>
                            <span className="font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
                              {f.roomCode}
                            </span>
                          </div>
                        )}
                        {f.streamUrl && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500">📺 Stream:</span>
                            <a
                              href={f.streamUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-rose-400 hover:underline truncate max-w-[160px]"
                            >
                              Live Broadcast ↗
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Squad Lineup Preview */}
                      {f.lineupPlayerIds && f.lineupPlayerIds.length > 0 && (
                        <div className="mb-4">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                            Assigned Athletes ({f.lineupPlayerIds.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {f.lineupPlayerIds.map(pId => {
                              const p = players.find(x => x.id === pId);
                              return (
                                <span
                                  key={pId}
                                  className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono"
                                >
                                  {p ? p.gamingName : pId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions: Convert, Edit, Delete */}
                    <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-between gap-2">
                      {!isCompleted ? (
                        <button
                          onClick={() => startConvertingFixture(f)}
                          disabled={!canCreate}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <span>⚽</span> Log Result
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500 italic py-1">Result Recorded</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditFixtureModal(f)}
                          disabled={!canEdit}
                          title="Edit Fixture / Reschedule"
                          className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingFixture(f)}
                          disabled={!canDelete}
                          title="Delete / Cancel Fixture"
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg text-xs border border-rose-800/40 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: COMPLETED MATCHES & RESULTS */}
      {/* ======================================================== */}
      {subView === 'matches' && (
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
              <span className="text-4xl">🏆</span>
              <h3 className="text-base font-bold text-white mt-3">No Matches Found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                No completed matches found matching your filters. Convert a fixture or click "Log Match Result" to record one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((m) => {
                const isWin = m.result === 'WIN';
                const isDraw = m.result === 'DRAW';

                return (
                  <div
                    key={m.id}
                    className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl p-4 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Tournament badge & date */}
                      <div className="min-w-[190px]">
                        <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {m.tournamentName || 'Tournament'}
                        </span>
                        <div className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2">
                          <span>🗓 {m.date}</span>
                          <span>⏰ {m.time} BST</span>
                        </div>
                      </div>

                      {/* Middle: Club vs Opponent Scoreline */}
                      <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4 bg-zinc-950/70 py-2.5 px-4 rounded-xl border border-zinc-800/60 max-w-lg mx-auto lg:mx-0">
                        {/* Club */}
                        <div className="flex-1 text-right flex items-center justify-end gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-black text-white block truncate">{m.clubName || 'BD Power Strikers'}</span>
                            <span className="block text-[10px] text-amber-400 font-bold uppercase">{m.homeAway}</span>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-amber-500/40 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_6px_rgba(245,158,11,0.2)]">
                            <img
                              src={m.clubLogo || '/logo.svg'}
                              alt={m.clubName || 'BD Power Strikers'}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Score Display */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">
                          <span className="text-lg font-black text-white font-mono">{m.scoreClub}</span>
                          <span className="text-xs font-black text-zinc-500">-</span>
                          <span className="text-lg font-black text-white font-mono">{m.scoreOpponent}</span>
                        </div>

                        {/* Opponent */}
                        <div className="flex-1 text-left flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={m.opponentLogo || '/opponent-logos/generic-opponent.svg'}
                              alt={m.opponentClub}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-white block truncate">{m.opponentClub}</span>
                            <span className="block text-[10px] text-zinc-500">OVR {m.opponentStrength}</span>
                          </div>
                        </div>

                        {/* Result Badge */}
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            isWin
                              ? 'bg-emerald-500 text-zinc-950 font-black'
                              : isDraw
                              ? 'bg-amber-500 text-zinc-950 font-black'
                              : 'bg-rose-500 text-white font-black'
                          }`}
                        >
                          {m.result}
                        </span>
                      </div>

                      {/* Right: MOTM & Granular Stat Summary */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 min-w-[240px]">
                        <div className="text-right">
                          {m.motmPlayerName && (
                            <div className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                              <span>⭐ MOTM:</span>
                              <span>{m.motmPlayerName}</span>
                            </div>
                          )}
                          <div className="text-[11px] text-zinc-500">
                            {m.playerStats?.length || 0} Player Records Logged
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditMatchModal(m)}
                            disabled={!canEdit}
                            className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                            title="Edit Match Details & Player Stats"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeletingMatch(m)}
                            disabled={!canDelete}
                            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg text-xs border border-rose-800/40 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Match Record"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Granular Player Performance Accordion / Summary */}
                    {m.playerStats && m.playerStats.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2 items-center text-xs">
                        <span className="text-[10px] font-bold uppercase text-zinc-500">Performances:</span>
                        {m.playerStats.map((ps) => {
                          const player = players.find(p => p.id === ps.playerId);
                          return (
                            <div
                              key={ps.id || ps.playerId}
                              className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] flex items-center gap-1.5"
                            >
                              <span className="font-bold text-zinc-200">
                                {player ? player.gamingName : ps.playerId}
                              </span>
                              {ps.goals > 0 && (
                                <span className="text-emerald-400 font-bold">⚽{ps.goals}</span>
                              )}
                              {ps.assists > 0 && (
                                <span className="text-cyan-400 font-bold">🎯{ps.assists}</span>
                              )}
                              {ps.cleanSheet && (
                                <span className="text-amber-400 font-bold">🧤CS</span>
                              )}
                              {(ps.yellowCards || 0) > 0 && (
                                <span className="text-amber-300 font-bold">🟨{ps.yellowCards}</span>
                              )}
                              {(ps.redCards || 0) > 0 && (
                                <span className="text-rose-500 font-bold">🟥{ps.redCards}</span>
                              )}
                              <span className="text-[10px] text-zinc-500 font-mono">
                                ({ps.performanceScore?.toFixed(1) || '7.0'})
                              </span>
                              {ps.motm && <span className="text-amber-400">⭐</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT UPCOMING FIXTURE */}
      {/* ======================================================== */}
      {isFixtureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    {editingFixture ? 'Modify Scheduled Fixture' : 'Schedule Upcoming Match Fixture'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Configure official tournament matchup, venue platform, and stream details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFixtureModalOpen(false)}
                className="text-zinc-500 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFixture} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tournament */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tournament / League *</label>
                  <select
                    value={fixTournamentId}
                    onChange={(e) => setFixTournamentId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.tier})</option>
                    ))}
                  </select>
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Stage / Round *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Group Stage - Matchday 1 or Quarter-Final"
                    value={fixStage}
                    onChange={(e) => setFixStage(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Home Team */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Home Team (Our Club)</span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                      <span>🛡️</span> Default Crest Populated
                    </span>
                  </label>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-950 border border-amber-500/40 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/40 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                      <img
                        src={fixHomeTeamLogo || '/logo.svg'}
                        alt="BD Power Strikers Crest"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <input
                      type="text"
                      value={fixHomeTeam}
                      onChange={(e) => setFixHomeTeam(e.target.value)}
                      placeholder="BD Power Strikers"
                      className="flex-1 bg-transparent border-0 text-xs font-black text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Away Team (Opponent) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Away Team / Opponent Club *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka Titans Esports"
                    value={fixAwayTeam}
                    onChange={(e) => setFixAwayTeam(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Opponent Club Logo */}
                <div className="sm:col-span-2">
                  <OpponentLogoUploader
                    label="Opponent Club Logo / Shield"
                    helperText="Upload official club crest (PNG, JPG, SVG) or pick a regional esports preset"
                    value={fixOpponentLogo}
                    onChange={setFixOpponentLogo}
                    opponentName={fixAwayTeam}
                    onSelectOpponentName={setFixAwayTeam}
                    accentColor="emerald"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Match Date *</label>
                  <input
                    type="date"
                    required
                    value={fixDate}
                    onChange={(e) => setFixDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* BST Time */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">BST Time (Bangladesh Standard) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      required
                      value={fixTime}
                      onChange={(e) => setFixTime(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="px-2.5 py-2 bg-zinc-800 text-[10px] font-black text-emerald-400 rounded-xl">
                      BST
                    </span>
                  </div>
                </div>

                {/* Venue / Platform */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Venue / Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. Discord Live Arena 1 / Mobile Lobby"
                    value={fixVenue}
                    onChange={(e) => setFixVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Fixture Status */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Status</label>
                  <select
                    value={fixStatus}
                    onChange={(e) => setFixStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                    <option value="LIVE">LIVE (Ongoing Right Now)</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="POSTPONED">POSTPONED (Rescheduling)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {/* Stream / Broadcast Link */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Stream / Broadcast Link</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/live/..."
                    value={fixStreamUrl}
                    onChange={(e) => setFixStreamUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Room Link or Code */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">eFootball Match Room / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ROOM-8829-BD or discord.gg/..."
                    value={fixRoomCode}
                    onChange={(e) => setFixRoomCode(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Lineup Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Assigned Athletes / Lineup
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  {players.map((p) => {
                    const isSelected = fixLineup.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFixLineup([...fixLineup, p.id]);
                            } else {
                              setFixLineup(fixLineup.filter(id => id !== p.id));
                            }
                          }}
                          className="accent-emerald-500 rounded"
                        />
                        <span className="truncate">{p.gamingName} ({p.position})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Additional match guidelines, room settings, or jersey colors..."
                  value={fixNotes}
                  onChange={(e) => setFixNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFixtureModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? 'Saving...' : editingFixture ? 'Update Fixture' : 'Schedule Fixture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: LOG MATCH RESULT / CONVERT FIXTURE */}
      {/* ======================================================== */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚽</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    {convertingFixture
                      ? `Record Match Result (Converting Fixture vs ${formOpponent})`
                      : editingMatch
                      ? `Edit Match Record vs ${editingMatch.opponentClub}`
                      : 'Log New Match Result & Detailed Scores'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Entering final scores triggers the rating engine to recalculate player stats and systemic leaderboards.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="text-zinc-500 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-5 mt-4">
              {/* SECTION: Match Basic Details */}
              <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-4">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  1. Match Setup & Final Scoreline
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Tournament *</label>
                    <select
                      value={formTournamentId}
                      onChange={(e) => setFormTournamentId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    >
                      {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Season *</label>
                    <select
                      value={formSeasonId}
                      onChange={(e) => setFormSeasonId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    >
                      {seasons.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Team Matchup: Our Club with default crest vs Opponent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                  {/* Our Club Identity (Auto-populated with default club logo & name) */}
                  <div>
                    <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Our Club Identity *</span>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <span>🛡️</span> Default Crest Populated
                      </span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-950 border border-amber-500/40 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                        <img
                          src={formClubLogo || '/logo.svg'}
                          alt="BD Power Strikers Crest"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={formClubName}
                        onChange={(e) => setFormClubName(e.target.value)}
                        placeholder="BD Power Strikers"
                        className="flex-1 bg-transparent border-0 text-xs font-black text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Opponent Club */}
                  <div>
                    <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-1">
                      Opponent Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chittagong Mariners"
                      value={formOpponent}
                      onChange={(e) => setFormOpponent(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl text-xs font-bold text-white outline-none"
                    />
                  </div>
                </div>

                {/* Opponent Club Logo Upload & Preset Selection */}
                <OpponentLogoUploader
                  label="Opponent Club Logo / Shield"
                  helperText="Upload official opponent club badge (PNG, JPG, SVG) or select a regional preset"
                  value={formOpponentLogo}
                  onChange={setFormOpponentLogo}
                  opponentName={formOpponent}
                  onSelectOpponentName={setFormOpponent}
                  accentColor="amber"
                />

                {/* Score Section */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <label className="block text-xs font-black text-emerald-400 mb-1 uppercase">
                      BDPSC Goals *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formScoreClub}
                      onChange={(e) => setFormScoreClub(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-emerald-500/40 rounded-xl text-lg font-mono font-black text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-rose-400 mb-1 uppercase">
                      Opponent Goals *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formScoreOpponent}
                      onChange={(e) => setFormScoreOpponent(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-rose-500/40 rounded-xl text-lg font-mono font-black text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Half-Time Score</label>
                    <input
                      type="text"
                      placeholder="e.g. 1-0"
                      value={formHalfTimeScore}
                      onChange={(e) => setFormHalfTimeScore(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Calculated Outcome</label>
                    <div className="px-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          formScoreClub > formScoreOpponent
                            ? 'text-emerald-400'
                            : formScoreClub < formScoreOpponent
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {formScoreClub > formScoreOpponent ? '🏆 VICTORY (WIN)' : formScoreClub < formScoreOpponent ? '❌ DEFEAT (LOSS)' : '🤝 DRAW'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">BST Time</label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Venue Type</label>
                    <select
                      value={formHomeAway}
                      onChange={(e) => setFormHomeAway(e.target.value as HomeAway)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    >
                      <option value="HOME">HOME</option>
                      <option value="AWAY">AWAY</option>
                      <option value="NEUTRAL">NEUTRAL</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Granular Player Performance Logs */}
              <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                      2. Granular Player Performance Logs
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Record goals, assists, clean sheets, cards (🟨/🟥), saves, and MOTM honors.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPlayerPerformanceRow}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>➕</span> Add Player Row
                  </button>
                </div>

                {playerPerformances.length === 0 ? (
                  <div className="p-6 text-center bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-zinc-500">
                    No individual player stats added. Click "Add Player Row" to log athlete performances.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playerPerformances.map((perf, index) => {
                      const isMotm = perf.playerId === formMotmPlayerId;

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-xl border transition-all ${
                            isMotm
                              ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                              : 'bg-zinc-900/90 border-zinc-800'
                          }`}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center">
                            {/* Athlete Selection */}
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">
                                Athlete
                              </label>
                              <select
                                value={perf.playerId}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].playerId = e.target.value;
                                  setPlayerPerformances(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                              >
                                {players.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.gamingName} ({p.position} - #{p.jerseyNumber})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Goals */}
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">
                                Goals
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={perf.goals}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].goals = parseInt(e.target.value) || 0;
                                  setPlayerPerformances(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white text-center font-bold"
                              />
                            </div>

                            {/* Assists */}
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">
                                Ast
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={perf.assists}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].assists = parseInt(e.target.value) || 0;
                                  setPlayerPerformances(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white text-center font-bold"
                              />
                            </div>

                            {/* Yellow Cards */}
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] text-amber-400 font-bold uppercase mb-0.5">
                                🟨
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="2"
                                value={perf.yellowCards}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].yellowCards = parseInt(e.target.value) || 0;
                                  setPlayerPerformances(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white text-center"
                              />
                            </div>

                            {/* Red Cards */}
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] text-rose-500 font-bold uppercase mb-0.5">
                                🟥
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="1"
                                value={perf.redCards}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].redCards = parseInt(e.target.value) || 0;
                                  setPlayerPerformances(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white text-center"
                              />
                            </div>

                            {/* Clean Sheet */}
                            <div className="sm:col-span-1 text-center">
                              <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">
                                CS
                              </label>
                              <input
                                type="checkbox"
                                checked={perf.cleanSheet}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].cleanSheet = e.target.checked;
                                  setPlayerPerformances(updated);
                                }}
                                className="mt-1 accent-emerald-500 h-4 w-4 rounded"
                              />
                            </div>

                            {/* Rating (1.0 - 10.0) */}
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">
                                Rating (1-10)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                min="1.0"
                                max="10.0"
                                value={perf.performanceScore}
                                onChange={(e) => {
                                  const updated = [...playerPerformances];
                                  updated[index].performanceScore = parseFloat(e.target.value) || 7.0;
                                  setPlayerPerformances(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white text-center font-mono font-bold"
                              />
                            </div>

                            {/* MOTM Button */}
                            <div className="sm:col-span-1 text-center">
                              <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">
                                MOTM
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (formMotmPlayerId === perf.playerId) {
                                    setFormMotmPlayerId('');
                                  } else {
                                    setFormMotmPlayerId(perf.playerId);
                                  }
                                }}
                                className={`p-1 rounded text-xs transition-colors ${
                                  isMotm
                                    ? 'bg-amber-500 text-zinc-950 font-black'
                                    : 'text-zinc-600 hover:text-amber-400 bg-zinc-950'
                                }`}
                                title="Award Man of the Match"
                              >
                                ⭐
                              </button>
                            </div>

                            {/* Remove row */}
                            <div className="sm:col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => removePlayerPerformanceRow(index)}
                                className="text-zinc-500 hover:text-rose-400 p-1 text-xs"
                                title="Remove row"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: Match Report & Media */}
              <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">
                  3. Match Narrative & Media Proof
                </h4>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Match Report / Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the match flow, tactical adjustments, and standout plays..."
                    value={formMatchReport}
                    onChange={(e) => setFormMatchReport(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="space-y-3">
                  <FileAttachmentUpload
                    label="Official Match Score Screenshot Proof"
                    sublabel="Drag & drop post-match results screenshot, paste from clipboard (Ctrl+V), or browse image"
                    value={formMatchScreenshot}
                    onChange={setFormMatchScreenshot}
                    folder="matches"
                    accentColor="cyan"
                    placeholder="https://images.unsplash.com/... or paste screenshot link"
                  />

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Highlights / Video URL (YouTube, Twitch, Stream)</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formMatchVideo}
                      onChange={(e) => setFormMatchVideo(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? 'Recording...' : editingMatch ? 'Update Match & Recalculate' : 'Save Match & Trigger Rankings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SAFEGUARD MODAL: DELETE / CANCEL FIXTURE */}
      {/* ======================================================== */}
      {deletingFixture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-black uppercase tracking-wider">
                Cancel Fixture Safeguard
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Are you sure you want to cancel and remove the scheduled fixture between{' '}
              <strong className="text-white">{deletingFixture.homeTeam || 'BD Power Strikers'}</strong> and{' '}
              <strong className="text-white">{deletingFixture.opponent}</strong> on{' '}
              <span className="text-emerald-400 font-mono">{deletingFixture.date}</span>?
            </p>
            <p className="text-[11px] text-zinc-500 mb-5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              🛡️ Safeguard: This action will cancel the upcoming game notification and record a cancellation entry in the audit logs.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingFixture(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-colors cursor-pointer"
              >
                Keep Fixture
              </button>
              <button
                type="button"
                onClick={handleDeleteFixtureConfirm}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Fixture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SAFEGUARD MODAL: DELETE MATCH RECORD */}
      {/* ======================================================== */}
      {deletingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <span className="text-2xl">🚨</span>
              <h3 className="text-base font-black uppercase tracking-wider">
                Delete Match Record
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              CRITICAL: Deleting the match record vs{' '}
              <strong className="text-white">{deletingMatch.opponentClub}</strong> ({deletingMatch.scoreClub}-{deletingMatch.scoreOpponent})
              will immediately trigger a systemic recalculation of all player statistics, goal tallies, and weekly/seasonal leaderboard rankings.
            </p>
            <p className="text-[11px] text-amber-400/90 mb-5 bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30">
              ⚡ Action will remove all associated player performance logs ({deletingMatch.playerStats?.length || 0} records) and re-index the leaderboard.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMatch(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMatchConfirm}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {loading ? 'Processing...' : 'Confirm Match Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
