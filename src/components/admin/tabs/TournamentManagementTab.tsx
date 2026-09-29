import React, { useState } from 'react';
import { Tournament, Season, TournamentFormat, TournamentStatus, TournamentStanding } from '../../../types';
import { saveTournament, deleteTournament } from '../../../services/api';
import { FileAttachmentUpload } from '../common/FileAttachmentUpload';

interface TournamentManagementTabProps {
  tournaments: Tournament[];
  seasons: Season[];
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

const FORMATS: { value: TournamentFormat; label: string }[] = [
  { value: 'KNOCKOUT', label: 'Single Elimination (Knockout)' },
  { value: 'GROUP_KNOCKOUT', label: 'Group Stage + Knockout' },
  { value: 'LEAGUE', label: 'League / Round Robin' },
];

const STATUSES: { value: TournamentStatus; label: string }[] = [
  { value: 'ONGOING', label: 'Ongoing / Live' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const TIERS: Array<'Major' | 'Championship' | 'Cup' | 'Friendly'> = ['Major', 'Championship', 'Cup', 'Friendly'];

export const TournamentManagementTab: React.FC<TournamentManagementTabProps> = ({
  tournaments,
  seasons,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [seasonFilter, setSeasonFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('Bangladesh eFootball Federation');
  const [seasonId, setSeasonId] = useState(seasons[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<TournamentFormat>('KNOCKOUT');
  const [status, setStatus] = useState<TournamentStatus>('ONGOING');
  const [tier, setTier] = useState<'Major' | 'Championship' | 'Cup' | 'Friendly'>('Major');
  const [participantsCount, setParticipantsCount] = useState<number>(16);
  const [prizePool, setPrizePool] = useState('100,000 BDT');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Standings / Teams
  const [standings, setStandings] = useState<TournamentStanding[]>([]);

  const canCreate = hasPermission('tournaments.create') || isSuperAdmin;
  const canEdit = hasPermission('tournaments.edit') || isSuperAdmin;

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTournament(null);
    setName('');
    setOrganizer('Bangladesh eFootball Federation');
    setSeasonId(seasons[0]?.id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setFormat('KNOCKOUT');
    setStatus('ONGOING');
    setTier('Major');
    setParticipantsCount(16);
    setPrizePool('100,000 BDT');
    setDescription('');
    setBannerUrl('');
    setLogoUrl('');
    setStandings([
      {
        position: 1,
        teamName: 'BD Power Strikers Club',
        isClub: true,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (t: Tournament) => {
    setEditingTournament(t);
    setName(t.name);
    setOrganizer(t.organizer || 'BDPSC');
    setSeasonId(t.seasonId || seasons[0]?.id || '');
    setStartDate(t.startDate);
    setEndDate(t.endDate);
    setFormat(t.format);
    setStatus(t.status);
    setTier(t.tier || 'Major');
    setParticipantsCount(t.participantsCount || 16);
    setPrizePool(t.prizePool || '');
    setDescription(t.description || '');
    setBannerUrl(t.bannerUrl || '');
    setLogoUrl(t.logoUrl || '');
    setStandings(t.standings ? [...t.standings] : []);
  };

  // Add team to standings table in modal
  const addStandingsRow = () => {
    setStandings([
      ...standings,
      {
        position: standings.length + 1,
        teamName: `Contender Team ${standings.length + 1}`,
        isClub: false,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]);
  };

  // Remove team from standings table in modal
  const removeStandingsRow = (index: number) => {
    setStandings(standings.filter((_, i) => i !== index));
  };

  // Save Tournament (Create / Update)
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showFeedback('error', 'Tournament name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<Tournament> = {
        name: name.trim(),
        organizer: organizer.trim(),
        seasonId,
        startDate,
        endDate,
        format,
        status,
        tier,
        participantsCount: Number(participantsCount) || 16,
        prizePool: prizePool.trim(),
        description: description.trim(),
        bannerUrl: bannerUrl.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        standings,
      };

      if (editingTournament) {
        payload.id = editingTournament.id;
      }

      await saveTournament(payload);
      showFeedback('success', editingTournament ? `Tournament "${name}" updated.` : `Tournament "${name}" created successfully.`);
      setIsCreateOpen(false);
      setEditingTournament(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save tournament');
    } finally {
      setLoading(false);
    }
  };

  // Delete Tournament
  const handleConfirmDelete = async () => {
    if (!deletingTournament) return;
    setLoading(true);
    try {
      await deleteTournament(deletingTournament.id);
      showFeedback('success', `Tournament "${deletingTournament.name}" deleted.`);
      setDeletingTournament(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete tournament');
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSeason = seasonFilter === 'ALL' || t.seasonId === seasonFilter;
    return matchesStatus && matchesSeason;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            Tournament Management & Brackets
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure competitions, prize pools, knockout brackets, group standings, and slot registrations
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 self-start md:self-auto shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <span>🏆</span>
            <span>Create Tournament</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition"
        >
          <option value="ALL">All Competition Statuses ({tournaments.length})</option>
          {STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label} ({tournaments.filter((t) => t.status === st.value).length})
            </option>
          ))}
        </select>

        {/* Season Filter */}
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition"
        >
          <option value="ALL">All Seasons</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.isCurrent ? '⭐ Active' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTournaments.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-zinc-500 font-bold bg-zinc-950 border border-zinc-800 rounded-2xl">
            No tournaments found. Click "Create Tournament" to set up a new cup or championship.
          </div>
        ) : (
          filteredTournaments.map((t) => (
            <div
              key={t.id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition overflow-hidden"
            >
              {t.bannerUrl && (
                <div className="h-32 w-full bg-zinc-900 relative overflow-hidden">
                  <img
                    src={t.bannerUrl}
                    alt={t.name}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>
              )}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {t.logoUrl ? (
                      <img
                        src={t.logoUrl}
                        alt=""
                        className="w-10 h-10 object-contain rounded-xl bg-zinc-900/80 p-1 border border-zinc-800 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg shrink-0">
                        🏆
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-black text-white">{t.name}</h3>
                      <span className="text-[11px] text-zinc-400">{t.organizer}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border shrink-0 ${
                      t.status === 'ONGOING'
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        : t.status === 'UPCOMING'
                        ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-y border-zinc-900 text-xs text-zinc-400">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Tier</span>
                    <strong className="text-white font-bold">{t.tier || 'Major'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Format</span>
                    <span className="text-zinc-300 truncate block">
                      {FORMATS.find((f) => f.value === t.format)?.label.split(' ')[0] || t.format}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Slots</span>
                    <strong className="text-white font-mono">{t.participantsCount} Teams</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Prize Pool</span>
                    <span className="text-amber-400 font-bold font-mono">{t.prizePool || 'TBA'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-zinc-500 uppercase block">Schedule</span>
                    <span className="text-zinc-300 font-mono text-[11px]">
                      {t.startDate} → {t.endDate}
                    </span>
                  </div>
                </div>

                {t.standings && t.standings.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-black uppercase text-zinc-500 block mb-1">
                      Standings ({t.standings.length} Teams Registered)
                    </span>
                    <div className="space-y-1">
                      {t.standings.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-900/60"
                        >
                          <span className="truncate">
                            <strong className="text-amber-400 font-mono mr-1.5">#{s.position}</strong>
                            <span className={s.isClub ? 'text-white font-bold' : 'text-zinc-400'}>
                              {s.teamName}
                            </span>
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">{s.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
                {canEdit && (
                  <button
                    onClick={() => openEditModal(t)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-xl text-xs font-bold transition"
                  >
                    Edit & Brackets
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setDeletingTournament(t)}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded-xl text-xs font-bold transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: CREATE OR EDIT TOURNAMENT */}
      {(isCreateOpen || editingTournament) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  {editingTournament ? `Edit Tournament: ${editingTournament.name}` : 'Set Up New Tournament'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure competition dates, slots, format, standings, and assigned teams.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTournament(null);
                }}
                className="text-zinc-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bangladesh eFootball Championship 2026"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Organizer Federation
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. National Esports Federation"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {TIERS.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Total Slots
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={64}
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder="e.g. 100,000 BDT"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Group Standings / Participants Management */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    Participating Teams & Standings ({standings.length})
                  </label>
                  <button
                    type="button"
                    onClick={addStandingsRow}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-zinc-200 rounded-lg transition"
                  >
                    + Add Team
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {standings.map((row, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl flex items-center gap-2 text-xs"
                    >
                      <span className="font-mono text-amber-400 font-black w-6 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={row.teamName}
                        onChange={(e) => {
                          const updated = [...standings];
                          updated[idx].teamName = e.target.value;
                          setStandings(updated);
                        }}
                        placeholder="Team Name"
                        className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-zinc-300">
                        <input
                          type="checkbox"
                          checked={row.isClub}
                          onChange={(e) => {
                            const updated = [...standings];
                            updated[idx].isClub = e.target.checked;
                            setStandings(updated);
                          }}
                          className="rounded bg-zinc-950 border-zinc-700 text-amber-400"
                        />
                        <span>BDPSC</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-500">Pts:</span>
                        <input
                          type="number"
                          value={row.points}
                          onChange={(e) => {
                            const updated = [...standings];
                            updated[idx].points = Number(e.target.value);
                            setStandings(updated);
                          }}
                          className="w-12 px-1.5 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white font-mono text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStandingsRow(idx)}
                        className="text-zinc-500 hover:text-red-400 text-sm p-1 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournament Banner Artwork & Logo Badge Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <FileAttachmentUpload
                    label="Tournament Banner / Artwork"
                    sublabel="Header graphic for tournament cards & bracket display"
                    value={bannerUrl}
                    onChange={setBannerUrl}
                    folder="tournaments"
                    accentColor="amber"
                    placeholder="https://images.unsplash.com/... or paste image URL"
                  />
                </div>
                <div>
                  <FileAttachmentUpload
                    label="Tournament Official Logo / Crest"
                    sublabel="Official competition emblem or organizer crest"
                    value={logoUrl}
                    onChange={setLogoUrl}
                    folder="tournaments"
                    accentColor="amber"
                    placeholder="https://images.unsplash.com/... or paste logo URL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Tournament Description & Rules
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of match rules, platform guidelines, prize distribution..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTournament(null);
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
                  {loading ? 'Saving...' : editingTournament ? 'Save Tournament Changes' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE TOURNAMENT CONFIRMATION */}
      {deletingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-900/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-xl text-red-400 mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight mb-2">
              Delete Tournament
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Are you sure you want to permanently delete tournament <strong className="text-white">"{deletingTournament.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTournament(null)}
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
                {loading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
