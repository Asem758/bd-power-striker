import crypto from 'crypto';
import { User, Role, UserWithDetails, Player } from '../src/types';

/**
 * Cryptographically secure password hashing using PBKDF2 with SHA-512
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, userSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: userSalt };
}

/**
 * Timing-safe password verification
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Generate secure session token or reset token
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Collect all permissions for a user given their assigned roles
 */
export function resolveUserPermissions(user: User, allRoles: Role[]): string[] {
  const userRoles = allRoles.filter(r => user.roleIds.includes(r.id));
  const permSet = new Set<string>();

  for (const role of userRoles) {
    for (const p of role.permissionIds) {
      permSet.add(p);
    }
  }

  // If user has '*', they possess all permissions
  return Array.from(permSet);
}

/**
 * Sanitize user object for transmission to frontend (strips passwordHash & salt)
 */
export function sanitizeUserWithDetails(
  user: User,
  allRoles: Role[],
  allPlayers: Player[]
): UserWithDetails {
  const roles = allRoles.filter(r => user.roleIds.includes(r.id));
  const permissions = resolveUserPermissions(user, allRoles);
  const player = user.playerId ? allPlayers.find(p => p.id === user.playerId) : undefined;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    gamingName: user.gamingName || player?.gamingName,
    avatarUrl: user.avatarUrl || player?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: user.status,
    roleIds: user.roleIds,
    playerId: user.playerId,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    roles,
    permissions,
    player,
  };
}
