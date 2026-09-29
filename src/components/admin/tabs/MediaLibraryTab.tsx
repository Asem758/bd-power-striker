import React, { useState } from 'react';
import { MediaItem, MediaCategory, Player, Match } from '../../../types';
import { saveMedia, deleteMedia } from '../../../services/api';
import { FileAttachmentUpload } from '../common/FileAttachmentUpload';
import { BatchMediaUploader } from '../common/BatchMediaUploader';

interface MediaLibraryTabProps {
  media: MediaItem[];
  players: Player[];
  matches: Match[];
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

const CATEGORIES: { value: MediaCategory; label: string }[] = [
  { value: 'HIGHLIGHTS', label: 'Match Highlights' },
  { value: 'PHOTOS', label: 'Official Squad Photos' },
  { value: 'SCREENSHOTS', label: 'Match Screenshots' },
  { value: 'VIDEOS', label: 'Video Clips / Streams' },
  { value: 'CARDS', label: 'Player Cards & Banners' },
];

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  media,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MediaCategory>('HIGHLIGHTS');
  const [mediaType, setMediaType] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const [mediaUrl, setMediaUrl] = useState('');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('BDPSC, Highlights');

  const canUpload = hasPermission('media.upload') || hasPermission('media.edit') || isSuperAdmin;
  const canDelete = hasPermission('media.delete') || isSuperAdmin;

  // Open Upload Modal
  const openUploadModal = () => {
    setTitle('');
    setCategory('HIGHLIGHTS');
    setMediaType('PHOTO');
    setMediaUrl('');
    setExternalVideoUrl('');
    setDescription('');
    setTagsInput('BDPSC, Highlights');
    setIsUploadOpen(true);
  };

  // Submit Media
  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showFeedback('error', 'Media title is required.');
      return;
    }

    const finalMediaUrl = mediaUrl.trim() || externalVideoUrl.trim();
    if (!finalMediaUrl) {
      showFeedback('error', 'Please provide an image asset URL or video URL.');
      return;
    }

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<MediaItem> = {
        title: title.trim(),
        category,
        type: mediaType,
        mediaUrl: finalMediaUrl,
        externalVideoUrl: externalVideoUrl.trim() || undefined,
        description: description.trim() || undefined,
        tags,
      };

      await saveMedia(payload);
      showFeedback('success', `Media item "${title}" added to club library.`);
      setIsUploadOpen(false);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to upload media item');
    } finally {
      setLoading(false);
    }
  };

  // Delete Media
  const handleConfirmDelete = async () => {
    if (!deletingMedia) return;
    setLoading(true);
    try {
      await deleteMedia(deletingMedia.id);
      showFeedback('success', `Media item "${deletingMedia.title}" removed.`);
      setDeletingMedia(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete media asset');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter((m) => {
    return categoryFilter === 'ALL' || m.category === categoryFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            Club Digital Media Asset Library
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage match screenshot archives, tournament wallpapers, squad photos, and YouTube video highlights
          </p>
        </div>

        {canUpload && (
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setIsBatchUploadOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <span>⚡</span>
              <span>Batch Drag & Drop</span>
            </button>
            <button
              onClick={openUploadModal}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
            >
              <span>📷</span>
              <span>Single Media</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition"
        >
          <option value="ALL">All Media Categories ({media.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} ({media.filter((m) => m.category === c.value).length})
            </option>
          ))}
        </select>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 font-bold bg-zinc-950 border border-zinc-800 rounded-2xl">
            No media assets found for the selected category.
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition flex flex-col justify-between shadow-lg"
            >
              <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600';
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur text-[10px] font-bold text-amber-400 rounded-md border border-zinc-700 uppercase">
                  {item.category}
                </span>
                {item.externalVideoUrl && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-red-600/90 text-[10px] font-bold text-white rounded-md flex items-center gap-1">
                    ▶ Video
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-xs line-clamp-1 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] text-zinc-500 font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] text-zinc-500">
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  {canDelete && (
                    <button
                      onClick={() => setDeletingMedia(item)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      Delete Asset
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: UPLOAD / EMBED MEDIA */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl my-8">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  Add Digital Media Asset
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Upload images (JPG, PNG, WebP) or link YouTube highlight streams.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-zinc-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Media Title / Caption *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Final Trophy Presentation 2026"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MediaCategory)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Media Type
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="PHOTO">Image / Photo</option>
                    <option value="VIDEO">Video / Stream</option>
                  </select>
                </div>
              </div>

              <div>
                <FileAttachmentUpload
                  label="Media Image or Thumbnail File"
                  sublabel="Drag & drop screenshot or squad photo, paste image URL, or clipboard paste (Ctrl+V)"
                  value={mediaUrl}
                  onChange={setMediaUrl}
                  folder="media"
                  accentColor="amber"
                  required
                  onUploadSuccess={(res) => {
                    if (!title) {
                      setTitle(res.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  YouTube / Video Stream URL (Optional)
                </label>
                <input
                  type="url"
                  value={externalVideoUrl}
                  onChange={(e) => setExternalVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="BDPSC, Highlights, Trophy, Noyon"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short note about where or when this media was captured..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Media Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE MEDIA CONFIRMATION */}
      {deletingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-900/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-xl text-red-400 mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight mb-2">
              Delete Media Asset
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Are you sure you want to permanently delete media item <strong className="text-white">"{deletingMedia.title}"</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
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
      {/* MODAL: BATCH MEDIA UPLOADER */}
      {isBatchUploadOpen && (
        <BatchMediaUploader
          onSuccess={() => {
            setIsBatchUploadOpen(false);
            onRefreshData();
          }}
          onCancel={() => setIsBatchUploadOpen(false)}
          showFeedback={showFeedback}
        />
      )}
    </div>
  );
};
