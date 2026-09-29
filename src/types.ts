export type PlayerStatus = 'ACTIVE' | 'INACTIVE' | 'RESERVE' | 'FORMER' | 'SUSPENDED' | 'BENCHED' | 'INJURED';

export type PlayerPosition = 
  | 'CF' 
  | 'SS' 
  | 'LWF' 
  | 'RWF' 
  | 'AMF' 
  | 'CMF' 
  | 'DMF' 
  | 'LB' 
  | 'RB' 
  | 'CB' 
  | 'GK';

export type MatchResult = 'WIN' | 'DRAW' | 'LOSS';
export type HomeAway = 'HOME' | 'AWAY' | 'NEUTRAL';
export type TournamentFormat = 'KNOCKOUT' | 'LEAGUE' | 'GROUP_KNOCKOUT';
export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type TrophyCategory = 'CHAMPIONS' | 'RUNNER_UP' | 'SEMI_FINAL' | 'SPECIAL' | 'INDIVIDUAL';
export type AwardCategory = 
  | 'POTW' 
  | 'POTM' 
  | 'POTS' 
  | 'GOLDEN_BOOT' 
  | 'BEST_PLAYMAKER' 
  | 'BEST_DEFENDER' 
  | 'BEST_GK' 
  | 'MVP' 
  | 'MOST_IMPROVED' 
  | 'BEST_TOURNAMENT_PERF';

export type NewsCategory = 'ANNOUNCEMENT' | 'MATCH_REPORT' | 'ROSTER' | 'TOURNAMENT' | 'ACHIEVEMENT';
export type MediaCategory = 'SCREENSHOTS' | 'PHOTOS' | 'CARDS' | 'VIDEOS' | 'HIGHLIGHTS';
export type RankMovement = 'UP' | 'DOWN' | 'SAME' | 'NEW';

export interface Player {
  id: string;
  slug: string;
  name: string;
  gamingName: string;
  efootballId: string;
  jerseyNumber: number;
  position: PlayerPosition;
  photoUrl: string;
  status: PlayerStatus;
  clubTier?: 'First Team' | 'Academy' | 'Reserve Squad' | 'Legend' | 'Starting XI';
  joinDate: string;
  bio: string;
  preferredPlatform: 'Mobile' | 'Console' | 'PC';
  playstyle: string;
  favoriteTeam: string;
  socialHandle?: string;
  // Computed career summary
  rating: number;
  overallRank: number;
  weeklyRank: number;
  monthlyRank: number;
  seasonRank: number;
  formRank: number;
  rankMovement: RankMovement;
  rankChangeValue: number;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number; // percentage (0-100)
  goals: number;
  assists: number;
  cleanSheets: number;
  motmCount: number;
  form: Array<'W' | 'D' | 'L'>; // last 5 results
  ratingProgression: Array<{ date: string; rating: number; matchId: string }>;
}

export interface PlayerMatchStats {
  id: string;
  matchId: string;
  playerId: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  saves: number;
  conceded: number;
  motm: boolean;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed: number;
  performanceScore: number;
  ratingBreakdown?: RatingBreakdown;
  notes?: string;
}

export interface Match {
  id: string;
  slug: string;
  tournamentId: string;
  tournamentName?: string;
  seasonId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  clubName?: string; // Default: 'BD Power Strikers'
  clubLogo?: string; // Default: '/logo.svg'
  opponentClub: string;
  opponentLogo?: string;
  opponentStrength: number; // 50 - 100
  homeAway: HomeAway;
  scoreClub: number;
  scoreOpponent: number;
  halfTimeScore?: string;
  result: MatchResult;
  motmPlayerId?: string;
  motmPlayerName?: string;
  matchScreenshot?: string;
  matchVideoUrl?: string;
  matchReport?: string;
  isPublished: boolean;
  createdAt: string;
  playerStats: PlayerMatchStats[];
}

export interface KnockoutMatch {
  id: string;
  round: 'Quarter Final' | 'Semi Final' | 'Final';
  matchNumber: number;
  team1: { name: string; score?: number; isClub?: boolean };
  team2: { name: string; score?: number; isClub?: boolean };
  winner?: string;
  date?: string;
  status: 'COMPLETED' | 'LIVE' | 'SCHEDULED';
}

export interface TournamentStanding {
  position: number;
  teamName: string;
  isClub: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  organizer: string;
  seasonId: string;
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  status: TournamentStatus;
  tier: 'Major' | 'Championship' | 'Friendly' | 'Cup';
  participantsCount: number;
  prizePool?: string;
  bannerUrl?: string;
  logoUrl?: string;
  championTeam?: string;
  runnerUpTeam?: string;
  clubFinalPosition?: string;
  topScorer?: { name: string; goals: number };
  topPerformer?: { name: string; rating: number };
  bracket?: KnockoutMatch[];
  standings?: TournamentStanding[];
  description?: string;
}

export interface Season {
  id: string;
  name: string; // e.g. "Season 01 — 2026"
  code: string; // "S01-2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
  description?: string;
  notes?: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalsScored: number;
  goalsConceded: number;
  currentClubRank: string;
}

export interface RatingConfig {
  id: string;
  version: string;
  baseRating: number;
  winWeight: number;
  goalWeight: number;
  assistWeight: number;
  cleanSheetWeight: number;
  motmWeight: number;
  opponentStrengthWeight: number;
  tournamentMultiplier: {
    Major: number;
    Championship: number;
    Cup: number;
    Friendly: number;
  };
  formWeight: number;
  updatedAt: string;
  updatedBy: string;
}

export interface RatingBreakdown {
  basePerformance: number;
  winContribution: number;
  goalContribution: number;
  assistContribution: number;
  defensiveContribution: number;
  motmBonus: number;
  opponentModifier: number;
  tournamentBonus: number;
  recentFormModifier: number;
  totalCalculatedRating: number;
}

export interface PlayerRanking {
  rank: number;
  previousRank: number;
  movement: RankMovement;
  changeValue: number;
  playerId: string;
  player: Player;
  rating: number;
  matches: number;
  wins: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  motmCount: number;
  winRate: number;
  form: Array<'W' | 'D' | 'L'>;
}

export interface Award {
  id: string;
  title: string;
  category: AwardCategory;
  awardType?: string;
  playerId: string;
  playerName: string;
  playerPhotoUrl: string;
  gamingName: string;
  period: string; // "Week 38", "September 2026", "Season 01"
  seasonId: string;
  tournamentId?: string;
  statsSummary: string; // e.g., "7 Goals, 4 Assists, 3 MOTM"
  ratingSnapshot: number;
  awardDate: string;
  description: string;
  badgeType: 'GOLD' | 'PLATINUM' | 'DIAMOND';
}

export interface Trophy {
  id: string;
  tournamentName: string;
  year: number;
  seasonId: string;
  category: TrophyCategory;
  position: 'Champions' | 'Runners-up' | '3rd Place' | 'Fair Play' | 'Special Achievement';
  participatingPlayerIds: string[];
  squadMembers?: string[];
  mvpPlayerName?: string;
  topScorerName?: string;
  trophyImageUrl: string;
  achievementDescription: string;
  dateAwarded: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: NewsCategory;
  tags: string[];
  relatedPlayerIds: string[];
  relatedTournamentId?: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export interface MediaItem {
  id: string;
  title: string;
  category: MediaCategory;
  type?: 'VIDEO' | 'PHOTO' | 'WALLPAPER' | 'SCREENSHOT';
  thumbnailUrl?: string;
  mediaUrl: string;
  externalVideoUrl?: string;
  uploadedAt: string;
  date?: string;
  tags: string[];
  description?: string;
  dimensions?: string;
}

export interface ClubMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
}

export interface Fixture {
  id: string;
  date: string;
  time: string; // BST Time e.g. "20:00"
  bstTime?: string;
  homeTeam?: string; // Default: 'BD Power Strikers'
  homeTeamLogo?: string; // Default: '/logo.svg'
  awayTeam?: string; // e.g. 'Dhaka Titans'
  opponent: string;
  opponentLogo?: string;
  fixturePosterUrl?: string;
  tournament: string;
  tournamentId: string;
  stage?: string; // e.g. 'Group Stage - Round 1', 'Quarter-Final', 'Grand Final'
  venue?: string; // e.g. 'National Cyber Arena, Dhaka' / 'Discord Room 1'
  venuePlatform: string;
  streamUrl?: string; // e.g. YouTube stream or Twitch URL
  roomLink?: string; // e.g. In-game room code or lobby link
  roomCode?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  lineupPlayerIds: string[];
  convertedMatchId?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: 'MATCH' | 'PLAYER' | 'RATING_CONFIG' | 'TOURNAMENT' | 'AWARD' | 'RANKINGS' | 'USER' | 'ROLE' | 'AUTH' | 'SETTINGS' | 'PERMISSION';
  entityId: string;
  previousValue?: any;
  newValue?: any;
  reason: string;
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface Permission {
  id: string;
  name: string;
  category: 'PLAYERS' | 'MATCHES' | 'TOURNAMENTS' | 'RANKINGS' | 'NEWS' | 'MEDIA' | 'USERS' | 'ROLES' | 'AUDIT_LOGS' | 'SETTINGS' | 'ANNOUNCEMENTS';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissionIds: string[];
  isSystem: boolean;
  color?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  name: string;
  gamingName?: string;
  avatarUrl?: string;
  status: UserStatus;
  roleIds: string[];
  playerId?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserWithDetails extends User {
  roles: Role[];
  permissions: string[];
  player?: Player;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
}

export interface AuthResponse {
  user: UserWithDetails;
  token: string;
  message?: string;
  redirectPath?: string;
}

export interface ClubStats {
  seasonName: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  cleanSheets: number;
  activePlayersCount: number;
  tournamentsCount: number;
  trophiesCount: number;
}

export type AnnouncementType = 'GENERAL' | 'URGENT' | 'UPDATE' | 'MATCH' | 'TOURNAMENT' | 'ROSTER' | 'CELEBRATION';

export interface ClubAnnouncement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isActive: boolean;
  priority: number;
  actionLink?: string;
  actionLabel?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

