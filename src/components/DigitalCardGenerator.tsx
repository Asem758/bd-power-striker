import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Download, 
  Share2, 
  Sparkles, 
  Shield, 
  Check, 
  Palette, 
  Sliders, 
  Upload,
  RefreshCw
} from 'lucide-react';
import { Player } from '../types';

interface DigitalCardGeneratorProps {
  players: Player[];
  initialPlayerId?: string;
}

type CardTheme = 'gold' | 'crimson' | 'emerald' | 'obsidian' | 'platinum';

export const DigitalCardGenerator: React.FC<DigitalCardGeneratorProps> = ({
  players,
  initialPlayerId,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    initialPlayerId || players[0]?.id || ''
  );

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  // Customizable Card State
  const [theme, setTheme] = useState<CardTheme>('gold');
  const [badgeTag, setBadgeTag] = useState<string>('NATIONAL CHAMPION');
  const [customPhoto, setCustomPhoto] = useState<string>('');
  const [pac, setPac] = useState<number>(92);
  const [sho, setSho] = useState<number>(selectedPlayer?.goals ? Math.min(99, 80 + selectedPlayer.goals) : 88);
  const [pas, setPas] = useState<number>(selectedPlayer?.assists ? Math.min(99, 78 + selectedPlayer.assists) : 85);
  const [dri, setDri] = useState<number>(91);
  const [def, setDef] = useState<number>(selectedPlayer?.cleanSheets ? Math.min(99, 75 + selectedPlayer.cleanSheets * 2) : 74);
  const [phy, setPhy] = useState<number>(86);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Sync attributes when selecting another player
  const handlePlayerChange = (id: string) => {
    setSelectedPlayerId(id);
    const p = players.find(x => x.id === id);
    if (p) {
      setCustomPhoto('');
      setSho(Math.min(99, Math.max(70, Math.round(p.rating * 0.98 + (p.goals > 10 ? 3 : 0)))));
      setPas(Math.min(99, Math.max(70, Math.round(p.rating * 0.95 + (p.assists > 5 ? 2 : 0)))));
      setDef(Math.min(99, Math.max(65, Math.round(p.rating * 0.88))));
    }
  };

  // Theme styling helpers
  const getThemeGradient = (t: CardTheme) => {
    switch (t) {
      case 'gold':
        return 'from-amber-600 via-amber-400 to-yellow-600 border-amber-400/80 text-amber-950';
      case 'crimson':
        return 'from-rose-700 via-red-500 to-rose-900 border-rose-400/80 text-white';
      case 'emerald':
        return 'from-emerald-700 via-emerald-500 to-teal-800 border-emerald-400/80 text-white';
      case 'obsidian':
        return 'from-slate-900 via-slate-800 to-slate-950 border-slate-600 text-white';
      case 'platinum':
        return 'from-cyan-600 via-sky-400 to-blue-700 border-cyan-300 text-slate-950';
    }
  };

  const getCardInnerBg = (t: CardTheme) => {
    switch (t) {
      case 'gold':
        return 'bg-gradient-to-b from-amber-950/90 via-slate-950 to-slate-950 text-amber-100';
      case 'crimson':
        return 'bg-gradient-to-b from-rose-950/90 via-slate-950 to-slate-950 text-rose-100';
      case 'emerald':
        return 'bg-gradient-to-b from-emerald-950/90 via-slate-950 to-slate-950 text-emerald-100';
      case 'obsidian':
        return 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-slate-100';
      case 'platinum':
        return 'bg-gradient-to-b from-sky-950/90 via-slate-950 to-slate-950 text-cyan-100';
    }
  };

  const photoToUse = customPhoto || selectedPlayer?.photoUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400';

  // Real canvas download implementation
  const handleDownload = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setDownloading(false);
      return;
    }

    // Draw background
    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    if (theme === 'gold') {
      grad.addColorStop(0, '#1c1305');
      grad.addColorStop(0.3, '#0b0f19');
      grad.addColorStop(1, '#05070d');
    } else if (theme === 'crimson') {
      grad.addColorStop(0, '#25080c');
      grad.addColorStop(0.3, '#0b0f19');
      grad.addColorStop(1, '#05070d');
    } else if (theme === 'emerald') {
      grad.addColorStop(0, '#041f17');
      grad.addColorStop(0.3, '#0b0f19');
      grad.addColorStop(1, '#05070d');
    } else if (theme === 'platinum') {
      grad.addColorStop(0, '#041d2a');
      grad.addColorStop(0.3, '#0b0f19');
      grad.addColorStop(1, '#05070d');
    } else {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.3, '#090d16');
      grad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 700, 1000);

    // Draw Outer Border
    ctx.strokeStyle = theme === 'gold' ? '#f59e0b' : theme === 'crimson' ? '#f43f5e' : theme === 'emerald' ? '#10b981' : theme === 'platinum' ? '#06b6d4' : '#64748b';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 660, 960);

    // Draw Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BD POWER STRIKERS CLUB', 350, 70);

    // Draw Badge Tag
    ctx.fillStyle = theme === 'gold' ? '#f59e0b' : '#38bdf8';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`★ ${badgeTag} ★`, 350, 98);

    // Rating & Position Left Top
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 80px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(selectedPlayer?.rating || 90), 60, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText(selectedPlayer?.position || 'CF', 65, 240);

    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`#${selectedPlayer?.jerseyNumber || 10}`, 65, 270);
    ctx.fillText('BANGLADESH 🇧🇩', 65, 300);

    // Draw Player Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoToUse;
    img.onload = () => {
      ctx.save();
      // Circle or rounded clip
      ctx.beginPath();
      ctx.arc(430, 250, 140, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 290, 110, 280, 280);
      ctx.restore();

      // Image border
      ctx.beginPath();
      ctx.arc(430, 250, 140, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Draw Player Name
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText(selectedPlayer?.gamingName || 'PLAYER', 350, 470);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 20px system-ui, sans-serif';
      ctx.fillText(selectedPlayer?.name || '', 350, 505);

      // Draw Separator
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 530);
      ctx.lineTo(620, 530);
      ctx.stroke();

      // Stats Matrix
      const statsList = [
        { label: 'PAC', val: pac },
        { label: 'SHO', val: sho },
        { label: 'PAS', val: pas },
        { label: 'DRI', val: dri },
        { label: 'DEF', val: def },
        { label: 'PHY', val: phy },
      ];

      ctx.font = 'bold 24px system-ui, sans-serif';
      statsList.forEach((st, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col === 0 ? 220 : 480;
        const y = 600 + row * 60;

        ctx.textAlign = 'right';
        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 32px system-ui, sans-serif';
        ctx.fillText(String(st.val), x - 20, y);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText(st.label, x, y - 4);
      });

      // Bottom Bar
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(80, 780);
      ctx.lineTo(620, 780);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`CAREER: ${selectedPlayer?.totalMatches || 0} MATCHES • ${selectedPlayer?.goals || 0} GOALS • ${selectedPlayer?.winRate || 0}% WIN RATE`, 350, 830);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('BDPSC OFFICIAL eFOOTBALL DIGITAL CARD • VERIFIED 2026', 350, 880);

      // Download trigger
      const link = document.createElement('a');
      link.download = `BDPSC_Card_${selectedPlayer?.gamingName || 'Player'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };

    img.onerror = () => {
      // Fallback if image fails to load
      const link = document.createElement('a');
      link.download = `BDPSC_Card_${selectedPlayer?.gamingName || 'Player'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            DIGITAL PLAYER CARD GENERATOR
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Craft high-resolution eFootball player cards with official BDPSC badges, custom stats, and instant PNG export.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER: INTERACTIVE CARD PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* THE CARD CONTAINER */}
          <div
            id="bdpsc-digital-card"
            className={`w-full max-w-[360px] aspect-[1/1.45] rounded-3xl p-1 bg-gradient-to-br shadow-2xl transition-all duration-300 relative overflow-hidden ${getThemeGradient(theme)}`}
          >
            <div className={`w-full h-full rounded-[22px] p-5 flex flex-col justify-between relative overflow-hidden ${getCardInnerBg(theme)}`}>
              {/* Card Watermark */}
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Top: Club Brand & Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-black text-amber-400 text-[10px]">
                      BD
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-white">
                    BDPSC eFOOTBALL
                  </span>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/40 border border-white/20 tracking-wider">
                  {badgeTag}
                </span>
              </div>

              {/* Card Upper: OVR & Image */}
              <div className="flex items-center justify-between my-2 relative z-10">
                {/* OVR Column */}
                <div className="text-center pl-1">
                  <span className="text-5xl font-black font-mono leading-none tracking-tighter text-amber-400 block">
                    {selectedPlayer?.rating || 90}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider block text-white mt-1">
                    {selectedPlayer?.position || 'CF'}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-2">
                    #{selectedPlayer?.jerseyNumber || 10}
                  </div>
                  <div className="text-base mt-1" title="Bangladesh">
                    🇧🇩
                  </div>
                </div>

                {/* Player Photo with Glow */}
                <div className="relative">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl bg-slate-900">
                    <img
                      src={photoToUse}
                      alt={selectedPlayer?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Card Middle: Names */}
              <div className="text-center my-1 relative z-10">
                <h3 className="text-xl font-black text-white tracking-tight uppercase leading-tight">
                  {selectedPlayer?.gamingName || 'PLAYER'}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  {selectedPlayer?.name || 'BDPSC Athlete'}
                </p>
              </div>

              {/* Card Lower: eFootball 6 Attributes */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-xs font-bold relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-black">{pac}</span>
                  <span className="text-slate-300 text-[10px]">PAC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-black">{dri}</span>
                  <span className="text-slate-300 text-[10px]">DRI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-black">{sho}</span>
                  <span className="text-slate-300 text-[10px]">SHO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-black">{def}</span>
                  <span className="text-slate-300 text-[10px]">DEF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-black">{pas}</span>
                  <span className="text-slate-300 text-[10px]">PAS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-black">{phy}</span>
                  <span className="text-slate-300 text-[10px]">PHY</span>
                </div>
              </div>

              {/* Card Footer: Career Summary */}
              <div className="text-center pt-2 border-t border-white/10 text-[9px] font-semibold text-slate-400 flex items-center justify-between relative z-10">
                <span>{selectedPlayer?.totalMatches || 0} MATCHES</span>
                <span>•</span>
                <span>{selectedPlayer?.goals || 0} GOALS</span>
                <span>•</span>
                <span>{selectedPlayer?.winRate || 0}% WIN</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-6 w-full max-w-[360px]">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'RENDERING...' : 'DOWNLOAD PNG CARD'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-colors"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* RIGHT: CUSTOMIZATION STUDIO CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Card Customization Studio
            </h2>
          </div>

          {/* 1. Select Squad Player */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase">
              1. Choose Squad Member
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => handlePlayerChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.gamingName} ({p.name}) — #{p.jerseyNumber} • {p.position} • OVR {p.rating}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Theme Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase">
              2. Holographic Card Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'gold', label: 'Gold Premier', color: 'from-amber-400 to-amber-600' },
                { id: 'crimson', label: 'Striker Red', color: 'from-red-500 to-rose-700' },
                { id: 'emerald', label: 'BD Emerald', color: 'from-emerald-400 to-teal-700' },
                { id: 'obsidian', label: 'Stealth Black', color: 'from-slate-700 to-slate-950' },
                { id: 'platinum', label: 'Cyber Blue', color: 'from-cyan-400 to-blue-600' },
              ].map(th => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id as CardTheme)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    theme === th.id
                      ? 'border-amber-400 bg-slate-800 shadow-md ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`w-full h-3 rounded-md bg-gradient-to-r ${th.color} mb-1.5`}></div>
                  <span className="text-[10px] font-bold text-white block truncate">{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Badge Tag Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase">
              3. Special Card Badge
            </label>
            <div className="flex flex-wrap gap-2">
              {['NATIONAL CHAMPION', 'PLAYER OF THE MONTH', 'GOLDEN BOOT', 'ICONIC MOMENT', 'CAPTAIN', 'PRO SPECTRE'].map(b => (
                <button
                  key={b}
                  onClick={() => setBadgeTag(b)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    badgeTag === b
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Custom Photo URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase">
              4. Custom Photo (Optional URL)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customPhoto}
                onChange={(e) => setCustomPhoto(e.target.value)}
                placeholder="Paste direct image URL to replace photo..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              {customPhoto && (
                <button
                  onClick={() => setCustomPhoto('')}
                  className="p-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* 5. eFootball Attribute Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase">
                5. Attribute Sliders
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">Tweak PAC, SHO, PAS, DRI, DEF, PHY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Pace (PAC)', val: pac, set: setPac },
                { label: 'Shooting (SHO)', val: sho, set: setSho },
                { label: 'Passing (PAS)', val: pas, set: setPas },
                { label: 'Dribbling (DRI)', val: dri, set: setDri },
                { label: 'Defending (DEF)', val: def, set: setDef },
                { label: 'Physical (PHY)', val: phy, set: setPhy },
              ].map(attr => (
                <div key={attr.label} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 text-[11px]">{attr.label}</span>
                    <span className="text-amber-400 font-mono font-bold">{attr.val}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={attr.val}
                    onChange={(e) => attr.set(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
