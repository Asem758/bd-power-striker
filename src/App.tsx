import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProfilePhotoModal } from './components/auth/ProfilePhotoModal';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomeView } from './components/HomeView';
import { PlayersView } from './components/PlayersView';
import { PlayerProfileView } from './components/PlayerProfileView';
import { RankingsView } from './components/RankingsView';
import { MatchesView } from './components/MatchesView';
import { TournamentsView } from './components/TournamentsView';
import { DigitalCardGenerator } from './components/DigitalCardGenerator';
import { TrophiesView } from './components/TrophiesView';
import { NewsMediaView } from './components/NewsMediaView';
import { PlayerDashboard } from './components/dashboard/PlayerDashboard';
import { RoleAdminDashboard } from './components/admin/RoleAdminDashboard';
import { fetchInitialData } from './services/api';
import { 
  ClubStats, 
  Player, 
  Match, 
  Fixture, 
  Tournament, 
  Season, 
  Award, 
  Trophy, 
  ClubMilestone, 
  NewsArticle, 
  MediaItem, 
  RatingConfig,
  ClubAnnouncement
} from './types';

function AppContent() {
  const { openAuthModal } = useAuth();

  // Normalize path from pathname or hash
  const parseCurrentPath = (): { view: string; subParam?: string } => {
    const rawPath = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
    const parts = rawPath.split('/').filter(Boolean);

    if (parts.length === 0) {
      return { view: 'home' };
    }

    const first = parts[0].toLowerCase();

    // Map common path aliases
    if (first === 'login') return { view: 'login' };
    if (first === 'dashboard' || (first === 'player' && parts[1] === 'dashboard')) return { view: 'dashboard' };
    if (first === 'admin' || (first === 'admin' && parts[1] === 'dashboard')) return { view: 'admin' };
    if (first === 'players' && parts[1]) return { view: 'player-detail', subParam: parts[1] };
    if (first === 'player-detail') return { view: 'player-detail', subParam: parts[1] };
    
    if (['players', 'matches', 'tournaments', 'rankings', 'news', 'trophies', 'media', 'cards'].includes(first)) {
      return { view: first, subParam: parts[1] };
    }

    return { view: 'home' };
  };

  const initialParsed = parseCurrentPath();
  const [currentView, setCurrentView] = useState<string>(initialParsed.view);
  const [viewParams, setViewParams] = useState<{ idOrSlug?: string }>({ idOrSlug: initialParsed.subParam });
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // App Data State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [milestones, setMilestones] = useState<ClubMilestone[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [ratingConfig, setRatingConfig] = useState<RatingConfig>({
    id: 'cfg-v2',
    version: '2.4.0',
    baseRating: 65,
    winWeight: 0.15,
    goalWeight: 0.28,
    assistWeight: 0.22,
    cleanSheetWeight: 0.35,
    motmWeight: 1.25,
    opponentStrengthWeight: 0.2,
    tournamentMultiplier: {
      Major: 1.3,
      Championship: 1.15,
      Cup: 1.1,
      Friendly: 0.85,
    },
    formWeight: 0.1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'System Engine',
  });

  const loadData = async () => {
    try {
      const data = await fetchInitialData();
      setStats(data.stats);
      setPlayers(data.players);
      setMatches(data.matches);
      setFixtures(data.fixtures);
      setTournaments(data.tournaments);
      setSeasons(data.seasons);
      setAwards(data.awards);
      setTrophies(data.trophies);
      setMilestones(data.milestones);
      setNews(data.news);
      setMedia(data.media);
      setAnnouncements(data.announcements || []);
      setRatingConfig(data.ratingConfig);
    } catch (err) {
      console.error('Failed to load initial BDPSC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for browser history navigation
    const handlePopState = () => {
      const parsed = parseCurrentPath();
      setCurrentView(parsed.view);
      setViewParams({ idOrSlug: parsed.subParam });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: string, idOrSlug?: string) => {
    // Normalization
    let cleanView = view;
    if (view === 'admin/dashboard') cleanView = 'admin';
    if (view === 'player/dashboard') cleanView = 'dashboard';

    setCurrentView(cleanView);
    setViewParams({ idOrSlug });

    // Update browser URL
    let path = '/';
    if (cleanView === 'home') {
      path = '/';
    } else if (cleanView === 'admin') {
      path = '/admin/dashboard';
    } else if (cleanView === 'dashboard') {
      path = '/dashboard';
    } else if (cleanView === 'login') {
      path = '/login';
    } else {
      path = `/${cleanView}${idOrSlug ? `/${idOrSlug}` : ''}`;
    }

    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find latest match and upcoming fixture
  const latestMatch = matches[0] || null;
  const upcomingFixture = fixtures[0] || null;

  // Find POTW and POTM
  const potw = awards.find(a => a.category === 'POTW' || a.awardType === 'POTW') || null;
  const potm = awards.find(a => a.category === 'POTM' || a.awardType === 'POTM') || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      {/* Global Auth Modal for popup sign in */}
      <AuthModal onSuccessRedirect={(dest) => handleNavigate(dest)} />

      {/* Global Profile Photo Upload Modal */}
      <ProfilePhotoModal />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        announcements={announcements}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 w-full">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 animate-pulse shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-400 text-lg">
                BD
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              INITIALIZING BDPSC STATISTICAL HUB...
            </p>
          </div>
        ) : (
          <>
            {/* 1. PUBLIC: HOME VIEW */}
            {currentView === 'home' && (
              <HomeView
                stats={stats}
                players={players}
                latestMatch={latestMatch}
                upcomingFixture={upcomingFixture}
                potw={potw}
                potm={potm}
                trophies={trophies}
                latestNews={news}
                announcements={announcements}
                onNavigate={handleNavigate}
              />
            )}

            {/* 2. PUBLIC: SQUAD VIEW */}
            {currentView === 'players' && (
              <PlayersView
                players={players}
                onSelectPlayer={(slug) => handleNavigate('player-detail', slug)}
                onGenerateCard={(id) => handleNavigate('cards', id)}
              />
            )}

            {/* 3. PUBLIC: PLAYER DETAIL PROFILE VIEW */}
            {currentView === 'player-detail' && (
              <PlayerProfileView
                playerSlug={viewParams.idOrSlug || players[0]?.slug}
                onBack={() => handleNavigate('players')}
                onGenerateCard={(id) => handleNavigate('cards', id)}
                onNavigateMatch={(matchId) => handleNavigate('matches', matchId)}
              />
            )}

            {/* 4. PUBLIC: RANKINGS VIEW */}
            {currentView === 'rankings' && (
              <RankingsView
                players={players}
                onSelectPlayer={(slug) => handleNavigate('player-detail', slug)}
                onGenerateCard={(id) => handleNavigate('cards', id)}
              />
            )}

            {/* 5. PUBLIC: MATCH CENTER & FIXTURES */}
            {currentView === 'matches' && (
              <MatchesView
                matches={matches}
                fixtures={fixtures}
                tournaments={tournaments}
                seasons={seasons}
                players={players}
                selectedMatchId={viewParams.idOrSlug}
                onSelectPlayer={(slug) => handleNavigate('player-detail', slug)}
              />
            )}

            {/* 6. PUBLIC: TOURNAMENTS & BRACKETS */}
            {currentView === 'tournaments' && (
              <TournamentsView
                tournaments={tournaments}
                selectedTournamentId={viewParams.idOrSlug}
              />
            )}

            {/* 7. DIGITAL CARD GENERATOR */}
            {currentView === 'cards' && (
              <DigitalCardGenerator
                players={players}
                initialPlayerId={viewParams.idOrSlug}
              />
            )}

            {/* 8. PUBLIC: TROPHIES & HONORS */}
            {currentView === 'trophies' && (
              <TrophiesView
                trophies={trophies}
                awards={awards}
                milestones={milestones}
                onSelectPlayer={(slug) => handleNavigate('player-detail', slug)}
                onNavigateToAdminTrophies={() => handleNavigate('admin', 'trophies')}
              />
            )}

            {/* 9. PUBLIC: NEWS & MEDIA */}
            {(currentView === 'news' || currentView === 'media') && (
              <NewsMediaView
                news={news}
                media={media}
                selectedArticleSlug={viewParams.idOrSlug}
              />
            )}

            {/* 10. AUTH: PRODUCTION LOGIN PAGE (/login) */}
            {currentView === 'login' && (
              <LoginPage onNavigate={handleNavigate} />
            )}

            {/* 11. PROTECTED ROUTE: PLAYER / MEMBER DASHBOARD (/dashboard) */}
            {currentView === 'dashboard' && (
              <ProtectedRoute onNavigate={handleNavigate}>
                <PlayerDashboard
                  onNavigate={handleNavigate}
                  onNavigateToAdmin={() => handleNavigate('admin')}
                />
              </ProtectedRoute>
            )}

            {/* 12. PROTECTED ROUTE: ROLE-BASED ADMIN DASHBOARD (/admin/dashboard) */}
            {currentView === 'admin' && (
              <ProtectedRoute adminOnly={true} onNavigate={handleNavigate}>
                <RoleAdminDashboard
                  players={players}
                  matches={matches}
                  tournaments={tournaments}
                  seasons={seasons}
                  ratingConfig={ratingConfig}
                  news={news}
                  media={media}
                  fixtures={fixtures}
                  trophies={trophies}
                  awards={awards}
                  milestones={milestones}
                  initialTab={viewParams.idOrSlug}
                  onRefreshData={loadData}
                  onExitAdmin={() => handleNavigate('home')}
                  onNavigateToPublicTrophies={() => handleNavigate('trophies')}
                />
              </ProtectedRoute>
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
