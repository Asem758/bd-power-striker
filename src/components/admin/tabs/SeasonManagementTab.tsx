import React, { useState } from 'react';
import { Season, Match, Tournament } from '../../../types';
import { saveSeason, setActiveSeason, deleteSeason } from '../../../services/api';

interface SeasonManagementTabProps {
  seasons: Season[];
  matches: Match[];
  tournaments: Tournament[];
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

export const SeasonManagementTab: React.FC<SeasonManagementTabProps> = ({
  seasons,
  matches,
  tournaments,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED'>('ALL');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'ONGOING' | 'COMPLETED' | 'ARCHIVED'>('ONGOING');
  const [formIsCurrent, setFormIsCurrent] = useState(false);

  // Safeguard Delete / Archive Modal State
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);
  const [deleteMode, setDeleteMode] = useState<'REASSIGN_AND_DELETE' | 'ARCHIVE_INSTEAD'>('ARCHIVE_INSTEAD');
  const [reassignTargetSeasonId, setReassignTargetSeasonId] = useState<string>('');
  const [confirmationInput, setConfirmationInput] = useState('');

  // Permissions
  const canCreate = hasPermission('tournaments.create') || hasPermission('settings.manage') || isSuperAdmin;
  const canEdit = hasPermission('tournaments.edit') || hasPermission('settings.manage') || isSuperAdmin;
  const canDelete = hasPermission('tournaments.edit') || hasPermission('settings.manage') || isSuperAdmin;

  // Open Create Modal
  const openCreateModal = () => {
    setEditingSeason(null);
    const nextSeasonNum = seasons.length + 1;
    const year = new Date().getFullYear();
    setFormName(`Season 0${nextSeasonNum} — ${year}`);
    setFormCode(`S0${nextSeasonNum}-${year}`);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormDescription('Official competitive tournament campaign, league rankings, and athlete milestones.');
    setFormNotes('');
    setFormStatus('ONGOING');
    setFormIsCurrent(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (season: Season) => {
    setEditingSeason(season);
    setFormName(season.name);
    setFormCode(season.code);
    setFormStartDate(season.startDate);
    setFormEndDate(season.endDate);
    setFormDescription(season.description || '');
    setFormNotes(season.notes || '');
    setFormStatus(season.status);
    setFormIsCurrent(season.isCurrent);
    setIsModalOpen(true);
  };

  // Open Delete Safeguard Modal
  const openDeleteSafeguard = (season: Season) => {
    setDeletingSeason(season);
    setConfirmationInput('');
    // Default target season to first other season available
    const otherSeasons = seasons.filter(s => s.id !== season.id);
    const defaultTarget = otherSeasons.find(s => s.isCurrent) || otherSeasons[0];
    setReassignTargetSeasonId(defaultTarget ? defaultTarget.id : '');
    
    // If it has matches or tournaments, default to archive for safety
    const tiedMatches = matches.filter(m => m.seasonId === season.id).length;
    if (tiedMatches > 0) {
      setDeleteMode('ARCHIVE_INSTEAD');
    } else {
      setDeleteMode('REASSIGN_AND_DELETE');
    }
  };

  // Handle Form Submit (Create / Edit)
  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showFeedback('error', 'Season name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<Season> = {
        id: editingSeason ? editingSeason.id : undefined,
        name: formName.trim(),
        code: formCode.trim() || undefined,
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription.trim(),
        notes: formNotes.trim(),
        status: formStatus,
        isCurrent: formIsCurrent,
      };

      const result = await saveSeason(payload);
      showFeedback(
        'success',
        editingSeason
          ? `Season "${result.name}" updated successfully!`
          : `New season "${result.name}" created successfully!`
      );
      setIsModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save season.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Set Active
  const handleQuickSetActive = async (season: Season) => {
    if (season.isCurrent) return;
    setLoading(true);
    try {
      await setActiveSeason(season.id);
      showFeedback(
        'success',
        `"${season.name}" is now the club's Current Active Season! Global match and ranking leaderboards updated.`
      );
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to set active season.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Safeguard Confirm Delete or Archive
  const handleExecuteSafeguard = async () => {
    if (!deletingSeason) return;

    // Validation for deletion
    if (deleteMode === 'REASSIGN_AND_DELETE') {
      const tiedCount = matches.filter(m => m.seasonId === deletingSeason.id).length;
      if (tiedCount > 0 && !reassignTargetSeasonId) {
        showFeedback('error', 'Please select a replacement season to reassign existing matches to.');
        return;
      }

      // Check confirmation text
      const expectedText = deletingSeason.code || deletingSeason.name;
      if (confirmationInput.trim().toLowerCase() !== expectedText.trim().toLowerCase()) {
        showFeedback(
          'error',
          `Confirmation mismatch. Please type "${expectedText}" exactly to confirm deletion.`
        );
        return;
      }
    }

    setLoading(true);
    try {
      if (deleteMode === 'ARCHIVE_INSTEAD') {
        await deleteSeason(deletingSeason.id, { archiveOnly: true });
        showFeedback(
          'success',
          `Season "${deletingSeason.name}" archived. All historic match logs and honors remain securely preserved.`
        );
      } else {
        const res = await deleteSeason(deletingSeason.id, {
          reassignMatchesToSeasonId: reassignTargetSeasonId,
        });
        showFeedback(
          'success',
          res.message || `Season "${deletingSeason.name}" deleted and records migrated successfully.`
        );
      }
      setDeletingSeason(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to process season action.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Seasons
  const filteredSeasons = seasons.filter(s => {
    if (statusFilter === 'ACTIVE' && !s.isCurrent) return false;
    if (statusFilter !== 'ALL' && statusFilter !== 'ACTIVE' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeSeason = seasons.find(s => s.isCurrent) || seasons[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Season & Competitive Eras
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Configure competitive cycles, designate the Current Active Season for global ranking filtering,
            and manage match assignments with double-confirmation safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            disabled={!canCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>➕</span> Create New Season
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Active Season Card */}
        <div className="bg-zinc-950/80 border border-amber-500/40 p-3.5 rounded-xl shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <span>Current Active</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <div className="text-base font-black text-white truncate mt-1">
            {activeSeason ? activeSeason.name : 'None Selected'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Default view for rankings & stats
          </div>
        </div>

        {/* Total Seasons */}
        <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Seasons
          </div>
          <div className="text-base font-black text-white mt-1">
            {seasons.length} <span className="text-xs text-zinc-500 font-normal">Registered</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {seasons.filter(s => s.status === 'ONGOING').length} Ongoing, {seasons.filter(s => s.status === 'ARCHIVED').length} Archived
          </div>
        </div>

        {/* Active Season Matches */}
        <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Matches in Active
          </div>
          <div className="text-base font-black text-emerald-400 mt-1">
            {matches.filter(m => m.seasonId === activeSeason?.id).length} Matches
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {activeSeason?.winRate || 75}% Active Win Rate
          </div>
        </div>

        {/* Tournaments Assigned */}
        <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Tournaments in Active
          </div>
          <div className="text-base font-black text-cyan-400 mt-1">
            {tournaments.filter(t => t.seasonId === activeSeason?.id).length} Campaigns
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Tied to {activeSeason?.code || 'Current'}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search seasons by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <span className="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            {(['ALL', 'ACTIVE', 'ONGOING', 'COMPLETED', 'ARCHIVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-amber-400 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          Showing {filteredSeasons.length} of {seasons.length} seasons
        </div>
      </div>

      {/* Seasons Cards Grid */}
      <div className="space-y-4">
        {filteredSeasons.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <span className="text-4xl">🗓️</span>
            <h3 className="text-base font-bold text-white mt-3">No Seasons Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              No seasons match your search or filter. Click "Create New Season" to start a new competitive cycle.
            </p>
          </div>
        ) : (
          filteredSeasons.map((season) => {
            const seasonMatches = matches.filter(m => m.seasonId === season.id);
            const seasonTournaments = tournaments.filter(t => t.seasonId === season.id);
            const isOngoing = season.status === 'ONGOING';
            const isCompleted = season.status === 'COMPLETED';
            const isArchived = season.status === 'ARCHIVED';

            return (
              <div
                key={season.id}
                className={`bg-zinc-900/90 rounded-2xl border p-5 transition-all ${
                  season.isCurrent
                    ? 'border-amber-400/60 shadow-xl shadow-amber-400/5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Column: Season Identity & Meta */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Active Season Badge */}
                      {season.isCurrent ? (
                        <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md shadow-amber-500/20 flex items-center gap-1">
                          <span>⭐</span> CURRENT ACTIVE SEASON
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickSetActive(season)}
                          disabled={!canEdit || loading}
                          title="Designate as Current Active Season for site filters"
                          className="px-2.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-zinc-700 transition cursor-pointer"
                        >
                          Make Active
                        </button>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isOngoing
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isCompleted
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {season.status}
                      </span>

                      {/* Code Tag */}
                      <span className="text-[10px] font-mono bg-zinc-950 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                        {season.code}
                      </span>
                    </div>

                    {/* Season Name */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-white tracking-wide">
                        {season.name}
                      </h3>
                    </div>

                    {/* Description */}
                    {season.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {season.description}
                      </p>
                    )}

                    {/* Dates Window */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">🗓 Window:</span>
                        <span className="text-zinc-200 font-semibold">{season.startDate}</span>
                        <span className="text-zinc-600">➔</span>
                        <span className="text-zinc-200 font-semibold">{season.endDate}</span>
                      </div>
                      {season.currentClubRank && (
                        <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                          <span>🏆 Rank:</span>
                          <span>{season.currentClubRank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Competitive Statistics Preview */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 text-center min-w-[260px]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Matches</span>
                      <span className="text-sm font-black text-white font-mono">
                        {seasonMatches.length > 0 ? seasonMatches.length : season.totalMatches}
                      </span>
                      <span className="block text-[9px] text-zinc-500">
                        {seasonTournaments.length} Tournaments
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Win Rate</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {season.winRate}%
                      </span>
                      <span className="block text-[9px] text-zinc-500">
                        {season.wins}W - {season.draws}D - {season.losses}L
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Goals</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">
                        {season.goalsScored}
                      </span>
                      <span className="block text-[9px] text-zinc-500">
                        -{season.goalsConceded} conceded
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-3 lg:pt-0 lg:pl-4">
                    <button
                      onClick={() => openEditModal(season)}
                      disabled={!canEdit}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 w-full justify-center"
                    >
                      <span>✏️</span> Edit Season
                    </button>

                    <button
                      onClick={() => openDeleteSafeguard(season)}
                      disabled={!canDelete}
                      className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 w-full justify-center"
                    >
                      <span>🛡️</span> Manage / Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE OR EDIT SEASON */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗓️</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    {editingSeason ? 'Edit Season Details' : 'Create New Competitive Season'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Define season identity, active status, date windows, and descriptive notes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSeason} className="space-y-4 mt-4">
              {/* Season Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Season Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Season 02 — 2026 or Spring Invitational"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Code & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Season Code (Short ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. S02-2026"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Season Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ONGOING">ONGOING (Active Competition)</option>
                    <option value="COMPLETED">COMPLETED (Season Concluded)</option>
                    <option value="ARCHIVED">ARCHIVED (Historical Record)</option>
                  </select>
                </div>
              </div>

              {/* Date Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Current Active Flag Toggle */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <span>⭐</span> Set as Current Active Season
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    When enabled, global match results and ranking engines will filter by this season by default.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsCurrent}
                    onChange={(e) => setFormIsCurrent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Description & Competitive Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the season's focus, league tiers, and team expectations..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Internal Staff Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Internal Staff Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In-game version 5.1 update calibration"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingSeason ? 'Save Season Changes' : 'Create Season'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SAFEGUARD DELETE / ARCHIVE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deletingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-rose-950/30">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-xl shrink-0">
                🛡️
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Season Safeguard Action
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Confirm how records tied to <strong className="text-white">"{deletingSeason.name}"</strong> will be handled.
                </p>
              </div>
            </div>

            {/* Impact Analysis Warning */}
            {(() => {
              const tiedMatches = matches.filter(m => m.seasonId === deletingSeason.id);
              const tiedTournaments = tournaments.filter(t => t.seasonId === deletingSeason.id);
              const hasTied = tiedMatches.length > 0 || tiedTournaments.length > 0;
              const otherSeasons = seasons.filter(s => s.id !== deletingSeason.id);

              return (
                <div className="space-y-4 mt-5">
                  <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                    <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                      📊 Associated Database Records:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800/80">
                        <span className="text-zinc-400 block text-[10px]">Tied Matches:</span>
                        <span className="font-bold text-white text-sm font-mono">{tiedMatches.length} Matches</span>
                      </div>
                      <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800/80">
                        <span className="text-zinc-400 block text-[10px]">Tied Tournaments:</span>
                        <span className="font-bold text-white text-sm font-mono">{tiedTournaments.length} Tournaments</span>
                      </div>
                    </div>

                    {deletingSeason.isCurrent && (
                      <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded-lg border border-amber-800/40">
                        ⚠️ Note: This is currently the Active Season. Performing this action will transfer active status to another season.
                      </div>
                    )}
                  </div>

                  {/* Mode Selector: Archive vs Reassign & Delete */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-300 uppercase">
                      Select Action:
                    </label>

                    {/* Option 1: Archive (Recommended) */}
                    <div
                      onClick={() => setDeleteMode('ARCHIVE_INSTEAD')}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                        deleteMode === 'ARCHIVE_INSTEAD'
                          ? 'bg-amber-950/30 border-amber-400/80'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={deleteMode === 'ARCHIVE_INSTEAD'}
                        onChange={() => setDeleteMode('ARCHIVE_INSTEAD')}
                        className="mt-0.5 text-amber-400"
                      />
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>📦</span> Archive Season (Recommended)
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Retains all historical matches, player goal logs, ratings, and trophies intact, but flags the season as concluded/archived.
                        </p>
                      </div>
                    </div>

                    {/* Option 2: Reassign & Permanently Delete */}
                    <div
                      onClick={() => setDeleteMode('REASSIGN_AND_DELETE')}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                        deleteMode === 'REASSIGN_AND_DELETE'
                          ? 'bg-rose-950/30 border-rose-500/80'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={deleteMode === 'REASSIGN_AND_DELETE'}
                        onChange={() => setDeleteMode('REASSIGN_AND_DELETE')}
                        className="mt-0.5 text-rose-500"
                      />
                      <div>
                        <div className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <span>🗑️</span> Migrate & Delete Season
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Permanently deletes this season entity after safely transferring all {tiedMatches.length} matches and {tiedTournaments.length} tournaments to another season.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reassignment Dropdown (If deleting) */}
                  {deleteMode === 'REASSIGN_AND_DELETE' && (
                    <div className="space-y-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                      {hasTied && (
                        <div>
                          <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                            Destination Season for Migration *
                          </label>
                          <select
                            value={reassignTargetSeasonId}
                            onChange={(e) => setReassignTargetSeasonId(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                          >
                            {otherSeasons.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.code}) {s.isCurrent ? '⭐ Active' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Explicit Text Confirmation */}
                      <div>
                        <label className="block text-xs font-bold text-rose-300 uppercase mb-1">
                          Type "{deletingSeason.code || deletingSeason.name}" to Confirm:
                        </label>
                        <input
                          type="text"
                          placeholder={`Type exact season name or code`}
                          value={confirmationInput}
                          onChange={(e) => setConfirmationInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-rose-800/80 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setDeletingSeason(null)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteSafeguard}
                      disabled={loading}
                      className={`px-5 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg disabled:opacity-50 ${
                        deleteMode === 'ARCHIVE_INSTEAD'
                          ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-400/20'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      }`}
                    >
                      {loading
                        ? 'Processing...'
                        : deleteMode === 'ARCHIVE_INSTEAD'
                        ? 'Confirm Archive Season'
                        : 'Confirm Migration & Deletion'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
