import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Crown, 
  Calendar, 
  CheckCircle2, 
  Star, 
  Users, 
  Sparkles,
  Medal,
  Clock,
  Flame,
  UserCheck,
  Settings
} from 'lucide-react';
import { Trophy as TrophyType, Award as AwardType, ClubMilestone } from '../types';
import { useAuth } from '../context/AuthContext';

interface TrophiesViewProps {
  trophies: TrophyType[];
  awards: AwardType[];
  milestones: ClubMilestone[];
  onSelectPlayer: (slug: string) => void;
  onNavigateToAdminTrophies?: () => void;
}

const FALLBACK_TROPHY_IMG = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=600';
const FALLBACK_PLAYER_IMG = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400';

export const TrophiesView: React.FC<TrophiesViewProps> = ({
  trophies,
  awards,
  milestones,
  onSelectPlayer,
  onNavigateToAdminTrophies,
}) => {
  const { isAdmin, isSuperAdmin, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'trophies' | 'awards' | 'milestones'>('trophies');

  const canManage = isSuperAdmin || isAdmin || hasPermission('tournaments.edit') || hasPermission('tournaments.create');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TROPHY CABINET & CLUB HONORS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Permanent hall of championship titles, individual player awards, and historic club milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Management Shortcut */}
          {canManage && onNavigateToAdminTrophies && (
            <button
              type="button"
              id="trophies-admin-manage-btn"
              onClick={onNavigateToAdminTrophies}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition hover:scale-105"
              title="Open Admin Trophy Management"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage in Admin</span>
            </button>
          )}

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('trophies')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'trophies' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              CHAMPION TROPHIES ({trophies.length})
            </button>
            <button
              onClick={() => setActiveTab('awards')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'awards' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              INDIVIDUAL HONORS ({awards.length})
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'milestones' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              CLUB MILESTONES ({milestones.length})
            </button>
          </div>
        </div>
      </div>

      {/* 1. TROPHIES TAB */}
      {activeTab === 'trophies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trophies.map(trophy => (
            <div
              key={trophy.id}
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex items-start space-x-4">
                <img
                  src={trophy.trophyImageUrl || FALLBACK_TROPHY_IMG}
                  alt={trophy.tournamentName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_TROPHY_IMG;
                  }}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/50 shrink-0 shadow-lg bg-slate-900"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {trophy.position || 'Champions'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {trophy.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mt-1">
                    {trophy.tournamentName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {trophy.achievementDescription}
                  </p>
                </div>
              </div>

              {/* Tournament Highlights Strip */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black flex items-center space-x-1">
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    <span>Tournament MVP</span>
                  </span>
                  <span className="font-bold text-amber-400 block mt-0.5">
                    {trophy.mvpPlayerName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>Top Goalscorer</span>
                  </span>
                  <span className="font-bold text-white block mt-0.5">
                    {trophy.topScorerName || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Winning Squad Roster */}
              {trophy.squadMembers && trophy.squadMembers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Championship Winning Squad:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trophy.squadMembers.map((member: string, i: number) => (
                      <span
                        key={i}
                        className="bg-slate-800/90 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-medium"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. AWARDS TAB */}
      {activeTab === 'awards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map(aw => (
            <div
              key={aw.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={aw.playerPhotoUrl || FALLBACK_PLAYER_IMG}
                  alt={aw.playerName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PLAYER_IMG;
                  }}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400/40 shrink-0 bg-slate-950"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {aw.category || aw.awardType || 'HONOR'}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1">
                    {aw.gamingName}
                  </h3>
                  <p className="text-xs text-slate-400">{aw.playerName}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                <p className="font-bold text-amber-300">{aw.title}</p>
                <p className="text-slate-400">{aw.statsSummary}</p>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {aw.description}
              </p>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                {aw.period} • Announced: {aw.awardDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Chronological Club Heritage
            </h2>
          </div>

          <div className="space-y-8 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {milestones.map((m, i) => (
              <div key={m.id} className="relative">
                <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-900 shadow-sm"></div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase block">
                  {m.date} • {m.category}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1 max-w-2xl">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
