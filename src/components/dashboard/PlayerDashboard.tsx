import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Player, Match, Award, Trophy } from '../../types';
import * as authService from '../../services/authService';
import { Camera, Upload, Users } from 'lucide-react';

export const PlayerDashboard: React.FC<{ 
  onNavigateToAdmin?: () => void;
  onNavigate?: (view: string, idOrSlug?: string) => void;
}> = ({ onNavigateToAdmin, onNavigate }) => {
  const { user, isAdmin, hasPermission, openPhotoModal } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'matches' | 'card' | 'awards' | 'progression' | 'settings'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<authService.PlayerStatsResponse | null>(null);

  // Settings form
  const [bio, setBio] = useState('');
  const [preferredPlatform, setPreferredPlatform] = useState('Mobile');
  const [playstyle, setPlaystyle] = useState('Possession Game');
  const [favoriteTeam, setFavoriteTeam] = useState('FC Barcelona');
  const [socialHandle, setSocialHandle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadStats() {
      if (!user?.playerId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await authService.getMyPlayerStats();
        setStatsData(data);
        if (data.player) {
          setBio(data.player.bio || '');
          setPreferredPlatform(data.player.preferredPlatform || 'Mobile');
          setPlaystyle(data.player.playstyle || 'Possession Game');
          setFavoriteTeam(data.player.favoriteTeam || '');
          setSocialHandle(data.player.socialHandle || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load athlete statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user?.playerId]);

  const handleUpdateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.updateMyPlayerBio({
        bio,
        preferredPlatform,
        playstyle,
        favoriteTeam,
        socialHandle,
      });
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Could not update bio');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <h2 className="text-xl font-black text-white mb-2">Authentication Required</h2>
          <p className="text-xs text-zinc-400">Please sign in to view your private Player Dashboard.</p>
        </div>
      </div>
    );
  }

  // Case: User is authenticated but NOT linked to an official BDPSC Athlete Profile
  if (!user.playerId || !statsData?.player) {
    return (
      <div className="min-h-[75vh] py-12 px-4 max-w-5xl mx-auto">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Interactive Profile Photo */}
          <div className="relative inline-block mb-4 group cursor-pointer" onClick={openPhotoModal}>
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-400 shadow-xl shadow-amber-500/15 group-hover:scale-105 transition-transform">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={user.name}
                className="w-full h-full rounded-full object-cover bg-zinc-950"
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPhotoModal();
              }}
              className="absolute bottom-0 right-0 p-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-full shadow-lg border-2 border-zinc-950 transition hover:scale-110 flex items-center justify-center"
              title="Upload profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-8">
            You are currently signed in as a <span className="text-amber-400 font-bold">Registered Club Member</span>. 
            Official match statistics, career ratings, and the Digital Player Card are available once your account is connected to an active BDPSC Roster Athlete profile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8 text-left">
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-1">
                Account Status
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Member
              </span>
              <p className="text-[11px] text-zinc-500 mt-2">Verified BD Power Strikers Community member.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-1">
                Assigned Roles
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles.map(r => (
                  <span key={r.id} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded">
                    {r.displayName}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">Manage club community & participate in open ladders.</p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-1">
                Athlete Link
              </span>
              <span className="text-zinc-400 text-xs">Unlinked</span>
              <p className="text-[11px] text-zinc-500 mt-2">Club management can link your eFootball ID in the Admin Panel.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={openPhotoModal}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Upload Profile Photo</span>
            </button>

            {isAdmin && onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-400/30 font-black text-xs uppercase tracking-wider rounded-xl transition"
              >
                Open Admin Panel
              </button>
            )}
            <button
              type="button"
              id="browse-active-club-roster-btn"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('players');
                } else {
                  window.location.href = '/players';
                }
              }}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Browse Active Club Roster</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const player = statsData.player;
  const ratingBreakdown = statsData.ratingBreakdown || {};
  const matches = statsData.matches || [];
  const awards = statsData.awards || [];
  const trophies = statsData.trophies || [];

  return (
    <div className="min-h-screen pb-16 pt-6 px-4 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden shadow-2xl">
        {/* Background esports ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Player Photo with Jersey Number Badge & Camera Button */}
          <div className="relative group shrink-0">
            <div 
              className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-xl bg-zinc-950 cursor-pointer relative group/img aspect-square ring-4 ring-amber-400/20"
              onClick={openPhotoModal}
              title="Click to update profile photo"
            >
              <img
                src={player.photoUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={player.name}
                className="w-full h-full rounded-full object-cover group-hover/img:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white font-bold text-xs">
                <Camera className="w-5 h-5 text-amber-400" />
                <span>Change Photo</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-gradient-to-br from-amber-400 to-amber-500 text-zinc-950 font-black text-xs md:text-sm px-2.5 py-1 rounded-full shadow-lg border border-amber-300">
              #{player.jerseyNumber}
            </div>
            <button
              type="button"
              onClick={openPhotoModal}
              className="absolute -top-1 -right-1 p-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded-full border border-amber-400/60 shadow-lg hover:scale-110 transition flex items-center justify-center"
              title="Update photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Player Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                Official Roster Athlete
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-bold">
                {player.position}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] font-mono">
                ID: {player.efootballId}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              {player.gamingName}
            </h1>
            <p className="text-base text-zinc-400 font-medium">{player.name}</p>

            <p className="text-xs text-zinc-400 mt-2 max-w-2xl italic">
              "{player.bio || 'Proud member of BD Power Strikers Club eFootball elite division.'}"
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Preferred: <strong className="text-white">{player.preferredPlatform || 'Mobile'}</strong>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                Playstyle: <strong className="text-white">{player.playstyle || 'Possession'}</strong>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                Joined: <strong className="text-white">{player.joinDate}</strong>
              </span>
            </div>
          </div>

          {/* Official Rating & Rank Showcase Block */}
          <div className="shrink-0 flex md:flex-col gap-3 justify-center">
            <div className="bg-zinc-950/90 border border-amber-500/30 p-4 rounded-2xl text-center min-w-[120px] shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                Club Rating
              </span>
              <span className="text-3xl md:text-4xl font-black text-amber-400 tracking-tight">
                {player.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Official Score</span>
            </div>

            <div className="bg-zinc-950/90 border border-emerald-500/30 p-4 rounded-2xl text-center min-w-[120px] shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                Club Rank
              </span>
              <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                #{player.overallRank}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                {player.rankMovement === 'UP' && '▲ Climbed'}
                {player.rankMovement === 'DOWN' && '▼ Dropped'}
                {player.rankMovement === 'SAME' && '◆ Stable'}
                {player.rankMovement === 'NEW' && '★ New Entry'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-zinc-800 pb-3 mb-8 no-scrollbar">
        {[
          { id: 'overview', label: '📊 Statistics Overview', count: null },
          { id: 'matches', label: '⚔️ Match History', count: matches.length },
          { id: 'card', label: '🎴 Digital Player Card', count: null },
          { id: 'progression', label: '📈 Rating Progression', count: player.ratingProgression?.length || null },
          { id: 'awards', label: '🏆 Honors & Awards', count: awards.length },
          { id: 'settings', label: '⚙️ Athlete Settings', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Rankings Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800/90 p-5 rounded-2xl">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                Weekly Rank
              </span>
              <div className="text-2xl font-black text-white">#{player.weeklyRank || player.overallRank}</div>
              <span className="text-[10px] text-zinc-400 mt-1 block">Current week leaderboard</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/90 p-5 rounded-2xl">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                Monthly Rank
              </span>
              <div className="text-2xl font-black text-amber-400">#{player.monthlyRank || player.overallRank}</div>
              <span className="text-[10px] text-zinc-400 mt-1 block">30-day performance window</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/90 p-5 rounded-2xl">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                Season Rank
              </span>
              <div className="text-2xl font-black text-emerald-400">#{player.seasonRank || player.overallRank}</div>
              <span className="text-[10px] text-zinc-400 mt-1 block">Season 01 official ranking</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/90 p-5 rounded-2xl">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                Form Rank
              </span>
              <div className="text-2xl font-black text-cyan-400">#{player.formRank || player.overallRank}</div>
              <span className="text-[10px] text-zinc-400 mt-1 block">Last 5 matches momentum</span>
            </div>
          </div>

          {/* Official Statistics Grid */}
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>Career Performance Record</span>
              <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                Official BDPSC Database
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Total Matches</span>
                <span className="text-2xl font-black text-white">{player.totalMatches}</span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Record (W-D-L)</span>
                <span className="text-base font-black text-emerald-400">
                  {player.wins}-{player.draws}-{player.losses}
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Win Rate</span>
                <span className="text-2xl font-black text-amber-400">{player.winRate}%</span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Goals Scored</span>
                <span className="text-2xl font-black text-white">{player.goals}</span>
                <span className="text-[9px] text-zinc-500 block">
                  {player.totalMatches > 0 ? (player.goals / player.totalMatches).toFixed(2) : 0} / match
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Assists</span>
                <span className="text-2xl font-black text-white">{player.assists}</span>
                <span className="text-[9px] text-zinc-500 block">
                  {player.totalMatches > 0 ? (player.assists / player.totalMatches).toFixed(2) : 0} / match
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Man of Match</span>
                <span className="text-2xl font-black text-amber-400">{player.motmCount}</span>
                <span className="text-[9px] text-zinc-500 block">MOTM honors</span>
              </div>
            </div>
          </div>

          {/* Form & Rating Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Form */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-4">
                Recent Form (Last 5 Fixtures)
              </h4>
              <div className="flex items-center gap-2 mb-4">
                {player.form && player.form.length > 0 ? (
                  player.form.map((res, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        res === 'W'
                          ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                          : res === 'D'
                          ? 'bg-zinc-600 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {res}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">No recent matches recorded</span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Form momentum dynamically boosts or penalizes your global club ranking score.
              </p>
            </div>

            {/* Official Formula Breakdown */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4">
                Official Rating Formula Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Base Club Floor:</span>
                  <span className="font-mono text-white font-bold">{ratingBreakdown.base || 65} pts</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Win Rate Bonus:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{ratingBreakdown.winBonus?.toFixed(1) || '0.0'} pts</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Goal Contribution (G+A):</span>
                  <span className="font-mono text-amber-400 font-bold">+{ratingBreakdown.goalBonus?.toFixed(1) || '0.0'} pts</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>MOTM Honors Multiplier:</span>
                  <span className="font-mono text-amber-400 font-bold">+{ratingBreakdown.motmBonus?.toFixed(1) || '0.0'} pts</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Form Momentum Factor:</span>
                  <span className="font-mono text-cyan-400 font-bold">+{ratingBreakdown.formBonus?.toFixed(1) || '0.0'} pts</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between font-black text-sm">
                  <span className="text-white">Total Dynamic Rating:</span>
                  <span className="text-amber-400 font-mono">{player.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: MATCH HISTORY */}
      {activeTab === 'matches' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Official Club Fixtures Participated In
            </h3>
            <span className="text-xs text-zinc-400">{matches.length} matches recorded</span>
          </div>

          {matches.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-500 text-xs">
              No official match appearances on record yet.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => {
                const pStat = m.playerStats.find((ps) => ps.playerId === player.id);
                return (
                  <div
                    key={m.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          m.result === 'WIN'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : m.result === 'DRAW'
                            ? 'bg-zinc-700/20 text-zinc-300 border border-zinc-700'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {m.result}
                      </div>

                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span>BDPSC</span>
                          <span className="text-amber-400 font-mono">
                            {m.scoreClub} - {m.scoreOpponent}
                          </span>
                          <span>{m.opponentClub}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {m.date} • {m.tournamentName} • {m.homeAway}
                        </div>
                      </div>
                    </div>

                    {/* Individual athlete performance in this match */}
                    {pStat && (
                      <div className="flex items-center gap-3 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs shrink-0">
                        <span className="text-zinc-400 font-medium">
                          ⚽ Goals: <strong className="text-white">{pStat.goals}</strong>
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-400 font-medium">
                          🎯 Assists: <strong className="text-white">{pStat.assists}</strong>
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-400 font-medium">
                          Match Rating: <strong className="text-amber-400 font-mono">{pStat.performanceScore}</strong>
                        </span>
                        {m.motmPlayerId === player.id && (
                          <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-400 text-[10px] font-black rounded uppercase">
                            ⭐ MOTM
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: DIGITAL PLAYER CARD */}
      {activeTab === 'card' && (
        <div className="flex flex-col items-center justify-center py-6 animate-fadeIn">
          <div className="relative w-80 md:w-96 rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-amber-400 via-zinc-800 to-amber-600 shadow-2xl shadow-amber-500/10">
            <div className="bg-zinc-950 rounded-[22px] p-6 text-white relative overflow-hidden">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-5xl font-black text-amber-400 leading-none">
                    {Math.round(player.rating)}
                  </div>
                  <div className="text-sm font-black text-zinc-300 uppercase tracking-widest mt-1">
                    {player.position}
                  </div>
                  <div className="w-6 h-0.5 bg-amber-400 my-1"></div>
                  <div className="text-xs text-zinc-500 font-bold">#{player.jerseyNumber}</div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-1 rounded bg-amber-400/20 border border-amber-400/40 text-amber-400 font-black text-[10px] uppercase tracking-wider">
                    BDPSC ELITE
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">CLUB RANK #{player.overallRank}</div>
                </div>
              </div>

              {/* Player Image */}
              <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-zinc-800 bg-zinc-900 mb-4 shadow-xl">
                <img
                  src={player.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Player Name Banner */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  {player.gamingName}
                </h3>
                <div className="text-xs text-zinc-400 font-medium tracking-wide">{player.name}</div>
              </div>

              {/* FIFA / eFootball Style Attribute Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-zinc-800/80">
                <div className="bg-zinc-900/60 p-2 rounded-xl">
                  <div className="text-lg font-black text-amber-400">
                    {Math.min(99, Math.round(75 + player.winRate * 0.2))}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">PAC (Pace)</div>
                </div>

                <div className="bg-zinc-900/60 p-2 rounded-xl">
                  <div className="text-lg font-black text-amber-400">
                    {Math.min(99, Math.round(70 + player.goals * 2))}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">SHO (Shooting)</div>
                </div>

                <div className="bg-zinc-900/60 p-2 rounded-xl">
                  <div className="text-lg font-black text-amber-400">
                    {Math.min(99, Math.round(72 + player.assists * 2.5))}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">PAS (Passing)</div>
                </div>

                <div className="bg-zinc-900/60 p-2 rounded-xl">
                  <div className="text-lg font-black text-amber-400">
                    {Math.min(99, Math.round(78 + player.motmCount * 3))}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">DRI (Dribble)</div>
                </div>

                <div className="bg-zinc-900/60 p-2 rounded-xl">
                  <div className="text-lg font-black text-amber-400">
                    {Math.min(99, Math.round(68 + player.cleanSheets * 3))}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">DEF (Defense)</div>
                </div>

                <div className="bg-zinc-900/60 p-2 rounded-xl">
                  <div className="text-lg font-black text-amber-400">
                    {Math.min(99, Math.round(player.rating))}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">PHY (Form)</div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="text-center mt-5 text-[9px] text-zinc-500 tracking-widest uppercase font-mono">
                BD POWER STRIKERS CLUB • AUTHENTICATED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: PROGRESSION */}
      {activeTab === 'progression' && (
        <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-3xl animate-fadeIn">
          <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
            Historical Rating Progression
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Official timeline documenting rating score progression calculated after every competitive fixture.
          </p>

          <div className="space-y-4">
            {player.ratingProgression && player.ratingProgression.length > 0 ? (
              player.ratingProgression.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-zinc-300 font-mono">{p.date}</span>
                    <span className="text-zinc-500">Fixture: {p.matchId}</span>
                  </div>
                  <div className="font-black text-sm text-amber-400 font-mono">
                    {p.rating.toFixed(1)} pts
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 text-center py-6">
                Initial baseline rating established at {player.rating.toFixed(1)} pts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AWARDS & HONORS */}
      {activeTab === 'awards' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            Personal Honors & Championship Trophies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {awards.length === 0 && trophies.length === 0 ? (
              <div className="col-span-2 bg-zinc-950 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-500 text-xs">
                No official honors recorded in the club vault yet.
              </div>
            ) : (
              <>
                {awards.map((a) => (
                  <div
                    key={a.id}
                    className="bg-zinc-950 border border-amber-500/30 p-5 rounded-2xl flex items-start gap-4"
                  >
                    <div className="text-3xl shrink-0 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      🏅
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {a.category} • {a.awardDate}
                      </span>
                      <h4 className="text-base font-black text-white mt-0.5">{a.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{a.description}</p>
                      <span className="inline-block mt-2 text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-300 font-mono">
                        {a.statsSummary}
                      </span>
                    </div>
                  </div>
                ))}

                {trophies.map((t) => (
                  <div
                    key={t.id}
                    className="bg-zinc-950 border border-emerald-500/30 p-5 rounded-2xl flex items-start gap-4"
                  >
                    <div className="text-3xl shrink-0 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      🏆
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {t.position} • {t.year}
                      </span>
                      <h4 className="text-base font-black text-white mt-0.5">{t.tournamentName}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{t.achievementDescription}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab: ATHLETE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-3xl animate-fadeIn space-y-6">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
              Athlete Bio & Profile Preferences
            </h3>
            <p className="text-xs text-zinc-400">
              Update your public player bio and setup preferences. Official statistics, ratings, and match history remain locked and protected by club administration.
            </p>
          </div>

          {/* Profile Photo Card */}
          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={user.avatarUrl || player.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={user.name}
                  className="w-14 h-14 rounded-full aspect-square object-cover border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={openPhotoModal}
                  className="absolute -bottom-0.5 -right-0.5 p-1.5 bg-amber-400 text-zinc-950 rounded-full shadow border-2 border-zinc-950 hover:scale-110 transition"
                  title="Change photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Profile Photo</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Visible across leaderboards, player cards & navbar.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={openPhotoModal}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              ✓ Player profile preferences updated successfully.
            </div>
          )}

          <form onSubmit={handleUpdateBio} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Player Biography / Motto
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your eFootball journey, specialties, or motto..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Preferred Device / Platform
                </label>
                <select
                  value={preferredPlatform}
                  onChange={(e) => setPreferredPlatform(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="Mobile">Mobile (iOS / Android)</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="PlayStation 4">PlayStation 4</option>
                  <option value="PC / Steam">PC / Steam</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Tactical Playstyle
                </label>
                <select
                  value={playstyle}
                  onChange={(e) => setPlaystyle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="Possession Game">Possession Game</option>
                  <option value="Quick Counter">Quick Counter</option>
                  <option value="Long Ball Counter">Long Ball Counter</option>
                  <option value="Out Wide">Out Wide</option>
                  <option value="Long Ball">Long Ball</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Favorite Club
                </label>
                <input
                  type="text"
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  placeholder="e.g. Real Madrid, Arsenal"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Social / Discord Handle
                </label>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="e.g. @striker_99"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
