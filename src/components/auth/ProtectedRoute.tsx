import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, ArrowRight, Home, LayoutDashboard, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requiredRoles?: string[];
  requiredPermission?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
  onOpenLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  requiredRoles = [],
  requiredPermission,
  onNavigate,
  onOpenLogin,
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isAdmin, 
    user, 
    roleBadge, 
    hasRole, 
    hasPermission, 
    logout, 
    openAuthModal 
  } = useAuth();

  // 1. Loading state while verifying token & session
  if (isLoading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 animate-pulse shadow-lg shadow-amber-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-400 text-lg">
            BD
          </div>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          VERIFYING ACCESS CREDENTIALS & RBAC AUTHORIZATION...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to login or prompt sign-in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400 absolute top-0 left-0"></div>
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            Authentication Required
          </span>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            Protected Club Area
          </h2>

          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            You must be signed in to an authenticated BD Power Strikers Club account to access this portal. 
            Please sign in with your email or Google account to continue.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else openAuthModal('LOGIN');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. RBAC Check: Admin Only
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-zinc-950 border border-red-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 absolute top-0 left-0"></div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30 mb-2">
              <span>HTTP 403 • ACCESS DENIED</span>
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Staff Authorization Required
            </h2>

            <p className="text-xs text-zinc-400 mt-2 max-w-sm">
              The BDPSC Administrative Control Center is restricted to authorized club management personnel. 
              Your active session does not possess the required staff credentials.
            </p>
          </div>

          {/* Current User Role Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Active User Session
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                  <div className="text-[11px] text-zinc-400 leading-tight">{user.email}</div>
                </div>
              </div>

              {/* Role badge */}
              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                {roleBadge.displayName}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigate('dashboard')}
              className="py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to My Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-zinc-800"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Public Home</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-900 text-center">
            <button
              onClick={async () => {
                await logout();
                if (onOpenLogin) onOpenLogin();
                else openAuthModal('LOGIN');
              }}
              className="text-xs text-zinc-500 hover:text-amber-400 transition inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3 h-3" />
              <span>Switch to an authorized staff account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role list check (if specified)
  if (requiredRoles.length > 0) {
    const hasAnyRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasAnyRequiredRole && !user.permissions.includes('*')) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
              Role Permission Required
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              This module requires one of the following assigned roles: {requiredRoles.join(', ')}.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // 5. Specific permission check (if specified)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
            Permission Required
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            You do not possess the required permission <code className="text-amber-400">[{requiredPermission}]</code>.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Authorized: Render target view
  return <>{children}</>;
};
