import React, { useState } from 'react';
import { NewsArticle, NewsCategory, Player } from '../../../types';
import { saveNews, deleteNews, updateNewsStatus } from '../../../services/api';
import { FileAttachmentUpload } from '../common/FileAttachmentUpload';

interface NewsPublisherTabProps {
  news: NewsArticle[];
  players: Player[];
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
  onRefreshData: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'MATCH_REPORT', label: 'Match Report' },
  { value: 'ROSTER', label: 'Roster & Transfers' },
  { value: 'TOURNAMENT', label: 'Tournament News' },
  { value: 'ACHIEVEMENT', label: 'Club Achievement' },
];

export const NewsPublisherTab: React.FC<NewsPublisherTabProps> = ({
  news,
  players,
  hasPermission,
  isSuperAdmin,
  onRefreshData,
  showFeedback,
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsCategory>('ANNOUNCEMENT');
  const [author, setAuthor] = useState('BDPSC Editorial Desk');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('BDPSC, eFootball, Esports');
  const [articleStatus, setArticleStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const canCreate = hasPermission('news.create') || isSuperAdmin;
  const canEdit = hasPermission('news.edit') || isSuperAdmin;
  const canPublish = hasPermission('news.publish') || isSuperAdmin;
  const canDelete = hasPermission('news.delete') || isSuperAdmin;

  // Open Write Modal
  const openWriteModal = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('ANNOUNCEMENT');
    setAuthor('BDPSC Editorial Desk');
    setCoverImageUrl('');
    setExcerpt('');
    setContent('');
    setTagsInput('BDPSC, eFootball, Esports');
    setArticleStatus('PUBLISHED');
    setSelectedPlayerIds([]);
    setIsWriteOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (article: NewsArticle) => {
    setEditingArticle(article);
    setTitle(article.title);
    setCategory(article.category);
    setAuthor(article.author);
    setCoverImageUrl(article.coverImageUrl);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setTagsInput(article.tags ? article.tags.join(', ') : '');
    setArticleStatus(article.status);
    setSelectedPlayerIds(article.relatedPlayerIds || []);
  };

  // Save Article (Create or Update)
  const handleSaveArticle = async (statusOverride?: 'PUBLISHED' | 'DRAFT') => {
    if (!title.trim() || !content.trim()) {
      showFeedback('error', 'Article headline and body content are required.');
      return;
    }
    const finalStatus = statusOverride || articleStatus;

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<NewsArticle> = {
        title: title.trim(),
        category,
        author: author.trim() || 'BDPSC Editorial',
        coverImageUrl:
          coverImageUrl.trim() ||
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000',
        excerpt: excerpt.trim() || content.trim().slice(0, 150) + '...',
        content: content.trim(),
        tags,
        status: finalStatus,
        relatedPlayerIds: selectedPlayerIds,
      };

      if (editingArticle) {
        payload.id = editingArticle.id;
      }

      await saveNews(payload);
      showFeedback(
        'success',
        finalStatus === 'DRAFT'
          ? `Draft saved for "${title}"`
          : editingArticle
          ? `Article "${title}" updated and published.`
          : `Article "${title}" published live!`
      );
      setIsWriteOpen(false);
      setEditingArticle(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save news article');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Published / Draft Status
  const handleToggleStatus = async (article: NewsArticle) => {
    const nextStatus = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateNewsStatus(article.id, nextStatus);
      showFeedback('success', `Article status changed to ${nextStatus}`);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update article status');
    }
  };

  // Delete Article
  const handleConfirmDelete = async () => {
    if (!deletingArticle) return;
    setLoading(true);
    try {
      await deleteNews(deletingArticle.id);
      showFeedback('success', `Article "${deletingArticle.title}" removed.`);
      setDeletingArticle(null);
      onRefreshData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete article');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter((n) => {
    return categoryFilter === 'ALL' || n.category === categoryFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            News & Editorial Publisher
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create club announcements, match reports, roster transfers, and press releases
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openWriteModal}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 self-start md:self-auto shadow-lg shadow-amber-400/20"
          >
            <span>✍️</span>
            <span>Write New Article</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition"
        >
          <option value="ALL">All Categories ({news.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} ({news.filter((n) => n.category === c.value).length})
            </option>
          ))}
        </select>
      </div>

      {/* Articles Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Article Headline</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author & Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-bold">
                    No articles found for the selected category.
                  </td>
                </tr>
              ) : (
                filteredNews.map((article) => {
                  const isPublished = article.status === 'PUBLISHED';
                  return (
                    <tr key={article.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {article.coverImageUrl && (
                            <img
                              src={article.coverImageUrl}
                              alt={article.title}
                              className="w-12 h-8 rounded-lg object-cover bg-zinc-800 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-white text-xs block line-clamp-1">
                              {article.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 line-clamp-1">
                              {article.excerpt}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-zinc-300 text-xs">
                          {CATEGORIES.find((c) => c.value === article.category)?.label || article.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-zinc-300 block">{article.author}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {canPublish ? (
                          <button
                            onClick={() => handleToggleStatus(article)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              isPublished
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/80'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isPublished ? '✓ Published' : 'Draft'}
                          </button>
                        ) : (
                          <span
                            className={`text-xs font-bold ${
                              isPublished ? 'text-emerald-400' : 'text-zinc-500'
                            }`}
                          >
                            {article.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(article)}
                              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-lg text-xs font-bold transition"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingArticle(article)}
                              className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded-lg text-xs font-bold transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: WRITE / EDIT ARTICLE */}
      {(isWriteOpen || editingArticle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  {editingArticle ? `Edit Article: ${editingArticle.title}` : 'Compose News Article'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish club releases or save as a draft for editorial review.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsWriteOpen(false);
                  setEditingArticle(null);
                }}
                className="text-zinc-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Article Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. BDPSC Crowned Champions of BDEC 2026"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NewsCategory)}
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
                    Author Byline
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. BDPSC Editorial Desk"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <FileAttachmentUpload
                  label="Article Cover Banner & Thumbnail"
                  sublabel="Drag & drop editorial cover graphic, paste image URL, or clipboard paste (Ctrl+V)"
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                  folder="news"
                  accentColor="amber"
                  placeholder="https://images.unsplash.com/photo-... or paste image URL"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Short Excerpt / Lead Summary
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief summary teaser appearing on the news cards..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Full Article Body Content *
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full report, quotes, tactical breakdown, and match analysis..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="BDPSC, Championship, Noyon"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Mentioned Athletes
                  </label>
                  <select
                    multiple
                    value={selectedPlayerIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setSelectedPlayerIds(selected);
                    }}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 h-20"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.gamingName} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsWriteOpen(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveArticle('DRAFT')}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveArticle('PUBLISHED')}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 disabled:opacity-50"
                  >
                    {loading ? 'Publishing...' : 'Publish Immediately'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE NEWS CONFIRMATION */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-900/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-xl text-red-400 mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight mb-2">
              Delete Article
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Are you sure you want to permanently delete article <strong className="text-white">"{deletingArticle.title}"</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingArticle(null)}
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
