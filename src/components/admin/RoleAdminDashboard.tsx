import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Ban, 
  CheckCircle, 
  AlertTriangle, 
  UserX, 
  ShieldAlert,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  Player, 
  Match,
  Tournament, 
  Season, 
  RatingConfig, 
  NewsArticle,
  MediaItem,
  Fixture,
  UserWithDetails, 
  Role, 
  Permission, 
  AuditLog,
  Trophy,
  Award,
  ClubMilestone
} from '../../types';
import * as authService from '../../services/authService';
import { 
  recalculateAll, 
  resetToSeedData
} from '../../services/api';
import { PlayerManagementTab } from './tabs/PlayerManagementTab';
import { MatchOperationsTab } from './tabs/MatchOperationsTab';
import { RankingEngineTab } from './tabs/RankingEngineTab';
import { TournamentManagementTab } from './tabs/TournamentManagementTab';
import { SeasonManagementTab } from './tabs/SeasonManagementTab';
import { NewsPublisherTab } from './tabs/NewsPublisherTab';
import { MediaLibraryTab } from './tabs/MediaLibraryTab';
import { AnnouncementManagerTab } from './tabs/AnnouncementManagerTab';
import { TrophyManagementTab } from './tabs/TrophyManagementTab';
import { SupabaseDatabaseTab } from './tabs/SupabaseDatabaseTab';

interface RoleAdminDashboardProps {
  players: Player[];
  matches?: Match[];
  tournaments: Tournament[];
  seasons: Season[];
  ratingConfig: RatingConfig;
  news?: NewsArticle[];
  media?: MediaItem[];
  fixtures?: Fixture[];
  trophies?: Trophy[];
  awards?: Award[];
  milestones?: ClubMilestone[];
  initialTab?: string;
  onRefreshData: () => void;
  onExitAdmin?: () => void;
  onNavigateToPublicTrophies?: () => void;
}

export const RoleAdminDashboard: React.FC<RoleAdminDashboardProps> = ({
  players,
  matches,
  tournaments,
  seasons,
  ratingConfig,
  news,
  media,
  fixtures,
  trophies = [],
  awards = [],
  milestones = [],
  initialTab,
  onRefreshData,
  onExitAdmin,
  onNavigateToPublicTrophies,
}) => {
  const { user, isSuperAdmin, hasPermission } = useAuth();

  // Navigation module tabs
  type AdminTab = 
    | 'overview' 
    | 'supabase'
    | 'announcements'
    | 'users' 
    | 'roles' 
    | 'players' 
    | 'matches' 
    | 'seasons'
    | 'tournaments'
    | 'trophies'
    | 'rankings' 
    | 'news'
    | 'media'
    | 'audit-logs' 
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>((initialTab as AdminTab) || 'overview');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as AdminTab);
    }
  }, [initialTab]);

  // Status / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // ==========================================
  // USERS MODULE STATE
  // ==========================================
  const [userList, setUserList] = useState<UserWithDetails[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<UserWithDetails | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedUserForPlayerLink, setSelectedUserForPlayerLink] = useState<UserWithDetails | null>(null);
  const [targetPlayerIdToLink, setTargetPlayerIdToLink] = useState<string>('');

  // Modals for actions that previously relied on browser confirm (blocked in sandboxed iframes)
  const [userToToggleStatus, setUserToToggleStatus] = useState<UserWithDetails | null>(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithDetails | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isResetDbModalOpen, setIsResetDbModalOpen] = useState(false);

  // ==========================================
  // ROLES & PERMISSIONS MODULE STATE
  // ==========================================
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('amber');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  // ==========================================
  // AUDIT LOGS MODULE STATE
  // ==========================================
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Load Users & Roles
  const loadUsersAndRoles = async () => {
    try {
      if (hasPermission('users.view')) {
        const u = await authService.getAdminUsers();
        setUserList(u);
      }
      if (hasPermission('roles.view') || isSuperAdmin) {
        const r = await authService.getRoles();
        setRolesList(r);
        const p = await authService.getPermissions();
        setPermissionsList(p);
      }
      if (hasPermission('audit_logs.view')) {
        const logs = await authService.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadUsersAndRoles();
  }, [activeTab]);

  // Handle Role Assignment on a User
  const handleSaveUserRoles = async () => {
    if (!selectedUserForRoles) return;
    setLoading(true);
    try {
      await authService.updateUserRoles(selectedUserForRoles.id, selectedRoleIds);
      showFeedback('success', `Roles updated for ${selectedUserForRoles.email}`);
      setSelectedUserForRoles(null);
      loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update roles');
    } finally {
      setLoading(false);
    }
  };

  // Handle User Suspension / Activation via in-app confirmation
  const handleConfirmToggleUserStatus = async () => {
    if (!userToToggleStatus) return;
    const targetUser = userToToggleStatus;
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setStatusActionLoading(true);
    try {
      await authService.updateUserStatus(targetUser.id, nextStatus);
      showFeedback('success', `Account status for ${targetUser.name || targetUser.email} is now ${nextStatus}.`);
      setUserToToggleStatus(null);
      await loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Action failed');
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Handle Permanent User Deletion
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const target = userToDelete;
    setDeleteUserLoading(true);
    try {
      const res = await authService.deleteUser(target.id, target.email);
      showFeedback('success', res.message || `User account for ${target.name || target.email} has been permanently deleted from database and Supabase.`);
      setUserToDelete(null);
      await loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete user account');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // Handle Player Link
  const handleLinkPlayerToUser = async () => {
    if (!selectedUserForPlayerLink) return;
    setLoading(true);
    try {
      await authService.linkUserToPlayer(
        selectedUserForPlayerLink.id, 
        targetPlayerIdToLink || null
      );
      showFeedback('success', 'BDPSC Athlete profile linked successfully.');
      setSelectedUserForPlayerLink(null);
      loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to link player');
    } finally {
      setLoading(false);
    }
  };

  // Handle Role Creation
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleDisplayName) {
      showFeedback('error', 'Role identifier and display name are required');
      return;
    }
    setLoading(true);
    try {
      await authService.createRole({
        name: newRoleName,
        displayName: newRoleDisplayName,
        description: newRoleDescription,
        permissionIds: newRolePermissions,
        color: newRoleColor,
      });
      showFeedback('success', `Role "${newRoleDisplayName}" created successfully`);
      setIsCreateRoleOpen(false);
      setNewRoleName('');
      setNewRoleDisplayName('');
      setNewRoleDescription('');
      setNewRolePermissions([]);
      loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  // Handle Role Update
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setLoading(true);
    try {
      await authService.updateRole(editingRole.id, {
        displayName: editingRole.displayName,
        description: editingRole.description,
        permissionIds: editingRole.permissionIds,
        color: editingRole.color,
      });
      showFeedback('success', `Role "${editingRole.displayName}" updated`);
      setEditingRole(null);
      loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  // Handle Role Delete trigger & confirmation
  const handleDeleteRole = (roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
  };

  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setLoading(true);
    try {
      await authService.deleteRole(roleToDelete.id);
      showFeedback('success', `Role "${roleToDelete.name}" deleted.`);
      setRoleToDelete(null);
      await loadUsersAndRoles();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  // Handle Recalculate Rankings
  const handleRecalculateRankings = async () => {
    setLoading(true);
    try {
      await recalculateAll();
      showFeedback('success', 'Recalculated all player ratings, rank movements, and statistics.');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Recalculation error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = userList.filter(u => {
    const matchesSearch = 
      !userSearch || 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.gamingName && u.gamingName.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
    const matchesRole = userRoleFilter === 'ALL' || u.roleIds.includes(userRoleFilter);
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter(l => {
    return auditActionFilter === 'ALL' || l.action === auditActionFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-4 pb-20 animate-fadeIn">
      {/* Top Admin Header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 font-black flex items-center justify-center text-lg shadow-lg shadow-amber-400/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-tight text-white">
                  BDPSC Control Center
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 text-[10px] font-black uppercase">
                  {isSuperAdmin ? 'Super Administrator' : 'Authorized Staff'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Logged in as <strong className="text-white">{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculateRankings}
              disabled={loading || !hasPermission('rankings.recalculate')}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
              title="Recalculate all rankings"
            >
              🔄 Recalculate Rankings
            </button>
            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-bold transition"
              >
                ← Exit to Website
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Alert Bar */}
      {feedback && (
        <div
          className={`max-w-7xl mx-auto mt-4 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border border-red-800 text-red-300'
          }`}
        >
          <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Module Tabs (Permission Filtered!) */}
        <div className="flex overflow-x-auto gap-2 border-b border-zinc-800 pb-3 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'overview' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            📊 Overview
          </button>

          {/* User Management Module (Requires users.view) */}
          {(hasPermission('users.view') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'users' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              👥 User Accounts
            </button>
          )}

          {/* Roles & Permissions Module (Requires Super Admin or roles.view) */}
          {(hasPermission('roles.view') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'roles' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              🛡️ Roles & RBAC
            </button>
          )}

          {/* Players Module (Requires players.create or players.view) */}
          {(hasPermission('players.create') || hasPermission('players.view') || hasPermission('players.edit') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'players' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              🏃 Roster Athletes
            </button>
          )}

          {/* Match Operations Module (Requires matches.create or matches.view) */}
          {(hasPermission('matches.create') || hasPermission('matches.view') || hasPermission('matches.edit') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'matches' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              ⚔️ Match Operations
            </button>
          )}

          {/* Seasons Module (Requires tournaments.view or settings.manage or isSuperAdmin) */}
          {(hasPermission('tournaments.view') || hasPermission('tournaments.create') || hasPermission('tournaments.edit') || hasPermission('settings.manage') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('seasons')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'seasons' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              🗓️ Seasons
            </button>
          )}

          {/* Tournaments Module (Requires tournaments.view or tournaments.create or tournaments.edit) */}
          {(hasPermission('tournaments.view') || hasPermission('tournaments.create') || hasPermission('tournaments.edit') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'tournaments' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              🏆 Tournaments
            </button>
          )}

          {/* Club Trophies & Honors Module (Requires tournaments.view or tournaments.create or isSuperAdmin) */}
          {(hasPermission('tournaments.view') || hasPermission('tournaments.create') || hasPermission('tournaments.edit') || isSuperAdmin) && (
            <button
              id="admin-tab-trophies-btn"
              onClick={() => setActiveTab('trophies')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center space-x-1.5 ${
                activeTab === 'trophies' ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🎖️</span>
              <span>Trophies & Honors</span>
            </button>
          )}

          {/* Rankings Engine (Requires rankings.manage or rankings.recalculate) */}
          {(hasPermission('rankings.manage') || hasPermission('rankings.recalculate') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('rankings')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'rankings' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              📈 Rating Formula
            </button>
          )}

          {/* News Publisher Module (Requires news.create or news.edit or news.publish) */}
          {(hasPermission('news.create') || hasPermission('news.edit') || hasPermission('news.publish') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'news' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              📰 News Publisher
            </button>
          )}

          {/* Announcements Ticker Module (Requires announcements.manage or news.create or isSuperAdmin) */}
          {(hasPermission('announcements.manage') || hasPermission('news.create') || hasPermission('news.edit') || isSuperAdmin) && (
            <button
              id="admin-tab-announcements-btn"
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center space-x-1.5 ${
                activeTab === 'announcements' ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <span>📢</span>
              <span>Moving Announcements</span>
            </button>
          )}

          {/* Media Library Module (Requires media.view or media.upload or media.edit) */}
          {(hasPermission('media.view') || hasPermission('media.upload') || hasPermission('media.edit') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'media' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              📷 Media Library
            </button>
          )}

          {/* Audit Logs Module (Requires audit_logs.view) */}
          {(hasPermission('audit_logs.view') || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'audit-logs' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              📜 Audit Trail
            </button>
          )}

          {/* Supabase Database (Super Admin only) */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'supabase' ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <span>⚡ Supabase DB</span>
            </button>
          )}

          {/* System Settings (Super Admin only) */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'settings' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              ⚙️ System Vault
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  Active Roster
                </span>
                <div className="text-3xl font-black text-white">{players.length} Players</div>
                <span className="text-[10px] text-emerald-400 block mt-1">Official BDPSC Squad</span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  Registered Accounts
                </span>
                <div className="text-3xl font-black text-amber-400">{userList.length || '—'} Users</div>
                <span className="text-[10px] text-zinc-400 block mt-1">Platform community & staff</span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  RBAC Roles
                </span>
                <div className="text-3xl font-black text-cyan-400">{rolesList.length || 7} Defined</div>
                <span className="text-[10px] text-zinc-400 block mt-1">Granular security policies</span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  System Rating Engine
                </span>
                <div className="text-3xl font-black text-emerald-400">v{ratingConfig.version}</div>
                <span className="text-[10px] text-zinc-400 block mt-1">Base Floor: {ratingConfig.baseRating} pts</span>
              </div>
            </div>

            {/* Current User's Granted RBAC Permissions Card */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Your Authenticated Privileges & Permissions
                </h3>
                <span className="text-xs text-amber-400 font-mono">
                  {user?.permissions.includes('*') ? 'Wildcard Superuser (*)' : `${user?.permissions.length} Granular Permissions`}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                {user?.permissions.includes('*') ? (
                  <span className="px-3 py-1 bg-amber-400/20 text-amber-400 border border-amber-400/40 text-xs font-black rounded-lg">
                    ★ All Administrative Modules & Permissions Granted (*)
                  </span>
                ) : (
                  user?.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono rounded border border-zinc-700"
                    >
                      {p}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: USER MANAGEMENT (SUPER ADMIN & USERS.VIEW) */}
        {/* ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search and Filters Bar */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search registered users by name, email, or eFootball gaming name..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="ALL">Status: All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="ALL">Role: All</option>
                  {rolesList.map(r => (
                    <option key={r.id} value={r.id}>{r.displayName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Assigned Roles</th>
                      <th className="py-3.5 px-4">Linked Athlete Profile</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                          No users found matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-900/40 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.gamingName && (
                                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                                      {u.gamingName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((r) => (
                                <span
                                  key={r.id}
                                  className="px-2 py-0.5 bg-zinc-800 text-zinc-200 text-[10px] font-bold rounded border border-zinc-700"
                                >
                                  {r.displayName}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {(() => {
                              const linkedPlayer = players.find(p => p.id === u.playerId);
                              return linkedPlayer ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  ⚽ #{linkedPlayer.jerseyNumber} {linkedPlayer.gamingName}
                                </span>
                              ) : (
                                <span className="text-zinc-600 italic">Not linked</span>
                              );
                            })()}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Manage Roles button (Super Admin only) */}
                              {isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    setSelectedUserForRoles(u);
                                    setSelectedRoleIds([...u.roleIds]);
                                  }}
                                  className="px-2.5 py-1 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 text-[10px] font-bold rounded-lg transition"
                                >
                                  Manage Roles
                                </button>
                              )}

                              {/* Link Player button */}
                              {(hasPermission('users.edit') || isSuperAdmin) && (
                                <button
                                  onClick={() => {
                                    setSelectedUserForPlayerLink(u);
                                    setTargetPlayerIdToLink(u.playerId || '');
                                  }}
                                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition"
                                >
                                  Link Athlete
                                </button>
                              )}

                              {/* Suspend / Activate button */}
                              {(hasPermission('users.suspend') || isSuperAdmin) && u.email !== 'ashrafulashem@gmail.com' && u.id !== user?.id && (
                                <button
                                  type="button"
                                  onClick={() => setUserToToggleStatus(u)}
                                  className={`px-2.5 py-1 border text-[10px] font-bold rounded-lg transition ${
                                    u.status === 'ACTIVE'
                                      ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                  }`}
                                >
                                  {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                </button>
                              )}

                              {/* Delete button */}
                              {(hasPermission('users.delete') || isSuperAdmin) && u.email !== 'ashrafulashem@gmail.com' && u.id !== user?.id && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/25 border border-red-500/30 hover:border-red-500/60 text-red-400 text-[10px] font-bold rounded-lg transition flex items-center gap-1"
                                  title={`Permanently delete user account for ${u.name || u.email}`}
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                  <span>Delete</span>
                                </button>
                              )}

                              {/* Root Founder Protected Badge */}
                              {u.email === 'ashrafulashem@gmail.com' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg" title="Root founder and super administrator account is protected.">
                                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                                  <span>Protected</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: MANAGE ROLES ON USER */}
            {selectedUserForRoles && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-black uppercase text-white">
                        Assign Roles: {selectedUserForRoles.name}
                      </h3>
                      <p className="text-xs text-zinc-400">{selectedUserForRoles.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedUserForRoles(null)}
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                    {rolesList.map((r) => {
                      const isChecked = selectedRoleIds.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? 'bg-amber-400/10 border-amber-400/40 text-white'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoleIds([...selectedRoleIds, r.id]);
                              } else {
                                setSelectedRoleIds(selectedRoleIds.filter(id => id !== r.id));
                              }
                            }}
                            className="mt-1 rounded bg-zinc-800 border-zinc-700 text-amber-400 focus:ring-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{r.displayName}</span>
                              {r.isSystem && (
                                <span className="px-1.5 py-0.2 bg-zinc-800 text-[9px] rounded text-zinc-400 uppercase font-mono">
                                  System
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{r.description}</p>
                            <span className="text-[9px] text-zinc-500 font-mono mt-1 block">
                              Permissions: {r.permissionIds.includes('*') ? 'ALL (*)' : `${r.permissionIds.length} permissions`}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForRoles(null)}
                      className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveUserRoles}
                      disabled={loading}
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition"
                    >
                      {loading ? 'Saving...' : 'Apply Role Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: LINK ATHLETE PROFILE */}
            {selectedUserForPlayerLink && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-black uppercase text-white">
                        Connect Athlete Profile
                      </h3>
                      <p className="text-xs text-zinc-400">{selectedUserForPlayerLink.name} ({selectedUserForPlayerLink.email})</p>
                    </div>
                    <button
                      onClick={() => setSelectedUserForPlayerLink(null)}
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                      Select BDPSC Roster Athlete:
                    </label>
                    <select
                      value={targetPlayerIdToLink}
                      onChange={(e) => setTargetPlayerIdToLink(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                    >
                      <option value="">-- No Athlete Profile (Unlink) --</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.jerseyNumber} {p.gamingName} ({p.name}) — {p.position}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-zinc-500 mt-2">
                      Linking connects this user account to the official match statistics, player card, and gives them access to their private Player Dashboard.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForPlayerLink(null)}
                      className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLinkPlayerToUser}
                      disabled={loading}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition"
                    >
                      {loading ? 'Saving...' : 'Save Athlete Link'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: CONFIRM SUSPEND / ACTIVATE USER ACCOUNT */}
            {userToToggleStatus && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                <div 
                  className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className={`h-1.5 w-full absolute top-0 left-0 ${
                      userToToggleStatus.status === 'ACTIVE'
                        ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
                    }`}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                          userToToggleStatus.status === 'ACTIVE'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {userToToggleStatus.status === 'ACTIVE' ? (
                          <span className="text-xl">⚠️</span>
                        ) : (
                          <span className="text-xl">✅</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-black uppercase text-white tracking-tight">
                          {userToToggleStatus.status === 'ACTIVE' ? 'Suspend User Account' : 'Reactivate User Account'}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          {userToToggleStatus.status === 'ACTIVE' ? 'Restrict platform access' : 'Restore member permissions'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUserToToggleStatus(null)}
                      className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
                      aria-label="Close dialog"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Target User Details Card */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={userToToggleStatus.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                          alt={userToToggleStatus.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{userToToggleStatus.name}</div>
                          <div className="text-[11px] text-zinc-400 leading-tight">{userToToggleStatus.email}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold uppercase text-zinc-500 mb-0.5">CURRENT STATUS</span>
                        <span 
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            userToToggleStatus.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {userToToggleStatus.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation / Consequence */}
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {userToToggleStatus.status === 'ACTIVE' ? (
                      <>
                        Suspending <strong className="text-white">{userToToggleStatus.email}</strong> will immediately revoke their access and terminate all active sessions. 
                        They will be blocked from signing in until an authorized staff member reactivates their account.
                      </>
                    ) : (
                      <>
                        Reactivating <strong className="text-white">{userToToggleStatus.email}</strong> will remove the suspension restriction and restore their ability to log in and participate in club activities.
                      </>
                    )}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setUserToToggleStatus(null)}
                      disabled={statusActionLoading}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmToggleUserStatus}
                      disabled={statusActionLoading}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-2 disabled:opacity-50 ${
                        userToToggleStatus.status === 'ACTIVE'
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                      }`}
                    >
                      {statusActionLoading ? (
                        <span>Processing...</span>
                      ) : userToToggleStatus.status === 'ACTIVE' ? (
                        <span>Confirm Suspension</span>
                      ) : (
                        <span>Confirm Reactivation</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: CONFIRM PERMANENT DELETE USER ACCOUNT */}
            {userToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                <div 
                  className="bg-zinc-950 border border-red-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 shadow-inner shrink-0">
                        <Trash2 className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                          <span>Delete User Account</span>
                        </h3>
                        <p className="text-xs text-red-400/90 font-medium">
                          Permanent destructive action • Cannot be undone
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
                      aria-label="Close dialog"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Target User Details Card */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={userToDelete.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                          alt={userToDelete.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                            <span className="truncate">{userToDelete.name}</span>
                            {userToDelete.gamingName && (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded shrink-0">
                                {userToDelete.gamingName}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 leading-tight truncate">{userToDelete.email}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <span className="text-[9px] font-bold uppercase text-zinc-500 mb-0.5">STATUS</span>
                        <span 
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            userToDelete.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {userToDelete.status}
                        </span>
                      </div>
                    </div>

                    {/* Roles list */}
                    {userToDelete.roles && userToDelete.roles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-zinc-400">Roles:</span>
                        {userToDelete.roles.map(r => (
                          <span key={r.id} className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                            {r.displayName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Athlete link info */}
                    {userToDelete.playerId && (
                      <div className="mt-2 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                        ⚽ Athlete Roster Note: The player profile and historic match statistics remain safe in club records, but will be detached from this deleted login.
                      </div>
                    )}
                  </div>

                  {/* Warning Box */}
                  <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-3.5 mb-5 space-y-1.5 text-xs text-red-200/90">
                    <div className="flex items-center gap-1.5 font-bold text-red-400 uppercase text-[11px] tracking-wide">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Destructive Impact & Database Purge</span>
                    </div>
                    <p className="leading-relaxed">
                      Deleting <strong className="text-white underline">{userToDelete.email}</strong> will immediately terminate all active sessions, invalidate auth tokens, and permanently remove the user's details from both the local database and Supabase (<code className="text-amber-300 font-mono text-[10px]">profiles</code> & <code className="text-amber-300 font-mono text-[10px]">auth.users</code>).
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      disabled={deleteUserLoading}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmDeleteUser}
                      disabled={deleteUserLoading}
                      className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleteUserLoading ? <span>Deleting...</span> : <span>Permanently Delete</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ROLES & RBAC MATRIX */}
        {/* ======================================================== */}
        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Role-Based Access Control (RBAC) System
                </h3>
                <p className="text-xs text-zinc-400">
                  Granular permission control: Users → Roles → Permissions.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => setIsCreateRoleOpen(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20"
                >
                  + Create Custom Role
                </button>
              )}
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rolesList.map((r) => (
                <div
                  key={r.id}
                  className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-white uppercase tracking-wide">
                        {r.displayName}
                      </span>
                      {r.isSystem ? (
                        <span className="px-2 py-0.5 bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded">
                          System Role
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 text-[10px] font-bold rounded">
                          Custom Role
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mb-3">{r.description}</p>

                    <div className="mb-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">
                        Granted Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-zinc-900 rounded-lg">
                        {r.permissionIds.includes('*') ? (
                          <span className="px-2 py-0.5 bg-amber-400 text-zinc-950 font-black text-[10px] rounded">
                            Wildcard Super Access (*)
                          </span>
                        ) : (
                          r.permissionIds.map((pid) => (
                            <span
                              key={pid}
                              className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 font-mono text-[9px] rounded"
                            >
                              {pid}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="pt-3 border-t border-zinc-900 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingRole(r)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition"
                      >
                        Edit Permissions
                      </button>
                      {!r.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(r.id, r.displayName)}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal: CREATE CUSTOM ROLE */}
            {isCreateRoleOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-black uppercase text-white">Create New Custom Role</h3>
                    <button onClick={() => setIsCreateRoleOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleCreateRole} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                        Role Identifier (Internal)
                      </label>
                      <input
                        type="text"
                        required
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="e.g. TOURNAMENT_DIRECTOR"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newRoleDisplayName}
                        onChange={(e) => setNewRoleDisplayName(e.target.value)}
                        placeholder="e.g. Tournament Director"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        placeholder="Describe role responsibilities..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                        Select Permissions:
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                        {permissionsList.map((p) => {
                          const isChecked = newRolePermissions.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRolePermissions([...newRolePermissions, p.id]);
                                  } else {
                                    setNewRolePermissions(newRolePermissions.filter(id => id !== p.id));
                                  }
                                }}
                                className="rounded bg-zinc-800 border-zinc-700 text-amber-400"
                              />
                              <span className="truncate">{p.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsCreateRoleOpen(false)}
                        className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl"
                      >
                        {loading ? 'Creating...' : 'Create Role'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: EDIT ROLE PERMISSIONS */}
            {editingRole && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-black uppercase text-white">
                        Edit Role: {editingRole.displayName}
                      </h3>
                      <p className="text-xs text-zinc-400">{editingRole.name}</p>
                    </div>
                    <button onClick={() => setEditingRole(null)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleUpdateRole} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editingRole.displayName}
                        onChange={(e) => setEditingRole({ ...editingRole, displayName: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                        Assigned Permissions:
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                        {permissionsList.map((p) => {
                          const isChecked = editingRole.permissionIds.includes(p.id) || editingRole.permissionIds.includes('*');
                          return (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={editingRole.id === 'role-super-admin'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingRole({
                                      ...editingRole,
                                      permissionIds: [...editingRole.permissionIds, p.id]
                                    });
                                  } else {
                                    setEditingRole({
                                      ...editingRole,
                                      permissionIds: editingRole.permissionIds.filter(id => id !== p.id)
                                    });
                                  }
                                }}
                                className="rounded bg-zinc-800 border-zinc-700 text-amber-400"
                              />
                              <span className="truncate">{p.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingRole(null)}
                        className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl"
                      >
                        {loading ? 'Saving...' : 'Save Role Permissions'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: CONFIRM DELETE CUSTOM ROLE */}
            {roleToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                  <h3 className="text-base font-black uppercase text-white mb-2">Delete Custom Role</h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    Are you sure you want to permanently delete custom role <strong className="text-white">"{roleToDelete.name}"</strong>? 
                    Any users assigned to this role will lose its permissions.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRoleToDelete(null)}
                      disabled={loading}
                      className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteRole}
                      disabled={loading}
                      className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition"
                    >
                      {loading ? 'Deleting...' : 'Delete Role'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: ROSTER ATHLETES */}
        {/* ======================================================== */}
        {activeTab === 'players' && (
          <PlayerManagementTab
            players={players}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: MATCH OPERATIONS */}
        {/* ======================================================== */}
        {activeTab === 'matches' && (
          <MatchOperationsTab
            matches={matches || []}
            fixtures={fixtures || []}
            players={players}
            tournaments={tournaments}
            seasons={seasons}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: SEASONS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'seasons' && (
          <SeasonManagementTab
            seasons={seasons || []}
            matches={matches || []}
            tournaments={tournaments || []}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: TOURNAMENT MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'tournaments' && (
          <TournamentManagementTab
            tournaments={tournaments}
            seasons={seasons}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: CLUB TROPHIES & HONORS CRUD MANAGEMENT              */}
        {/* ======================================================== */}
        {activeTab === 'trophies' && (
          <TrophyManagementTab
            trophies={trophies}
            awards={awards}
            milestones={milestones}
            players={players}
            seasons={seasons}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
            onNavigateToPublicTrophies={onNavigateToPublicTrophies}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: RATING FORMULA & RANKINGS */}
        {/* ======================================================== */}
        {activeTab === 'rankings' && (
          <RankingEngineTab
            players={players}
            ratingConfig={ratingConfig}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: NEWS PUBLISHER */}
        {/* ======================================================== */}
        {activeTab === 'news' && (
          <NewsPublisherTab
            news={news || []}
            players={players}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: MOVING ANNOUNCEMENTS CONTROL */}
        {/* ======================================================== */}
        {activeTab === 'announcements' && (
          <AnnouncementManagerTab
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {/* ======================================================== */}
        {/* TAB: MEDIA LIBRARY */}
        {/* ======================================================== */}
        {activeTab === 'media' && (
          <MediaLibraryTab
            media={media || []}
            players={players}
            matches={matches || []}
            hasPermission={hasPermission}
            isSuperAdmin={isSuperAdmin}
            onRefreshData={onRefreshData}
            showFeedback={showFeedback}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 7: AUDIT LOGS */}
        {/* ======================================================== */}
        {activeTab === 'audit-logs' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Administrative Audit Trail
                </h3>
                <p className="text-xs text-zinc-400">
                  Secure tamper-evident log documenting authentication, role modifications, match entries, and permission changes.
                </p>
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="LOGOUT">Logout</option>
                <option value="UPDATE_USER_ROLES">Role Assignment</option>
                <option value="SUSPEND_USER">User Suspension</option>
                <option value="CREATE_MATCH">Match Entries</option>
                <option value="RECALCULATE_RANKINGS">Recalculation</option>
              </select>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-zinc-900">
                {filteredLogs.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    No audit log records recorded yet.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-zinc-900/40 transition text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-amber-400">
                            {log.action}
                          </span>
                          <span className="font-bold text-white">{log.actor}</span>
                          <span className="text-[10px] text-zinc-500">Target: {log.entityType} ({log.entityId})</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">{log.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SUPABASE CLOUD DATABASE (SUPER ADMIN ONLY) */}
        {/* ======================================================== */}
        {activeTab === 'supabase' && isSuperAdmin && (
          <SupabaseDatabaseTab />
        )}

        {/* ======================================================== */}
        {/* TAB 8: SYSTEM SETTINGS (SUPER ADMIN ONLY) */}
        {/* ======================================================== */}
        {activeTab === 'settings' && isSuperAdmin && (
          <div className="max-w-2xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-3xl animate-fadeIn space-y-6">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider text-red-400">
                Danger Zone & Database Reset
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Super Administrator authority: Reset all club data, players, matches, ratings, and audit records back to pristine factory seeds.
              </p>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-800/60 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-white block">Restore Official Seed Database</span>
                <span className="text-xs text-zinc-400">Reinitializes all official BDPSC players, matches, and roles.</span>
              </div>

              <button
                type="button"
                onClick={() => setIsResetDbModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shrink-0"
              >
                Reset Database
              </button>
            </div>

            {/* Modal: CONFIRM DATABASE RESTORE */}
            {isResetDbModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
                <div className="bg-zinc-950 border border-red-900/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 absolute top-0 left-0" />
                  <h3 className="text-base font-black uppercase text-white mb-2">Restore Official Seed Database?</h3>
                  <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                    This will re-initialize all official BDPSC players, baseline match logs, and championship records. 
                    Any newly added custom matches will be reset to baseline.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsResetDbModalOpen(false)}
                      disabled={loading}
                      className="px-4 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await resetToSeedData();
                          showFeedback('success', 'Database restored to official seeds.');
                          setIsResetDbModalOpen(false);
                          onRefreshData();
                          await loadUsersAndRoles();
                        } catch (err: any) {
                          showFeedback('error', err.message || 'Reset failed');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition"
                    >
                      {loading ? 'Restoring...' : 'Yes, Restore Database'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
