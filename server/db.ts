import fs from 'fs';
import path from 'path';
import { 
  Player, 
  Match, 
  Tournament, 
  Season, 
  RatingConfig, 
  Award, 
  Trophy, 
  NewsArticle, 
  MediaItem, 
  Fixture, 
  AuditLog,
  ClubStats,
  ClubMilestone,
  User,
  Role,
  Permission,
  Session,
  PasswordResetToken,
  ClubAnnouncement
} from '../src/types';
import { 
  initialPlayers, 
  initialMatches, 
  initialTournaments, 
  initialSeasons, 
  initialRatingConfig, 
  initialAwards, 
  initialTrophies, 
  initialNews, 
  initialMedia, 
  initialFixtures, 
  initialAuditLogs,
  initialMilestones,
  initialPermissions,
  initialRoles,
  initialUsers,
  initialAnnouncements
} from './initialData';

export interface DatabaseState {
  players: Player[];
  matches: Match[];
  tournaments: Tournament[];
  seasons: Season[];
  ratingConfig: RatingConfig;
  awards: Award[];
  trophies: Trophy[];
  news: NewsArticle[];
  media: MediaItem[];
  fixtures: Fixture[];
  auditLogs: AuditLog[];
  milestones: ClubMilestone[];
  users: User[];
  roles: Role[];
  permissions: Permission[];
  sessions: Session[];
  passwordResetTokens: PasswordResetToken[];
  announcements: ClubAnnouncement[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bdpsc-store.json');

class DatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrInit();
  }

  private loadOrInit(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.players && parsed.matches && parsed.ratingConfig) {
          let needsSave = false;
          if (!parsed.milestones || parsed.milestones.length === 0) {
            parsed.milestones = initialMilestones;
            needsSave = true;
          }
          if (!parsed.permissions || parsed.permissions.length === 0) {
            parsed.permissions = initialPermissions;
            needsSave = true;
          }
          if (!parsed.roles || parsed.roles.length === 0) {
            parsed.roles = initialRoles;
            needsSave = true;
          }
          if (!parsed.users || parsed.users.length === 0) {
            parsed.users = initialUsers;
            needsSave = true;
          }
          if (!parsed.sessions) {
            parsed.sessions = [];
            needsSave = true;
          }
          if (!parsed.passwordResetTokens) {
            parsed.passwordResetTokens = [];
            needsSave = true;
          }
          if (!parsed.announcements || parsed.announcements.length === 0) {
            parsed.announcements = initialAnnouncements;
            needsSave = true;
          }

          // Modernize legacy opponent logos if still pointing to unsplash stock photo
          const fixLogo = (name?: string, logo?: string) => {
            if (logo && logo.includes('photo-1542751371-adc38448a05e')) {
              const lower = (name || '').toLowerCase();
              if (lower.includes('bengal')) return '/opponent-logos/bengal-warriors.svg';
              if (lower.includes('karachi')) return '/opponent-logos/karachi-kickers.svg';
              if (lower.includes('colombo')) return '/opponent-logos/colombo-strikers.svg';
              if (lower.includes('dragon')) return '/opponent-logos/dhaka-dragons.svg';
              if (lower.includes('royals')) return '/opponent-logos/rajshahi-royals.svg';
              return '/opponent-logos/generic-opponent.svg';
            }
            return logo;
          };

          if (parsed.matches) {
            for (const m of parsed.matches) {
              const updated = fixLogo(m.opponentClub, m.opponentLogo);
              if (updated !== m.opponentLogo) {
                m.opponentLogo = updated;
                needsSave = true;
              }
              if (!m.clubName) {
                m.clubName = 'BD Power Strikers';
                needsSave = true;
              }
              if (!m.clubLogo) {
                m.clubLogo = '/logo.svg';
                needsSave = true;
              }
            }
          }

          if (parsed.fixtures) {
            for (const f of parsed.fixtures) {
              const updated = fixLogo(f.opponent, f.opponentLogo);
              if (updated !== f.opponentLogo) {
                f.opponentLogo = updated;
                needsSave = true;
              }
              if (!f.homeTeam) {
                f.homeTeam = 'BD Power Strikers';
                needsSave = true;
              }
              if (!f.homeTeamLogo) {
                f.homeTeamLogo = '/logo.svg';
                needsSave = true;
              }
            }
          }

          if (parsed.permissions && !parsed.permissions.some((p: Permission) => p.id === 'users.delete')) {
            parsed.permissions.push({
              id: 'users.delete',
              name: 'Delete Users',
              category: 'USERS',
              description: 'Permanently remove user accounts and sessions.',
            });
            needsSave = true;
          }

          if (parsed.roles) {
            const adminRole = parsed.roles.find((r: Role) => r.id === 'role-admin' || r.name === 'ADMIN');
            if (adminRole) {
              for (const perm of ['users.view', 'users.edit', 'users.suspend', 'users.delete']) {
                if (!adminRole.permissionIds.includes(perm)) {
                  adminRole.permissionIds.push(perm);
                  needsSave = true;
                }
              }
            }
          }

          if (needsSave) {
            this.persist(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing with fresh seed data:', e);
    }

    const defaultState: DatabaseState = {
      players: initialPlayers,
      matches: initialMatches,
      tournaments: initialTournaments,
      seasons: initialSeasons,
      ratingConfig: initialRatingConfig,
      awards: initialAwards,
      trophies: initialTrophies,
      news: initialNews,
      media: initialMedia,
      fixtures: initialFixtures,
      auditLogs: initialAuditLogs,
      milestones: initialMilestones,
      users: initialUsers,
      roles: initialRoles,
      permissions: initialPermissions,
      sessions: [],
      passwordResetTokens: [],
      announcements: initialAnnouncements,
    };

    this.persist(defaultState);
    return defaultState;
  }

  public resetToDefaults(): DatabaseState {
    this.state = {
      players: initialPlayers,
      matches: initialMatches,
      tournaments: initialTournaments,
      seasons: initialSeasons,
      ratingConfig: initialRatingConfig,
      awards: initialAwards,
      trophies: initialTrophies,
      news: initialNews,
      media: initialMedia,
      fixtures: initialFixtures,
      auditLogs: initialAuditLogs,
      milestones: initialMilestones,
      users: initialUsers,
      roles: initialRoles,
      permissions: initialPermissions,
      sessions: [],
      passwordResetTokens: [],
      announcements: initialAnnouncements,
    };
    this.persist(this.state);
    return this.state;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public createUser(user: User): User {
    this.state.users.push(user);
    this.persist(this.state);
    return user;
  }

  public updateUser(id: string, updater: (u: User) => void): User | null {
    const user = this.state.users.find(u => u.id === id);
    if (!user) return null;
    updater(user);
    this.persist(this.state);
    return user;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.state.users.length;
    this.state.users = this.state.users.filter(u => u.id !== id);
    if (this.state.users.length === initialLen) {
      return false;
    }
    // Invalidate active sessions
    this.state.sessions = this.state.sessions.filter(s => s.userId !== id);
    // Invalidate password reset tokens
    if (this.state.passwordResetTokens) {
      this.state.passwordResetTokens = this.state.passwordResetTokens.filter(t => t.userId !== id);
    }
    this.persist(this.state);
    return true;
  }

  public createSession(userId: string, token: string, ip?: string, ua?: string): Session {
    // 7 days expiration
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: Session = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      token,
      expiresAt,
      ipAddress: ip,
      userAgent: ua,
      createdAt: new Date().toISOString(),
    };
    this.state.sessions.push(session);
    // Keep max 500 active sessions
    if (this.state.sessions.length > 500) {
      this.state.sessions = this.state.sessions.slice(-300);
    }
    this.persist(this.state);
    return session;
  }

  public getSession(token: string): Session | undefined {
    const session = this.state.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string): boolean {
    const initialLen = this.state.sessions.length;
    this.state.sessions = this.state.sessions.filter(s => s.token !== token);
    if (this.state.sessions.length !== initialLen) {
      this.persist(this.state);
      return true;
    }
    return false;
  }

  public createPasswordResetToken(userId: string, token: string): PasswordResetToken {
    // 1 hour expiration
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const resetToken: PasswordResetToken = {
      token,
      userId,
      expiresAt,
      used: false,
    };
    this.state.passwordResetTokens.push(resetToken);
    this.persist(this.state);
    return resetToken;
  }

  public getPasswordResetToken(token: string): PasswordResetToken | undefined {
    const reset = this.state.passwordResetTokens.find(r => r.token === token && !r.used);
    if (!reset) return undefined;
    if (new Date(reset.expiresAt).getTime() < Date.now()) {
      return undefined;
    }
    return reset;
  }

  public markPasswordResetTokenUsed(token: string): void {
    const reset = this.state.passwordResetTokens.find(r => r.token === token);
    if (reset) {
      reset.used = true;
      this.persist(this.state);
    }
  }

  private persist(stateToSave: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data to disk:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public updateState(updater: (draft: DatabaseState) => void): DatabaseState {
    updater(this.state);
    this.persist(this.state);
    return this.state;
  }

  public addAuditLog(actor: string, action: string, entityType: any, entityId: string, reason: string, previousValue?: any, newValue?: any) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      entityType,
      entityId,
      previousValue,
      newValue,
      reason,
    };
    this.state.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
    this.persist(this.state);
    return log;
  }

  public getClubStats(seasonId?: string): ClubStats {
    const season = seasonId 
      ? this.state.seasons.find(s => s.id === seasonId) 
      : (this.state.seasons.find(s => s.isCurrent) || this.state.seasons[0]);

    const matches = seasonId
      ? this.state.matches.filter(m => m.seasonId === seasonId)
      : this.state.matches;

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let cleanSheets = 0;

    for (const m of matches) {
      if (m.result === 'WIN') wins++;
      else if (m.result === 'DRAW') draws++;
      else if (m.result === 'LOSS') losses++;

      goalsScored += (m.scoreClub || 0);
      goalsConceded += (m.scoreOpponent || 0);
      if (m.scoreOpponent === 0) cleanSheets++;
    }

    const totalMatches = matches.length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 1000) / 10 : 0;
    const goalDifference = goalsScored - goalsConceded;

    return {
      seasonName: season ? season.name : 'Season 01 — 2026',
      totalMatches,
      wins,
      draws,
      losses,
      winRate,
      goalsScored,
      goalsConceded,
      goalDifference,
      cleanSheets,
      activePlayersCount: this.state.players.filter(p => p.status === 'ACTIVE').length,
      tournamentsCount: this.state.tournaments.length,
      trophiesCount: this.state.trophies.length,
    };
  }

  // ==========================================
  // CLUB ANNOUNCEMENTS (MOVING TICKER)
  // ==========================================
  public getAnnouncements(onlyActive: boolean = false): ClubAnnouncement[] {
    const list = [...(this.state.announcements || [])];
    const filtered = onlyActive ? list.filter(a => a.isActive) : list;
    return filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAnnouncementById(id: string): ClubAnnouncement | undefined {
    return (this.state.announcements || []).find(a => a.id === id);
  }

  public createAnnouncement(data: Partial<ClubAnnouncement>, userId?: string): ClubAnnouncement {
    const now = new Date().toISOString();
    const newAnnouncement: ClubAnnouncement = {
      id: data.id || `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || 'Club Update',
      content: data.content || '',
      type: data.type || 'GENERAL',
      isActive: data.isActive !== undefined ? data.isActive : true,
      priority: typeof data.priority === 'number' ? data.priority : 50,
      actionLink: data.actionLink || undefined,
      actionLabel: data.actionLabel || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      createdBy: userId || data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    if (!this.state.announcements) {
      this.state.announcements = [];
    }
    this.state.announcements.unshift(newAnnouncement);
    this.persist(this.state);
    return newAnnouncement;
  }

  public updateAnnouncement(id: string, data: Partial<ClubAnnouncement>): ClubAnnouncement | null {
    if (!this.state.announcements) return null;
    const index = this.state.announcements.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.state.announcements[index] = {
      ...this.state.announcements[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persist(this.state);
    return this.state.announcements[index];
  }

  public toggleAnnouncement(id: string): ClubAnnouncement | null {
    if (!this.state.announcements) return null;
    const index = this.state.announcements.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.state.announcements[index].isActive = !this.state.announcements[index].isActive;
    this.state.announcements[index].updatedAt = new Date().toISOString();
    this.persist(this.state);
    return this.state.announcements[index];
  }

  public deleteAnnouncement(id: string): boolean {
    if (!this.state.announcements) return false;
    const initialLen = this.state.announcements.length;
    this.state.announcements = this.state.announcements.filter(a => a.id !== id);
    if (this.state.announcements.length !== initialLen) {
      this.persist(this.state);
      return true;
    }
    return false;
  }
}

export const db = new DatabaseManager();
