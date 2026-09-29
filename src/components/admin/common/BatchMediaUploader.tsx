import React, { useState, useRef } from 'react';
import { MediaCategory } from '../../../types';
import { uploadImagesBatch } from '../../../services/api';

export interface BatchMediaUploaderProps {
  onSuccess: (count: number) => void;
  onCancel: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  title: string;
  category: MediaCategory;
  tags: string;
  size: number;
  dimensions?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

const CATEGORIES: { value: MediaCategory; label: string }[] = [
  { value: 'SCREENSHOTS', label: 'Match Screenshots' },
  { value: 'PHOTOS', label: 'Official Squad Photos' },
  { value: 'HIGHLIGHTS', label: 'Tournament Highlights' },
  { value: 'CARDS', label: 'Player Cards & Banners' },
  { value: 'VIDEOS', label: 'Video Clips / Streams' },
];

export const BatchMediaUploader: React.FC<BatchMediaUploaderProps> = ({
  onSuccess,
  onCancel,
  showFeedback,
}) => {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalCategory, setGlobalCategory] = useState<MediaCategory>('SCREENSHOTS');
  const [globalTags, setGlobalTags] = useState('BDPSC, Esports');
  const [overallProgress, setOverallProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    const newItems: QueuedFile[] = [];

    Array.from(fileList).forEach((file) => {
      if (!allowedTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
        showFeedback('error', `Skipped non-image file: ${file.name}`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showFeedback('error', `File ${file.name} is too large (>10MB)`);
        return;
      }

      const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const previewUrl = URL.createObjectURL(file);
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Read base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setQueue((prev) =>
          prev.map((q) => (q.id === id ? { ...q, base64 } : q))
        );
      };
      reader.readAsDataURL(file);

      // Measure dimensions
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, dimensions: `${img.naturalWidth}×${img.naturalHeight}` } : q
          )
        );
      };

      newItems.push({
        id,
        file,
        previewUrl,
        base64: '',
        title: cleanTitle,
        category: globalCategory,
        tags: globalTags,
        size: file.size,
        status: 'pending',
      });
    });

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
    }
  };

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
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setQueue([]);
  };

  const applyGlobalCategoryToAll = (cat: MediaCategory) => {
    setGlobalCategory(cat);
    setQueue((prev) => prev.map((item) => ({ ...item, category: cat })));
  };

  const applyGlobalTagsToAll = (tags: string) => {
    setGlobalTags(tags);
    setQueue((prev) => prev.map((item) => ({ ...item, tags })));
  };

  // Execute Batch Upload
  const handleStartBatchUpload = async () => {
    if (queue.length === 0) {
      showFeedback('error', 'Please select or drop at least one image file.');
      return;
    }

    setIsUploading(true);
    setOverallProgress(10);

    try {
      // Ensure all items have base64 loaded
      const filesToUpload = queue.map((q) => ({
        file: q.base64 || q.previewUrl,
        fileName: q.file.name,
        title: q.title.trim() || q.file.name,
        category: q.category,
        description: `Batch uploaded photo (${formatBytes(q.size)})`,
      }));

      setOverallProgress(35);

      const res = await uploadImagesBatch({
        files: filesToUpload,
        autoCreateMedia: true,
        mediaCategory: globalCategory,
        tags: globalTags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setOverallProgress(100);
      showFeedback('success', `Successfully uploaded ${res.count} images to Club Media Library!`);
      setTimeout(() => {
        setIsUploading(false);
        onSuccess(res.count);
      }, 500);
    } catch (err: any) {
      setIsUploading(false);
      showFeedback('error', err.message || 'Batch upload failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-xl text-amber-400">
              📸
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Batch Drag-and-Drop Media Uploader
              </h3>
              <p className="text-xs text-zinc-400">
                Bulk upload tournament photos, match score screenshots, and graphics in one go
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="text-zinc-500 hover:text-white text-lg p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-1 space-y-4 my-3 pr-2">
          {/* Interactive Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl text-amber-400 shadow-inner">
              ⚡
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
              Drag & Drop Multiple Files Here
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Drop screenshots or tournament folders, or{' '}
              <span className="text-amber-400 font-bold underline">click to browse</span> from your device.
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-zinc-900 rounded-lg text-[10px] text-zinc-500 font-mono">
              Supports PNG, JPG, JPEG, WebP, GIF (Max 10MB each)
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />

          {/* Global Defaults Toolbar */}
          {queue.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                    Apply Category to All
                  </label>
                  <select
                    value={globalCategory}
                    onChange={(e) => applyGlobalCategoryToAll(e.target.value as MediaCategory)}
                    className="px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                    Default Tags
                  </label>
                  <input
                    type="text"
                    value={globalTags}
                    onChange={(e) => applyGlobalTagsToAll(e.target.value)}
                    placeholder="BDPSC, Cup, Matchday"
                    className="px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white w-44"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">
                  {queue.length} {queue.length === 1 ? 'file' : 'files'} ready
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Queued Items List */}
          {queue.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl flex items-center gap-3 text-xs hover:border-zinc-700 transition"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.previewUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-950 border border-zinc-800 flex-shrink-0"
                  />

                  {/* Title & Metadata input */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...queue];
                          updated[index].title = e.target.value;
                          setQueue(updated);
                        }}
                        placeholder="Image title / caption"
                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                      />
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {formatBytes(item.size)} {item.dimensions && `• ${item.dimensions}`}
                      </span>
                    </div>

                    <div>
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...queue];
                          updated[index].category = e.target.value as MediaCategory;
                          setQueue(updated);
                        }}
                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.tags}
                        onChange={(e) => {
                          const updated = [...queue];
                          updated[index].tags = e.target.value;
                          setQueue(updated);
                        }}
                        placeholder="Tags (comma separated)"
                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Remove action */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 transition"
                    title="Remove from queue"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Uploading progress bar */}
          {isUploading && (
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>Uploading batch media files to club archive...</span>
                <span className="text-amber-400">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={queue.length === 0 || isUploading}
              onClick={handleStartBatchUpload}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Uploading Queue...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Upload {queue.length > 0 ? `${queue.length} Files` : 'Files'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
