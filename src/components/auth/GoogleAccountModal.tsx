import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, ChevronRight, ArrowLeft, Trash2, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface GoogleSavedAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  lastUsed: string;
}

const STORAGE_KEY = 'bdpsc_saved_google_accounts';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (redirectPath: string) => void;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle } = useAuth();
  const [accounts, setAccounts] = useState<GoogleSavedAccount[]>([]);
  const [mode, setMode] = useState<'SELECT' | 'ENTER_CUSTOM'>('SELECT');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Load saved accounts from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setAccounts(parsed);
          if (parsed.length === 0) {
            setMode('ENTER_CUSTOM');
          } else {
            setMode('SELECT');
          }
          return;
        }
      }
    } catch {
      // ignore
    }
    // Default fallback list if none exists yet
    const initialList: GoogleSavedAccount[] = [
      {
        email: 'ashrafulashem@gmail.com',
        name: 'Ashraful Ashem (Founder)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        lastUsed: new Date().toISOString(),
      }
    ];
    setAccounts(initialList);
    setMode('SELECT');
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAccountToHistory = (account: GoogleSavedAccount) => {
    try {
      const existing = accounts.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
      const updated = [account, ...existing].slice(0, 5);
      setAccounts(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeAccount = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = accounts.filter(a => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    setAccounts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    if (updated.length === 0) {
      setMode('ENTER_CUSTOM');
    }
  };

  const handleSelectAccount = async (account: GoogleSavedAccount) => {
    setError(null);
    setSelectedEmail(account.email);
    setLoading(true);

    try {
      const res = await loginWithGoogle(
        account.email,
        account.name,
        account.avatarUrl
      );

      saveAccountToHistory({
        ...account,
        lastUsed: new Date().toISOString(),
      });

      onSuccess(res.redirectPath || '/dashboard');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
      setSelectedEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your Google email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    // Infer a clean name if left blank (e.g. "ashrafur.rahman" -> "Ashrafur Rahman")
    let resolvedName = name.trim();
    if (!resolvedName) {
      const prefix = cleanEmail.split('@')[0];
      resolvedName = prefix
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    setLoading(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=0284c7,f59e0b,10b981`;
      
      const res = await loginWithGoogle(
        cleanEmail,
        resolvedName,
        avatarUrl
      );

      saveAccountToHistory({
        email: cleanEmail,
        name: resolvedName,
        avatarUrl,
        lastUsed: new Date().toISOString(),
      });

      onSuccess(res.redirectPath || '/dashboard');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-red-500 to-amber-400"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700/80 p-2 flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {mode === 'SELECT' ? 'Choose an account' : 'Sign in with Google'}
              </h3>
              <p className="text-xs text-zinc-400">
                to continue to <strong className="text-amber-400">BD Power Strikers Club</strong>
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* MODE 1: SELECT EXISTING OR RECENT ACCOUNT */}
          {mode === 'SELECT' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isCurrent = selectedEmail === acc.email;
                  return (
                    <div
                      key={acc.email}
                      onClick={() => !loading && handleSelectAccount(acc)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-400/10 border-amber-400/50'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800">
                          <img
                            src={acc.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`}
                            alt={acc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate">
                            {acc.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isCurrent && loading ? (
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => removeAccount(acc.email, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                              title="Remove from this browser list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setEmail('');
                  setName('');
                  setMode('ENTER_CUSTOM');
                }}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-zinc-700 hover:border-amber-400/60 bg-zinc-900/40 hover:bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white transition"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">Use another Google account</div>
                  <div className="text-[11px] text-zinc-400 font-normal">Sign in with your own Google email</div>
                </div>
              </button>
            </div>
          )}

          {/* MODE 2: ENTER CUSTOM GOOGLE ACCOUNT */}
          {mode === 'ENTER_CUSTOM' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('SELECT');
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to saved accounts</span>
                </button>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Google Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Enter the Google email address you want to link to your BDPSC profile.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Your Full Name <span className="text-zinc-500 text-[10px] lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ashrafur Rahman"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMode('SELECT')}
                    className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Privacy Footnote */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-[10px] text-zinc-500 leading-relaxed">
            By continuing, Google shares your name, email address, and profile picture with BD Power Strikers Club. See our{' '}
            <span className="text-zinc-400 hover:underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
