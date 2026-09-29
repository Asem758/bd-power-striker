import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

// Curated high-resolution club preset avatars
const CLUB_PRESETS = [
  {
    id: 'preset-striker',
    title: 'Striker Icon',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'preset-playmaker',
    title: 'Playmaker',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'preset-winger',
    title: 'Speed Winger',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'preset-defender',
    title: 'Defensive Rock',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'preset-esports',
    title: 'Pro Gamer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'preset-supporter',
    title: 'Club Member',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
  },
];

export const ProfilePhotoModal: React.FC = () => {
  const { user, isPhotoModalOpen, closePhotoModal, updateUserAvatar, roleBadge } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync initial state when modal opens
  React.useEffect(() => {
    if (isPhotoModalOpen && user) {
      setPreviewUrl(user.avatarUrl || null);
      setUrlInput(user.avatarUrl || '');
      setSelectedFileBase64(null);
      setSelectedFileName('');
      setError(null);
      setSuccess(false);
    }
  }, [isPhotoModalOpen, user]);

  if (!isPhotoModalOpen || !user) return null;

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP, GIF, or SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed is 10MB.`);
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedFileBase64(result);
      setPreviewUrl(result);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!urlInput.trim()) {
      setError('Please enter a valid image URL.');
      return;
    }
    setPreviewUrl(urlInput.trim());
    setSelectedFileBase64(null);
    setSelectedFileName('web-image.jpg');
  };

  const handleSelectPreset = (presetUrl: string) => {
    setError(null);
    setPreviewUrl(presetUrl);
    setUrlInput(presetUrl);
    setSelectedFileBase64(null);
    setSelectedFileName('club-preset.jpg');
  };

  const handleSavePhoto = async () => {
    if (!previewUrl) {
      setError('Please select or upload a profile photo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedFileBase64) {
        await updateUserAvatar({
          file: selectedFileBase64,
          fileName: selectedFileName || 'profile-avatar.png',
        });
      } else {
        await updateUserAvatar({
          avatarUrl: previewUrl,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        closePhotoModal();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
    setLoading(true);
    setError(null);
    try {
      await updateUserAvatar({ avatarUrl: defaultUrl });
      setPreviewUrl(defaultUrl);
      setSuccess(true);
      setTimeout(() => {
        closePhotoModal();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset profile photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400"></div>

        {/* Close Button */}
        <button
          onClick={closePhotoModal}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Update Profile Photo
              </h2>
              <p className="text-xs text-zinc-400">
                Personalize your official BDPSC profile, player card & community avatar
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Profile photo updated successfully! Synchronizing across application...</span>
            </div>
          )}

          {/* Live Preview Section */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-5">
            {/* Large Avatar Preview with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-400 shadow-xl shadow-amber-500/15">
                <img
                  src={previewUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover bg-zinc-950"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-full shadow-lg border-2 border-zinc-950 transition hover:scale-110"
                title="Browse file"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Contextual Preview in Badges */}
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs font-bold text-white mb-0.5">{user.name}</div>
              <div className="text-[11px] text-zinc-400 mb-2">{user.email}</div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}>
                  {roleBadge.displayName}
                </div>

                {selectedFileName && (
                  <span className="text-[10px] text-amber-400/90 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 truncate max-w-[180px]">
                    {selectedFileName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Method Selector Tabs */}
          <div className="flex bg-zinc-900/90 p-1 rounded-xl mb-4 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Image URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Club Presets</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {/* Tab 1: DRAG & DROP FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-amber-400 bg-amber-400/10 scale-[1.01]' 
                  : 'border-zinc-700 hover:border-amber-400/70 bg-zinc-900/50 hover:bg-zinc-900/80'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white mb-1">
                Drop your photo here, or <span className="text-amber-400 underline">browse files</span>
              </p>
              <p className="text-[11px] text-zinc-500">
                Supports PNG, JPG, WebP, GIF up to 10MB. High resolution recommended.
              </p>
            </div>
          )}

          {/* Tab 2: PASTE IMAGE URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Public Image Web Address (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition border border-zinc-700 shrink-0"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                You can paste direct image links from Discord, Steam, GitHub, or any image hosting platform.
              </p>
            </form>
          )}

          {/* Tab 3: CLUB PRESET AVATARS */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CLUB_PRESETS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative p-1 rounded-2xl border transition-all hover:scale-105 flex flex-col items-center group ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 shadow-md shadow-amber-400/20'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-12 h-12 rounded-full aspect-square object-cover mb-1 border border-zinc-700"
                    />
                    <span className="text-[9px] font-bold text-zinc-400 group-hover:text-white truncate max-w-full">
                      {preset.title}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={loading}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={closePhotoModal}
                disabled={loading}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={loading || !previewUrl}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Saving Photo...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
