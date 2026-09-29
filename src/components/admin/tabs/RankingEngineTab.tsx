import React, { useState } from 'react';
import { Player, RatingConfig } from '../../../types';
import { updateRatingConfig, triggerRecalculateRankings, overridePlayerRating } from '../../../services/api';

interface RankingEngineTabProps {
  players: Player[];
  ratingConfig: RatingConfig;
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

export const RankingEngineTab: React.FC<RankingEngineTabProps> = ({
  players,
  ratingConfig,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState<RatingConfig>({ ...ratingConfig });

  // Manual Override Form State
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [overrideRating, setOverrideRating] = useState<number>(players[0]?.rating || 90);
  const [overrideRank, setOverrideRank] = useState<number>(players[0]?.overallRank || 1);
  const [overrideReason, setOverrideReason] = useState<string>('');

  const canManage = hasPermission('rankings.manage') || isSuperAdmin;
  const canRecalculate = hasPermission('rankings.recalculate') || isSuperAdmin;

  // When selected player changes in override form
  const handlePlayerSelect = (id: string) => {
    setSelectedPlayerId(id);
    const p = players.find(x => x.id === id);
    if (p) {
      setOverrideRating(p.rating);
      setOverrideRank(p.overallRank);
    }
  };

  // Submit Manual Rating Adjustment
  const handleApplyRatingOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      showFeedback('error', 'Please select a player to adjust.');
      return;
    }
    if (!overrideReason.trim()) {
      showFeedback('error', 'A justification reason is required for administrative rating overrides.');
      return;
    }

    const targetPlayer = players.find(p => p.id === selectedPlayerId);
    setLoading(true);
    try {
      await overridePlayerRating(selectedPlayerId, {
        rating: Number(overrideRating),
        rank: Number(overrideRank),
        reason: overrideReason.trim(),
      });
      showFeedback('success', `Rating override applied for ${targetPlayer?.gamingName || 'player'}.`);
      setOverrideReason('');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to override rating');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Automated Systemic Recalculation
  const handleTriggerRecalculate = async () => {
    setLoading(true);
    try {
      const res = await triggerRecalculateRankings('Manual system-wide recalculation triggered from Admin Panel');
      showFeedback('success', res.message || 'Systemic rankings & rating progression recomputed.');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Recalculation error');
    } finally {
      setLoading(false);
    }
  };

  // Save Formula Configuration
  const handleSaveFormulaWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateRatingConfig(cfg);
      showFeedback('success', res.message || 'Formula weights updated and all athlete scores recomputed.');
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save formula weights');
    } finally {
      setLoading(false);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            Ranking Engine & Rating Architecture
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dynamic ELO-hybrid algorithm evaluating match results, individual contributions, opponent strength, and clean sheets
          </p>
        </div>

        {canRecalculate && (
          <button
            onClick={handleTriggerRecalculate}
            disabled={loading}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-lg shadow-amber-400/20 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>Trigger Full System Recalculation</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: MANUAL RATING & RANK OVERRIDE */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center text-sm font-black">
              ⚖️
            </span>
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Manual Rank / Rating Adjustment
              </h3>
              <p className="text-[11px] text-zinc-400">
                Allows administrators to manually calibrate a player's official rating or re-index leaderboard positions
              </p>
            </div>
          </div>

          {canManage ? (
            <form onSubmit={handleApplyRatingOverride} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Select Athlete
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => handlePlayerSelect(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.jerseyNumber} {p.gamingName} ({p.name}) — Current: {p.rating} pts (Rank #{p.overallRank})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Override Rating Points
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={120}
                    value={overrideRating}
                    onChange={(e) => setOverrideRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Override Overall Rank #
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={players.length}
                    value={overrideRank}
                    onChange={(e) => setOverrideRank(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Audit Justification Reason *
                </label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Tournament MVP adjustment or tier qualification calibration"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  All manual overrides are logged into the system audit trail with administrator timestamp.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50"
              >
                {loading ? 'Applying Override...' : 'Apply Rating & Rank Override'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-xs text-zinc-400">
              You do not have permission to manually override player ratings. Required permission: <code className="text-amber-400">rankings.manage</code>.
            </div>
          )}
        </div>

        {/* SECTION 2: RATING FORMULA PARAMETERS */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center text-sm font-black">
              ⚙️
            </span>
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Algorithm Formula Weights
              </h3>
              <p className="text-[11px] text-zinc-400">
                Systemic weights governing automated match score calculations
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveFormulaWeights} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  Base Floor
                </label>
                <input
                  type="number"
                  value={cfg.baseRating}
                  onChange={(e) => setCfg({ ...cfg, baseRating: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  Win Factor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cfg.winWeight}
                  onChange={(e) => setCfg({ ...cfg, winWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  Goal Weight
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cfg.goalWeight}
                  onChange={(e) => setCfg({ ...cfg, goalWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  Assist Weight
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cfg.assistWeight}
                  onChange={(e) => setCfg({ ...cfg, assistWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  MOTM Multiplier
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={cfg.motmWeight}
                  onChange={(e) => setCfg({ ...cfg, motmWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  Clean Sheet
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={cfg.cleanSheetWeight}
                  onChange={(e) => setCfg({ ...cfg, cleanSheetWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            {canManage && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-400/40 font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Updating Weights...' : 'Save Weights & Recompute All Player Ratings'}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* SECTION 3: LIVE LEADERBOARD INDEX PREVIEW */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Current Leaderboard Standing & Rating Index ({players.length} Athletes)
          </h3>
          <span className="text-[10px] text-zinc-400">
            Last Updated: {ratingConfig.updatedAt ? new Date(ratingConfig.updatedAt).toLocaleTimeString() : 'Recent'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Weekly</th>
                <th className="py-3 px-4">Monthly</th>
                <th className="py-3 px-4">Season</th>
                <th className="py-3 px-4">Matches</th>
                <th className="py-3 px-4">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {sortedPlayers.map((p, idx) => (
                <tr key={p.id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-mono font-black text-amber-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">{p.gamingName}</span>
                    <span className="text-zinc-500 text-[11px] block">{p.name}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-zinc-300">{p.position}</td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">{p.rating}</td>
                  <td className="py-3 px-4 font-mono text-zinc-400">#{p.weeklyRank || idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-zinc-400">#{p.monthlyRank || idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-zinc-400">#{p.seasonRank || idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{p.totalMatches}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{p.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
