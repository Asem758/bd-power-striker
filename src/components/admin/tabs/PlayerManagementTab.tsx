import React, { useState } from 'react';
import { Player, PlayerPosition, PlayerStatus } from '../../../types';
import { savePlayer, deletePlayer, updatePlayerStatus } from '../../../services/api';
import { FileAttachmentUpload } from '../common/FileAttachmentUpload';

interface PlayerManagementTabProps {
  players: Player[];
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

const POSITIONS: PlayerPosition[] = ['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'LB', 'RB', 'CB', 'GK'];
const STATUSES: { value: PlayerStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'BENCHED', label: 'Benched' },
  { value: 'INJURED', label: 'Injured' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'RESERVE', label: 'Reserve Squad' },
  { value: 'FORMER', label: 'Former Member' },
];
const TIERS = ['First Team', 'Starting XI', 'Academy', 'Reserve Squad', 'Legend'];

export const PlayerManagementTab: React.FC<PlayerManagementTabProps> = ({
  players,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  // Add / Edit Form State
  const [formName, setFormName] = useState('');
  const [formGamingName, setFormGamingName] = useState('');
  const [formEfootballId, setFormEfootballId] = useState('');
  const [formJersey, setFormJersey] = useState<number>(10);
  const [formPosition, setFormPosition] = useState<PlayerPosition>('CF');
  const [formPhoto, setFormPhoto] = useState('');
  const [formTier, setFormTier] = useState<string>('First Team');
  const [formStatus, setFormStatus] = useState<PlayerStatus>('ACTIVE');
  const [formBio, setFormBio] = useState('');
  const [formPlaystyle, setFormPlaystyle] = useState('Goal Poacher');
  const [formPlatform, setFormPlatform] = useState<'Mobile' | 'Console' | 'PC'>('Mobile');
  const [formFavTeam, setFormFavTeam] = useState('BD Power Strikers');
  const [formSocial, setFormSocial] = useState('');

  const canCreate = hasPermission('players.create') || isSuperAdmin;
  const canEdit = hasPermission('players.edit') || isSuperAdmin;
  const canDelete = hasPermission('players.delete') || isSuperAdmin;

  // Open Add Modal
  const openAddModal = () => {
    setFormName('');
    setFormGamingName('');
    setFormEfootballId('');
    setFormJersey(players.length > 0 ? Math.max(...players.map(p => p.jerseyNumber)) + 1 : 10);
    setFormPosition('CF');
    setFormPhoto('');
    setFormTier('First Team');
    setFormStatus('ACTIVE');
    setFormBio('');
    setFormPlaystyle('Goal Poacher');
    setFormPlatform('Mobile');
    setFormFavTeam('BD Power Strikers');
    setFormSocial('');
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormName(player.name);
    setFormGamingName(player.gamingName);
    setFormEfootballId(player.efootballId);
    setFormJersey(player.jerseyNumber);
    setFormPosition(player.position);
    setFormPhoto(player.photoUrl);
    setFormTier(player.clubTier || 'First Team');
    setFormStatus(player.status);
    setFormBio(player.bio || '');
    setFormPlaystyle(player.playstyle || 'Offensive');
    setFormPlatform(player.preferredPlatform || 'Mobile');
    setFormFavTeam(player.favoriteTeam || 'BD Power Strikers');
    setFormSocial(player.socialHandle || '');
  };

  // Handle Submit (Create or Update)
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formGamingName.trim()) {
      showFeedback('error', 'Full Name and Gaming IGN are required.');
      return;
    }
    setLoading(true);
    try {
      const payload: Partial<Player> = {
        name: formName.trim(),
        gamingName: formGamingName.trim(),
        efootballId: formEfootballId.trim() || `BDPSC-${Math.floor(1000 + Math.random() * 9000)}`,
        jerseyNumber: Number(formJersey) || 99,
        position: formPosition,
        photoUrl: formPhoto.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
        status: formStatus,
        clubTier: formTier as any,
        bio: formBio.trim(),
        playstyle: formPlaystyle.trim(),
        preferredPlatform: formPlatform,
        favoriteTeam: formFavTeam.trim(),
        socialHandle: formSocial.trim(),
      };

      if (editingPlayer) {
        payload.id = editingPlayer.id;
      }

      await savePlayer(payload);
      showFeedback('success', editingPlayer ? `Updated profile for ${formGamingName}` : `Enrolled athlete ${formGamingName} into official roster.`);
      setIsAddOpen(false);
      setEditingPlayer(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save player');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (playerId: string, newStatus: string) => {
    try {
      await updatePlayerStatus(playerId, newStatus);
      showFeedback('success', `Player status updated to ${newStatus}`);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update status');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingPlayer) return;
    setLoading(true);
    try {
      await deletePlayer(deletingPlayer.id);
      showFeedback('success', `Athlete ${deletingPlayer.gamingName} was removed from the roster.`);
      setDeletingPlayer(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete player');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Players
  const filteredPlayers = players.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || p.gamingName.toLowerCase().includes(q) || p.efootballId.toLowerCase().includes(q);
    const matchPosition = positionFilter === 'ALL' || p.position === positionFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchQuery && matchPosition && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            Official Club Roster Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Total of {players.length} registered athletes · Control profiles, squad tiers, jersey numbers, and statuses
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 self-start md:self-auto shadow-lg shadow-amber-400/20"
          >
            <span>+</span>
            <span>Enroll New Athlete</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <input
            type="text"
            placeholder="Search by IGN, Real Name, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        <div>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition"
          >
            <option value="ALL">All Positions ({players.length})</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos} — {players.filter((p) => p.position === pos).length} athletes
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label} ({players.filter((p) => p.status === st.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Athlete & IGN</th>
                <th className="py-3.5 px-4">Pos / #</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4">Rating & Rank</th>
                <th className="py-3.5 px-4">Career Stats</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-bold">
                    No athletes matched the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl}
                          alt={p.gamingName}
                          className="w-9 h-9 rounded-full aspect-square object-cover bg-zinc-800 border border-zinc-700/60 shrink-0 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                        <div>
                          <span className="font-black text-white text-xs block tracking-tight">
                            {p.gamingName}
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            {p.name} · <span className="font-mono text-zinc-500">{p.efootballId}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400">{p.position}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="font-mono text-zinc-300">#{p.jerseyNumber}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs text-zinc-300">{p.clubTier || 'First Team'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-emerald-400 font-mono">{p.rating}</span>
                        <span className="text-[10px] text-zinc-500">pts</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-[11px] text-zinc-400 font-mono">#{p.overallRank}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-zinc-400 space-x-1">
                        <span className="text-white font-bold">{p.totalMatches}</span>M ·
                        <span className="text-emerald-400 font-bold">{p.goals}</span>G ·
                        <span className="text-cyan-400 font-bold">{p.assists}</span>A ·
                        <span className="text-amber-400 font-bold">{p.motmCount}</span>⭐
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {canEdit ? (
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-200 focus:outline-none focus:border-amber-400 transition"
                        >
                          {STATUSES.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-medium text-zinc-400">
                          {STATUSES.find((s) => s.value === p.status)?.label || p.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-lg text-xs font-bold transition"
                            title="Edit Roster Details"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeletingPlayer(p)}
                            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded-lg text-xs font-bold transition"
                            title="Remove Athlete"
                          >
                            Delete
                          </button>
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

      {/* MODAL: ADD OR EDIT PLAYER */}
      {(isAddOpen || editingPlayer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  {editingPlayer ? `Edit Athlete: ${editingPlayer.gamingName}` : 'Enroll New BDPSC Athlete'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {editingPlayer
                    ? 'Modify roster profile details, position, assigned tier, and bio'
                    : 'Add official roster athlete with automated ranking indexation'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingPlayer(null);
                }}
                className="text-zinc-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Full Real Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ashraful Ashem"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Gaming IGN (Player Tag) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formGamingName}
                    onChange={(e) => setFormGamingName(e.target.value)}
                    placeholder="e.g. ASHEM_STRIKER"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Position *
                  </label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value as PlayerPosition)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Jersey # *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={formJersey}
                    onChange={(e) => setFormJersey(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Club Tier
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    eFootball Account ID
                  </label>
                  <input
                    type="text"
                    value={formEfootballId}
                    onChange={(e) => setFormEfootballId(e.target.value)}
                    placeholder="e.g. 583-920-112"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PlayerStatus)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <FileAttachmentUpload
                  label="Athlete Squad Photo / Profile Avatar"
                  sublabel="Drag & drop official squad portrait, paste photo URL, or clipboard paste (Ctrl+V)"
                  value={formPhoto}
                  onChange={setFormPhoto}
                  folder="players"
                  accentColor="amber"
                  placeholder="https://images.unsplash.com/... or paste image link"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Preferred Platform
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="Console">Console</option>
                    <option value="PC">PC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Playstyle
                  </label>
                  <input
                    type="text"
                    value={formPlaystyle}
                    onChange={(e) => setFormPlaystyle(e.target.value)}
                    placeholder="e.g. Build Up, Poacher"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Social Handle
                  </label>
                  <input
                    type="text"
                    value={formSocial}
                    onChange={(e) => setFormSocial(e.target.value)}
                    placeholder="@ashem_striker"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Athlete Bio
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Career background, accomplishments, or role within the club..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingPlayer(null);
                  }}
                  className="px-4 py-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingPlayer ? 'Save Changes' : 'Enroll Athlete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION SAFEGUARD */}
      {deletingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-900/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-xl text-red-400 mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight mb-2">
              Confirm Roster Removal
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Are you sure you want to permanently remove <strong className="text-white">{deletingPlayer.gamingName}</strong> ({deletingPlayer.name}) from the BDPSC official roster?
            </p>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl mb-6 text-[11px] text-zinc-400 space-y-1">
              <div>• Any linked user account will have their athlete status unlinked.</div>
              <div>• Club rankings and leaderboard ratings will automatically be recomputed.</div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                disabled={loading}
                className="px-4 py-2.5 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {loading ? 'Removing...' : 'Confirm Removal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
