import { 
  UserWithDetails, 
  Role, 
  Permission, 
  AuditLog, 
  Player, 
  Match, 
  Award, 
  Trophy 
} from '../types';
import { supabase } from './supabase';

const TOKEN_KEY = 'bdpsc_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface AuthResponse {
  user: UserWithDetails;
  token: string;
  message?: string;
}

export interface PlayerStatsResponse {
  linked: boolean;
  message?: string;
  player?: Player;
  ratingBreakdown?: any;
  matches?: Match[];
  awards?: Award[];
  trophies?: Trophy[];
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  // Sync login with Supabase client Auth (non-blocking)
  try {
    supabase.auth.signInWithPassword({ email, password }).catch(() => {});
  } catch {}

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }

  setAuthToken(data.token);
  return data;
}

export async function register(
  email: string, 
  password: string, 
  name: string, 
  gamingName?: string
): Promise<AuthResponse> {
  // Sync registration with Supabase Auth (non-blocking)
  try {
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          gaming_name: gamingName,
        }
      }
    }).then(({ data: sbData }) => {
      if (sbData?.user) {
        supabase.from('profiles').upsert({
          id: sbData.user.id,
          email,
          name,
          gaming_name: gamingName || null,
          role: email.toLowerCase() === 'ashrafulashem@gmail.com' ? 'SUPER_ADMIN' : 'USER',
          status: 'ACTIVE',
        }).then(() => {});
      }
    }).catch(() => {});
  } catch {}

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, gamingName }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  setAuthToken(data.token);
  return data;
}

export async function loginWithGoogle(
  email: string, 
  name?: string, 
  avatarUrl?: string, 
  googleId?: string
): Promise<AuthResponse> {
  // Sync profile to Supabase if client is active (non-blocking)
  try {
    supabase.from('profiles').upsert({
      email,
      name: name || email.split('@')[0],
      avatar_url: avatarUrl || null,
      role: email.toLowerCase() === 'ashrafulashem@gmail.com' ? 'SUPER_ADMIN' : 'USER',
      status: 'ACTIVE',
    }, { onConflict: 'email' }).then(() => {});
  } catch {}

  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, avatarUrl, googleId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Google login failed');
  }

  setAuthToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    supabase.auth.signOut().catch(() => {});
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    removeAuthToken();
  }
}

export async function getCurrentUser(): Promise<UserWithDetails | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        removeAuthToken();
      }
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch (e) {
    console.error('Failed to verify session:', e);
    return null;
  }
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Password reset failed');
  return data;
}

export async function updateProfile(data: { name?: string; gamingName?: string; avatarUrl?: string }): Promise<UserWithDetails> {
  const res = await fetch('/api/auth/update-profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Update failed');
  return resData.user;
}

export async function uploadAvatar(payload: {
  file?: string;
  fileName?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; avatarUrl: string; user: UserWithDetails; message: string }> {
  const res = await fetch('/api/auth/avatar', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload profile photo');
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Password change failed');
  return data;
}

// Player Dashboard
export async function getMyPlayerStats(): Promise<PlayerStatsResponse> {
  const res = await fetch('/api/player/me/stats', {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to fetch player stats');
  return data;
}

export async function updateMyPlayerBio(bioData: {
  bio?: string;
  preferredPlatform?: string;
  playstyle?: string;
  favoriteTeam?: string;
  socialHandle?: string;
}): Promise<{ success: boolean; player: Player; message: string }> {
  const res = await fetch('/api/player/me/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bioData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update player bio');
  return data;
}

// RBAC & User Management
export async function getAdminUsers(params?: { search?: string; role?: string; status?: string }): Promise<UserWithDetails[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.role) query.append('role', params.role);
  if (params?.status) query.append('status', params.status);

  const res = await fetch(`/api/admin/users?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch users');
  }
  return res.json();
}

export async function updateUserRoles(userId: string, roleIds: string[]): Promise<UserWithDetails> {
  const res = await fetch(`/api/admin/users/${userId}/roles`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ roleIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user roles');
  return data.user;
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<UserWithDetails> {
  const res = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user status');
  return data.user;
}

export async function deleteUser(userId: string, email?: string): Promise<{ success: boolean; message: string; supabaseSynced?: boolean }> {
  // Sync client-side Supabase profile removal if available
  if (email) {
    try {
      await supabase.from('profiles').delete().eq('email', email.toLowerCase().trim());
    } catch {}
  }
  if (userId) {
    try {
      await supabase.from('profiles').delete().eq('id', userId);
    } catch {}
  }

  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete user account');
  return data;
}

export async function linkUserToPlayer(userId: string, playerId: string | null): Promise<UserWithDetails> {
  const res = await fetch(`/api/admin/users/${userId}/player-link`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ playerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to link player profile');
  return data.user;
}

export async function getRoles(): Promise<Role[]> {
  const res = await fetch('/api/admin/roles', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

export async function createRole(roleData: {
  name: string;
  displayName: string;
  description: string;
  permissionIds: string[];
  color?: string;
}): Promise<Role> {
  const res = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create role');
  return data;
}

export async function updateRole(roleId: string, roleData: {
  displayName?: string;
  description?: string;
  permissionIds?: string[];
  color?: string;
}): Promise<Role> {
  const res = await fetch(`/api/admin/roles/${roleId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update role');
  return data;
}

export async function deleteRole(roleId: string): Promise<void> {
  const res = await fetch(`/api/admin/roles/${roleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete role');
  }
}

export async function getPermissions(): Promise<Permission[]> {
  const res = await fetch('/api/admin/permissions', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch permissions');
  return res.json();
}

export async function getAuditLogs(params?: { actor?: string; action?: string; entityType?: string }): Promise<AuditLog[]> {
  const query = new URLSearchParams();
  if (params?.actor) query.append('actor', params.actor);
  if (params?.action) query.append('action', params.action);
  if (params?.entityType) query.append('entityType', params.entityType);

  const res = await fetch(`/api/admin/audit-logs?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch audit logs');
  }
  return res.json();
}
