import React, { useState } from 'react';
import { 
  Calendar, 
  Trophy, 
  Star, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  X,
  Play
} from 'lucide-react';
import { Match, Fixture, Tournament, Season, Player } from '../types';
import { getOpponentLogoUrl } from '../utils/opponentLogos';

interface MatchesViewProps {
  matches: Match[];
  fixtures: Fixture[];
  tournaments: Tournament[];
  seasons: Season[];
  players: Player[];
  selectedMatchId?: string;
  onSelectPlayer: (slug: string) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  fixtures,
  tournaments,
  seasons,
  players,
  selectedMatchId,
  onSelectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'fixtures'>('results');
  const [tournamentFilter, setTournamentFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [modalMatch, setModalMatch] = useState<Match | null>(
    selectedMatchId ? matches.find(m => m.id === selectedMatchId || m.slug === selectedMatchId) || null : null
  );

  // Filtered matches
  const filteredMatches = matches.filter(m => {
    if (tournamentFilter !== 'ALL' && m.tournamentId !== tournamentFilter) return false;
    if (resultFilter !== 'ALL' && m.result !== resultFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              MATCH CENTER & FIXTURES
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete competitive match archive, player performance sheets, and upcoming fixture schedule.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'results' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            RESULTS & REPORTS ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'fixtures' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            UPCOMING FIXTURES ({fixtures.length})
          </button>
        </div>
      </div>

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">TOURNAMENT:</span>
              <select
                value={tournamentFilter}
                onChange={(e) => setTournamentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Tournaments</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              {['ALL', 'WIN', 'DRAW', 'LOSS'].map(res => (
                <button
                  key={res}
                  onClick={() => setResultFilter(res)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    resultFilter === res ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Matches List */}
          {filteredMatches.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No matches found matching filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map(match => (
                <div
                  key={match.id}
                  onClick={() => setModalMatch(match)}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Tournament & Date */}
                    <div className="sm:w-1/4">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {match.tournamentName}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {match.date} • {match.time} BST
                      </p>
                      <span className="text-[10px] text-slate-500 uppercase">{match.homeAway} FIXTURE</span>
                    </div>

                    {/* Center: Teams & Score */}
                    <div className="flex-1 flex items-center justify-center space-x-3 sm:space-x-6">
                      {/* BDPSC - Club Logo aligned to the left of the Club Name */}
                      <div className="text-left w-36 sm:w-48 flex items-center justify-end gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/40 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                          <img
                            src={match.clubLogo || '/logo.svg'}
                            alt={match.clubName || 'BD Power Strikers'}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 text-left">
                          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition-colors truncate">
                            {match.clubName || 'BD POWER STRIKERS'}
                          </h3>
                          <p className="text-[10px] text-amber-400 font-bold uppercase">CLUB</p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-center shrink-0">
                        <div className="inline-flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-xl font-mono text-xl sm:text-2xl font-black">
                          <span className="text-amber-400">{match.scoreClub}</span>
                          <span className="text-slate-600">:</span>
                          <span className="text-white">{match.scoreOpponent}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            match.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            match.result === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {match.result}
                          </span>
                        </div>
                      </div>

                      {/* Opponent */}
                      <div className="text-left w-36 sm:w-44 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={getOpponentLogoUrl(match.opponentClub, match.opponentLogo)}
                            alt={match.opponentClub}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-black text-white truncate">
                            {match.opponentClub}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">OPPONENT</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: MOTM & Trigger */}
                    <div className="sm:w-1/4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      {match.motmPlayerName && (
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>MOTM: <strong className="text-white">{match.motmPlayerName}</strong></span>
                        </div>
                      )}
                      <span className="text-xs text-amber-400 font-bold group-hover:underline mt-1">
                        View Report & Stats →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FIXTURES TAB */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          {fixtures.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No upcoming fixtures scheduled currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fixtures.map(fix => (
                <div key={fix.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {fix.tournament}
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-500/30">
                      {fix.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 text-center">
                    <div className="w-2/5 flex flex-col items-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-amber-500/40 p-1 mb-2 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <img
                          src={fix.homeTeamLogo || '/logo.svg'}
                          alt={fix.homeTeam || 'BD Power Strikers'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">{fix.homeTeam || 'BD POWER STRIKERS'}</h4>
                    </div>

                    <div className="text-center px-2">
                      <span className="text-xs font-black text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                        VS
                      </span>
                      <p className="text-xs font-bold text-white mt-2 font-mono">{fix.date}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{fix.time} BST</p>
                    </div>

                    <div className="w-2/5 flex flex-col items-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-700 p-1 mb-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={getOpponentLogoUrl(fix.opponent, fix.opponentLogo)}
                          alt={fix.opponent}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">{fix.opponent}</h4>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{fix.venuePlatform}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MATCH DETAIL MODAL */}
      {modalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  {modalMatch.tournamentName}
                </span>
                <p className="text-xs text-slate-400 mt-1">{modalMatch.date} • {modalMatch.time} BST</p>
              </div>
              <button
                onClick={() => setModalMatch(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Hero */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between text-center">
              <div className="w-1/3 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/40 p-1 mb-1.5 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <img
                    src={modalMatch.clubLogo || '/logo.svg'}
                    alt={modalMatch.clubName || 'BD Power Strikers'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-black text-white text-base truncate max-w-full">
                  {modalMatch.clubName || 'BD POWER STRIKERS'}
                </h3>
                <span className="text-xs text-amber-400 font-bold uppercase">CLUB</span>
              </div>
              <div className="w-1/3">
                <div className="text-4xl font-black font-mono">
                  <span className="text-amber-400">{modalMatch.scoreClub}</span>
                  <span className="text-slate-600 mx-2">:</span>
                  <span className="text-white">{modalMatch.scoreOpponent}</span>
                </div>
                <div className="mt-1">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                    modalMatch.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {modalMatch.result}
                  </span>
                </div>
              </div>
              <div className="w-1/3 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 p-1 mb-1.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={getOpponentLogoUrl(modalMatch.opponentClub, modalMatch.opponentLogo)}
                    alt={modalMatch.opponentClub}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-black text-white text-base truncate max-w-full">{modalMatch.opponentClub}</h3>
                <span className="text-xs text-slate-400 uppercase">OPPONENT</span>
              </div>
            </div>

            {/* Match Report */}
            {modalMatch.matchReport && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Official Match Report
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {modalMatch.matchReport}
                </p>
              </div>
            )}

            {/* Player Performances Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Squad Performance & Ratings
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-2 text-center">Goals</th>
                      <th className="py-2.5 px-2 text-center">Assists</th>
                      <th className="py-2.5 px-2 text-center">Clean Sheet</th>
                      <th className="py-2.5 px-2 text-center">MOTM</th>
                      <th className="py-2.5 px-3 text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {modalMatch.playerStats.map(ps => {
                      const p = players.find(x => x.id === ps.playerId);
                      return (
                        <tr key={ps.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => {
                                if (p) {
                                  onSelectPlayer(p.slug);
                                  setModalMatch(null);
                                }
                              }}
                              className="font-bold text-white hover:text-amber-400 text-left"
                            >
                              {p ? p.gamingName : ps.playerId}
                            </button>
                            <span className="text-[10px] text-slate-500 block">{p?.position}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-amber-400">{ps.goals}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-white">{ps.assists}</td>
                          <td className="py-2.5 px-2 text-center text-slate-400">{ps.cleanSheet ? 'YES' : 'NO'}</td>
                          <td className="py-2.5 px-2 text-center">
                            {ps.motm ? (
                              <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                MOTM
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-white font-mono">
                            {ps.performanceScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Screenshot or Video link */}
            {(modalMatch.matchScreenshot || modalMatch.matchVideoUrl) && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between text-xs">
                {modalMatch.matchVideoUrl && (
                  <a
                    href={modalMatch.matchVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-bold"
                  >
                    <Play className="w-4 h-4" />
                    <span>Watch Match Video Stream</span>
                  </a>
                )}
                {modalMatch.matchScreenshot && (
                  <a
                    href={modalMatch.matchScreenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-slate-300 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Official Scoreboard Screenshot</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
