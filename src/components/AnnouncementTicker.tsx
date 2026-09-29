import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Megaphone, 
  Sparkles, 
  Swords, 
  Calendar, 
  Users, 
  Pause, 
  Play, 
  ArrowRight, 
  Settings, 
  PlusCircle, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ClubAnnouncement, AnnouncementType } from '../types';
import { useAuth } from '../context/AuthContext';

interface AnnouncementTickerProps {
  announcements: ClubAnnouncement[];
  onNavigate: (view: string, subParam?: string) => void;
  onOpenAdminAnnouncements?: () => void;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({
  announcements,
  onNavigate,
  onOpenAdminAnnouncements,
}) => {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'slow' | 'fast'>('normal');
  const [isHovered, setIsHovered] = useState(false);

  const canManage = isSuperAdmin || hasPermission('announcements.manage') || hasPermission('news.create') || user?.roles.some(r => r.name === 'ADMIN' || r.name === 'SUPER_ADMIN' || r.name === 'EDITOR');

  // Filter only active announcements and sort by priority descending
  const activeAnnouncements = announcements
    .filter(a => a.isActive)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Fallback items if none are configured or all deactivated
  const displayItems: ClubAnnouncement[] = activeAnnouncements.length > 0 
    ? activeAnnouncements 
    : [
        {
          id: 'def-1',
          title: 'OFFICIAL eFOOTBALL CLUB',
          content: 'BD Power Strikers Club — Reigning National Champions 2026 • Welcome to Bangladesh premier competitive esports hub.',
          type: 'CELEBRATION',
          isActive: true,
          priority: 100,
          actionLink: 'home',
          actionLabel: 'Club Overview',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'def-2',
          title: 'MATCH STATS & ELO',
          content: 'Real-time player rankings, match history, and automated performance calculation v2.4 active.',
          type: 'UPDATE',
          isActive: true,
          priority: 90,
          actionLink: 'rankings',
          actionLabel: 'View Leaderboards',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

  const getBadgeStyle = (type: AnnouncementType) => {
    switch (type) {
      case 'CELEBRATION':
        return {
          bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10',
          dot: 'bg-amber-400',
          icon: Trophy,
          label: 'CHAMPIONS',
        };
      case 'URGENT':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-red-500/10 animate-pulse',
          dot: 'bg-red-500',
          icon: Flame,
          label: 'URGENT',
        };
      case 'MATCH':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10',
          dot: 'bg-emerald-400',
          icon: Swords,
          label: 'MATCH DAY',
        };
      case 'TOURNAMENT':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/10',
          dot: 'bg-purple-400',
          icon: Calendar,
          label: 'TOURNAMENT',
        };
      case 'ROSTER':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10',
          dot: 'bg-cyan-400',
          icon: Users,
          label: 'SQUAD',
        };
      case 'UPDATE':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/10',
          dot: 'bg-blue-400',
          icon: Sparkles,
          label: 'UPDATE',
        };
      case 'GENERAL':
      default:
        return {
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600/50 shadow-slate-900/10',
          dot: 'bg-amber-400',
          icon: Megaphone,
          label: 'NOTICE',
        };
    }
  };

  const getAnimationClass = () => {
    if (isPaused) return '';
    if (speed === 'fast') return 'animate-marquee-fast';
    if (speed === 'slow') return 'animate-marquee-slow';
    return 'animate-marquee';
  };

  const handleActionClick = (e: React.MouseEvent, item: ClubAnnouncement) => {
    e.stopPropagation();
    if (!item.actionLink) return;

    if (item.actionLink.startsWith('http://') || item.actionLink.startsWith('https://')) {
      window.open(item.actionLink, '_blank', 'noopener,noreferrer');
      return;
    }

    const clean = item.actionLink.replace(/^#\/?/, '').replace(/^\//, '');
    const parts = clean.split('/');
    onNavigate(parts[0] || 'home', parts[1]);
  };

  return (
    <div 
      className="relative z-30 w-full bg-slate-950/95 border-b border-amber-500/30 shadow-md backdrop-blur-md overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* High-tech esports ambient gradient background line */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-slate-900/40 to-amber-500/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center h-10 px-2 sm:px-4">
        
        {/* Left Fixed Badge: LIVE CLUB BROADCAST */}
        <div className="flex items-center space-x-2 shrink-0 pr-3 border-r border-slate-800/90 z-10 bg-slate-950/90 py-1">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black tracking-widest text-amber-400 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="hidden sm:inline">CLUB ANNOUNCEMENT</span>
            <span className="sm:hidden">LIVE</span>
          </div>

          {/* Quick controls: Pause/Play */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Play moving announcement" : "Pause moving announcement"}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-[10px] flex items-center"
            aria-label={isPaused ? "Resume announcement movement" : "Pause announcement movement"}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
          </button>

          {/* Speed selector for moving text */}
          <button
            type="button"
            onClick={() => {
              if (speed === 'normal') setSpeed('fast');
              else if (speed === 'fast') setSpeed('slow');
              else setSpeed('normal');
            }}
            title={`Speed: ${speed.toUpperCase()} (Click to toggle)`}
            className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition uppercase border border-slate-800"
          >
            {speed}
          </button>
        </div>

        {/* Moving Marquee Content Area */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          
          {/* Subtle gradient fades on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          {/* The continuous scrolling marquee track */}
          <div className={`flex items-center space-x-8 whitespace-nowrap pl-4 ${getAnimationClass()}`}>
            
            {/* First sequence of announcements */}
            {displayItems.map((item, idx) => {
              const badge = getBadgeStyle(item.type);
              const BadgeIcon = badge.icon;

              return (
                <div 
                  key={`ann-first-${item.id}-${idx}`}
                  className="flex items-center space-x-3 text-xs group py-1 cursor-default"
                >
                  {/* Category Pill */}
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    <BadgeIcon className="w-2.5 h-2.5" />
                    <span>{item.title || badge.label}</span>
                  </span>

                  {/* Announcement Content */}
                  <span className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {item.content}
                  </span>

                  {/* Optional Action CTA */}
                  {item.actionLink && (
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(e, item)}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition hover:scale-105"
                    >
                      <span>{item.actionLabel || 'View'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {/* Esports Separator Dot */}
                  <span className="text-amber-500/50 font-black pl-2">•</span>
                </div>
              );
            })}

            {/* Second sequence of announcements for seamless endless loop */}
            {displayItems.map((item, idx) => {
              const badge = getBadgeStyle(item.type);
              const BadgeIcon = badge.icon;

              return (
                <div 
                  key={`ann-second-${item.id}-${idx}`}
                  className="flex items-center space-x-3 text-xs group py-1 cursor-default"
                  aria-hidden="true"
                >
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    <BadgeIcon className="w-2.5 h-2.5" />
                    <span>{item.title || badge.label}</span>
                  </span>

                  <span className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {item.content}
                  </span>

                  {item.actionLink && (
                    <button
                      type="button"
                      onClick={(e) => handleActionClick(e, item)}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition hover:scale-105"
                    >
                      <span>{item.actionLabel || 'View'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}

                  <span className="text-amber-500/50 font-black pl-2">•</span>
                </div>
              );
            })}

          </div>
        </div>

        {/* Right Side: Admin Quick Manage Button */}
        {canManage && (
          <div className="shrink-0 pl-3 border-l border-slate-800/90 z-10 bg-slate-950/90 flex items-center space-x-1.5">
            <button
              type="button"
              id="admin-manage-announcements-btn"
              onClick={onOpenAdminAnnouncements}
              className="inline-flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all"
              title="Admin: Create or control moving club announcements"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden sm:inline">CONTROL ANNOUNCEMENT</span>
              <span className="sm:hidden">EDIT</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
