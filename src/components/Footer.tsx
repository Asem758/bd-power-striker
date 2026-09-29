import React from 'react';
import { ClubLogo } from './ClubLogo';
import { MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Organization */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 shrink-0">
              <ClubLogo size="md" className="w-11 h-11 shrink-0" />
              <div className="shrink-0 min-w-max">
                <h3 className="font-black text-white text-base tracking-tight whitespace-nowrap">
                  BD POWER STRIKERS
                </h3>
                <p className="text-xs text-amber-500 font-semibold tracking-wider whitespace-nowrap">
                  CLUB (BDPSC)
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official eFootball competitive sports organization in Bangladesh. Founded to foster esports excellence, tactical mastery, and national sporting glory.
            </p>
            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-500">
                EST. 2025 • DHAKA, BANGLADESH
              </span>
              <a
                href="https://www.facebook.com/p/BD-Power-strikers-Efootball-Club-61580380543166/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-md bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/70 text-blue-400 hover:text-blue-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm shrink-0"
                title="Follow BD Power Strikers eFootball Club on Facebook"
                aria-label="Official BD Power Strikers Facebook Page"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation / Club Hub */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <span>Club Hub</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('players')} className="hover:text-amber-400 transition-colors">
                  Official Squad & Profiles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rankings')} className="hover:text-amber-400 transition-colors">
                  BDPSC Power Rankings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('matches')} className="hover:text-amber-400 transition-colors">
                  Match Center & Results
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tournaments')} className="hover:text-amber-400 transition-colors">
                  Tournaments & Brackets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trophies')} className="hover:text-amber-400 transition-colors">
                  Trophy Cabinet & Honors
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Competitive Tools & Media */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <span>Player & Fan Tools</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('cards')} className="hover:text-amber-400 transition-colors inline-flex items-center space-x-1.5">
                  <span>Digital Player Card Generator</span>
                  <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.2 rounded font-black">HOT</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('players')} className="hover:text-amber-400 transition-colors">
                  Head-to-Head Comparison
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('news')} className="hover:text-amber-400 transition-colors">
                  Club News & Transfers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('media')} className="hover:text-amber-400 transition-colors">
                  Media Library & Highlights
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-slate-500 hover:text-slate-300 transition-colors">
                  Club Management Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Headquarters */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Official Headquarters</span>
            </h4>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Gulshan Club Secretariat</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed pl-3">
                H02, Rd no. 140, Gulshan 1, Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} BD Power Strikers Club (BDPSC). All rights reserved.
          </div>
          <div className="text-[11px] text-slate-500">
            eFootball™ is a registered trademark of Konami Digital Entertainment.
          </div>
        </div>
      </div>
    </footer>
  );
};

