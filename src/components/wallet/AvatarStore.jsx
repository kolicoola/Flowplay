import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ShoppingBag, X, Check, Lock, Type, Palette, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  AVATAR_BACKGROUNDS, FONTS, LETTER_COLORS, HAIRSTYLES, SITE_BACKGROUNDS,
  getAvatarBgStyle, getFontStyle, getLetterColorStyle, getAvatarStyle
} from "./avatarUtils";

export { getAvatarBgStyle, AVATAR_BACKGROUNDS } from "./avatarUtils";

const TABS = [
  { id: "backgrounds", label: "Avatar BG",    icon: ShoppingBag },
  { id: "fonts",       label: "Fonts",         icon: Type },
  { id: "lettercolor", label: "Letter",        icon: Palette },
  { id: "hair",        label: "Hair",          icon: Sparkles },
  { id: "sitebg",      label: "Site BG",       icon: Globe },
];

export default function AvatarStore({ wallet, onClose, onRefresh }) {
  const [tab, setTab] = useState("backgrounds");
  const [buying, setBuying] = useState(null);

  const owned = wallet.owned_backgrounds || [];
  const ownedFonts = wallet.owned_fonts || [];
  const ownedLetterColors = wallet.owned_letter_colors || [];
  const ownedHairs = wallet.owned_hairs || [];
  const ownedSiteBgs = wallet.owned_site_backgrounds || [];
  const current = wallet.avatar_background || "default";
  const currentFont = wallet.avatar_font || "default";
  const currentLetterColor = wallet.avatar_letter_color || "default";
  const currentHair = wallet.avatar_hair || "none";
  const currentSiteBg = wallet.site_background || "default";

  const buy = async (field, ownedField, id, price, label, extraFields = {}) => {
    if (wallet.balance < price) { toast.error(`You need $${price} to buy this.`); return; }
    setBuying(id);
    const currentOwned = wallet[ownedField] || [];
    const newOwned = [...new Set([...currentOwned, id])];
    await base44.entities.Wallet.update(wallet.id, {
      balance: wallet.balance - price,
      [ownedField]: newOwned,
      [field]: id,
      ...extraFields,
    });
    toast.success(`"${label}" unlocked & equipped!`);
    setBuying(null);
    onRefresh();
  };

  const equip = async (field, id, label) => {
    setBuying(id);
    await base44.entities.Wallet.update(wallet.id, { [field]: id });
    toast.success(`"${label}" equipped!`);
    setBuying(null);
    onRefresh();
  };

  const letterStyle = getLetterColorStyle(currentLetterColor);
  const avatarBgForPreview = getAvatarBgStyle(current, wallet.avatar_color);
  const fontStyleForPreview = getFontStyle(currentFont);
  const hairEmoji = HAIRSTYLES.find(h => h.id === currentHair)?.emoji;

  function AvatarPreview({ bgStyle, fontStyle, lcStyle, hair, size = "w-14 h-14" }) {
    return (
      <div className="relative inline-flex flex-col items-center">
        {hair && <span className="text-lg absolute -top-3 left-1/2 -translate-x-1/2 z-10">{hair}</span>}
        <div className={`${size} rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg`}
          style={{ ...bgStyle, ...fontStyle }}>
          <span style={lcStyle}>{wallet.username?.[0]?.toUpperCase()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-400" />
            <h2 className="text-white font-bold text-lg">Avatar Store</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm font-mono">$<span className="text-white font-bold">{wallet.balance?.toFixed(2)}</span></span>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-1 border-b border-white/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${tab === t.id ? "bg-violet-500/20 text-violet-400" : "text-slate-500 hover:text-slate-300"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Avatar Backgrounds */}
        {tab === "backgrounds" && (
          <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3">
            {[...AVATAR_BACKGROUNDS].sort((a, b) => a.price - b.price).map(bg => {
              const isOwned = owned.includes(bg.id) || bg.price === 0;
              const isEquipped = current === bg.id;
              const isLoading = buying === bg.id;
              const canAfford = wallet.balance >= bg.price;
              const bgStyle = bg.id === "default" ? { backgroundColor: wallet.avatar_color || "#6366f1" } : bg.style;
              return (
                <motion.button key={bg.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  disabled={!!buying}
                  onClick={() => isOwned ? equip("avatar_background", bg.id, bg.label) : buy("avatar_background", "owned_backgrounds", bg.id, bg.price, bg.label)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isEquipped ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <AvatarPreview bgStyle={bgStyle} fontStyle={fontStyleForPreview} lcStyle={letterStyle} hair={hairEmoji} />
                  <span className="text-white text-xs font-medium text-center leading-tight">{bg.label}</span>
                  {isEquipped ? <span className="text-violet-400 text-xs flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> On</span>
                    : isOwned ? <span className="text-emerald-400 text-xs font-semibold">Equip</span>
                    : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>${bg.price}</span>}
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Fonts */}
        {tab === "fonts" && (
          <div className="overflow-y-auto p-4 space-y-3">
            {[...FONTS].sort((a, b) => a.price - b.price).map(font => {
              const isOwned = ownedFonts.includes(font.id) || font.price === 0;
              const isEquipped = currentFont === font.id;
              const isLoading = buying === font.id;
              const canAfford = wallet.balance >= font.price;
              const fontStyle = getFontStyle(font.id);
              return (
                <motion.button key={font.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  disabled={!!buying}
                  onClick={() => isOwned ? equip("avatar_font", font.id, font.label) : buy("avatar_font", "owned_fonts", font.id, font.price, font.label)}
                  className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isEquipped ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="relative inline-flex flex-col items-center flex-shrink-0">
                    {hairEmoji && <span className="text-sm absolute -top-3 left-1/2 -translate-x-1/2">{hairEmoji}</span>}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg"
                      style={{ ...avatarBgForPreview, ...fontStyle, fontWeight: fontStyle.fontWeight || "bold" }}>
                      <span style={letterStyle}>{wallet.username?.[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold" style={fontStyle}>{font.label}</p>
                    <p className="text-slate-400 text-sm" style={fontStyle}>The quick brown fox</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isEquipped ? <span className="text-violet-400 text-xs flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> On</span>
                      : isOwned ? <span className="text-emerald-400 text-xs font-semibold">Equip</span>
                      : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>${font.price}</span>}
                  </div>
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Letter Colors */}
        {tab === "lettercolor" && (
          <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3">
            {[...LETTER_COLORS].sort((a, b) => a.price - b.price).map(lc => {
              const isOwned = ownedLetterColors.includes(lc.id) || lc.price === 0;
              const isEquipped = currentLetterColor === lc.id;
              const isLoading = buying === lc.id;
              const canAfford = wallet.balance >= lc.price;
              const lcStyle = getLetterColorStyle(lc.id);
              return (
                <motion.button key={lc.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  disabled={!!buying}
                  onClick={() => isOwned ? equip("avatar_letter_color", lc.id, lc.label) : buy("avatar_letter_color", "owned_letter_colors", lc.id, lc.price, lc.label)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isEquipped ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="relative inline-flex flex-col items-center">
                    {hairEmoji && <span className="text-base absolute -top-3 left-1/2 -translate-x-1/2">{hairEmoji}</span>}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg"
                      style={{ ...avatarBgForPreview, ...fontStyleForPreview }}>
                      <span style={lcStyle}>{wallet.username?.[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="text-white text-xs font-medium text-center leading-tight">{lc.label}</span>
                  {isEquipped ? <span className="text-violet-400 text-xs flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> On</span>
                    : isOwned ? <span className="text-emerald-400 text-xs font-semibold">Equip</span>
                    : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>${lc.price}</span>}
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Hairstyles */}
        {tab === "hair" && (
          <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3">
            {[...HAIRSTYLES].sort((a, b) => a.price - b.price).map(hair => {
              const isOwned = ownedHairs.includes(hair.id) || hair.price === 0;
              const isEquipped = currentHair === hair.id;
              const isLoading = buying === hair.id;
              const canAfford = wallet.balance >= hair.price;
              return (
                <motion.button key={hair.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  disabled={!!buying}
                  onClick={() => isOwned ? equip("avatar_hair", hair.id, hair.label) : buy("avatar_hair", "owned_hairs", hair.id, hair.price, hair.label)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isEquipped ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="relative inline-flex flex-col items-center mt-3">
                    {hair.emoji && <span className="text-xl absolute -top-4 left-1/2 -translate-x-1/2 z-10">{hair.emoji}</span>}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg"
                      style={{ ...avatarBgForPreview, ...fontStyleForPreview }}>
                      <span style={letterStyle}>{wallet.username?.[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="text-white text-xs font-medium text-center leading-tight">{hair.label}</span>
                  {isEquipped ? <span className="text-violet-400 text-xs flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> On</span>
                    : isOwned ? <span className="text-emerald-400 text-xs font-semibold">Equip</span>
                    : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>{hair.price === 0 ? "Free" : `$${hair.price}`}</span>}
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Site Backgrounds */}
        {tab === "sitebg" && (
          <div className="overflow-y-auto p-4 space-y-3">
            {[...SITE_BACKGROUNDS].sort((a, b) => a.price - b.price).map(bg => {
              const isOwned = ownedSiteBgs.includes(bg.id) || bg.price === 0;
              const isEquipped = currentSiteBg === bg.id;
              const isLoading = buying === bg.id;
              const canAfford = wallet.balance >= bg.price;
              return (
                <motion.button key={bg.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  disabled={!!buying}
                  onClick={() => isOwned ? equip("site_background", bg.id, bg.label) : buy("site_background", "owned_site_backgrounds", bg.id, bg.price, bg.label)}
                  className={`relative w-full flex items-center gap-4 p-3 rounded-2xl border transition-all ${isEquipped ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  {/* Preview swatch */}
                  <div className="w-16 h-10 rounded-xl flex-shrink-0 shadow-inner" style={bg.style} />
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-sm">{bg.label}</p>
                    <p className="text-slate-500 text-xs">Page background</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isEquipped ? <span className="text-violet-400 text-xs flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> On</span>
                      : isOwned ? <span className="text-emerald-400 text-xs font-semibold">Equip</span>
                      : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>{bg.price === 0 ? "Free" : `$${bg.price}`}</span>}
                  </div>
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}