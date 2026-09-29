import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Flame, 
  Trophy, 
  Swords, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Radio, 
  AlertTriangle 
} from 'lucide-react';
import { ClubAnnouncement, AnnouncementType } from '../../../types';
import { 
  fetchAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  toggleAnnouncement, 
  deleteAnnouncement 
} from '../../../services/api';

interface AnnouncementManagerTabProps {
  onRefreshData?: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
}

const ANNOUNCEMENT_TYPES: { value: AnnouncementType; label: string; icon: any; color: string; desc: string }[] = [
  { value: 'CELEBRATION', label: 'Celebration / Championship', icon: Trophy, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: 'Trophy wins, major milestones, and victory announcements' },
  { value: 'URGENT', label: 'Urgent / Breaking Alert', icon: Flame, color: 'text-red-400 bg-red-500/10 border-red-500/30', desc: 'Time-sensitive or emergency notifications' },
  { value: 'MATCH', label: 'Match Day / Fixtures', icon: Swords, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: 'Upcoming matches, rivals, schedules, and scorelines' },
  { value: 'TOURNAMENT', label: 'Tournament & Cups', icon: Calendar, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', desc: 'Bracket announcements, open trials, prize pools' },
  { value: 'ROSTER', label: 'Squad & Transfers', icon: Users, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', desc: 'Player signings, starting XI line-ups, jersey reveals' },
  { value: 'UPDATE', label: 'System & Stats Update', icon: Sparkles, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', desc: 'Elo rating recalibration, website updates, feature rollouts' },
  { value: 'GENERAL', label: 'General Club Notice', icon: Megaphone, color: 'text-slate-300 bg-slate-800 border-slate-700', desc: 'Community news, social handles, general updates' },
];

export const AnnouncementManagerTab: React.FC<AnnouncementManagerTabProps> = ({
  onRefreshData,
  showFeedback,
  hasPermission,
  isSuperAdmin,
}) => {
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClubAnnouncement | null>(null);
  const [deletingItem, setDeletingItem] = useState<ClubAnnouncement | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('GENERAL');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(50);
  const [actionLink, setActionLink] = useState('');
  const [actionLabel, setActionLabel] = useState('');

  const canManage = isSuperAdmin || hasPermission('announcements.manage') || hasPermission('news.create');

  // Load announcements
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      // Pass all=true so admins get active AND inactive announcements
      const data = await fetchAnnouncements(true);
      setAnnouncements(data);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    if (onRefreshData) onRefreshData();
    setRefreshing(false);
    showFeedback('success', 'Announcements synchronized from server.');
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('OFFICIAL ANNOUNCEMENT');
    setContent('');
    setType('GENERAL');
    setIsActive(true);
    setPriority(50);
    setActionLink('');
    setActionLabel('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: ClubAnnouncement) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setType(item.type);
    setIsActive(item.isActive);
    setPriority(item.priority || 50);
    setActionLink(item.actionLink || '');
    setActionLabel(item.actionLabel || '');
    setIsModalOpen(true);
  };

  // Save Announcement (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showFeedback('error', 'Please enter announcement content.');
      return;
    }

    try {
      const payload: Partial<ClubAnnouncement> = {
        title: title.trim() || 'CLUB UPDATE',
        content: content.trim(),
        type,
        isActive,
        priority: Number(priority) || 50,
        actionLink: actionLink.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
      };

      if (editingItem) {
        await updateAnnouncement(editingItem.id, payload);
        showFeedback('success', `Announcement "${payload.title}" updated.`);
      } else {
        await createAnnouncement(payload);
        showFeedback('success', `New announcement published to the moving ticker!`);
      }

      setIsModalOpen(false);
      await loadAnnouncements();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save announcement.');
    }
  };

  // Fast Toggle Active / Inactive
  const handleToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleAnnouncement(id);
      showFeedback('success', res.message || 'Announcement status updated.');
      // Local optimistic update
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to toggle status.');
    }
  };

  // Delete Announcement
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteAnnouncement(deletingItem.id);
      showFeedback('success', `Announcement "${deletingItem.title}" removed.`);
      setDeletingItem(null);
      await loadAnnouncements();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete announcement.');
    }
  };

  // Filtered List
  const filtered = announcements.filter(item => {
    if (statusFilter === 'ACTIVE' && !item.isActive) return false;
    if (statusFilter === 'INACTIVE' && item.isActive) return false;
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = announcements.filter(a => a.isActive).length;
  const highPriorityCount = announcements.filter(a => a.isActive && (a.priority || 0) >= 80).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CLUB ANNOUNCEMENT TICKER CONTROL
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Manage the real-time moving marquee announcement bar visible to all visitors. Broadcast match days, trophy victories, open trials, starting XI updates, and emergency club news.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>POST ANNOUNCEMENT</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Ticker Preview */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>LIVE TICKER SIMULATION ({activeCount} Active on Moving Bar)</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Hover to pause • Changes apply instantly
            </span>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-amber-500/40 p-2.5 shadow-inner">
            <div className="flex items-center space-x-8 whitespace-nowrap animate-marquee">
              {(announcements.filter(a => a.isActive).length > 0
                ? announcements.filter(a => a.isActive)
                : [
                    { id: 'sim-1', title: 'PREVIEW', content: 'No active announcements. Add a notice below to start the moving ticker!', type: 'GENERAL' as const, isActive: true, priority: 50, createdAt: '', updatedAt: '' }
                  ]
              ).map((item, idx) => (
                <div key={`sim-${item.id}-${idx}`} className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.title}
                  </span>
                  <span className="text-slate-200 font-semibold">{item.content}</span>
                  {item.actionLink && (
                    <span className="text-amber-400 text-[10px] font-bold underline cursor-pointer">
                      {item.actionLabel || 'Details →'}
                    </span>
                  )}
                  <span className="text-amber-500/40 font-black pl-2">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Total Announcements</span>
            <span className="text-lg font-black text-white">{announcements.length}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Moving on Live Ticker</span>
            <span className="text-lg font-black text-emerald-400">{activeCount}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">High Priority (≥80)</span>
            <span className="text-lg font-black text-amber-400">{highPriorityCount}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block text-[11px]">Ticker Broadcast Status</span>
            <span className="text-lg font-black text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status buttons */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition ${statusFilter === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              All ({announcements.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-bold transition ${statusFilter === 'ACTIVE' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-lg font-bold transition ${statusFilter === 'INACTIVE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Inactive ({announcements.length - activeCount})
            </button>
          </div>

          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Categories</option>
            {ANNOUNCEMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search announcement text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2 font-medium focus:outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Announcements Table / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider">Loading announcements...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No announcements found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filter options.'
              : 'Post your first club announcement to see it scrolling across the header ticker.'}
          </p>
          {canManage && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center space-x-2 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-amber-400 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Announcement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const meta = ANNOUNCEMENT_TYPES.find(t => t.value === item.type) || ANNOUNCEMENT_TYPES[0];
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  item.isActive 
                    ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40' 
                    : 'bg-slate-950/70 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Left Details */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white text-sm tracking-tight">
                        {item.title}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${meta.color}`}>
                        {meta.label.split('/')[0]}
                      </span>

                      {/* Active Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                        item.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span>{item.isActive ? 'LIVE ON TICKER' : 'INACTIVE'}</span>
                      </span>

                      {/* Priority Tag */}
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
                        Priority: {item.priority || 50}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.content}
                    </p>

                    {item.actionLink && (
                      <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-400">
                        <span>Action Link:</span>
                        <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                          {item.actionLink}
                        </span>
                        {item.actionLabel && (
                          <span className="text-slate-400">({item.actionLabel})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggle(item.id, e)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      item.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                    }`}
                    title={item.isActive ? "Click to deactivate and take off moving ticker" : "Click to activate and put on moving ticker"}
                  >
                    {item.isActive ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Edit announcement"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}

                  {/* Delete Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Megaphone className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingItem ? 'Edit Announcement' : 'Post Moving Announcement'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Controls live text displayed on the header ticker bar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Announcement Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ANNOUNCEMENT_TYPES.map(t => {
                    const Icon = t.icon;
                    const isSelected = type === t.value;
                    return (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => setType(t.value)}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.label.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Announcement Title / Short Badge
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NATIONAL CHAMPIONS, NEXT MATCH, SQUAD UPDATE"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Announcement Text (Moving on Ticker)
                </label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the message to scroll across the header (e.g. BD Power Strikers vs Dhaka Titans scheduled for this Sunday at 8:00 PM BST. Don't miss out!)..."
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 font-normal focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Priority & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Display Priority (1 - 100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Higher priority items display first on the moving ticker
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Live Broadcast Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition ${
                      isActive 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{isActive ? 'Active (Moving on Ticker)' : 'Inactive (Draft)'}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  </button>
                </div>
              </div>

              {/* Action Link & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Action Link / Page Target (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionLink}
                    onChange={(e) => setActionLink(e.target.value)}
                    placeholder="e.g. matches, players, rankings, trophies, news"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="e.g. View Fixture, Explore Squad"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Broadcast Announcement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">Delete Announcement</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{deletingItem.title}"</strong> from the club announcements?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex items-center space-x-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
