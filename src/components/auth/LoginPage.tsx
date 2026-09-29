import React, { useState } from 'react';
import { ClubLogo } from '../ClubLogo';
import { useAuth, AuthModalMode } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { Shield, Lock, Mail, Key, User, Gamepad2, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { GoogleAccountModal } from './GoogleAccountModal';

interface LoginPageProps {
  onNavigate: (view: string, idOrSlug?: string) => void;
  initialMode?: AuthModalMode;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, initialMode = 'LOGIN' }) => {
  const { login, register, loginWithGoogle, isAuthenticated, user, resolveRedirectPath } = useAuth();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [gamingName, setGamingName] = useState('');
  const [resetToken, setResetToken] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // If already authenticated, display quick redirect banner
  if (isAuthenticated && user) {
    const targetPath = resolveRedirectPath(user);
    const targetLabel = targetPath.includes('admin') ? 'Staff Admin Dashboard' : 'Player Dashboard';

    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400 absolute top-0 left-0"></div>
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
            Already Authenticated
          </h2>

          <p className="text-xs text-zinc-400 mb-6">
            You are signed in as <strong className="text-white">{user.name}</strong> ({user.email}).
          </p>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate(targetPath.replace(/^\//, ''))}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <span>Continue to {targetLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl transition"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      // Dynamic Role Resolution: Redirect to /admin/dashboard or /dashboard
      const dest = res.redirectPath.replace(/^\//, '');
      onNavigate(dest);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await register(email, password, name, gamingName);
      const dest = res.redirectPath.replace(/^\//, '');
      onNavigate(dest);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError(null);
    setShowGoogleModal(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setTimeout(() => setMode('RESET'), 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Could not dispatch password reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword(resetToken, password);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('LOGIN');
        setSuccessMsg('Your password has been updated. Please sign in with your new credentials.');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 absolute top-0 left-0"></div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <ClubLogo size="lg" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            {mode === 'LOGIN' && 'Sign In to BDPSC'}
            {mode === 'REGISTER' && 'Join BD Power Strikers'}
            {mode === 'FORGOT' && 'Password Recovery'}
            {mode === 'RESET' && 'Set New Password'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'LOGIN' && 'Access player stats, club records & authorized portals'}
            {mode === 'REGISTER' && 'Create your official BDPSC club profile'}
            {mode === 'FORGOT' && 'Enter your registered email to receive reset instructions'}
            {mode === 'RESET' && 'Enter your reset token and updated credentials'}
          </p>
        </div>

        {/* Tab Switcher (Login / Register) */}
        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <div className="flex bg-zinc-900/90 p-1 rounded-xl mb-6 border border-zinc-800">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alert: Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Alert: Success */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth (No dev shortcuts, real OAuth standard) */}
        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-500 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google Account
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-950 px-3 text-zinc-500 font-medium uppercase tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('FORGOT'); setError(null); }}
                  className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:text-amber-400"
                  title={showPassword ? 'Hide password' : 'View password'}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ashraful Ashem"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                eFootball Gaming Name / IGN <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Gamepad2 className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={gamingName}
                  onChange={(e) => setGamingName(e.target.value)}
                  placeholder="e.g. Ashem_07"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@bdpsc.club"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1.5 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:text-amber-400"
                    title={showPassword ? 'Hide password' : 'View password'}
                    aria-label={showPassword ? 'Hide password' : 'View password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1.5 top-1.5 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:text-amber-400"
                    title={showConfirmPassword ? 'Hide password' : 'View password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'View password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Profile'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'FORGOT' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black uppercase tracking-wider text-xs rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Sending Instructions...' : 'Request Password Reset'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 4. RESET PASSWORD FORM */}
        {mode === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste reset token"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1.5 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:text-amber-400"
                  title={showPassword ? 'Hide password' : 'View password'}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1.5 top-1.5 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:text-amber-400"
                  title={showConfirmPassword ? 'Hide password' : 'View password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'View password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black uppercase tracking-wider text-xs rounded-xl transition disabled:opacity-50 mt-1"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-600" />
            <span>Protected by BDPSC Enterprise Role-Based Access Control</span>
          </p>
        </div>

      </div>

      {/* Google Account Selector Dialog */}
      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(redirectPath) => {
          const dest = redirectPath.replace(/^\//, '');
          onNavigate(dest);
        }}
      />
    </div>
  );
};
