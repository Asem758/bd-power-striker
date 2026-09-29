import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadImageFile } from '../../../services/api';

export interface FileAttachmentUploadProps {
  label?: string;
  sublabel?: string;
  value: string; // The image URL or data URI
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  maxSizeMB?: number;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  helperText?: string;
  required?: boolean;
  accentColor?: 'amber' | 'emerald' | 'cyan' | 'rose' | 'purple';
  onUploadSuccess?: (result: { url: string; fileName: string; size: number }) => void;
  onError?: (errorMessage: string) => void;
}

export const FileAttachmentUpload: React.FC<FileAttachmentUploadProps> = ({
  label = 'Media Attachment',
  sublabel,
  value,
  onChange,
  folder = 'general',
  placeholder = 'https://images.unsplash.com/... or paste image URL',
  maxSizeMB = 10,
  aspectRatio = 'auto',
  helperText,
  required = false,
  accentColor = 'amber',
  onUploadSuccess,
  onError,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    fileName?: string;
    fileSize?: string;
    dimensions?: string;
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute accent styling classes
  const colorMap = {
    amber: {
      border: 'border-amber-500/50',
      borderActive: 'border-amber-400 bg-amber-500/10',
      badge: 'bg-amber-400 text-zinc-950',
      text: 'text-amber-400',
      button: 'bg-amber-400 hover:bg-amber-300 text-zinc-950',
      ring: 'focus:border-amber-400',
      bar: 'bg-gradient-to-r from-amber-500 to-amber-300',
    },
    emerald: {
      border: 'border-emerald-500/50',
      borderActive: 'border-emerald-400 bg-emerald-500/10',
      badge: 'bg-emerald-400 text-zinc-950',
      text: 'text-emerald-400',
      button: 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950',
      ring: 'focus:border-emerald-500',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-300',
    },
    cyan: {
      border: 'border-cyan-500/50',
      borderActive: 'border-cyan-400 bg-cyan-500/10',
      badge: 'bg-cyan-400 text-zinc-950',
      text: 'text-cyan-400',
      button: 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950',
      ring: 'focus:border-cyan-500',
      bar: 'bg-gradient-to-r from-cyan-500 to-sky-300',
    },
    rose: {
      border: 'border-rose-500/50',
      borderActive: 'border-rose-400 bg-rose-500/10',
      badge: 'bg-rose-400 text-zinc-950',
      text: 'text-rose-400',
      button: 'bg-rose-400 hover:bg-rose-300 text-zinc-950',
      ring: 'focus:border-rose-500',
      bar: 'bg-gradient-to-r from-rose-500 to-pink-300',
    },
    purple: {
      border: 'border-purple-500/50',
      borderActive: 'border-purple-400 bg-purple-500/10',
      badge: 'bg-purple-400 text-zinc-950',
      text: 'text-purple-400',
      button: 'bg-purple-400 hover:bg-purple-300 text-zinc-950',
      ring: 'focus:border-purple-500',
      bar: 'bg-gradient-to-r from-purple-500 to-indigo-300',
    },
  };

  const currentTheme = colorMap[accentColor] || colorMap.amber;

  // Format file size nicely
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Extract dimensions for image preview
  useEffect(() => {
    if (!value) {
      setImageMeta(null);
      return;
    }

    const img = new Image();
    img.src = value;
    img.onload = () => {
      setImageMeta((prev) => ({
        ...prev,
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
      }));
    };
    img.onerror = () => {
      // Could be remote image or cross-origin
    };
  }, [value]);

  // Upload process
  const processAndUploadFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);

      // Validate MIME type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
        const msg = `Unsupported file type "${file.type || 'unknown'}". Please upload PNG, JPG, WebP, GIF, or SVG images.`;
        setErrorMessage(msg);
        if (onError) onError(msg);
        return;
      }

      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        const msg = `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is ${maxSizeMB} MB.`;
        setErrorMessage(msg);
        if (onError) onError(msg);
        return;
      }

      setIsUploading(true);
      setUploadProgress(15);

      try {
        // Read file as Base64 Data URL
        const reader = new FileReader();

        reader.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 45) + 15;
            setUploadProgress(percent);
          }
        };

        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          if (!base64Data) {
            throw new Error('Could not read file data.');
          }

          setUploadProgress(70);

          // Upload to server endpoint
          const result = await uploadImageFile({
            file: base64Data,
            fileName: file.name,
            folder,
          });

          setUploadProgress(100);

          // Update value and meta
          onChange(result.url);
          setImageMeta({
            fileName: file.name,
            fileSize: formatBytes(file.size),
          });

          if (onUploadSuccess) {
            onUploadSuccess({
              url: result.url,
              fileName: result.fileName,
              size: result.size,
            });
          }

          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 350);
        };

        reader.onerror = () => {
          throw new Error('Error reading local file.');
        };

        reader.readAsDataURL(file);
      } catch (err: any) {
        setIsUploading(false);
        setUploadProgress(0);
        const msg = err.message || 'Failed to upload image file.';
        setErrorMessage(msg);
        if (onError) onError(msg);
      }
    },
    [folder, maxSizeMB, onChange, onError, onUploadSuccess]
  );

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processAndUploadFile(file);
    }
  };

  // File Picker Change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processAndUploadFile(file);
    }
  };

  // Clipboard Paste Support (Screenshots from clipboard)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processAndUploadFile(file);
            break;
          }
        }
      }
    }
  };

  // Clear current image
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setImageMeta(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      {/* Header with Label and Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
          {sublabel && <p className="text-[11px] text-zinc-500">{sublabel}</p>}
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? `${currentTheme.badge} shadow-sm`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📁</span>
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
              activeTab === 'url'
                ? `${currentTheme.badge} shadow-sm`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🔗</span>
            <span>Paste URL</span>
          </button>
        </div>
      </div>

      {/* Main Upload / Input Zone */}
      {activeTab === 'upload' ? (
        <div className="space-y-2">
          {/* If an image is currently selected/uploaded */}
          {value ? (
            <div className="relative group bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-4 transition-all hover:border-zinc-700">
              {/* Thumbnail preview */}
              <div
                onClick={() => setIsPreviewModalOpen(true)}
                className="relative cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 w-full sm:w-28 h-28 flex-shrink-0 flex items-center justify-center group/thumb"
                title="Click to view full preview"
              >
                <img
                  src={value}
                  alt="Attachment Preview"
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                  <span className="text-white text-xs font-black bg-zinc-900/80 px-2 py-1 rounded-md">
                    🔍 Zoom
                  </span>
                </div>
              </div>

              {/* Details & Re-upload action */}
              <div className="flex-1 w-full space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white truncate max-w-[220px]">
                    {imageMeta?.fileName || 'Attached Media Image'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    Active File
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                  {imageMeta?.dimensions && (
                    <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      📐 {imageMeta.dimensions}
                    </span>
                  )}
                  {imageMeta?.fileSize && (
                    <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      💾 {imageMeta.fileSize}
                    </span>
                  )}
                  <span className="text-zinc-500 truncate max-w-[180px]">
                    {value.startsWith('data:') ? 'Embedded Base64 Data' : value}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-zinc-300 hover:text-white px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition"
                  >
                    🔄 Replace File
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded-lg transition flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? `${currentTheme.borderActive} scale-[1.01] shadow-xl`
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
              }`}
            >
              {/* SVG Icon */}
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition">
                <svg
                  className={`w-6 h-6 ${isDragging ? currentTheme.text : 'text-zinc-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  Drag and drop image here, or{' '}
                  <span className={`${currentTheme.text} underline underline-offset-2 hover:opacity-90 font-black`}>
                    browse files
                  </span>
                </p>
                <p className="text-[11px] text-zinc-500">
                  PNG, JPG, WebP, GIF, or SVG (Up to {maxSizeMB}MB). Screenshot paste supported (Ctrl+V).
                </p>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                    <span className="text-zinc-300">Processing & Uploading...</span>
                    <span className={currentTheme.text}>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${currentTheme.bar} transition-all duration-200`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Direct URL Input Mode */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={placeholder}
              className={`w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none ${currentTheme.ring} transition pr-8`}
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs p-1"
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          {/* Live Preview for URL Mode */}
          {value && (
            <div className="flex items-center gap-3 p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl">
              <div
                onClick={() => setIsPreviewModalOpen(true)}
                className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 cursor-pointer"
              >
                <img
                  src={value}
                  alt="URL Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setErrorMessage('Image URL could not be loaded or is invalid.');
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 text-[11px]">
                <span className="text-zinc-300 font-bold block truncate">External Image Linked</span>
                <span className="text-zinc-500 block truncate">{value}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message Toast / Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 animate-fadeIn">
          <span>⚠️</span>
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white p-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Helper text */}
      {helperText && !errorMessage && (
        <p className="text-[10px] text-zinc-500">{helperText}</p>
      )}

      {/* Fullscreen Image Preview Lightbox Modal */}
      {isPreviewModalOpen && value && (
        <div
          onClick={() => setIsPreviewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-4 overflow-hidden shadow-2xl animate-scaleUp"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Attached Image Preview
                </h4>
                {imageMeta?.dimensions && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Dimensions: {imageMeta.dimensions}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl bg-zinc-900 flex items-center justify-center p-2">
              <img
                src={value}
                alt="Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span className="truncate max-w-md font-mono text-[11px]">{value}</span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
