import React, { useState } from 'react';
import { 
  Newspaper, 
  Image as ImageIcon, 
  Play, 
  Download, 
  Calendar, 
  User, 
  ArrowLeft, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { NewsArticle, MediaItem } from '../types';

interface NewsMediaViewProps {
  news: NewsArticle[];
  media: MediaItem[];
  selectedArticleSlug?: string;
}

export const NewsMediaView: React.FC<NewsMediaViewProps> = ({
  news,
  media,
  selectedArticleSlug,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'media'>('news');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(
    selectedArticleSlug ? news.find(n => n.slug === selectedArticleSlug) || null : null
  );

  const filteredNews = news.filter(n => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Newspaper className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              DISPATCHES & MEDIA VAULT
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official announcements, tournament reviews, match recaps, match highlights, and wallpaper vault.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('news'); setActiveArticle(null); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'news' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            NEWS & ARTICLES ({news.length})
          </button>
          <button
            onClick={() => { setActiveTab('media'); setActiveArticle(null); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'media' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            MEDIA GALLERY ({media.length})
          </button>
        </div>
      </div>

      {/* ARTICLE FULL DETAIL VIEW */}
      {activeArticle ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 max-w-4xl mx-auto shadow-2xl">
          <button
            onClick={() => setActiveArticle(null)}
            className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL ARTICLES</span>
          </button>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded-lg uppercase">
                {activeArticle.category}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(activeArticle.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {activeArticle.title}
            </h1>
            <p className="text-xs text-slate-400">
              Published by <strong className="text-slate-200">{activeArticle.author}</strong> • Official BDPSC Press
            </p>
          </div>

          <img
            src={activeArticle.coverImageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000'}
            alt={activeArticle.title}
            className="w-full h-80 sm:h-96 rounded-2xl object-cover border border-slate-700 shadow-xl"
          />

          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4 pt-4 border-t border-slate-800">
            {activeArticle.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {activeArticle.tags && activeArticle.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-2">
              {activeArticle.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-slate-950 text-slate-400 text-xs px-2.5 py-1 rounded-lg border border-slate-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'news' ? (
        /* NEWS LIST VIEW */
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl overflow-x-auto text-xs font-bold">
            <span className="text-slate-400 text-[11px] uppercase ml-2 mr-1">TOPIC:</span>
            {['ALL', 'TOURNAMENT', 'MATCH_REPORT', 'ANNOUNCEMENT', 'TRANSFER', 'INTERVIEW'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(article => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-700 rounded-lg px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {article.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>By {article.author}</span>
                  <span className="text-amber-400 font-bold group-hover:underline">Read Dispatch →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MEDIA GALLERY TAB */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map(item => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg space-y-3 group"
              >
                <div className="relative h-52 overflow-hidden bg-black">
                  <img
                    src={item.thumbnailUrl || item.mediaUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {(item.type === 'VIDEO' || item.category === 'VIDEOS' || item.category === 'HIGHLIGHTS') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-slate-950/80 border border-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {item.type || item.category}
                  </span>
                </div>

                <div className="p-4 pt-1 space-y-1">
                  <h4 className="text-sm font-black text-white line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">{item.uploadedAt || item.date || ''}</span>
                    {item.mediaUrl && (
                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                      >
                        <span>Open Media</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
