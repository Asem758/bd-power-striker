import React, { useState, useRef, useEffect } from 'react';
import { ClubLogo } from './ClubLogo';
import { 
  Shield, 
  Trophy, 
  Users, 
  Calendar, 
  Award, 
  BarChart3, 
  Newspaper, 
  Image as ImageIcon, 
  Search, 
  Lock, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Sparkles, 
  Camera 
} from 'lucide-react';
import { Season, ClubAnnouncement } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate?: (view: string, idOrSlug?: string) => void;
  setCurrentView?: (view: string) => void;
  announcements?: ClubAnnouncement[];
  seasons?: Season[];
  currentSeasonId?: string;
  setCurrentSeasonId?: (id: string) => void;
  onOpenSearch?: () => void;
  openSearch?: () => void;
  openAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  setCurrentView,
  announcements = [],
  onOpenSearch,
  openSearch,
}) => {
  const { user, isAuthenticated, isAdmin, roleBadge, logout, openAuthModal, openPhotoModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenSearch = onOpenSearch || openSearch || (() => {});

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Strictly Public Navigation according to Specification:
  // HOME | PLAYERS | MATCHES | TOURNAMENTS | RANKINGS | NEWS | TROPHIES | MEDIA
  const navItems = [
    { id: 'home', label: 'HOME', icon: Shield },
    { id: 'players', label: 'PLAYERS', icon: Users },
    { id: 'matches', label: 'MATCHES', icon: Calendar },
    { id: 'tournaments', label: 'TOURNAMENTS', icon: Trophy },
    { id: 'rankings', label: 'RANKINGS', icon: BarChart3 },
    { id: 'news', label: 'NEWS', icon: Newspaper },
    { id: 'trophies', label: 'TROPHIES', icon: Award },
    { id: 'media', label: 'MEDIA', icon: ImageIcon },
  ];

  const handleNavClick = (viewId: string, subParam?: string) => {
    if (onNavigate) {
      onNavigate(viewId, subParam);
    } else if (setCurrentView) {
      setCurrentView(viewId);
    }
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    handleNavClick('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20 gap-3 xl:gap-6">
          {/* Left: Brand Identity */}
          <div className="flex items-center shrink-0 z-10">
            <button 
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2.5 xl:space-x-3 text-left group focus:outline-none shrink-0 select-none py-1"
            >
              <ClubLogo size="md" className="w-10 h-10 xl:w-11 xl:h-11 shrink-0" />
              <div className="shrink-0 min-w-max flex flex-col justify-center">
                <span className="text-sm xl:text-base font-black tracking-wider text-white group-hover:text-amber-400 transition-colors uppercase whitespace-nowrap leading-tight">
                  BD POWER STRIKERS
                </span>
                <p className="text-[9px] xl:text-[10px] font-medium text-slate-400 tracking-wider whitespace-nowrap leading-normal mt-0.5">
                  COMPETITIVE eFOOTBALL CLUB
                </p>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation Buttons (Perfect Center Alignment) */}
          <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 space-x-0.5 xl:space-x-1.5 z-10 pointer-events-auto">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Search & Dynamic Auth Profile Perfectly Aligned */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5 shrink-0 z-10">
            {/* Search Trigger */}
            <button
              id="global-search-trigger-btn"
              onClick={handleOpenSearch}
              className="h-9 xl:h-10 px-3 xl:px-3.5 flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-full text-xs font-semibold transition-all shadow-sm shrink-0"
              title="Quick Search"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>SEARCH</span>
            </button>

            {/* Authenticated User Menu with Avatar & Assigned Role Badge */}
            {isAuthenticated && user ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-9 xl:h-10 pl-1.5 pr-2.5 xl:pr-3 flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 shrink-0"
                  aria-expanded={userDropdownOpen}
                  aria-label="User navigation menu"
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt={user.name}
                      className="w-6.5 h-6.5 xl:w-7 xl:h-7 rounded-full aspect-square object-cover border border-amber-400/80 shadow-sm"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950"></span>
                  </div>

                  <div className="text-left flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white leading-tight truncate max-w-[70px] xl:max-w-[110px]">
                        {user.gamingName || user.name.split(' ')[0]}
                      </span>
                      {/* Dynamic Role Badge */}
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                        {roleBadge.displayName}
                      </span>
                    </div>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ml-0.5 transition-transform shrink-0 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn overflow-hidden">
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Interactive Profile Avatar with hover edit overlay */}
                        <div 
                          className="relative group/avatar cursor-pointer shrink-0" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openPhotoModal();
                          }}
                          title="Click to update profile photo"
                        >
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                            alt={user.name}
                            className="w-12 h-12 rounded-full aspect-square object-cover border-2 border-amber-400 group-hover/avatar:border-amber-300 transition-all shadow-md group-hover/avatar:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <Camera className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-400 text-zinc-950 rounded-full shadow border border-zinc-950">
                            <Camera className="w-2.5 h-2.5" />
                          </div>
                        </div>

                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              openPhotoModal();
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Camera className="w-2.5 h-2.5" />
                            <span>Change photo</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">ASSIGNED ROLE</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                          {roleBadge.displayName}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="py-1">
                      {/* Link: Update Profile Photo */}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openPhotoModal();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left text-zinc-300 hover:bg-zinc-900 hover:text-white transition group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span>Update Profile Photo</span>
                        </div>
                        <span className="text-[9px] text-amber-400 font-extrabold uppercase bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          Upload
                        </span>
                      </button>

                      {/* Link: Player Dashboard */}
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition ${
                          currentView === 'dashboard'
                            ? 'bg-amber-400/10 text-amber-400 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <LayoutDashboard className="w-4 h-4 text-amber-400" />
                          <span>Player Dashboard</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">/dashboard</span>
                      </button>

                      {/* Link: Admin Panel (ONLY SHOWN IF AUTHORIZED STAFF) */}
                      {isAdmin && (
                        <button
                          onClick={() => handleNavClick('admin')}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition ${
                            currentView === 'admin'
                              ? 'bg-amber-400/10 text-amber-400 font-bold'
                              : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span>Admin Dashboard</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">/admin</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-zinc-800/80 my-1"></div>

                    {/* Sign Out */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-950/30 text-left transition font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="h-9 xl:h-10 flex items-center space-x-1.5 px-4 xl:px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-full shadow-md shadow-amber-400/20 transition-all hover:scale-102 shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger & search */}
          <div className="flex lg:hidden items-center space-x-2 shrink-0">
            <button
              onClick={handleOpenSearch}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 transition-all animate-fadeIn">
          {/* User Status in Mobile */}
          {isAuthenticated && user ? (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openPhotoModal();
                  }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full aspect-square object-cover border-2 border-amber-400 group-hover:scale-105 transition shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-400 text-zinc-950 rounded-full shadow border border-zinc-950">
                      <Camera className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1">
                      <span>{user.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">{user.email}</div>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                  {roleBadge.displayName}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openPhotoModal();
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Update Photo</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="text-xs text-zinc-300 hover:text-white font-bold flex items-center gap-1"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('login');
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl mb-3 shadow-md shadow-amber-400/20"
            >
              Sign In to BDPSC
            </button>
          )}

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Authenticated Links in Mobile */}
          {isAuthenticated && (
            <div className="pt-2 space-y-2 border-t border-zinc-800">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold ${
                  currentView === 'dashboard'
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Player Dashboard</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'admin'
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-900 text-amber-400 border border-amber-400/30'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
