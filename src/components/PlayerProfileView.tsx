import React, { useState, useEffect } from 'react';
import { 
  fetchPlayerDetail 
} from '../services/api';
import { 
  Player, 
  Match, 
  Award, 
  Trophy, 
  RatingBreakdown,
  PlayerMatchStats 
} from '../types';
import { 
  ArrowLeft, 
  Award as AwardIcon, 
  Trophy as TrophyIcon, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  CreditCard, 
  Shield, 
  Flame,
  Info,
  Clock,
  ChevronRight
} from 'lucide-react';

interface PlayerProfileViewProps {
  playerSlug: string;
  onBack: () => void;
  onGenerateCard: (playerId: string) => void;
  onNavigateMatch: (matchId: string) => void;
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  playerSlug,
  onBack,
  onGenerateCard,
  onNavigateMatch,
}) => {
  const [data, setData] = useState<{
    player: Player;
    ratingBreakdown: RatingBreakdown;
    matches: Match[];
    awards: Award[];
    trophies: Trophy[];
    timeline: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPlayerDetail(playerSlug)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Player not found');
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [playerSlug]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 font-semibold">Loading player profile and performance analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-400">{error || 'Could not find player.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
        >
          Back to Squad
        </button>
      </div>
    );
  }

  const { player, ratingBreakdown, matches, awards, trophies, timeline } = data;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO SQUAD</span>
      </button>

      {/* 1. PLAYER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Photo with holographic border */}
          <div className="relative shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 aspect-square ring-4 ring-amber-400/20">
              <img
                src={player.photoUrl}
                alt={player.name}
                className="w-full h-full rounded-full aspect-square object-cover border-2 border-slate-950"
              />
            </div>
            {/* Jersey circle */}
            <div className="absolute bottom-1 right-1 bg-slate-950 border-2 border-amber-400 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white font-mono shadow-md">
              #{player.jerseyNumber}
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-lg tracking-wider">
                {player.position}
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                player.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {player.status}
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg border border-slate-700">
                {player.efootballId}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {player.gamingName}
            </h1>
            <p className="text-base font-semibold text-slate-300">{player.name}</p>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {player.bio}
            </p>

            {/* Quick Specs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-2">
              <div>
                <span className="text-slate-500">Playstyle:</span>{' '}
                <span className="text-slate-200 font-semibold">{player.playstyle}</span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">Platform:</span>{' '}
                <span className="text-slate-200 font-semibold">{player.preferredPlatform}</span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-500">Joined:</span>{' '}
                <span className="text-slate-200 font-semibold">{player.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Large OVR & Card Trigger */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center min-w-[150px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              POWER RATING
            </span>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 my-1">
              {player.rating}
            </div>
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
              {player.rankMovement === 'UP' && <TrendingUp className="w-4 h-4" />}
              {player.rankMovement === 'DOWN' && <TrendingDown className="w-4 h-4 text-rose-400" />}
              {player.rankMovement === 'SAME' && <Minus className="w-4 h-4 text-slate-400" />}
              <span>
                {player.rankMovement === 'UP' ? `+${player.rankChangeValue} Pos` : 
                 player.rankMovement === 'DOWN' ? `-${player.rankChangeValue} Pos` : 'Unchanged'}
              </span>
            </div>

            <button
              onClick={() => onGenerateCard(player.id)}
              className="mt-4 w-full flex items-center justify-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold py-2 px-3 rounded-xl shadow-md transition-all hover:scale-105"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Digital Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RANKINGS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Overall Rank</p>
          <p className="text-2xl font-black text-amber-400 mt-1">#{player.overallRank}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Club Leaderboard</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Form Rank</p>
          <p className="text-2xl font-black text-white mt-1">#{player.formRank}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Last 5 Matches</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Weekly Rank</p>
          <p className="text-2xl font-black text-white mt-1">#{player.weeklyRank}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Current Week</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Monthly Rank</p>
          <p className="text-2xl font-black text-white mt-1">#{player.monthlyRank}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">September 2026</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Season Rank</p>
          <p className="text-2xl font-black text-white mt-1">#{player.seasonRank}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Season 01</p>
        </div>
      </div>

      {/* 3. TRANSPARENT RATING BREAKDOWN & PERFORMANCE ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Breakdown Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Transparent Rating Engine Breakdown
              </h2>
            </div>
            <span className="text-xs text-amber-400 font-bold">
              Algorithm v1.2
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            BDPSC ratings are mathematically reproducible and derived directly from verified competitive match records. Below is the audited breakdown of {player.gamingName}'s <strong className="text-amber-400">OVR {player.rating}</strong> score:
          </p>

          <div className="space-y-2.5">
            {[
              { label: 'Base Competitive Floor', points: ratingBreakdown.basePerformance, desc: 'Minimum baseline rating for official squad members' },
              { label: 'Win Contribution', points: `+${ratingBreakdown.winContribution}`, desc: `${player.wins} wins in ${player.totalMatches} competitive matches (${player.winRate}%)` },
              { label: 'Goal Contribution', points: `+${ratingBreakdown.goalContribution}`, desc: `${player.goals} total goals scored (Finishing efficiency)` },
              { label: 'Assist Contribution', points: `+${ratingBreakdown.assistContribution}`, desc: `${player.assists} decisive key assists provided` },
              { label: 'Defensive Contribution', points: `+${ratingBreakdown.defensiveContribution}`, desc: `${player.cleanSheets} clean sheets / defensive clearances` },
              { label: 'Man of the Match (MOTM) Bonus', points: `+${ratingBreakdown.motmBonus}`, desc: `${player.motmCount} MVP / MOTM recognitions` },
              { label: 'Opponent Strength Modifier', points: `+${ratingBreakdown.opponentModifier}`, desc: 'Calculated against opponent tier ratings' },
              { label: 'Tournament Tier Bonus', points: `+${ratingBreakdown.tournamentBonus}`, desc: 'Major Championship weighting factor' },
              { label: 'Recent Form Modifier', points: `+${ratingBreakdown.recentFormModifier}`, desc: 'Rolling multiplier from past 5 matches' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="font-bold text-white block">{row.label}</span>
                  <span className="text-[11px] text-slate-500">{row.desc}</span>
                </div>
                <span className="font-extrabold text-amber-400 font-mono text-sm shrink-0 ml-3">
                  {row.points}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between font-black text-sm">
            <span className="text-white">FINAL CALCULATED RATING (OVR):</span>
            <span className="text-amber-400 text-xl">{ratingBreakdown.totalCalculatedRating}</span>
          </div>
        </div>

        {/* Career Summary & Form */}
        <div className="space-y-6">
          {/* Career Stats Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Career Record</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Matches</span>
                <p className="text-xl font-black text-white">{player.totalMatches}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Win Rate</span>
                <p className="text-xl font-black text-amber-400">{player.winRate}%</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Wins</span>
                <p className="text-xl font-black text-emerald-400">{player.wins}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Draws / Loss</span>
                <p className="text-xl font-black text-slate-400">{player.draws}/{player.losses}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Goals</span>
                <p className="text-xl font-black text-white">{player.goals}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Assists</span>
                <p className="text-xl font-black text-white">{player.assists}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Clean Sheets</span>
                <p className="text-xl font-black text-white">{player.cleanSheets}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">MOTM</span>
                <p className="text-xl font-black text-amber-400">{player.motmCount}</p>
              </div>
            </div>

            {/* Form Widget */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                Recent Form (Last 5 Games)
              </span>
              <div className="flex items-center space-x-2">
                {player.form.length === 0 ? (
                  <span className="text-xs text-slate-500">No match data recorded.</span>
                ) : (
                  player.form.map((res: 'W' | 'D' | 'L', i: number) => (
                    <div
                      key={i}
                      className={`flex-1 py-2 rounded-lg text-xs font-black text-center ${
                        res === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        res === 'D' ? 'bg-slate-700 text-slate-300' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {res}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Rating Progression Chart / History */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Rating Progression</span>
            </h3>
            <div className="space-y-2">
              {player.ratingProgression.map((prog: { date: string; rating: number; matchId: string }, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">{prog.date}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">{prog.rating} OVR</span>
                    <span className="text-[10px] text-slate-500">Match #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. CAREER TIMELINE & AWARDS & TROPHIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Career Timeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Career History & Milestones</span>
          </h2>

          <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timeline.map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-900"></div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {item.year}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">
                  {item.event}
                </h4>
                {item.details && (
                  <p className="text-[11px] text-slate-400 mt-1">{item.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Individual Honors & Trophies */}
        <div className="space-y-6">
          {/* Individual Awards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <AwardIcon className="w-5 h-5 text-amber-400" />
              <span>Individual Honors ({awards.length})</span>
            </h2>

            {awards.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No individual honors logged yet.</p>
            ) : (
              <div className="space-y-3">
                {awards.map(aw => (
                  <div key={aw.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <AwardIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{aw.title}</h4>
                      <p className="text-[11px] text-amber-400 font-semibold">{aw.statsSummary}</p>
                      <p className="text-[10px] text-slate-500">{aw.period} • {aw.awardDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Club Trophies Participated In */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-amber-400" />
              <span>Club Trophies Won ({trophies.length})</span>
            </h2>

            {trophies.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No tournament trophies logged for this player yet.</p>
            ) : (
              <div className="space-y-3">
                {trophies.map(tr => (
                  <div key={tr.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center space-x-3">
                    <img
                      src={tr.trophyImageUrl}
                      alt={tr.tournamentName}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">
                        {tr.year} • {tr.position}
                      </span>
                      <h4 className="text-xs font-bold text-white">{tr.tournamentName}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{tr.achievementDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. MATCH APPEARANCES LOG */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <span>Match Appearances & Match-Level Stats</span>
        </h2>

        {matches.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No match appearances recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Tournament</th>
                  <th className="py-3 px-3">Opponent</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-center">Goals</th>
                  <th className="py-3 px-3 text-center">Assists</th>
                  <th className="py-3 px-3 text-center">MOTM</th>
                  <th className="py-3 px-3 text-center">Rating</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {matches.map(m => {
                  const stat = m.playerStats.find((ps: PlayerMatchStats) => ps.playerId === player.id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{m.date}</td>
                      <td className="py-3 px-3 text-slate-300 font-semibold truncate max-w-[150px]">{m.tournamentName}</td>
                      <td className="py-3 px-3 font-bold text-white">{m.opponentClub}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          m.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          m.result === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {m.scoreClub} - {m.scoreOpponent} ({m.result})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">{stat?.goals ?? 0}</td>
                      <td className="py-3 px-3 text-center font-bold text-white">{stat?.assists ?? 0}</td>
                      <td className="py-3 px-3 text-center">
                        {stat?.motm ? (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            YES
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {stat?.performanceScore ?? '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateMatch(m.id)}
                          className="text-amber-400 hover:text-amber-300 font-bold text-[11px]"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
