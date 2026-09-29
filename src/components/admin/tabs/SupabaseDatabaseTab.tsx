import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Server, 
  Key, 
  Globe, 
  Terminal, 
  FileText,
  UploadCloud,
  ArrowRight
} from 'lucide-react';
import { 
  fetchSupabaseStatus, 
  triggerSupabaseSync, 
  fetchSupabaseSqlSchema 
} from '../../../services/api';
import { checkSupabaseConnection, SupabaseHealthCheck } from '../../../services/supabase';

export const SupabaseDatabaseTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [healthCheck, setHealthCheck] = useState<SupabaseHealthCheck | null>(null);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'schema' | 'instructions'>('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [backendStatus, clientHealth, sql] = await Promise.all([
        fetchSupabaseStatus().catch(err => ({ error: err.message, connected: false })),
        checkSupabaseConnection().catch(err => ({ connected: false, error: err.message } as any)),
        fetchSupabaseSqlSchema().catch(() => '-- Schema unavailable'),
      ]);

      setStatus(backendStatus);
      setHealthCheck(clientHealth);
      setSchemaSql(sql);
    } catch (e) {
      console.error('Error loading Supabase status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopySql = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await triggerSupabaseSync();
      setSyncResult(result);
      await loadData();
    } catch (err: any) {
      setSyncResult({ error: err.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const tables = [
    { name: 'profiles', label: 'User Profiles & Roles', desc: 'Syncs automatically with Supabase Auth (auth.users) via trigger' },
    { name: 'players', label: 'Roster & Player Profiles', desc: 'Roster athletes, bios, power rankings, positions, dominant foot' },
    { name: 'matches', label: 'Match Operations', desc: 'Fixtures, opponent details, scorelines, results' },
    { name: 'match_performances', label: 'Player Match Stats', desc: 'Goals, assists, saves, MVP, minutes played, match ratings' },
    { name: 'tournaments', label: 'Tournaments & Brackets', desc: 'Editions, brackets, formats, champion records' },
    { name: 'seasons', label: 'Seasons & Standings', desc: 'Historical & active seasons, goal differentials, win tallies' },
    { name: 'trophies', label: 'Trophy Cabinet', desc: 'Club accolades, tournament victories, milestone awards' },
    { name: 'news_articles', label: 'News & Announcements', desc: 'Editorial posts, featured cover images, categories, tags' },
    { name: 'media_items', label: 'Media Library Assets', desc: 'Highlight clips, team wallpapers, tournament photos' },
    { name: 'announcements', label: 'Ticker Announcements', desc: 'Live breaking ticker alerts & club updates' },
    { name: 'rating_configs', label: 'Rating Engine (v1.2)', desc: 'Official BDPSC rating multiplier configuration' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-950 border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  Supabase Relational Database
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Active Project
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PostgreSQL Database, Real-time Subscriptions, Supabase Auth & Row Level Security (RLS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/ooqeoqxhogrmcbzjtmjk/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-400">Project ID</div>
              <div className="text-xs font-mono font-bold text-white truncate">ooqeoqxhogrmcbzjtmjk</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-400">Endpoint URL</div>
              <div className="text-xs font-mono font-bold text-slate-300 truncate">
                https://ooqeoqxhogrmcbzjtmjk.supabase.co
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <Key className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-slate-400">Client Key</div>
              <div className="text-xs font-mono font-bold text-slate-300 truncate">
                sb_publishable_eaycO9uNpAqK...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Sub-navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'overview'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tables & Sync Status</span>
        </button>
        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'schema'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>SQL Schema Migration</span>
        </button>
        <button
          onClick={() => setActiveSubTab('instructions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'instructions'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Setup Guide</span>
        </button>
      </div>

      {/* Sub-Tab 1: Overview & Tables */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Sync Trigger Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>Sync Platform Data to Supabase</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Automatically push roster athletes, match results, tournament brackets, and announcements to your connected Supabase PostgreSQL database tables.
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-black rounded-lg shadow-md transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing...' : 'Sync State to Supabase'}</span>
            </button>
          </div>

          {/* Sync Feedback Message */}
          {syncResult && (
            <div className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2.5 ${
              syncResult.error 
                ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              {syncResult.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <div>
                <p className="font-bold">{syncResult.message || syncResult.error}</p>
                {syncResult.syncedRecords && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Synced records: {Object.entries(syncResult.syncedRecords).map(([t, count]) => `${t} (${count})`).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Relational Tables Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Relational Tables & Schema Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tables.map(tbl => {
                const tableInfo = status?.tables?.[tbl.name];
                const exists = tableInfo?.exists;
                const count = tableInfo?.rowCount ?? 0;

                return (
                  <div
                    key={tbl.name}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{tbl.name}</span>
                        <span className="text-xs font-bold text-white">({tbl.label})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{tbl.desc}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {exists ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{count} rows</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending Migration</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: SQL Schema Migration */}
      {activeSubTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Production SQL Migration Script</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Includes all 11 tables, foreign key constraints, UUID extensions, automatic profile sync trigger on Auth sign-up, and Row Level Security (RLS) policies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto max-h-[500px]">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
              {schemaSql || '-- Loading schema...'}
            </pre>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Instructions */}
      {activeSubTab === 'instructions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-white">How to Run the Migration in Supabase:</h3>
          <ol className="space-y-3 list-decimal list-inside text-slate-400">
            <li className="leading-relaxed">
              <span className="text-slate-200 font-semibold">Open Supabase Dashboard:</span> Go to{' '}
              <a 
                href="https://supabase.com/dashboard/project/ooqeoqxhogrmcbzjtmjk/sql" 
                target="_blank" 
                rel="noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                ooqeoqxhogrmcbzjtmjk SQL Editor <ExternalLink className="w-3 h-3" />
              </a>.
            </li>
            <li className="leading-relaxed">
              <span className="text-slate-200 font-semibold">Copy the SQL Script:</span> Switch to the{' '}
              <button onClick={() => setActiveSubTab('schema')} className="text-amber-400 underline font-bold">
                SQL Schema Migration
              </button>{' '}
              tab above and click "Copy SQL Script".
            </li>
            <li className="leading-relaxed">
              <span className="text-slate-200 font-semibold">Run the Query:</span> In the Supabase SQL Editor, paste the script into a new query tab and click <span className="text-emerald-400 font-bold">RUN</span>.
            </li>
            <li className="leading-relaxed">
              <span className="text-slate-200 font-semibold">Return & Sync:</span> Come back to this tab and click <span className="text-amber-400 font-bold">"Sync State to Supabase"</span> to populate all BDPSC records into your tables!
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
