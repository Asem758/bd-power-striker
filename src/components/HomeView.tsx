import React from 'react';
import { ClubLogo } from './ClubLogo';
import { AnnouncementTicker } from './AnnouncementTicker';
import { 
  Trophy, 
  Users, 
  BarChart3, 
  Calendar, 
  Award, 
  ArrowRight, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Star,
  Sparkles,
  Camera,
  LayoutDashboard
} from 'lucide-react';
import { ClubStats, Match, Player, Award as AwardType, Trophy as TrophyType, NewsArticle, Fixture, ClubAnnouncement } from '../types';
import { useAuth } from '../context/AuthContext';
import { getOpponentLogoUrl } from '../utils/opponentLogos';

interface HomeViewProps {
  stats: ClubStats | null;
  players: Player[];
  latestMatch: Match | null;
  upcomingFixture: Fixture | null;
  potw: AwardType | null;
  potm: AwardType | null;
  trophies: TrophyType[];
  latestNews: NewsArticle[];
  announcements?: ClubAnnouncement[];
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  players,
  latestMatch,
  upcomingFixture,
  potw,
  potm,
  trophies,
  latestNews,
  announcements = [],
  onNavigate,
}) => {
  const { user, isAuthenticated, openPhotoModal, roleBadge } = useAuth();

  // Top 3 players by rating
  const top3 = [...players].sort((a, b) => b.rating - a.rating).slice(0, 3);

  // Check if current user is linked to an athlete
  const userPlayer = user?.playerId ? players.find(p => p.id === user.playerId) : null;

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      {/* 0. AUTHENTICATED USER CIRCULAR PROFILE CARD (QUICK ACCESS ON FRONT PAGE) */}
      {isAuthenticated && user && (
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              {/* Perfectly Adjusted Circle Profile Image with Camera Hover Trigger */}
              <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={openPhotoModal}
                title="Click to update your profile photo"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-400 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={user.avatarUrl || userPlayer?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name}
                    className="w-full h-full rounded-full aspect-square object-cover bg-slate-950 border-2 border-slate-950"
                  />
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-amber-400 text-slate-950 rounded-full shadow-lg border-2 border-slate-950 group-hover:bg-amber-300 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-xs text-amber-400 font-extrabold uppercase tracking-wider">
                    {userPlayer ? 'BDPSC Official Athlete' : 'Registered Club Member'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                    {roleBadge.displayName}
                  </span>
                  {userPlayer && (
                    <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                      OVR {userPlayer.rating} • #{userPlayer.jerseyNumber}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Welcome back, {user.gamingName || user.name}!
                </h2>
                <p className="text-xs text-slate-400">
                  {userPlayer 
                    ? `Linked to Roster: ${userPlayer.name} (${userPlayer.position}) • ${userPlayer.winRate}% Win Rate`
                    : `${user.email} • Your profile photo is live across all club leaderboards`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={openPhotoModal}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Change Photo</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold transition hover:scale-105 shadow-md shadow-amber-500/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CLUB ANNOUNCEMENT MOVING TICKER (Controlled by Admin) */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-950 shadow-lg">
        <AnnouncementTicker
          announcements={announcements}
          onNavigate={onNavigate}
          onOpenAdminAnnouncements={() => onNavigate('admin', 'announcements')}
        />
      </section>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16">
        {/* Background esports accent glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Official Club Crest */}
          <div className="flex justify-center">
            <ClubLogo size="hero" className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_12px_30px_rgba(217,119,6,0.4)]" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              Official eFootball Competitive Organization
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
            BD POWER STRIKERS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              CLUB
            </span>
          </h1>

          {/* Tagline & Intro */}
          <p className="text-base sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Precision. Power. Prestige. The home of Bangladesh's premier eFootball squad, automated statistics tracking, and competitive player rankings.
          </p>

          {/* Season & Rank Banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 py-2 px-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
            <span className="text-amber-400 font-bold">🏆 REIGNING NATIONAL CHAMPIONS</span>
            <span>•</span>
            <span>{stats?.seasonName || 'Season 01 — 2026'}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{stats?.winRate || 76.2}% WIN RATE</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              id="hero-view-squad-btn"
              onClick={() => onNavigate('players')}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <Users className="w-4 h-4" />
              <span>EXPLORE SQUAD</span>
            </button>
            <button
              id="hero-view-rankings-btn"
              onClick={() => onNavigate('rankings')}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-xl font-extrabold text-sm tracking-wide transition-all hover:scale-105"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>POWER RANKINGS</span>
            </button>
            <button
              id="hero-view-cards-btn"
              onClick={() => onNavigate('cards')}
              className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800 text-amber-300 border border-amber-500/30 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>GENERATE DIGITAL CARD</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CURRENT SEASON SUMMARY METRICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-white tracking-tight uppercase">
              Current Season Performance
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {stats?.seasonName || 'Season 01 — 2026'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 font-medium">Matches</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.totalMatches || 42}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Competitive</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-emerald-400 font-medium">Wins</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.wins || 32}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Victories</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 font-medium">Draws</p>
            <p className="text-2xl font-black text-slate-300 mt-1">{stats?.draws || 6}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Ties</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-rose-400 font-medium">Losses</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{stats?.losses || 4}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Defeats</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-amber-400 font-medium">Win Rate</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{stats?.winRate || 76.2}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Dominance</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 font-medium">Goals Scored</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.goalsScored || 114}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">+{stats?.goalDifference || 76} GD</p>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 font-medium">Clean Sheets</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.cleanSheets || 19}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Defensive Wall</p>
          </div>
        </div>
      </section>

      {/* 3. LATEST MATCH & UPCOMING FIXTURE ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Match Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                LATEST RESULT
              </span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              {latestMatch?.tournamentName || 'Bangladesh eFootball Championship'}
            </span>
          </div>

          <div className="py-6 flex items-center justify-between px-2 sm:px-6">
            {/* BDPSC */}
            <div className="text-center w-1/3">
              <ClubLogo size="md" className="w-14 h-14 mx-auto mb-2" />
              <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                BD POWER STRIKERS
              </h4>
              <p className="text-[10px] text-amber-400 font-bold uppercase mt-0.5">CLUB</p>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {latestMatch?.scoreClub ?? 4}
                </span>
                <span className="text-slate-600 font-bold text-xl">:</span>
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {latestMatch?.scoreOpponent ?? 2}
                </span>
              </div>
              <div className="mt-2">
                <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {latestMatch?.result ?? 'WIN'}
                </span>
              </div>
              {latestMatch?.halfTimeScore && (
                <p className="text-[10px] text-slate-500 mt-1">HT: {latestMatch.halfTimeScore}</p>
              )}
            </div>

            {/* Opponent */}
            <div className="text-center w-1/3">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-900 border border-slate-700 p-1 mb-2 shadow-md flex items-center justify-center overflow-hidden">
                <img
                  src={getOpponentLogoUrl(latestMatch?.opponentClub, latestMatch?.opponentLogo)}
                  alt={latestMatch?.opponentClub || 'Opponent'}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
                {latestMatch?.opponentClub || 'Dhaka Dragons'}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">OPPONENT</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">MOTM:</span>
              <span className="text-white font-bold">{latestMatch?.motmPlayerName || 'NOYON'}</span>
            </div>
            <button
              onClick={() => onNavigate('matches', latestMatch?.id)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>Match Report</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upcoming Fixture Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                UPCOMING CLASH
              </span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              {upcomingFixture?.tournament || 'South Asia eFootball Masters'}
            </span>
          </div>

          <div className="py-6 flex items-center justify-between px-2 sm:px-6">
            <div className="text-center w-1/3">
              <ClubLogo size="md" className="w-14 h-14 mx-auto mb-2" />
              <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                BD POWER STRIKERS
              </h4>
            </div>

            <div className="text-center">
              <div className="bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-xl">
                <span className="text-xs font-extrabold text-amber-400 tracking-wider">VS</span>
              </div>
              <div className="mt-2 text-xs font-bold text-white">
                {upcomingFixture?.date || '2026-09-28'}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {upcomingFixture?.time || '21:00'} (BST)
              </p>
            </div>

            <div className="text-center w-1/3">
              <div className="w-14 h-14 mx-auto rounded-xl bg-slate-900 border border-slate-700 p-1 mb-2 shadow-md flex items-center justify-center overflow-hidden">
                <img
                  src={getOpponentLogoUrl(upcomingFixture?.opponent, upcomingFixture?.opponentLogo)}
                  alt={upcomingFixture?.opponent || 'Opponent'}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
                {upcomingFixture?.opponent || 'Karachi Kickers'}
              </h4>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Arena: {upcomingFixture?.venuePlatform || 'Online Room'}</span>
            <button
              onClick={() => onNavigate('matches')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>View Fixtures</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. TOP 3 PLAYERS PODIUM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-white tracking-tight uppercase">
              Top Ranked Squad Leaders
            </h2>
          </div>
          <button
            onClick={() => onNavigate('rankings')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
          >
            <span>Full Rankings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((player, idx) => (
            <div
              key={player.id}
              className={`relative rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 ${
                idx === 0 
                  ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10'
                  : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                  idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'
                }`}>
                  #{idx + 1} OVERALL
                </span>
                <span className="bg-slate-800 text-amber-400 text-xs font-bold px-2 py-0.5 rounded border border-slate-700">
                  {player.position}
                </span>
              </div>

              {/* Photo & Identity */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative shrink-0">
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-16 h-16 rounded-full aspect-square object-cover border-2 border-amber-400/80 shadow-lg ring-2 ring-amber-400/20"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-amber-400/70 text-amber-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shadow">
                    #{player.jerseyNumber}
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-white truncate">
                    {player.gamingName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{player.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      #{player.jerseyNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {player.winRate}% WIN RATE
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-center mb-4">
                <div>
                  <p className="text-[10px] text-slate-400">OVR</p>
                  <p className="text-base font-black text-amber-400">{player.rating}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Goals</p>
                  <p className="text-base font-bold text-white">{player.goals}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Assists</p>
                  <p className="text-base font-bold text-white">{player.assists}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">MOTM</p>
                  <p className="text-base font-bold text-white">{player.motmCount}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('player-detail', player.slug)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-xl text-center transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onNavigate('cards', player.id)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                  title="Generate Digital Card"
                >
                  Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PLAYER OF THE WEEK & PLAYER OF THE MONTH SHOWCASE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* POTW */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 tracking-wider uppercase mb-3">
            <Award className="w-4 h-4" />
            <span>PLAYER OF THE WEEK</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <img
                src={potw?.playerPhotoUrl || top3[1]?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={potw?.playerName || 'Player'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full aspect-square object-cover border-2 border-amber-400 shadow-xl ring-2 ring-amber-400/30 shrink-0"
              />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {potw?.gamingName || top3[1]?.gamingName || 'ASHEM_STRIKER'}
              </h3>
              <p className="text-xs text-slate-400">{potw?.playerName || 'Ashraful Ashem'}</p>
              <p className="text-xs font-semibold text-amber-300 mt-1">
                {potw?.statsSummary || '3 Goals, 3 Assists in BDEC Finals'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-800 pt-3">
            {potw?.description || 'Awarded for match-winning leadership during championship week.'}
          </p>
        </div>

        {/* POTM */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 tracking-wider uppercase mb-3">
            <Award className="w-4 h-4" />
            <span>PLAYER OF THE MONTH</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <img
                src={potm?.playerPhotoUrl || top3[0]?.photoUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300'}
                alt={potm?.playerName || 'Player'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full aspect-square object-cover border-2 border-amber-400 shadow-xl ring-2 ring-amber-400/30 shrink-0"
              />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {potm?.gamingName || top3[0]?.gamingName || 'NOYON'}
              </h3>
              <p className="text-xs text-slate-400">{potm?.playerName || 'Noyon Hossain'}</p>
              <p className="text-xs font-semibold text-amber-300 mt-1">
                {potm?.statsSummary || '11 Goals, 5 Assists, 3 MOTM Awards'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-800 pt-3">
            {potm?.description || 'Outstanding Golden Boot scoring performance in national tournaments.'}
          </p>
        </div>
      </section>

      {/* 6. LATEST NEWS & TROPHY CABINET PREVIEW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest News (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white tracking-tight uppercase">
              Latest Club Dispatches
            </h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>View All News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {latestNews.slice(0, 3).map(article => (
              <div
                key={article.id}
                onClick={() => onNavigate('news', article.slug)}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 cursor-pointer transition-colors group"
              >
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full sm:w-28 h-24 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                    {article.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors mt-1 line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {article.excerpt}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {new Date(article.publishedAt).toLocaleDateString()} • By {article.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trophy Preview (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white tracking-tight uppercase">
              Trophy Cabinet
            </h2>
            <button
              onClick={() => onNavigate('trophies')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>Full Cabinet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            {trophies.slice(0, 2).map(trophy => (
              <div key={trophy.id} className="flex items-center space-x-3 pb-3 border-b border-slate-800/80 last:border-0 last:pb-0">
                <img
                  src={trophy.trophyImageUrl}
                  alt={trophy.tournamentName}
                  className="w-14 h-14 rounded-xl object-cover border border-amber-500/30 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    {trophy.year} • {trophy.position}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {trophy.tournamentName}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {trophy.achievementDescription}
                  </p>
                </div>
              </div>
            ))}
            <button
              onClick={() => onNavigate('trophies')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition-colors text-center"
            >
              Explore All {trophies.length} Trophies & Honors
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
