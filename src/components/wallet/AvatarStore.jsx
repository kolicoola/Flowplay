import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ShoppingBag, X, Check, Lock, Type, Palette, Globe, Gem, Brush, FlaskConical, Gauge, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  AVATAR_BACKGROUNDS, FONTS, LETTER_COLORS, SITE_BACKGROUNDS, STORE_PACKAGES,
  getAvatarBgStyle, getFontStyle, getLetterColorStyle, getAvatarStyle, HairOverlay
} from "./avatarUtils";
import { UPGRADE_DEFS, purchaseUpgrade, getUpgradeEffects } from "./upgradeEffects";

export { getAvatarBgStyle, AVATAR_BACKGROUNDS } from "./avatarUtils";

const TABS = [
  { id: "items",       label: "Items",         icon: Gem },
  { id: "backgrounds", label: "Avatar BG",    icon: ShoppingBag },
  { id: "fonts",       label: "Fonts",         icon: Type },
  { id: "lettercolor", label: "Letter",        icon: Palette },
  { id: "sitebg",      label: "Site BG",       icon: Globe },
  { id: "packages",    label: "Packages",      icon: Gem },
];

const STORE_ITEM_CARDS = [
  {
    id: "lucky_15m",
    title: "Lucky Potion",
    subtitle: "15m",
    icon: FlaskConical,
    theme: "from-violet-500 to-indigo-700",
    kind: "timed_lucky",
  },
  {
    id: "speed_15m",
    title: "OverSpeed",
    subtitle: "15m",
    icon: Gauge,
    theme: "from-sky-500 to-blue-700",
    kind: "timed_speed",
  },
  {
    id: "friendship_10",
    title: "Companies",
    subtitle: "15m",
    icon: Building2,
    theme: "from-orange-500 to-rose-700",
    kind: "timed_friendship",
  },
  {
    id: "tips_500_30",
    title: "+500 / 30s",
    subtitle: "Forever",
    icon: Gem,
    theme: "from-emerald-500 to-green-700",
    kind: "tips",
  },
  {
    id: "tips_200_35",
    title: "+200 / 35s",
    subtitle: "Forever",
    icon: Gem,
    theme: "from-lime-500 to-emerald-700",
    kind: "tips",
  },
];

export default function AvatarStore({ wallet, onClose, onRefresh }) {
  const [tab, setTab] = useState("items");
  const [buying, setBuying] = useState(null);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(10);
  const [itemRows, setItemRows] = useState([]);
  const [itemNow, setItemNow] = useState(Date.now());
  const [itemBalance, setItemBalance] = useState(Number(wallet.balance) || 0);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const itemEffects = getUpgradeEffects(itemRows, itemNow);

  const loadStoreItems = async () => {
    const rows = await base44.entities.Upgrade.filter({ wallet_id: wallet.id });
    setItemRows(rows);
    return rows;
  };

  useEffect(() => {
    setItemBalance(Number(wallet.balance) || 0);
  }, [wallet.balance]);

  useEffect(() => {
    if (tab !== "items") return;
    loadStoreItems();
  }, [tab, wallet.id]);

  useEffect(() => {
    if (tab !== "items") return;
    const t = setInterval(() => setItemNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [tab]);

  const isItemActivated = (item) => {
    if (item.kind === "timed_lucky") return Boolean(itemEffects?.luckyActive);
    if (item.kind === "timed_speed") return Boolean(itemEffects?.speedActive);
    if (item.kind === "timed_friendship") return Boolean(itemEffects?.friendshipActive);
    if (item.kind === "tips") return (itemEffects?.tipGenerators || []).some((t) => t.id === item.id);
    return false;
  };

  const itemTimeLeft = (item) => {
    const fmt = (ms) => {
      const totalSec = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}m ${s}s`;
    };
    if (item.kind === "timed_lucky") return fmt(Math.max(0, Number(itemEffects?.luckyUntil || 0) - itemNow));
    if (item.kind === "timed_speed") return fmt(Math.max(0, Number(itemEffects?.speedUntil || 0) - itemNow));
    if (item.kind === "timed_friendship") return fmt(Math.max(0, Number(itemEffects?.friendshipUntil || 0) - itemNow));
    return null;
  };

  const handleBuyStoreItem = async (item) => {
    const def = UPGRADE_DEFS[item.id];
    if (!def) return;
    if (isItemActivated(item)) {
      toast.error("Already activated");
      return;
    }
    if (itemBalance < def.cost) {
      toast.error(`You need $${def.cost.toLocaleString()} to buy this.`);
      return;
    }

    setBuying(item.id);
    try {
      await purchaseUpgrade(wallet.id, item.id);
      setItemBalance((prev) => Math.max(0, prev - def.cost));
      await Promise.all([onRefresh?.(), loadStoreItems()]);
      toast.success(`${item.title} activated`);
    } catch (error) {
      toast.error(error?.message || "Could not activate item");
    } finally {
      setBuying(null);
    }
  };

  const owned = wallet.owned_backgrounds || [];
  const ownedFonts = wallet.owned_fonts || [];
  const ownedLetterColors = wallet.owned_letter_colors || [];
  const ownedSiteBgs = wallet.owned_site_backgrounds || [];
  const ownedPackages = wallet.owned_packages || [];
  const current = wallet.avatar_background || "default";
  const currentFont = wallet.avatar_font || "default";
  const currentLetterColor = wallet.avatar_letter_color || "default";
  const currentHair = wallet.avatar_hair || "none";
  const currentSiteBg = wallet.site_background || "default";
  const localCustomBgKey = `flowplay_custom_bg_${wallet.id}`;
  const customSiteBackground = wallet.site_background_custom || localStorage.getItem(localCustomBgKey) || null;

  const isMissingColumnError = (error, columnName) => {
    const msg = String(error?.message || "").toLowerCase();
    return msg.includes("column") && msg.includes(columnName.toLowerCase());
  };

  const isPackageOwned = (pkg) => {
    if (ownedPackages.includes(pkg.id)) return true;
    const hasFonts = (pkg.fontUnlocks || []).every((id) => ownedFonts.includes(id));
    const hasAvatar = (pkg.avatarBgUnlocks || []).every((id) => owned.includes(id));
    const hasSite = (pkg.siteBgUnlocks || []).every((id) => ownedSiteBgs.includes(id));
    return hasFonts && hasAvatar && hasSite;
  };

  const buy = async (field, ownedField, id, price, label, extraFields = {}) => {
    if (wallet.balance < price) { toast.error(`You need $${price} to buy this.`); return; }
    setBuying(id);
    const currentOwned = wallet[ownedField] || [];
    const newOwned = [...new Set([...currentOwned, id])];
    try {
      await base44.entities.Wallet.update(wallet.id, {
        balance: wallet.balance - price,
        [ownedField]: newOwned,
        [field]: id,
        ...extraFields,
      });
      toast.success(`"${label}" unlocked & equipped!`);
      onRefresh();
    } catch (error) {
      toast.error(`Purchase failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  const buyPackage = async (pkg) => {
    if (wallet.balance < pkg.price) {
      toast.error(`You need $${pkg.price} to buy this package.`);
      return;
    }
    setBuying(pkg.id);
    const nextPackages = [...new Set([...(wallet.owned_packages || []), pkg.id])];
    const nextFonts = [...new Set([...(wallet.owned_fonts || []), ...(pkg.fontUnlocks || [])])];
    const nextAvatarBgs = [...new Set([...(wallet.owned_backgrounds || []), ...(pkg.avatarBgUnlocks || [])])];
    const nextSiteBgs = [...new Set([...(wallet.owned_site_backgrounds || []), ...(pkg.siteBgUnlocks || [])])];
    try {
      try {
        await base44.entities.Wallet.update(wallet.id, {
          balance: wallet.balance - pkg.price,
          owned_packages: nextPackages,
          owned_fonts: nextFonts,
          owned_backgrounds: nextAvatarBgs,
          owned_site_backgrounds: nextSiteBgs,
          ...(pkg.autoEquip || {}),
        });
      } catch (error) {
        if (!isMissingColumnError(error, "owned_packages")) throw error;
        // Backward-compatible fallback if DB migration has not added `owned_packages` yet.
        await base44.entities.Wallet.update(wallet.id, {
          balance: wallet.balance - pkg.price,
          owned_fonts: nextFonts,
          owned_backgrounds: nextAvatarBgs,
          owned_site_backgrounds: nextSiteBgs,
          ...(pkg.autoEquip || {}),
        });
      }
      toast.success(`${pkg.label} unlocked!`);
      onRefresh();
    } catch (error) {
      toast.error(`Package purchase failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  useEffect(() => {
    if (!showDrawModal || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (customSiteBackground) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = customSiteBackground;
    }
  }, [showDrawModal, customSiteBackground]);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getCanvasPoint(event);
  };

  const draw = (event) => {
    if (!drawingRef.current || !canvasRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const point = getCanvasPoint(event);
    const last = lastPointRef.current || point;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCustomBackground = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBuying("custom-canvas-save");
    const image = canvas.toDataURL("image/png");
    const newOwnedSiteBgs = [...new Set([...(wallet.owned_site_backgrounds || []), "custom_canvas"])];
    try {
      try {
        await base44.entities.Wallet.update(wallet.id, {
          site_background: "custom_canvas",
          site_background_custom: image,
          owned_site_backgrounds: newOwnedSiteBgs,
        });
      } catch (error) {
        if (!isMissingColumnError(error, "site_background_custom")) throw error;
        // Backward-compatible fallback: keep custom image locally if DB column is unavailable.
        localStorage.setItem(localCustomBgKey, image);
        await base44.entities.Wallet.update(wallet.id, {
          site_background: "custom_canvas",
          owned_site_backgrounds: newOwnedSiteBgs,
        });
      }
      setShowDrawModal(false);
      toast.success("Your custom site background is live!");
      onRefresh();
    } catch (error) {
      toast.error(`Save failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  const equip = async (field, id, label) => {
    setBuying(id);
    try {
      await base44.entities.Wallet.update(wallet.id, { [field]: id });
      toast.success(`"${label}" equipped!`);
      onRefresh();
    } catch (error) {
      toast.error(`Equip failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  const letterStyle = getLetterColorStyle(currentLetterColor);
  const avatarBgForPreview = getAvatarBgStyle(current, wallet.avatar_color);
  const fontStyleForPreview = getFontStyle(currentFont);
  function AvatarPreview({ bgStyle, fontStyle, lcStyle, hairId, size = "w-14 h-14" }) {
    return (
      <div className="relative inline-flex flex-col items-center">
        <HairOverlay hairId={hairId} size="md" />
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
            <h2 className="text-white font-bold text-lg">Store</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm font-mono">$<span className="text-white font-bold">{itemBalance.toFixed(2)}</span></span>
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

        {/* Items */}
        {tab === "items" && (
          <div className="overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STORE_ITEM_CARDS.map((item, idx) => {
                const def = UPGRADE_DEFS[item.id];
                const active = isItemActivated(item);
                const isLoading = buying === item.id;
                const canAfford = itemBalance >= Number(def?.cost || 0);
                const timeLeft = itemTimeLeft(item);
                const showActivated = item.kind === "tips" ? active : active && !!timeLeft;
                const label = showActivated ? "Activated" : `$${Number(def?.cost || 0).toLocaleString()}`;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!!buying || active || !canAfford}
                    onClick={() => handleBuyStoreItem(item)}
                    className={`relative aspect-square rounded-2xl border border-white/20 bg-gradient-to-br ${item.theme} p-3 text-left overflow-hidden ${active ? "opacity-95" : ""}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.3)_0,rgba(255,255,255,0.3)_6px,transparent_7px),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.2)_0,rgba(255,255,255,0.2)_14px,transparent_15px),radial-gradient(circle_at_84%_76%,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_24px,transparent_25px)]" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-between text-center">
                      <div className="pt-1" />
                      <item.icon className="w-7 h-7 text-white drop-shadow" />
                      <div>
                        <p className="text-white font-extrabold text-sm leading-tight">{item.title}</p>
                        <p className="text-white/85 text-[11px] mt-1">{active && timeLeft ? timeLeft : item.subtitle}</p>
                      </div>
                      <div className={`w-full rounded-md py-1.5 text-[11px] font-black ${showActivated ? "bg-white text-emerald-700" : canAfford ? "bg-white text-slate-900" : "bg-black/30 text-white/60"}`}>
                        {isLoading ? "..." : label}
                      </div>
                    </div>
                    {!active && !canAfford && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-white/70" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

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
                  <AvatarPreview bgStyle={bgStyle} fontStyle={fontStyleForPreview} lcStyle={letterStyle} hairId={currentHair} />
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
                    <HairOverlay hairId={currentHair} size="md" />
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
                    <HairOverlay hairId={currentHair} size="md" />
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

        {/* Site Backgrounds */}
        {tab === "sitebg" && (
          <div className="overflow-y-auto p-4 space-y-3">
            {[...SITE_BACKGROUNDS].sort((a, b) => a.price - b.price).map(bg => {
              const isOwned = ownedSiteBgs.includes(bg.id) || bg.price === 0;
              const isEquipped = currentSiteBg === bg.id;
              const isLoading = buying === bg.id;
              const canAfford = wallet.balance >= bg.price;
              const isCustomCanvas = bg.id === "custom_canvas";
              const previewStyle = isCustomCanvas && customSiteBackground
                ? { backgroundImage: `url(${customSiteBackground})`, backgroundSize: "cover", backgroundPosition: "center" }
                : bg.style;
              return (
                <motion.button key={bg.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  disabled={!!buying}
                  onClick={() => {
                    if (isOwned && isCustomCanvas) {
                      setShowDrawModal(true);
                      return;
                    }
                    if (isOwned) {
                      equip("site_background", bg.id, bg.label);
                      return;
                    }
                    buy("site_background", "owned_site_backgrounds", bg.id, bg.price, bg.label);
                  }}
                  className={`relative w-full flex items-center gap-4 p-3 rounded-2xl border transition-all ${isEquipped ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  {/* Preview swatch */}
                  <div className="w-16 h-10 rounded-xl flex-shrink-0 shadow-inner" style={previewStyle} />
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-sm">{bg.label}</p>
                    <p className="text-slate-500 text-xs">{isCustomCanvas ? "Draw your own background" : "Page background"}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isEquipped ? <span className="text-violet-400 text-xs flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> On</span>
                      : isOwned ? <span className="text-emerald-400 text-xs font-semibold">{isCustomCanvas ? "Draw" : "Equip"}</span>
                      : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>{bg.price === 0 ? "Free" : `$${bg.price}`}</span>}
                  </div>
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Packages */}
        {tab === "packages" && (
          <div className="overflow-y-auto p-4 space-y-3">
            {[...STORE_PACKAGES].sort((a, b) => a.price - b.price).map(pkg => {
              const isOwned = isPackageOwned(pkg);
              const isLoading = buying === pkg.id;
              const canAfford = wallet.balance >= pkg.price;
              return (
                <motion.button key={pkg.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  disabled={!!buying || isOwned}
                  onClick={() => buyPackage(pkg)}
                  className={`relative w-full text-left p-4 rounded-2xl border transition-all ${isOwned ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{pkg.label}</p>
                      <p className="text-slate-400 text-xs mt-1">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      {isOwned
                        ? <span className="text-emerald-400 text-xs font-semibold">Owned</span>
                        : <span className={`text-xs font-bold font-mono ${canAfford ? "text-amber-300" : "text-slate-500"}`}>${pkg.price}</span>}
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500">
                    Includes: {pkg.fontUnlocks.length} font, {pkg.avatarBgUnlocks.length} avatar BG, {pkg.siteBgUnlocks.length} site BG
                  </div>
                  {isLoading && <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {!isOwned && !canAfford && <div className="absolute top-2 right-2"><Lock className="w-3 h-3 text-slate-600" /></div>}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {showDrawModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setShowDrawModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-white font-bold text-base flex items-center gap-2"><Brush className="w-4 h-4 text-cyan-300" /> Draw Your Background</h3>
              <button onClick={() => setShowDrawModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <label className="text-slate-300 text-xs">Color</label>
              <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-10 h-8 p-0 border-none bg-transparent" />
              <label className="text-slate-300 text-xs">Brush</label>
              <input type="range" min="2" max="30" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
              <span className="text-slate-400 text-xs">{brushSize}px</span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
              <canvas
                ref={canvasRef}
                width={1024}
                height={576}
                className="w-full aspect-video touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="mt-4 flex justify-between gap-3">
              <button onClick={clearCanvas} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm hover:bg-slate-700">Clear</button>
              <button
                onClick={saveCustomBackground}
                disabled={buying === "custom-canvas-save"}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 disabled:opacity-50"
              >
                {buying === "custom-canvas-save" ? "Saving..." : "Save & Equip"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}