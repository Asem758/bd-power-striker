import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  Flame, 
  Info, 
  Zap, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Player } from '../types';

interface RankingsViewProps {
  players: Player[];
  onSelectPlayer: (slug: string) => void;
  onGenerateCard: (playerId: string) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  players,
  onSelectPlayer,
  onGenerateCard,
}) => {
  const [rankingType, setRankingType] = useState<'overall' | 'weekly' | 'monthly' | 'season' | 'form'>('overall');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [showFormula, setShowFormula] = useState(false);

  // Filter by position
  const filtered = players.filter(p => {
    if (positionFilter === 'ALL') return true;
    if (positionFilter === 'FWD' && ['CF', 'SS', 'LWF', 'RWF'].includes(p.position)) return true;
    if (positionFilter === 'MID' && ['AMF', 'CMF', 'DMF'].includes(p.position)) return true;
    if (positionFilter === 'DEF' && ['CB', 'LB', 'RB'].includes(p.position)) return true;
    if (positionFilter === 'GK' && p.position === 'GK') return true;
    return p.position === positionFilter;
  });

  // Sort by selected ranking type
  const sortedPlayers = [...filtered].sort((a, b) => {
    if (rankingType === 'weekly') return a.weeklyRank - b.weeklyRank || b.rating - a.rating;
    if (rankingType === 'monthly') return a.monthlyRank - b.monthlyRank || b.rating - a.rating;
    if (rankingType === 'season') return a.seasonRank - b.seasonRank || b.rating - a.rating;
    if (rankingType === 'form') return a.formRank - b.formRank || b.rating - a.rating;
    return a.overallRank - b.overallRank || b.rating - a.rating;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              OFFICIAL POWER RANKINGS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated competitive standings updated across weekly, monthly, season, and form performance cycles.
          </p>
        </div>

        {/* Formula Explainer Button */}
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors"
        >
          <Info className="w-4 h-4" />
          <span>{showFormula ? 'HIDE FORMULA' : 'RATING ALGORITHM FORMULA'}</span>
        </button>
      </div>

      {/* RATING ALGORITHM DISCLOSURE PANEL */}
      {showFormula && (
        <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                BDPSC Rating Engine Specification (v1.2)
              </h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              AUDITED
            </span>
          </div>

          <div className="font-mono text-xs bg-slate-950 p-4 rounded-xl text-amber-300 border border-slate-800 overflow-x-auto leading-relaxed">
            Overall Rating (OVR) = 65.0 [Base Floor]
            <br />+ (WinRate% × 0.15) [Match Victory Weight]
            <br />+ (Goals × 0.28) [Finishing Contribution]
            <br />+ (Assists × 0.22) [Playmaking Contribution]
            <br />+ (CleanSheets × 0.35) [Defensive Contribution]
            <br />+ (MOTM × 1.25) [MVP Impact Factor]
            <br />+ FormBonus (Up to ±4 pts based on last 5 results)
            <br />+ TournamentTierWeight (Major: 1.25x, Championship: 1.15x)
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            This rating engine eliminates subjective bias. When tournament and match statistics are submitted in the Club Manager, every player's statistics, power rating, and leaderboard rankings recalculate instantly.
          </p>
        </div>
      )}

      {/* Ranking Type Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto">
          {[
            { id: 'overall', label: 'OVERALL RANKINGS' },
            { id: 'form', label: 'FORM RANKINGS (L5)' },
            { id: 'weekly', label: 'WEEKLY' },
            { id: 'monthly', label: 'MONTHLY' },
            { id: 'season', label: 'SEASON 01' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRankingType(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
                rankingType === tab.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Position Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase">ROLE:</span>
          {['ALL', 'FWD', 'MID', 'DEF', 'GK'].map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                positionFilter === pos
                  ? 'bg-slate-700 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 text-center">Rank</th>
                <th className="py-3 px-3">Player</th>
                <th className="py-3 px-2 text-center">Pos</th>
                <th className="py-3 px-2 text-center">Matches</th>
                <th className="py-3 px-2 text-center">Wins</th>
                <th className="py-3 px-2 text-center">Win%</th>
                <th className="py-3 px-2 text-center">Goals</th>
                <th className="py-3 px-2 text-center">Assists</th>
                <th className="py-3 px-2 text-center">Clean Sheets</th>
                <th className="py-3 px-2 text-center">MOTM</th>
                <th className="py-3 px-3 text-center">Form</th>
                <th className="py-3 px-3 text-right">Rating (OVR)</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {sortedPlayers.map((player, idx) => {
                const displayRank =
                  rankingType === 'weekly' ? player.weeklyRank :
                  rankingType === 'monthly' ? player.monthlyRank :
                  rankingType === 'season' ? player.seasonRank :
                  rankingType === 'form' ? player.formRank :
                  player.overallRank;

                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Rank & Movement */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center font-mono ${
                          displayRank === 1 ? 'bg-amber-500 text-slate-950' :
                          displayRank === 2 ? 'bg-slate-300 text-slate-950' :
                          displayRank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {displayRank}
                        </span>
                        <div className="flex flex-col items-center">
                          {player.rankMovement === 'UP' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          {player.rankMovement === 'DOWN' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                          {player.rankMovement === 'SAME' && <Minus className="w-3 h-3 text-slate-500" />}
                        </div>
                      </div>
                    </td>

                    {/* Player Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-10 h-10 rounded-full aspect-square object-cover border border-amber-500/40 shadow-sm shrink-0"
                        />
                        <div>
                          <button
                            onClick={() => onSelectPlayer(player.slug)}
                            className="font-extrabold text-white group-hover:text-amber-400 text-xs sm:text-sm text-left transition-colors"
                          >
                            {player.gamingName}
                          </button>
                          <p className="text-[11px] text-slate-400">{player.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3 px-2 text-center">
                      <span className="bg-slate-800 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                        {player.position}
                      </span>
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-2 text-center text-slate-300 font-bold">{player.totalMatches}</td>
                    <td className="py-3 px-2 text-center text-emerald-400 font-bold">{player.wins}</td>
                    <td className="py-3 px-2 text-center text-slate-300 font-bold">{player.winRate}%</td>
                    <td className="py-3 px-2 text-center text-amber-400 font-bold">{player.goals}</td>
                    <td className="py-3 px-2 text-center text-white font-bold">{player.assists}</td>
                    <td className="py-3 px-2 text-center text-slate-300">{player.cleanSheets}</td>
                    <td className="py-3 px-2 text-center text-amber-400 font-bold">{player.motmCount}</td>

                    {/* Form Dots */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {player.form.slice(-3).map((res, i) => (
                          <span
                            key={i}
                            className={`w-3.5 h-3.5 rounded text-[8px] font-black flex items-center justify-center ${
                              res === 'W' ? 'bg-emerald-500 text-slate-950' :
                              res === 'D' ? 'bg-slate-600 text-white' :
                              'bg-rose-500 text-white'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* OVR Rating */}
                    <td className="py-3 px-3 text-right">
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {player.rating}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectPlayer(player.slug)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => onGenerateCard(player.id)}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-lg transition-colors"
                          title="Generate Card"
                        >
                          Card
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
