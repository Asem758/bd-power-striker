import React, { useState } from 'react';
import { 
  Shield, 
  PlusCircle, 
  UserPlus, 
  Sliders, 
  RefreshCw, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Trash2,
  Calendar,
  Star
} from 'lucide-react';
import { Player, Tournament, Season, RatingConfig } from '../types';
import { 
  createMatch, 
  createPlayer, 
  updateRatingConfig, 
  recalculateAll, 
  resetToSeedData 
} from '../services/api';
import { OpponentLogoUploader } from './admin/common/OpponentLogoUploader';

interface AdminViewProps {
  players: Player[];
  tournaments: Tournament[];
  seasons: Season[];
  ratingConfig: RatingConfig;
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  players,
  tournaments,
  seasons,
  ratingConfig,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'add-match' | 'add-player' | 'formula-tuning'>('add-match');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // --- MATCH FORM STATE ---
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id || '');
  const [seasonId, setSeasonId] = useState(seasons[0]?.id || '');
  const [opponentClub, setOpponentClub] = useState('');
  const [opponentLogo, setOpponentLogo] = useState('');
  const [scoreClub, setScoreClub] = useState<number>(0);
  const [scoreOpponent, setScoreOpponent] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('21:00');
  const [homeAway, setHomeAway] = useState<'HOME' | 'AWAY' | 'NEUTRAL'>('HOME');
  const [matchReport, setMatchReport] = useState('');
  const [motmPlayerId, setMotmPlayerId] = useState<string>('');
  const [matchVideoUrl, setMatchVideoUrl] = useState('');
  
  // Player stats row entries for the new match
  const [participatingPlayerStats, setParticipatingPlayerStats] = useState<
    Array<{
      playerId: string;
      goals: number;
      assists: number;
      cleanSheet: boolean;
      saves: number;
      performanceScore: number;
    }>
  >(
    players.slice(0, 3).map(p => ({
      playerId: p.id,
      goals: 0,
      assists: 0,
      cleanSheet: false,
      saves: 0,
      performanceScore: 7.5,
    }))
  );

  // --- PLAYER FORM STATE ---
  const [pName, setPName] = useState('');
  const [pGamingName, setPGamingName] = useState('');
  const [pEfootballId, setPEfootballId] = useState('');
  const [pJersey, setPJersey] = useState<number>(10);
  const [pPosition, setPPosition] = useState<string>('CF');
  const [pPhoto, setPPhoto] = useState('');
  const [pBio, setPBio] = useState('');
  const [pPlaystyle, setPPlaystyle] = useState('Goal Poacher');

  // --- RATING CONFIG STATE ---
  const [cfg, setCfg] = useState<RatingConfig>({ ...ratingConfig });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Submit New Match
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponentClub.trim()) {
      showFeedback('error', 'Please enter the Opponent Club name.');
      return;
    }
    const result = scoreClub > scoreOpponent ? 'WIN' : scoreClub === scoreOpponent ? 'DRAW' : 'LOSS';
    const selTournament = tournaments.find(t => t.id === tournamentId);
    const motmPlayer = players.find(p => p.id === motmPlayerId);

    setLoading(true);
    try {
      await createMatch({
        tournamentId,
        tournamentName: selTournament?.name || 'Championship Match',
        seasonId,
        clubName: 'BD Power Strikers',
        clubLogo: '/logo.svg',
        opponentClub: opponentClub.trim(),
        opponentLogo: opponentLogo.trim() || undefined,
        scoreClub: Number(scoreClub),
        scoreOpponent: Number(scoreOpponent),
        result,
        date,
        time,
        homeAway,
        motmPlayerId: motmPlayerId || undefined,
        motmPlayerName: motmPlayer ? motmPlayer.gamingName : undefined,
        matchReport,
        matchVideoUrl: matchVideoUrl || undefined,
        playerStats: participatingPlayerStats.map((ps, idx) => ({
          id: `pms-${Date.now()}-${idx}`,
          matchId: '',
          playerId: ps.playerId,
          goals: ps.goals,
          assists: ps.assists,
          cleanSheet: ps.cleanSheet,
          saves: ps.saves,
          conceded: 0,
          minutesPlayed: 90,
          performanceScore: ps.performanceScore,
          motm: ps.playerId === motmPlayerId,
        })),
      });

      showFeedback('success', `Match vs ${opponentClub} recorded successfully! Player statistics and ratings recalculated.`);
      setOpponentClub('');
      setOpponentLogo('');
      setScoreClub(0);
      setScoreOpponent(0);
      setMatchReport('');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to record match');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit New Player
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pGamingName.trim()) {
      showFeedback('error', 'Player real name and gaming name are required.');
      return;
    }

    setLoading(true);
    try {
      await createPlayer({
        name: pName.trim(),
        gamingName: pGamingName.trim(),
        efootballId: pEfootballId.trim() || `BDPSC-${Math.floor(100 + Math.random() * 900)}`,
        jerseyNumber: Number(pJersey),
        position: pPosition as any,
        photoUrl: pPhoto.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        status: 'ACTIVE',
        bio: pBio.trim() || 'Official registered athlete for BD Power Strikers Club.',
        playstyle: pPlaystyle,
        preferredPlatform: 'Mobile',
      });

      showFeedback('success', `Player ${pGamingName} registered successfully!`);
      setPName('');
      setPGamingName('');
      setPEfootballId('');
      setPPhoto('');
      setPBio('');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to create player');
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Formula Config
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await updateRatingConfig(cfg);
      showFeedback('success', 'Rating algorithm weights updated and all squad rankings synchronized!');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  // 4. Force Recalculate
  const handleRecalculate = async () => {
    setLoading(true);
    try {
      await recalculateAll();
      showFeedback('success', 'All ratings, records, clean sheets, and rankings recalculated!');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to recalculate');
    } finally {
      setLoading(false);
    }
  };

  // 5. Reset to Seed
  const handleReset = async () => {
    setLoading(true);
    try {
      await resetToSeedData();
      showFeedback('success', 'Database successfully reset to official BDPSC baseline seed.');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CLUB MANAGEMENT PORTAL
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Match score logging, roster management, automated rating engine calibration, and database synchronization.
          </p>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50"
            title="Recalculate all rankings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>RECALCULATE ALL</span>
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            title="Reset to official seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET SEED</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in duration-150 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('add-match')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'add-match' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>LOG COMPETITIVE MATCH</span>
        </button>
        <button
          onClick={() => setActiveTab('add-player')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'add-player' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>REGISTER SQUAD MEMBER</span>
        </button>
        <button
          onClick={() => setActiveTab('formula-tuning')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'formula-tuning' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>RATING ENGINE TUNING</span>
        </button>
      </div>

      {/* 1. LOG MATCH FORM */}
      {activeTab === 'add-match' && (
        <form onSubmit={handleCreateMatch} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Log Competitive Match Result
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Recording this match will immediately recalculate participating players' goals, assists, clean sheets, power ratings, and overall leaderboard standing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Tournament */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Tournament</label>
              <select
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.tier})</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Season</label>
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              >
                {seasons.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Our Club Identity */}
            <div>
              <label className="text-xs font-bold text-amber-400 uppercase block mb-1.5 flex items-center justify-between">
                <span>Our Club Name *</span>
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <span>🛡️</span> Default Crest Populated
                </span>
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                  <img src="/logo.svg" alt="BD Power Strikers" className="w-full h-full object-contain" />
                </div>
                <input
                  type="text"
                  readOnly
                  value="BD POWER STRIKERS"
                  className="flex-1 bg-transparent border-0 text-xs font-black text-white focus:outline-none cursor-default"
                />
              </div>
            </div>

            {/* Opponent */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Opponent Club</label>
              <input
                type="text"
                required
                value={opponentClub}
                onChange={(e) => setOpponentClub(e.target.value)}
                placeholder="e.g. Dhaka Titans Esports"
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Opponent Club Logo */}
            <div className="sm:col-span-2">
              <OpponentLogoUploader
                label="Opponent Club Logo"
                helperText="Upload official opponent club badge or choose from esports presets"
                value={opponentLogo}
                onChange={setOpponentLogo}
                opponentName={opponentClub}
                onSelectOpponentName={setOpponentClub}
                accentColor="amber"
              />
            </div>

            {/* Scores */}
            <div className="flex space-x-2">
              <div className="w-1/2">
                <label className="text-xs font-bold text-amber-400 uppercase block mb-1.5">BDPSC Score</label>
                <input
                  type="number"
                  min="0"
                  value={scoreClub}
                  onChange={(e) => setScoreClub(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-black text-center text-sm rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="w-1/2">
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Opponent Score</label>
                <input
                  type="number"
                  min="0"
                  value={scoreOpponent}
                  onChange={(e) => setScoreOpponent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-black text-center text-sm rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex space-x-2">
              <div className="w-1/2">
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="w-1/2">
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Time (BST)</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="21:00"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* MOTM */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Man of the Match</label>
              <select
                value={motmPlayerId}
                onChange={(e) => setMotmPlayerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              >
                <option value="">None / Unassigned</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.gamingName} ({p.name})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Participating Players Matrix */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Participating Squad Performance Entries
              </h3>
              <button
                type="button"
                onClick={() => {
                  const unusedPlayer = players.find(p => !participatingPlayerStats.some(ps => ps.playerId === p.id));
                  if (unusedPlayer) {
                    setParticipatingPlayerStats([
                      ...participatingPlayerStats,
                      {
                        playerId: unusedPlayer.id,
                        goals: 0,
                        assists: 0,
                        cleanSheet: false,
                        saves: 0,
                        performanceScore: 7.0,
                      }
                    ]);
                  }
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                + Add Another Player to Match
              </button>
            </div>

            <div className="space-y-2">
              {participatingPlayerStats.map((ps, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                  <select
                    value={ps.playerId}
                    onChange={(e) => {
                      const copy = [...participatingPlayerStats];
                      copy[idx].playerId = e.target.value;
                      setParticipatingPlayerStats(copy);
                    }}
                    className="flex-1 min-w-[140px] bg-slate-900 border border-slate-700 text-white font-bold p-1.5 rounded-lg"
                  >
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.gamingName} ({p.position})</option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-500 font-bold">Goals:</span>
                    <input
                      type="number"
                      min="0"
                      value={ps.goals}
                      onChange={(e) => {
                        const copy = [...participatingPlayerStats];
                        copy[idx].goals = Number(e.target.value);
                        setParticipatingPlayerStats(copy);
                      }}
                      className="w-12 bg-slate-900 border border-slate-700 text-center font-bold text-amber-400 p-1 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-500 font-bold">Assists:</span>
                    <input
                      type="number"
                      min="0"
                      value={ps.assists}
                      onChange={(e) => {
                        const copy = [...participatingPlayerStats];
                        copy[idx].assists = Number(e.target.value);
                        setParticipatingPlayerStats(copy);
                      }}
                      className="w-12 bg-slate-900 border border-slate-700 text-center font-bold text-white p-1 rounded-lg"
                    />
                  </div>

                  <label className="flex items-center space-x-1 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ps.cleanSheet}
                      onChange={(e) => {
                        const copy = [...participatingPlayerStats];
                        copy[idx].cleanSheet = e.target.checked;
                        setParticipatingPlayerStats(copy);
                      }}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-[11px]">Clean Sheet</span>
                  </label>

                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-500 font-bold">Rating:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={ps.performanceScore}
                      onChange={(e) => {
                        const copy = [...participatingPlayerStats];
                        copy[idx].performanceScore = Number(e.target.value);
                        setParticipatingPlayerStats(copy);
                      }}
                      className="w-14 bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white p-1 rounded-lg"
                    />
                  </div>

                  {participatingPlayerStats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setParticipatingPlayerStats(participatingPlayerStats.filter((_, i) => i !== idx));
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Match Report & Video URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Match Report Narrative</label>
              <textarea
                rows={3}
                value={matchReport}
                onChange={(e) => setMatchReport(e.target.value)}
                placeholder="Tactical summary, clutch goals, key defensive stops..."
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Stream / Video Highlight URL</label>
              <input
                type="text"
                value={matchVideoUrl}
                onChange={(e) => setMatchVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'SAVING & RECALCULATING...' : 'SAVE MATCH & UPDATE STATS'}
            </button>
          </div>
        </form>
      )}

      {/* 2. ADD SQUAD MEMBER FORM */}
      {activeTab === 'add-player' && (
        <form onSubmit={handleCreatePlayer} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Register New Club Athlete
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adds player to the official active squad and generates their baseline rating and digital card profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Real Full Name</label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="e.g. Tanvir Hasan"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Gaming / eFootball Alias</label>
              <input
                type="text"
                required
                value={pGamingName}
                onChange={(e) => setPGamingName(e.target.value)}
                placeholder="e.g. TANVIR_STRIKER"
                className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-xs font-black rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">eFootball User ID</label>
              <input
                type="text"
                value={pEfootballId}
                onChange={(e) => setPEfootballId(e.target.value)}
                placeholder="e.g. BDPSC-889"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Jersey Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={pJersey}
                onChange={(e) => setPJersey(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Position</label>
              <select
                value={pPosition}
                onChange={(e) => setPPosition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              >
                {['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'].map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Playstyle</label>
              <input
                type="text"
                value={pPlaystyle}
                onChange={(e) => setPPlaystyle(e.target.value)}
                placeholder="e.g. Goal Poacher, Creative Playmaker"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Player Photo Direct Image URL</label>
            <input
              type="text"
              value={pPhoto}
              onChange={(e) => setPPhoto(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Player Biography & Background</label>
            <textarea
              rows={3}
              value={pBio}
              onChange={(e) => setPBio(e.target.value)}
              placeholder="Competitive history, strengths, achievements..."
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'REGISTERING...' : 'REGISTER ATHLETE'}
            </button>
          </div>
        </form>
      )}

      {/* 3. FORMULA TUNING */}
      {activeTab === 'formula-tuning' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Rating Engine Weights & Multipliers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize the mathematical coefficients governing the automatic generation of OVR scores.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Base Rating Floor</label>
              <input
                type="number"
                value={cfg.baseRating}
                onChange={(e) => setCfg({ ...cfg, baseRating: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 text-center"
              />
              <p className="text-[11px] text-slate-500">Minimum rating assigned before match contributions.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Win Rate Weight</label>
              <input
                type="number"
                step="0.01"
                value={cfg.winWeight}
                onChange={(e) => setCfg({ ...cfg, winWeight: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 text-center"
              />
              <p className="text-[11px] text-slate-500">Multiplier applied to squad member win rate %.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Goal Weight</label>
              <input
                type="number"
                step="0.01"
                value={cfg.goalWeight}
                onChange={(e) => setCfg({ ...cfg, goalWeight: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 text-center"
              />
              <p className="text-[11px] text-slate-500">Points earned per competitive goal scored.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Assist Weight</label>
              <input
                type="number"
                step="0.01"
                value={cfg.assistWeight}
                onChange={(e) => setCfg({ ...cfg, assistWeight: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 text-center"
              />
              <p className="text-[11px] text-slate-500">Points earned per key assist delivered.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase">Clean Sheet Weight</label>
              <input
                type="number"
                step="0.01"
                value={cfg.cleanSheetWeight}
                onChange={(e) => setCfg({ ...cfg, cleanSheetWeight: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 text-center"
              />
              <p className="text-[11px] text-slate-500">Points earned per defensive clean sheet match.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase">MOTM Weight</label>
              <input
                type="number"
                step="0.05"
                value={cfg.motmWeight}
                onChange={(e) => setCfg({ ...cfg, motmWeight: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 text-center"
              />
              <p className="text-[11px] text-slate-500">Points awarded per Man of the Match honor.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'CALIBRATING...' : 'APPLY ENGINE WEIGHTS & RECALCULATE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
