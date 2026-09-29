import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Zap, 
  Flame, 
  Trophy, 
  Sparkles,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { Player, PlayerPosition, PlayerStatus } from '../types';

interface PlayersViewProps {
  players: Player[];
  onSelectPlayer: (slug: string) => void;
  onGenerateCard: (playerId: string) => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  players,
  onSelectPlayer,
  onGenerateCard,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'goals' | 'assists' | 'winRate'>('rating');

  // Head to Head (PvP) selection state
  const [h2hOpen, setH2hOpen] = useState(false);
  const [playerAId, setPlayerAId] = useState<string>(players[0]?.id || '');
  const [playerBId, setPlayerBId] = useState<string>(players[1]?.id || '');

  // Filtering
  const filteredPlayers = players.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (positionFilter !== 'ALL') {
      if (positionFilter === 'FWD' && !['CF', 'SS', 'LWF', 'RWF'].includes(p.position)) return false;
      if (positionFilter === 'MID' && !['AMF', 'CMF', 'DMF'].includes(p.position)) return false;
      if (positionFilter === 'DEF' && !['CB', 'LB', 'RB'].includes(p.position)) return false;
      if (positionFilter === 'GK' && p.position !== 'GK') return false;
      if (['CF', 'SS', 'AMF', 'CB', 'GK', 'LWF', 'RWF', 'DMF'].includes(positionFilter) && p.position !== positionFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.gamingName.toLowerCase().includes(q) ||
        p.efootballId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorting
  filteredPlayers.sort((a, b) => {
    if (sortBy === 'goals') return b.goals - a.goals || b.rating - a.rating;
    if (sortBy === 'assists') return b.assists - a.assists || b.rating - a.rating;
    if (sortBy === 'winRate') return b.winRate - a.winRate || b.rating - a.rating;
    return b.rating - a.rating || b.goals - a.goals;
  });

  const playerA = players.find(p => p.id === playerAId) || players[0];
  const playerB = players.find(p => p.id === playerBId) || players[1];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              BDPSC OFFICIAL SQUAD
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered roster, career statistics, and competitive eFootball profiles.
          </p>
        </div>

        {/* H2H Trigger Button */}
        <button
          id="toggle-h2h-comparison-btn"
          onClick={() => setH2hOpen(!h2hOpen)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider border transition-all ${
            h2hOpen
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{h2hOpen ? 'CLOSE HEAD-TO-HEAD' : 'HEAD-TO-HEAD (PvP)'}</span>
        </button>
      </div>

      {/* HEAD TO HEAD (PvP) TOOL */}
      {h2hOpen && playerA && playerB && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                PvP Head-to-Head Comparison
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Side-by-Side Competitive Metric Engine
            </span>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player A Select */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
              <img
                src={playerA?.photoUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300'}
                alt={playerA?.name || 'Player 1'}
                className="w-16 h-16 rounded-full aspect-square object-cover border-2 border-amber-400/70 shadow-md shrink-0 ring-2 ring-amber-400/20"
              />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">PLAYER 1</label>
                <select
                  value={playerA?.id || ''}
                  onChange={(e) => setPlayerAId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:border-amber-400"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === playerB?.id}>
                      {p.gamingName} ({p.position} • OVR {p.rating})
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mt-2">
                  <span className="text-amber-400 font-extrabold">{playerA?.rating || 85} OVR</span>
                  <span>•</span>
                  <span>Rank #{playerA?.overallRank || 1}</span>
                </div>
              </div>
            </div>

            {/* Player B Select */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
              <img
                src={playerB?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={playerB?.name || 'Player 2'}
                className="w-16 h-16 rounded-full aspect-square object-cover border-2 border-amber-400/70 shadow-md shrink-0 ring-2 ring-amber-400/20"
              />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">PLAYER 2</label>
                <select
                  value={playerB?.id || ''}
                  onChange={(e) => setPlayerBId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:border-amber-400"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === playerA?.id}>
                      {p.gamingName} ({p.position} • OVR {p.rating})
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mt-2">
                  <span className="text-amber-400 font-extrabold">{playerB?.rating || 85} OVR</span>
                  <span>•</span>
                  <span>Rank #{playerB?.overallRank || 2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Metrics Table / Bars */}
          <div className="space-y-4 pt-2">
            {[
              { label: 'Overall Rating (OVR)', valA: playerA.rating, valB: playerB.rating, max: 99 },
              { label: 'Matches Played', valA: playerA.totalMatches, valB: playerB.totalMatches, max: 50 },
              { label: 'Match Wins', valA: playerA.wins, valB: playerB.wins, max: 50 },
              { label: 'Win Rate (%)', valA: playerA.winRate, valB: playerB.winRate, max: 100, suffix: '%' },
              { label: 'Goals Scored', valA: playerA.goals, valB: playerB.goals, max: Math.max(playerA.goals, playerB.goals, 30) },
              { label: 'Assists Delivered', valA: playerA.assists, valB: playerB.assists, max: Math.max(playerA.assists, playerB.assists, 30) },
              { label: 'Clean Sheets', valA: playerA.cleanSheets, valB: playerB.cleanSheets, max: Math.max(playerA.cleanSheets, playerB.cleanSheets, 20) },
              { label: 'MOTM Awards', valA: playerA.motmCount, valB: playerB.motmCount, max: Math.max(playerA.motmCount, playerB.motmCount, 15) },
            ].map((metric, i) => {
              const aWins = metric.valA > metric.valB;
              const bWins = metric.valB > metric.valA;
              return (
                <div key={i} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className={aWins ? 'text-amber-400 font-black' : 'text-slate-300'}>
                      {metric.valA}{metric.suffix || ''}
                    </span>
                    <span className="text-slate-400 uppercase text-[11px]">{metric.label}</span>
                    <span className={bWins ? 'text-amber-400 font-black' : 'text-slate-300'}>
                      {metric.valB}{metric.suffix || ''}
                    </span>
                  </div>
                  {/* Dual comparison bar */}
                  <div className="grid grid-cols-2 gap-1 h-2 rounded-full overflow-hidden bg-slate-900">
                    <div className="flex justify-end">
                      <div
                        className={`h-full rounded-l-full transition-all ${aWins ? 'bg-amber-400' : 'bg-slate-600'}`}
                        style={{ width: `${Math.min(100, (metric.valA / metric.max) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-start">
                      <div
                        className={`h-full rounded-r-full transition-all ${bWins ? 'bg-amber-400' : 'bg-slate-600'}`}
                        style={{ width: `${Math.min(100, (metric.valB / metric.max) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtering & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by player name or ID..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto w-full md:w-auto">
            {['ALL', 'ACTIVE', 'RESERVE', 'FORMER'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === st ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'ALL SQUAD' : st}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 text-xs w-full md:w-auto justify-end">
            <span className="text-slate-400 font-semibold">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-amber-400 font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="rating">Rating (OVR)</option>
              <option value="goals">Most Goals</option>
              <option value="assists">Most Assists</option>
              <option value="winRate">Win Rate %</option>
            </select>
          </div>
        </div>

        {/* Position Filter Pills */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase shrink-0">POSITION:</span>
          {['ALL', 'FWD', 'MID', 'DEF', 'GK', 'CF', 'SS', 'AMF', 'CB'].map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
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

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">No players found matching current filters.</p>
          <button
            onClick={() => { setStatusFilter('ALL'); setPositionFilter('ALL'); setSearchQuery(''); }}
            className="mt-3 text-xs text-amber-400 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlayers.map(player => (
            <div
              key={player.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-200 group flex flex-col justify-between"
            >
              {/* Card Top: Image & Overlay */}
              <div className="relative h-48 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                {/* Rating Badge */}
                <div className="absolute top-3 left-3 bg-slate-950/90 border border-amber-500/40 rounded-xl px-2.5 py-1 text-center shadow-lg backdrop-blur-sm">
                  <span className="text-lg font-black text-amber-400 leading-none block">
                    {player.rating}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                    {player.position}
                  </span>
                </div>

                {/* Status & Jersey Badge */}
                <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
                  <span className="bg-slate-950/80 border border-slate-700 text-white font-mono font-black text-xs px-2 py-0.5 rounded-md">
                    #{player.jerseyNumber}
                  </span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    player.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    player.status === 'RESERVE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {player.status}
                  </span>
                </div>

                {/* Bottom of Image: Name */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-black text-white tracking-tight leading-tight truncate">
                    {player.gamingName}
                  </h3>
                  <p className="text-xs text-slate-300 truncate">{player.name}</p>
                </div>
              </div>

              {/* Card Body: Stats */}
              <div className="p-4 space-y-3">
                {/* ID & Rank */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>ID: <span className="font-mono text-slate-300">{player.efootballId}</span></span>
                  <span className="text-amber-400 font-bold">Rank #{player.overallRank}</span>
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-2 rounded-xl text-center border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Matches</span>
                    <span className="text-xs font-bold text-white">{player.totalMatches}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Goals</span>
                    <span className="text-xs font-bold text-amber-400">{player.goals}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Assists</span>
                    <span className="text-xs font-bold text-white">{player.assists}</span>
                  </div>
                </div>

                {/* Recent Form */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Form (Last 5):</span>
                  <div className="flex items-center space-x-1">
                    {player.form.length === 0 ? (
                      <span className="text-[10px] text-slate-500">—</span>
                    ) : (
                      player.form.map((res, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                            res === 'W' ? 'bg-emerald-500 text-slate-950' :
                            res === 'D' ? 'bg-slate-600 text-white' :
                            'bg-rose-500 text-white'
                          }`}
                        >
                          {res}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => onSelectPlayer(player.slug)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-xl transition-colors text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onGenerateCard(player.id)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    title="Generate Card"
                  >
                    Card
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
