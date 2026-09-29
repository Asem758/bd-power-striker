import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserWithDetails } from '../types';
import * as authService from '../services/authService';

export type AuthModalMode = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'RESET';

export interface RoleBadgeInfo {
  name: string;
  displayName: string;
  color: string;
  bg: string;
  border: string;
  text: string;
}

export function getRoleBadgeInfo(user: UserWithDetails | null): RoleBadgeInfo {
  if (!user || !user.roles || user.roles.length === 0) {
    return {
      name: 'GUEST',
      displayName: 'Guest',
      color: 'zinc',
      bg: 'bg-zinc-850',
      border: 'border-zinc-700',
      text: 'text-zinc-400',
    };
  }

  const roleNames = user.roles.map(r => r.name.toUpperCase());
  if (roleNames.includes('SUPER_ADMIN') || user.permissions.includes('*')) {
    return {
      name: 'SUPER_ADMIN',
      displayName: 'Super Admin',
      color: 'amber',
      bg: 'bg-amber-500/15',
      border: 'border-amber-400/40',
      text: 'text-amber-400',
    };
  }
  if (roleNames.includes('STATISTICS_MANAGER') || user.permissions.includes('rankings.recalculate')) {
    return {
      name: 'STATISTICS_MANAGER',
      displayName: 'Stats Manager',
      color: 'blue',
      bg: 'bg-blue-500/15',
      border: 'border-blue-400/40',
      text: 'text-blue-400',
    };
  }
  if (roleNames.includes('MEDIA_MANAGER') || user.permissions.includes('media.upload')) {
    return {
      name: 'MEDIA_MANAGER',
      displayName: 'Media Manager',
      color: 'purple',
      bg: 'bg-purple-500/15',
      border: 'border-purple-400/40',
      text: 'text-purple-400',
    };
  }
  if (roleNames.includes('EDITOR') || user.permissions.includes('news.create')) {
    return {
      name: 'EDITOR',
      displayName: 'Content Editor',
      color: 'cyan',
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-400/40',
      text: 'text-cyan-400',
    };
  }
  if (roleNames.includes('PLAYER') || Boolean(user.playerId)) {
    return {
      name: 'PLAYER',
      displayName: 'Pro Player',
      color: 'emerald',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-400/40',
      text: 'text-emerald-400',
    };
  }
  return {
    name: 'MEMBER',
    displayName: user.roles[0]?.displayName || 'Club Member',
    color: 'zinc',
    bg: 'bg-zinc-800/80',
    border: 'border-zinc-700',
    text: 'text-zinc-300',
  };
}

export function getRoleBasedRedirect(user: UserWithDetails | null): string {
  if (!user) return '/login';

  // Super Admin or Staff roles with administrative authority
  const isSuper = user.roles.some(r => r.name.toUpperCase() === 'SUPER_ADMIN') || user.permissions.includes('*');
  const isStaffAdmin = isSuper ||
    user.roles.some(r => ['ADMIN', 'EDITOR', 'STATISTICS_MANAGER', 'MEDIA_MANAGER'].includes(r.name.toUpperCase())) ||
    user.permissions.some(p => !['players.view', 'matches.view', 'tournaments.view', 'rankings.view', 'media.view'].includes(p));

  if (isStaffAdmin) {
    return '/admin/dashboard';
  }

  // Players and Club Members
  return '/dashboard';
}

interface AuthSuccessResult {
  user: UserWithDetails;
  token: string;
  redirectPath: string;
}

interface AuthContextType {
  user: UserWithDetails | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isPlayer: boolean;
  roleBadge: RoleBadgeInfo;
  resolveRedirectPath: (targetUser?: UserWithDetails | null) => string;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  login: (email: string, pass: string) => Promise<AuthSuccessResult>;
  register: (email: string, pass: string, name: string, gamingName?: string) => Promise<AuthSuccessResult>;
  loginWithGoogle: (email: string, name?: string, avatarUrl?: string) => Promise<AuthSuccessResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Auth Modal helpers
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  resetTokenForModal?: string;
  openAuthModal: (mode?: AuthModalMode, token?: string) => void;
  closeAuthModal: () => void;

  // Profile Photo Upload Modal helpers
  isPhotoModalOpen: boolean;
  openPhotoModal: () => void;
  closePhotoModal: () => void;
  updateUserAvatar: (params: { file?: string; fileName?: string; avatarUrl?: string }) => Promise<UserWithDetails>;
  updateUserProfile: (data: { name?: string; gamingName?: string; avatarUrl?: string }) => Promise<UserWithDetails>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [token, setToken] = useState<string | null>(authService.getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [resetTokenForModal, setResetTokenForModal] = useState<string | undefined>(undefined);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const openPhotoModal = () => setIsPhotoModalOpen(true);
  const closePhotoModal = () => setIsPhotoModalOpen(false);

  const updateUserAvatar = async (params: { file?: string; fileName?: string; avatarUrl?: string }): Promise<UserWithDetails> => {
    setIsLoading(true);
    try {
      const res = await authService.uploadAvatar(params);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { name?: string; gamingName?: string; avatarUrl?: string }): Promise<UserWithDetails> => {
    setIsLoading(true);
    try {
      const updated = await authService.updateProfile(data);
      setUser(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setToken(authService.getAuthToken());
    } catch (err) {
      console.error('Error verifying user authentication:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (user.roles?.some(r => r.name.toUpperCase() === 'SUPER_ADMIN')) return true;
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some(r => r.name.toUpperCase() === roleName.toUpperCase());
  }, [user]);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return hasRole('SUPER_ADMIN') || user.permissions.includes('*');
  }, [user, hasRole]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      isSuperAdmin ||
      user.roles.some(r => ['ADMIN', 'EDITOR', 'STATISTICS_MANAGER', 'MEDIA_MANAGER'].includes(r.name.toUpperCase())) ||
      user.permissions.some(p => !['players.view', 'matches.view', 'tournaments.view', 'rankings.view', 'media.view'].includes(p))
    );
  }, [user, isSuperAdmin]);

  const isPlayer = useMemo(() => Boolean(user?.playerId), [user]);

  const roleBadge = useMemo(() => getRoleBadgeInfo(user), [user]);

  const resolveRedirectPath = useCallback((targetUser?: UserWithDetails | null): string => {
    return getRoleBasedRedirect(targetUser !== undefined ? targetUser : user);
  }, [user]);

  const login = async (email: string, pass: string): Promise<AuthSuccessResult> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
      const redirectPath = getRoleBasedRedirect(res.user);
      return { user: res.user, token: res.token, redirectPath };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, gamingName?: string): Promise<AuthSuccessResult> => {
    setIsLoading(true);
    try {
      const res = await authService.register(email, pass, name, gamingName);
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
      const redirectPath = getRoleBasedRedirect(res.user);
      return { user: res.user, token: res.token, redirectPath };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (email: string, name?: string, avatarUrl?: string): Promise<AuthSuccessResult> => {
    setIsLoading(true);
    try {
      const res = await authService.loginWithGoogle(email, name, avatarUrl);
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
      const redirectPath = getRoleBasedRedirect(res.user);
      return { user: res.user, token: res.token, redirectPath };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openAuthModal = (mode: AuthModalMode = 'LOGIN', resetToken?: string) => {
    setAuthModalMode(mode);
    setResetTokenForModal(resetToken);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setResetTokenForModal(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isSuperAdmin,
        isAdmin,
        isPlayer,
        roleBadge,
        resolveRedirectPath,
        hasPermission,
        hasRole,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        resetTokenForModal,
        openAuthModal,
        closeAuthModal,
        isPhotoModalOpen,
        openPhotoModal,
        closePhotoModal,
        updateUserAvatar,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
