import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Calendar, Trophy, Newspaper, ArrowRight } from 'lucide-react';
import { searchGlobal } from '../services/api';
import { Player, Match, Tournament, NewsArticle } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    players: Player[];
    matches: Match[];
    tournaments: Tournament[];
    news: NewsArticle[];
  }>({ players: [], matches: [], tournaments: [], news: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ players: [], matches: [], tournaments: [], news: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ players: [], matches: [], tournaments: [], news: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchGlobal(query.trim());
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results.players.length > 0 ||
    results.matches.length > 0 ||
    results.tournaments.length > 0 ||
    results.news.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players, opponents, tournaments, matches, or news..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded font-semibold ml-2 border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching BDPSC records...
            </div>
          )}

          {!loading && query.trim() && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="py-6 text-center text-xs text-slate-500">
              Type a player name (e.g. "Noyon", "Ashem"), opponent club ("Dhaka Dragons"), or tournament.
            </div>
          )}

          {/* Players */}
          {results.players.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Players ({results.players.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('player-detail', p.slug);
                      onClose();
                    }}
                    className="flex items-center space-x-3 p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors group"
                  >
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-full aspect-square object-cover border border-amber-500/40 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-xs truncate group-hover:text-amber-400">
                          {p.gamingName}
                        </span>
                        <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1 rounded">
                          #{p.jerseyNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{p.name} • {p.position}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-amber-400 font-extrabold text-sm">{p.rating}</span>
                      <p className="text-[9px] text-slate-500">OVR</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matches */}
          {results.matches.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Matches ({results.matches.length})</span>
              </div>
              <div className="space-y-2">
                {results.matches.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onNavigate('matches', m.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-white">
                        BDPSC vs {m.opponentClub}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {m.tournamentName} • {m.date}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        m.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        m.result === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {m.scoreClub} - {m.scoreOpponent} ({m.result})
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tournaments */}
          {results.tournaments.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Tournaments ({results.tournaments.length})</span>
              </div>
              <div className="space-y-2">
                {results.tournaments.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigate('tournaments', t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-white">
                        {t.name}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {t.organizer} • {t.status}
                      </p>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold">
                      {t.tier} Tier
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {results.news.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5" />
                <span>News & Announcements ({results.news.length})</span>
              </div>
              <div className="space-y-2">
                {results.news.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onNavigate('news', n.slug);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors"
                  >
                    <div className="pr-4">
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {n.title}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {n.category} • {new Date(n.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
