import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Crown, 
  Layers, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Tournament, KnockoutMatch, TournamentStanding } from '../types';

interface TournamentsViewProps {
  tournaments: Tournament[];
  selectedTournamentId?: string;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  selectedTournamentId,
}) => {
  const [activeTournamentId, setActiveTournamentId] = useState<string>(
    selectedTournamentId || tournaments[0]?.id || ''
  );

  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0];

  // Group bracket matches by round if bracket exists
  const quarterFinals = activeTournament?.bracket?.filter(m => m.round === 'Quarter Final') || [];
  const semiFinals = activeTournament?.bracket?.filter(m => m.round === 'Semi Final') || [];
  const finalMatch = activeTournament?.bracket?.find(m => m.round === 'Final');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TOURNAMENT CENTER & BRACKETS
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          National and international competitive campaigns, knockout brackets, points tables, and honors.
        </p>
      </div>

      {/* Tournament Selector Strip */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {tournaments.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTournamentId(t.id)}
            className={`px-4 py-3 rounded-2xl border text-left shrink-0 transition-all ${
              activeTournamentId === t.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/20">
                {t.tier} Tier
              </span>
              <span className={`text-[10px] font-extrabold uppercase ${
                activeTournamentId === t.id ? 'text-slate-950' : 'text-amber-400'
              }`}>
                {t.status}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold mt-1 truncate max-w-[220px]">
              {t.name}
            </h3>
          </button>
        ))}
      </div>

      {/* Active Tournament Detail Banner */}
      {activeTournament && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                  {activeTournament.tier}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg uppercase ${
                  activeTournament.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {activeTournament.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {activeTournament.startDate} to {activeTournament.endDate}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                {activeTournament.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Organized by: <strong className="text-slate-200">{activeTournament.organizer}</strong>
              </p>
            </div>

            {/* Champion or Prize Pool */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[180px]">
              {activeTournament.clubFinalPosition ? (
                <>
                  <Crown className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">CLUB RESULT</span>
                  <span className="text-sm font-black text-amber-400 block">{activeTournament.clubFinalPosition}</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">PRIZE POOL</span>
                  <span className="text-sm font-black text-white block">{activeTournament.prizePool || 'Glory & Trophy'}</span>
                </>
              )}
            </div>
          </div>

          {/* Tournament Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Format</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeTournament.format.replace('_', ' ')}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Participants</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeTournament.participantsCount} Elite Teams</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Top Scorer</span>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{activeTournament.topScorer?.name || 'In Progress'}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Tournament MVP</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{activeTournament.topPerformer?.name || 'In Progress'}</p>
            </div>
          </div>

          {/* Description */}
          {activeTournament.description && (
            <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {activeTournament.description}
            </p>
          )}

          {/* 1. VISUAL KNOCKOUT BRACKET */}
          {activeTournament.bracket && activeTournament.bracket.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Knockout Championship Bracket
                </h3>
              </div>

              {/* Bracket Container */}
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[700px] grid grid-cols-3 gap-6 items-center">
                  {/* Round 1: Quarter Finals */}
                  <div className="space-y-4">
                    <div className="text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-800 uppercase tracking-wider">
                      Quarter Finals
                    </div>
                    {quarterFinals.map(match => (
                      <div
                        key={match.id}
                        className={`bg-slate-950 border rounded-xl p-3 space-y-2 ${
                          match.winner?.includes('BD Power Strikers') ? 'border-amber-500/50 shadow-md' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold truncate ${match.team1.isClub ? 'text-amber-400' : 'text-white'}`}>
                            {match.team1.name}
                          </span>
                          <span className="font-mono font-black text-white ml-2">{match.team1.score ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-1.5">
                          <span className={`font-bold truncate ${match.team2.isClub ? 'text-amber-400' : 'text-white'}`}>
                            {match.team2.name}
                          </span>
                          <span className="font-mono font-black text-white ml-2">{match.team2.score ?? '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Round 2: Semi Finals */}
                  <div className="space-y-6">
                    <div className="text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-800 uppercase tracking-wider">
                      Semi Finals
                    </div>
                    {semiFinals.map(match => (
                      <div
                        key={match.id}
                        className={`bg-slate-950 border rounded-xl p-3.5 space-y-2.5 ${
                          match.winner?.includes('BD Power Strikers') ? 'border-amber-500/50 shadow-md' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold truncate ${match.team1.isClub ? 'text-amber-400' : 'text-white'}`}>
                            {match.team1.name}
                          </span>
                          <span className="font-mono font-black text-white ml-2">{match.team1.score ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-1.5">
                          <span className={`font-bold truncate ${match.team2.isClub ? 'text-amber-400' : 'text-white'}`}>
                            {match.team2.name}
                          </span>
                          <span className="font-mono font-black text-white ml-2">{match.team2.score ?? '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Round 3: Grand Final & Champion */}
                  <div className="space-y-4">
                    <div className="text-center font-bold text-xs text-amber-400 pb-2 border-b border-amber-500/30 uppercase tracking-wider">
                      🏆 Grand Final
                    </div>
                    {finalMatch && (
                      <div className="bg-gradient-to-b from-slate-950 to-amber-950/20 border-2 border-amber-500/60 rounded-2xl p-4 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-black text-sm truncate ${finalMatch.team1.isClub ? 'text-amber-400' : 'text-white'}`}>
                            {finalMatch.team1.name}
                          </span>
                          <span className="font-mono font-black text-amber-400 text-lg ml-2">{finalMatch.team1.score ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
                          <span className={`font-black text-sm truncate ${finalMatch.team2.isClub ? 'text-amber-400' : 'text-white'}`}>
                            {finalMatch.team2.name}
                          </span>
                          <span className="font-mono font-black text-white text-lg ml-2">{finalMatch.team2.score ?? '—'}</span>
                        </div>

                        {finalMatch.winner && (
                          <div className="pt-2 border-t border-amber-500/30 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">CHAMPION</span>
                            <span className="text-xs font-black text-amber-300 flex items-center justify-center space-x-1 mt-0.5">
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                              <span>{finalMatch.winner}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. STANDINGS TABLE (For League or Group Tournaments) */}
          {activeTournament.standings && activeTournament.standings.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Tournament Group Standings
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-2 text-center">P</th>
                      <th className="py-2.5 px-2 text-center">W</th>
                      <th className="py-2.5 px-2 text-center">D</th>
                      <th className="py-2.5 px-2 text-center">L</th>
                      <th className="py-2.5 px-2 text-center">GF</th>
                      <th className="py-2.5 px-2 text-center">GA</th>
                      <th className="py-2.5 px-2 text-center">GD</th>
                      <th className="py-2.5 px-3 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeTournament.standings.map(st => (
                      <tr key={st.position} className={st.isClub ? 'bg-amber-500/10 font-bold' : 'hover:bg-slate-800/40'}>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{st.position}</td>
                        <td className={`py-2.5 px-3 ${st.isClub ? 'text-amber-400 font-black' : 'text-white'}`}>
                          {st.teamName} {st.isClub && '(BDPSC)'}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{st.played}</td>
                        <td className="py-2.5 px-2 text-center text-emerald-400">{st.won}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{st.drawn}</td>
                        <td className="py-2.5 px-2 text-center text-rose-400">{st.lost}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{st.goalsFor}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{st.goalsAgainst}</td>
                        <td className="py-2.5 px-2 text-center font-mono">
                          {st.goalDifference > 0 ? `+${st.goalDifference}` : st.goalDifference}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-400 font-mono text-sm">
                          {st.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
