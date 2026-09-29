import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link, X, Check, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { uploadImageFile } from '../../../services/api';
import { OPPONENT_CLUB_PRESETS, getOpponentLogoUrl } from '../../../utils/opponentLogos';

interface OpponentLogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  opponentName?: string;
  onSelectOpponentName?: (name: string) => void;
  label?: string;
  helperText?: string;
  accentColor?: 'amber' | 'emerald';
}

export const OpponentLogoUploader: React.FC<OpponentLogoUploaderProps> = ({
  value,
  onChange,
  opponentName = '',
  onSelectOpponentName,
  label = 'Opponent Club Logo',
  helperText = 'Upload official opponent crest, badge, or select a regional preset',
  accentColor = 'amber',
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTheme = accentColor === 'emerald' ? {
    border: 'border-emerald-500/40',
    borderActive: 'border-emerald-400 bg-emerald-500/10',
    ring: 'focus:border-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    btn: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950',
    text: 'text-emerald-400',
  } : {
    border: 'border-amber-500/40',
    borderActive: 'border-amber-400 bg-amber-500/10',
    ring: 'focus:border-amber-500',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    btn: 'bg-amber-400 hover:bg-amber-300 text-zinc-950',
    text: 'text-amber-400',
  };

  const effectivePreview = value 
    ? (value.includes('photo-1542751371-adc38448a05e') ? getOpponentLogoUrl(opponentName, '') : value)
    : (opponentName ? getOpponentLogoUrl(opponentName, '') : '/opponent-logos/generic-opponent.svg');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File size exceeds 8MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        if (!base64Data) {
          setIsUploading(false);
          return;
        }

        try {
          const cleanClub = (opponentName || 'opponent').toLowerCase().replace(/[^a-z0-9]/g, '-');
          const ext = file.name.split('.').pop() || 'png';
          const fileName = `${cleanClub}-logo-${Date.now()}.${ext}`;

          const res = await uploadImageFile({
            file: base64Data,
            fileName,
            folder: 'opponent-logos',
            autoCreateMedia: false,
          });

          if (res?.url) {
            onChange(res.url);
          } else {
            // Fallback to Data URL
            onChange(base64Data);
          }
        } catch (uploadErr) {
          // Fallback to storing Data URL locally if server upload endpoint is unavailable
          onChange(base64Data);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read image file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Image processing failed.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
  };

  const handleSelectPreset = (preset: typeof OPPONENT_CLUB_PRESETS[0]) => {
    onChange(preset.logoUrl);
    if (onSelectOpponentName && (!opponentName || opponentName.trim() === '')) {
      onSelectOpponentName(preset.name);
    }
  };

  return (
    <div className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-2xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            {label}
          </label>
          <p className="text-[11px] text-zinc-500 mt-0.5">{helperText}</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px] font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              activeMode === 'upload' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('preset')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              activeMode === 'preset' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Club Crests</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              activeMode === 'url' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {uploadError}
        </div>
      )}

      {/* Main Content Area: Preview + Upload Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Logo Preview Badge */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-zinc-700/80 p-2 flex items-center justify-center overflow-hidden shadow-lg shadow-black/40 group-hover:border-zinc-500 transition">
            <img
              src={effectivePreview}
              alt={opponentName || 'Opponent Club Crest'}
              className="w-full h-full object-contain drop-shadow"
              onError={(e) => {
                // Fallback to generic shield if image fails to load
                (e.target as HTMLImageElement).src = '/opponent-logos/generic-opponent.svg';
              }}
            />
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-md transition hover:scale-110"
              title="Remove opponent logo"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dynamic Controls based on selected mode */}
        <div className="flex-1 w-full">
          {activeMode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition text-center flex flex-col items-center justify-center ${
                  isDragging ? activeTheme.borderActive : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Uploading club crest...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-xs font-bold text-zinc-300">
                      Click to choose file or drag & drop logo
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      PNG, JPG, SVG, WebP up to 8MB
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {activeMode === 'preset' && (
            <div>
              <div className="text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Select Opponent Crest:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OPPONENT_CLUB_PRESETS.map((preset) => {
                  const isSelected = value === preset.logoUrl;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-zinc-900 hover:bg-zinc-800/80 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <img
                        src={preset.logoUrl}
                        alt={preset.shortName}
                        className="w-6 h-6 rounded-lg object-contain shrink-0 bg-zinc-950 p-0.5 border border-zinc-800"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold truncate leading-tight">{preset.shortName}</div>
                        <div className="text-[9px] text-zinc-500 truncate">{preset.region}</div>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeMode === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                placeholder="https://.../opponent-badge.png"
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplyUrl()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
