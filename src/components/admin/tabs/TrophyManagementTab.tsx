import React, { useState } from 'react';
import { 
  Trophy as TrophyIcon, 
  Award as AwardIcon, 
  Clock, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  UserCheck, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Trophy, Award, ClubMilestone, Player, Season } from '../../../types';
import { 
  saveTrophy, 
  deleteTrophy, 
  saveAward, 
  deleteAward, 
  saveMilestone, 
  deleteMilestone 
} from '../../../services/api';
import { FileAttachmentUpload } from '../common/FileAttachmentUpload';

export type HonorCategoryTab = 'ALL' | 'CHAMPION_TROPHIES' | 'INDIVIDUAL_HONORS' | 'CLUB_MILESTONES';

interface TrophyManagementTabProps {
  trophies: Trophy[];
  awards: Award[];
  milestones: ClubMilestone[];
  players?: Player[];
  seasons?: Season[];
  hasPermission?: (perm: string) => boolean;
  isSuperAdmin?: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
  onNavigateToPublicTrophies?: () => void;
}

// Preset high quality esports trophy and awards images for 1-click convenience
const PRESET_IMAGES = [
  { label: 'Champions Cup', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=600' },
  { label: 'Gold Trophy', url: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&q=80&w=600' },
  { label: 'Winter Cup', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600' },
  { label: 'Esports Stadium', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600' },
  { label: 'Golden Boot', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600' },
  { label: 'Player Honor', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=600' },
];

export const TrophyManagementTab: React.FC<TrophyManagementTabProps> = ({
  trophies,
  awards,
  milestones,
  players = [],
  seasons = [],
  hasPermission,
  isSuperAdmin = true,
  onRefreshData,
  showFeedback,
  onNavigateToPublicTrophies,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<HonorCategoryTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id?: string;
    type: 'TROPHY' | 'AWARD' | 'MILESTONE';
    raw?: any;
  } | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    title: string;
    type: 'TROPHY' | 'AWARD' | 'MILESTONE';
  } | null>(null);

  // Form State matching all required fields
  const [formCategory, setFormCategory] = useState<'CHAMPION_TROPHIES' | 'INDIVIDUAL_HONORS' | 'CLUB_MILESTONES'>('CHAMPION_TROPHIES');
  const [formTitle, setFormTitle] = useState('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMvpPlayer, setFormMvpPlayer] = useState('');
  const [formTopScorer, setFormTopScorer] = useState('');
  
  // Extra fields for rich presentation
  const [formPosition, setFormPosition] = useState<'Champions' | 'Runners-up' | '3rd Place' | 'Fair Play' | 'Special Achievement'>('Champions');
  const [formSquadMembers, setFormSquadMembers] = useState('');
  const [formSelectedPlayerId, setFormSelectedPlayerId] = useState('');
  const [formBadgeType, setFormBadgeType] = useState<'GOLD' | 'PLATINUM' | 'DIAMOND'>('GOLD');
  const [formPeriod, setFormPeriod] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSeasonId, setFormSeasonId] = useState(seasons[0]?.id || 's01-2026');

  // Open Create Modal
  const handleOpenCreateModal = (defaultCategory?: 'CHAMPION_TROPHIES' | 'INDIVIDUAL_HONORS' | 'CLUB_MILESTONES') => {
    setEditingItem(null);
    setFormCategory(defaultCategory || 'CHAMPION_TROPHIES');
    setFormTitle('');
    setFormYear(new Date().getFullYear());
    setFormDescription('');
    setFormImageUrl(PRESET_IMAGES[0].url);
    setFormMvpPlayer('');
    setFormTopScorer('');
    setFormPosition('Champions');
    setFormSquadMembers('');
    setFormSelectedPlayerId(players[0]?.id || '');
    setFormBadgeType('GOLD');
    setFormPeriod('Current Season');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSeasonId(seasons[0]?.id || 's01-2026');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal for Trophy
  const handleEditTrophy = (item: Trophy) => {
    setEditingItem({ id: item.id, type: 'TROPHY', raw: item });
    setFormCategory('CHAMPION_TROPHIES');
    setFormTitle(item.tournamentName || '');
    setFormYear(item.year || new Date().getFullYear());
    setFormDescription(item.achievementDescription || '');
    setFormImageUrl(item.trophyImageUrl || '');
    setFormMvpPlayer(item.mvpPlayerName || '');
    setFormTopScorer(item.topScorerName || '');
    setFormPosition(item.position || 'Champions');
    setFormSquadMembers(item.squadMembers ? item.squadMembers.join(', ') : '');
    setFormDate(item.dateAwarded || '');
    setFormSeasonId(item.seasonId || seasons[0]?.id || 's01-2026');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal for Award (Individual Honor)
  const handleEditAward = (item: Award) => {
    setEditingItem({ id: item.id, type: 'AWARD', raw: item });
    setFormCategory('INDIVIDUAL_HONORS');
    setFormTitle(item.title || '');
    const extractedYear = item.awardDate ? parseInt(item.awardDate.substring(0, 4), 10) : new Date().getFullYear();
    setFormYear(isNaN(extractedYear) ? new Date().getFullYear() : extractedYear);
    setFormDescription(item.description || '');
    setFormImageUrl(item.playerPhotoUrl || '');
    setFormMvpPlayer(item.gamingName || item.playerName || '');
    setFormTopScorer(item.statsSummary || '');
    setFormSelectedPlayerId(item.playerId || '');
    setFormBadgeType(item.badgeType || 'GOLD');
    setFormPeriod(item.period || '');
    setFormDate(item.awardDate || '');
    setFormSeasonId(item.seasonId || seasons[0]?.id || 's01-2026');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal for Milestone
  const handleEditMilestone = (item: ClubMilestone) => {
    setEditingItem({ id: item.id, type: 'MILESTONE', raw: item });
    setFormCategory('CLUB_MILESTONES');
    setFormTitle(item.title || '');
    const extractedYear = item.date ? parseInt(item.date.substring(0, 4), 10) : new Date().getFullYear();
    setFormYear(isNaN(extractedYear) ? new Date().getFullYear() : extractedYear);
    setFormDescription(item.description || '');
    setFormImageUrl('');
    setFormMvpPlayer('');
    setFormTopScorer('');
    setFormDate(item.date || '');
    setIsFormModalOpen(true);
  };

  // Save / Update Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showFeedback('error', 'Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (formCategory === 'CHAMPION_TROPHIES') {
        const squadArray = formSquadMembers
          ? formSquadMembers.split(',').map(s => s.trim()).filter(Boolean)
          : undefined;

        const trophyPayload: Partial<Trophy> = {
          id: editingItem?.type === 'TROPHY' ? editingItem.id : undefined,
          tournamentName: formTitle.trim(),
          year: Number(formYear) || new Date().getFullYear(),
          position: formPosition,
          category: 'CHAMPIONS',
          achievementDescription: formDescription.trim(),
          trophyImageUrl: formImageUrl.trim() || PRESET_IMAGES[0].url,
          mvpPlayerName: formMvpPlayer.trim() || undefined,
          topScorerName: formTopScorer.trim() || undefined,
          squadMembers: squadArray,
          dateAwarded: formDate || `${formYear}-09-15`,
          seasonId: formSeasonId,
        };

        await saveTrophy(trophyPayload);
        showFeedback('success', `Trophy "${formTitle}" ${editingItem ? 'updated' : 'created'} successfully!`);
      } 
      else if (formCategory === 'INDIVIDUAL_HONORS') {
        const linkedPlayer = players.find(p => p.id === formSelectedPlayerId);

        const awardPayload: Partial<Award> = {
          id: editingItem?.type === 'AWARD' ? editingItem.id : undefined,
          title: formTitle.trim(),
          category: 'POTM',
          playerId: linkedPlayer?.id || formSelectedPlayerId || 'p-noyon',
          playerName: linkedPlayer?.name || formMvpPlayer || 'BDPSC Athlete',
          gamingName: linkedPlayer?.gamingName || formMvpPlayer || 'BDPSC_STAR',
          playerPhotoUrl: formImageUrl.trim() || linkedPlayer?.photoUrl || PRESET_IMAGES[5].url,
          period: formPeriod || `${formYear} Season`,
          seasonId: formSeasonId,
          statsSummary: formTopScorer.trim() || 'Notable tournament performance',
          ratingSnapshot: linkedPlayer?.rating || 92,
          awardDate: formDate || `${formYear}-09-15`,
          description: formDescription.trim(),
          badgeType: formBadgeType,
        };

        await saveAward(awardPayload);
        showFeedback('success', `Individual Honor "${formTitle}" ${editingItem ? 'updated' : 'created'} successfully!`);
      } 
      else if (formCategory === 'CLUB_MILESTONES') {
        const milestonePayload = {
          id: editingItem?.type === 'MILESTONE' ? editingItem.id : undefined,
          title: formTitle.trim(),
          date: formDate || `${formYear}-01-01`,
          description: formDescription.trim(),
          category: formPosition === 'Champions' ? 'CHAMPIONSHIP' : 'MILESTONE',
        };

        await saveMilestone(milestonePayload);
        showFeedback('success', `Milestone "${formTitle}" ${editingItem ? 'updated' : 'created'} successfully!`);
      }

      // Close modal & live sync immediately
      setIsFormModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action Trigger
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    setIsSubmitting(true);
    try {
      if (deleteConfirmation.type === 'TROPHY') {
        await deleteTrophy(deleteConfirmation.id);
        showFeedback('success', `Trophy "${deleteConfirmation.title}" deleted.`);
      } else if (deleteConfirmation.type === 'AWARD') {
        await deleteAward(deleteConfirmation.id);
        showFeedback('success', `Honor "${deleteConfirmation.title}" deleted.`);
      } else if (deleteConfirmation.type === 'MILESTONE') {
        await deleteMilestone(deleteConfirmation.id);
        showFeedback('success', `Milestone "${deleteConfirmation.title}" deleted.`);
      }

      setDeleteConfirmation(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items
  const query = searchQuery.toLowerCase().trim();

  const filteredTrophies = trophies.filter(t => {
    if (activeCategoryFilter !== 'ALL' && activeCategoryFilter !== 'CHAMPION_TROPHIES') return false;
    if (!query) return true;
    return (
      (t.tournamentName && t.tournamentName.toLowerCase().includes(query)) ||
      (t.achievementDescription && t.achievementDescription.toLowerCase().includes(query)) ||
      (t.mvpPlayerName && t.mvpPlayerName.toLowerCase().includes(query)) ||
      (t.topScorerName && t.topScorerName.toLowerCase().includes(query)) ||
      String(t.year).includes(query)
    );
  });

  const filteredAwards = awards.filter(a => {
    if (activeCategoryFilter !== 'ALL' && activeCategoryFilter !== 'INDIVIDUAL_HONORS') return false;
    if (!query) return true;
    return (
      (a.title && a.title.toLowerCase().includes(query)) ||
      (a.playerName && a.playerName.toLowerCase().includes(query)) ||
      (a.gamingName && a.gamingName.toLowerCase().includes(query)) ||
      (a.description && a.description.toLowerCase().includes(query)) ||
      (a.statsSummary && a.statsSummary.toLowerCase().includes(query))
    );
  });

  const filteredMilestones = milestones.filter(m => {
    if (activeCategoryFilter !== 'ALL' && activeCategoryFilter !== 'CLUB_MILESTONES') return false;
    if (!query) return true;
    return (
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      (m.date && m.date.includes(query)) ||
      (m.category && m.category.toLowerCase().includes(query))
    );
  });

  const totalFilteredCount = filteredTrophies.length + filteredAwards.length + filteredMilestones.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Controls */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-black">
              <TrophyIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight uppercase">
                  Club Trophies & Honors Management
                </h2>
                <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  CRUD CONTROL
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Create, update, and manage official championship trophies, individual player honors, and club milestones with live sync to <code className="text-amber-400 font-mono">/trophies</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToPublicTrophies && (
            <button
              type="button"
              id="admin-btn-view-public-trophies"
              onClick={onNavigateToPublicTrophies}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold transition hover:scale-105"
              title="View how trophies appear on public site"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View /trophies Page</span>
            </button>
          )}

          <button
            type="button"
            id="admin-btn-add-trophy"
            onClick={() => handleOpenCreateModal()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trophy / Honor</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <TrophyIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">CHAMPION TROPHIES</span>
            <span className="text-2xl font-black text-white">{trophies.length}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <AwardIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">INDIVIDUAL HONORS</span>
            <span className="text-2xl font-black text-white">{awards.length}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">CLUB MILESTONES</span>
            <span className="text-2xl font-black text-white">{milestones.length}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">TOTAL HONORS</span>
            <span className="text-2xl font-black text-amber-400">{trophies.length + awards.length + milestones.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeCategoryFilter === 'ALL' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Categories ({trophies.length + awards.length + milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('CHAMPION_TROPHIES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center space-x-1 ${
              activeCategoryFilter === 'CHAMPION_TROPHIES' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrophyIcon className="w-3 h-3" />
            <span>Champion Trophies ({trophies.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('INDIVIDUAL_HONORS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center space-x-1 ${
              activeCategoryFilter === 'INDIVIDUAL_HONORS' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AwardIcon className="w-3 h-3" />
            <span>Individual Honors ({awards.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('CLUB_MILESTONES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center space-x-1 ${
              activeCategoryFilter === 'CLUB_MILESTONES' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Milestones ({milestones.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, player, year..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {totalFilteredCount === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <TrophyIcon className="w-12 h-12 text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold text-white">No records found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? `No trophies or honors match "${searchQuery}". Try a different keyword.`
              : 'Start building your club trophy cabinet by adding the first championship or honor.'}
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-400 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Trophy</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 1. CHAMPION TROPHIES SECTION */}
          {(activeCategoryFilter === 'ALL' || activeCategoryFilter === 'CHAMPION_TROPHIES') && filteredTrophies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Champion Trophies ({filteredTrophies.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('CHAMPION_TROPHIES')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Championship</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTrophies.map(trophy => (
                  <div
                    key={trophy.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg transition-all group relative overflow-hidden"
                  >
                    {/* Header info */}
                    <div className="flex items-start space-x-4">
                      <div className="relative shrink-0">
                        <img
                          src={trophy.trophyImageUrl || PRESET_IMAGES[0].url}
                          alt={trophy.tournamentName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                          }}
                          className="w-16 h-16 rounded-xl object-cover border border-amber-400/30 shadow-md bg-zinc-900"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 text-[9px] font-black px-1 rounded shadow">
                          {trophy.year}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            {trophy.position || 'CHAMPIONS'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {trophy.dateAwarded || `${trophy.year}`}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white truncate mt-1">
                          {trophy.tournamentName}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                          {trophy.achievementDescription}
                        </p>
                      </div>
                    </div>

                    {/* Highlights Strip: Tournament MVP & Top Goalscorer */}
                    <div className="grid grid-cols-2 gap-2 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-black flex items-center space-x-1">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          <span>TOURNAMENT MVP</span>
                        </span>
                        <span className="font-bold text-amber-300 block truncate mt-0.5">
                          {trophy.mvpPlayerName || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-black flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-red-400" />
                          <span>TOP GOALSCORER</span>
                        </span>
                        <span className="font-bold text-white block truncate mt-0.5">
                          {trophy.topScorerName || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Squad Members */}
                    {trophy.squadMembers && trophy.squadMembers.length > 0 && (
                      <div className="text-[11px] text-zinc-400 truncate">
                        <strong className="text-zinc-500">Squad:</strong> {trophy.squadMembers.join(', ')}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditTrophy(trophy)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition flex items-center space-x-1"
                        title="Edit Trophy details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmation({ id: trophy.id, title: trophy.tournamentName, type: 'TROPHY' })}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-bold transition flex items-center space-x-1"
                        title="Delete Trophy record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. INDIVIDUAL HONORS SECTION */}
          {(activeCategoryFilter === 'ALL' || activeCategoryFilter === 'INDIVIDUAL_HONORS') && filteredAwards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center space-x-2">
                  <AwardIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Individual Honors ({filteredAwards.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('INDIVIDUAL_HONORS')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Individual Honor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAwards.map(award => (
                  <div
                    key={award.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3.5 shadow-lg transition-all"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={award.playerPhotoUrl || PRESET_IMAGES[5].url}
                        alt={award.playerName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRESET_IMAGES[5].url;
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40 shrink-0 bg-zinc-900"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            {award.badgeType || 'HONOR'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{award.period}</span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate mt-1">
                          {award.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {award.playerName} ({award.gamingName})
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 text-xs">
                      <span className="text-[10px] text-zinc-500 uppercase font-black block">PERFORMANCE SUMMARY</span>
                      <span className="font-bold text-amber-300 block truncate">{award.statsSummary || 'Elite performance'}</span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {award.description}
                    </p>

                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditAward(award)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmation({ id: award.id, title: award.title, type: 'AWARD' })}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CLUB MILESTONES SECTION */}
          {(activeCategoryFilter === 'ALL' || activeCategoryFilter === 'CLUB_MILESTONES') && filteredMilestones.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Club Milestones ({filteredMilestones.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('CLUB_MILESTONES')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-3">
                {filteredMilestones.map(milestone => (
                  <div
                    key={milestone.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {milestone.category || 'MILESTONE'}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {milestone.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">
                        {milestone.title}
                      </h4>
                      <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditMilestone(milestone)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmation({ id: milestone.id, title: milestone.title, type: 'MILESTONE' })}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT TROPHY & HONOR FORM                 */}
      {/* ======================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="bg-zinc-900/90 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-black">
                  <TrophyIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    {editingItem ? 'Edit Trophy / Honor' : 'Add New Trophy or Honor'}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Saves directly to database and live-syncs with the public cabinet.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Category selector (Requirement: Champion Trophies, Individual Honors, Club Milestones) */}
              <div>
                <label className="block text-xs font-black uppercase text-zinc-400 tracking-wider mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('CHAMPION_TROPHIES');
                      if (!formImageUrl) setFormImageUrl(PRESET_IMAGES[0].url);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      formCategory === 'CHAMPION_TROPHIES'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <TrophyIcon className={`w-4 h-4 mb-1.5 ${formCategory === 'CHAMPION_TROPHIES' ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-bold block leading-tight">Champion Trophies</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Tournaments & Cups</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('INDIVIDUAL_HONORS');
                      if (!formImageUrl) setFormImageUrl(PRESET_IMAGES[5].url);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      formCategory === 'INDIVIDUAL_HONORS'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <AwardIcon className={`w-4 h-4 mb-1.5 ${formCategory === 'INDIVIDUAL_HONORS' ? 'text-cyan-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-bold block leading-tight">Individual Honors</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Player POTM, MVP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('CLUB_MILESTONES')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      formCategory === 'CLUB_MILESTONES'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <Clock className={`w-4 h-4 mb-1.5 ${formCategory === 'CLUB_MILESTONES' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-bold block leading-tight">Club Milestones</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Historic Timelines</span>
                  </button>
                </div>
              </div>

              {/* Title & Year Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                    Title / Honor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      formCategory === 'CHAMPION_TROPHIES'
                        ? 'e.g. Bangladesh eFootball Championship 2026'
                        : formCategory === 'INDIVIDUAL_HONORS'
                        ? 'e.g. Golden Boot Award - Season 01'
                        : 'e.g. BDPSC Club Foundation & eSports License'
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2035}
                    value={formYear}
                    onChange={(e) => setFormYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition font-mono font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                  Description / Achievement Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the match summary, finals score, record achieved, or tournament highlights..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition resize-none leading-relaxed"
                />
              </div>

              {/* Image URL / Upload (Requirement: Image URL/Upload) */}
              {formCategory !== 'CLUB_MILESTONES' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-zinc-400">
                      Trophy / Honor Image (Upload or URL)
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      Supports direct upload or image URL
                    </span>
                  </div>

                  <FileAttachmentUpload
                    label="Trophy Photo / Crest"
                    value={formImageUrl}
                    onChange={(url) => setFormImageUrl(url)}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    folder="trophies"
                    aspectRatio="square"
                    accentColor="amber"
                  />

                  {/* Preset quick picker */}
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">
                      Or pick from High-Res Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_IMAGES.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormImageUrl(p.url)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            formImageUrl === p.url
                              ? 'bg-amber-400 text-zinc-950 border-amber-400'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tournament MVP & Top Goalscorer (Requirements: Tournament MVP, Top Goalscorer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <label className="block text-xs font-bold uppercase text-amber-400 mb-1.5 flex items-center space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tournament MVP</span>
                  </label>
                  <input
                    type="text"
                    value={formMvpPlayer}
                    onChange={(e) => setFormMvpPlayer(e.target.value)}
                    placeholder="e.g. Noyon (BD_Noyon) or Tanvir Ahmed"
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  {/* Quick suggestions from roster */}
                  {players.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {players.slice(0, 4).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormMvpPlayer(`${p.name} (${p.gamingName})`)}
                          className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 px-1.5 py-0.5 rounded transition"
                        >
                          +{p.gamingName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-red-400 mb-1.5 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Top Goalscorer</span>
                  </label>
                  <input
                    type="text"
                    value={formTopScorer}
                    onChange={(e) => setFormTopScorer(e.target.value)}
                    placeholder="e.g. Noyon (14 Goals)"
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  {players.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {players.slice(0, 4).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormTopScorer(`${p.name} (${p.goals || 10} Goals)`)}
                          className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-1.5 py-0.5 rounded transition"
                        >
                          +{p.gamingName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contextual Fields for Champion Trophies */}
              {formCategory === 'CHAMPION_TROPHIES' && (
                <div className="space-y-4 pt-2 border-t border-zinc-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                        Position / Result
                      </label>
                      <select
                        value={formPosition}
                        onChange={(e: any) => setFormPosition(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      >
                        <option value="Champions">Champions (1st Place)</option>
                        <option value="Runners-up">Runners-up (2nd Place)</option>
                        <option value="3rd Place">3rd Place</option>
                        <option value="Special Achievement">Special Achievement</option>
                        <option value="Fair Play">Fair Play Award</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                        Award Date
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                      Winning Squad Athletes (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formSquadMembers}
                      onChange={(e) => setFormSquadMembers(e.target.value)}
                      placeholder="e.g. Noyon (C), Ashraful Ashem, Tanvir Ahmed, Rakib Hossain, Siam Islam"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Contextual Fields for Individual Honors */}
              {formCategory === 'INDIVIDUAL_HONORS' && (
                <div className="space-y-4 pt-2 border-t border-zinc-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                        Linked Athlete
                      </label>
                      <select
                        value={formSelectedPlayerId}
                        onChange={(e) => {
                          setFormSelectedPlayerId(e.target.value);
                          const p = players.find(x => x.id === e.target.value);
                          if (p && !formMvpPlayer) {
                            setFormMvpPlayer(`${p.name} (${p.gamingName})`);
                          }
                          if (p?.photoUrl && (!formImageUrl || formImageUrl === PRESET_IMAGES[5].url)) {
                            setFormImageUrl(p.photoUrl);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      >
                        <option value="">-- Select Roster Athlete --</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.gamingName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                        Badge Tier
                      </label>
                      <select
                        value={formBadgeType}
                        onChange={(e: any) => setFormBadgeType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      >
                        <option value="GOLD">Gold Medal</option>
                        <option value="PLATINUM">Platinum Recognition</option>
                        <option value="DIAMOND">Diamond Hall of Fame</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                      Period / Season Label
                    </label>
                    <input
                      type="text"
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(e.target.value)}
                      placeholder="e.g. September 2026, Season 01, Week 38"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Contextual Fields for Milestones */}
              {formCategory === 'CLUB_MILESTONES' && (
                <div className="space-y-4 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                      Milestone Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
                  Live Preview on /trophies:
                </span>
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 flex items-start space-x-3.5">
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                      }}
                      className="w-14 h-14 rounded-xl object-cover border border-amber-400/40 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                        {formPosition || 'CHAMPIONS'}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        {formYear}
                      </span>
                    </div>
                    <h5 className="text-xs font-black text-white truncate mt-1">
                      {formTitle || 'Trophy Title'}
                    </h5>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {formDescription || 'Description will appear here...'}
                    </p>
                    {(formMvpPlayer || formTopScorer) && (
                      <div className="flex items-center space-x-3 mt-2 text-[10px]">
                        {formMvpPlayer && (
                          <span className="text-amber-300 font-bold">MVP: {formMvpPlayer}</span>
                        )}
                        {formTopScorer && (
                          <span className="text-zinc-300 font-bold">Scorer: {formTopScorer}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Honor' : 'Save to Cabinet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                              */}
      {/* ======================================================== */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">
                Delete {deleteConfirmation.type === 'TROPHY' ? 'Trophy' : deleteConfirmation.type === 'AWARD' ? 'Individual Honor' : 'Milestone'}?
              </h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to permanently remove <strong className="text-white font-bold">"{deleteConfirmation.title}"</strong> from the club honors cabinet?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-red-500/20"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
