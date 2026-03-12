// Shared avatar utility: apply background + font + letter color styles to avatar elements

export const FONTS = [
  { id: "default",    label: "Default",       price: 0,    fontFamily: "inherit" },
  { id: "mono",       label: "💻 Mono",        price: 100,  fontFamily: "'Courier New', monospace" },
  { id: "serif",      label: "📜 Serif",       price: 150,  fontFamily: "Georgia, serif" },
  { id: "rounded",    label: "🔵 Rounded",     price: 200,  fontFamily: "'Trebuchet MS', sans-serif" },
  { id: "thin",       label: "✨ Thin",         price: 250,  fontFamily: "inherit", fontWeight: "300" },
  { id: "heavy",      label: "💪 Heavy",       price: 300,  fontFamily: "inherit", fontWeight: "900" },
  { id: "fantasy",    label: "🧙 Fantasy",     price: 400,  fontFamily: "Palatino, 'Book Antiqua', serif" },
  { id: "typewriter", label: "⌨️ Typewriter",  price: 500,  fontFamily: "'Lucida Console', monospace" },
  { id: "elegant",    label: "🌸 Elegant",     price: 750,  fontFamily: "'Times New Roman', serif" },
  { id: "techno",     label: "🤖 Techno",      price: 1000, fontFamily: "'Arial Black', sans-serif" },
  { id: "cursive",    label: "✍️ Script",       price: 1200, fontFamily: "cursive" },
  { id: "impact",     label: "💣 Impact",       price: 1500, fontFamily: "Impact, 'Arial Narrow', sans-serif" },
  { id: "comic",      label: "💬 Comic",        price: 800,  fontFamily: "'Comic Sans MS', cursive" },
  { id: "narrow",     label: "📐 Narrow",       price: 350,  fontFamily: "'Arial Narrow', sans-serif", fontWeight: "700" },
  { id: "wide",       label: "📏 Wide",         price: 400,  fontFamily: "inherit", letterSpacing: "0.15em" },
  { id: "pixel",      label: "👾 Pixel",        price: 600,  fontFamily: "'Lucida Console', 'Courier New', monospace", fontWeight: "900" },
  { id: "diamond_serif", label: "💎 Diamond Serif", price: 85000, fontFamily: "'Times New Roman', serif", fontWeight: "700", letterSpacing: "0.08em" },
  { id: "duma_god",      label: "⚜ Duma God Font",  price: 250000, fontFamily: "'Impact', 'Arial Black', sans-serif", fontWeight: "900", letterSpacing: "0.12em" },
  { id: "obsidian_grotesk", label: "🖤 Obsidian Grotesk", price: 650000, fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: "900", letterSpacing: "0.05em" },
  { id: "royal_script", label: "👑 Royal Script", price: 900000, fontFamily: "'Palatino Linotype', 'Book Antiqua', serif", fontStyle: "italic", fontWeight: "700", letterSpacing: "0.07em" },
  { id: "neon_wire", label: "⚡ Neon Wire", price: 1100000, fontFamily: "'Lucida Console', 'Courier New', monospace", fontWeight: "700", letterSpacing: "0.18em" },
];

export function getFontStyle(fontId) {
  const found = FONTS.find(f => f.id === fontId);
  if (!found || found.id === "default") return {};
  const s = { fontFamily: found.fontFamily };
  if (found.fontWeight) s.fontWeight = found.fontWeight;
  if (found.fontStyle) s.fontStyle = found.fontStyle;
  if (found.letterSpacing) s.letterSpacing = found.letterSpacing;
  return s;
}

// Letter colors for the avatar initial
export const LETTER_COLORS = [
  { id: "default",  label: "⬜ White",      price: 0,    color: "#ffffff" },
  { id: "yellow",   label: "🟡 Yellow",     price: 80,   color: "#fbbf24" },
  { id: "cyan",     label: "🔵 Cyan",       price: 100,  color: "#22d3ee" },
  { id: "lime",     label: "🟢 Lime",       price: 120,  color: "#a3e635" },
  { id: "pink",     label: "🩷 Pink",       price: 150,  color: "#f472b6" },
  { id: "orange",   label: "🟠 Orange",     price: 150,  color: "#fb923c" },
  { id: "violet",   label: "🔮 Violet",     price: 200,  color: "#a78bfa" },
  { id: "red",      label: "🔴 Red",        price: 200,  color: "#f87171" },
  { id: "teal",     label: "🌊 Teal",       price: 250,  color: "#2dd4bf" },
  { id: "gold",     label: "✨ Gold",        price: 400,  color: "#fde047" },
  { id: "silver",   label: "🪙 Silver",     price: 500,  color: "#e2e8f0" },
  { id: "rainbow",  label: "🌈 Rainbow",    price: 800,  color: "linear" },
  { id: "fire",     label: "🔥 Fire",       price: 1000, color: "#ff6a00" },
  { id: "neon",     label: "⚡ Neon Green",  price: 1200, color: "#39ff14" },
  { id: "hologram", label: "🌀 Hologram",   price: 2000, color: "linear2" },
  { id: "mint",     label: "🌿 Mint",       price: 180,  color: "#6ee7b7" },
  { id: "sky",      label: "🩵 Sky Blue",   price: 130,  color: "#7dd3fc" },
  { id: "coral",    label: "🪸 Coral",      price: 160,  color: "#fb7185" },
  { id: "peach",    label: "🍑 Peach",      price: 140,  color: "#fdba74" },
  { id: "lavender", label: "💜 Lavender",   price: 220,  color: "#c4b5fd" },
  { id: "emerald",  label: "💚 Emerald",    price: 300,  color: "#34d399" },
  { id: "ice",      label: "🧊 Ice Blue",   price: 350,  color: "#bae6fd" },
  { id: "cherry",   label: "🍒 Cherry",     price: 280,  color: "#fb2c36" },
  { id: "cosmic",   label: "🪐 Cosmic",     price: 1500, color: "linear3" },
  { id: "sunburst", label: "🌞 Sunburst",   price: 2400, color: "linear4" },
  { id: "aether",   label: "🧿 Aether",     price: 3200, color: "linear5" },
  { id: "royal_ice",label: "❄️ Royal Ice",  price: 4800, color: "linear6" },
];

export function getLetterColorStyle(lcId) {
  const found = LETTER_COLORS.find(c => c.id === lcId);
  if (!found || found.id === "default") return { color: "#ffffff" };
  if (found.color === "linear") return { 
    background: "linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
  };
  if (found.color === "linear2") return {
    background: "linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
  };
  if (found.color === "linear3") return {
    background: "linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8, #34d399)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
  };
  if (found.color === "linear4") return {
    background: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444, #fde047)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
  };
  if (found.color === "linear5") return {
    background: "linear-gradient(135deg, #22d3ee, #3b82f6, #7c3aed, #ec4899)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
  };
  if (found.color === "linear6") return {
    background: "linear-gradient(135deg, #e0f2fe, #93c5fd, #60a5fa, #c4b5fd)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
  };
  return { color: found.color };
}

// Hairstyle overlays using layered shapes to resemble real hair silhouettes.
export const HAIRSTYLES = [
  { id: "none", label: "None", price: 0, variant: "none", tone: "natural" },
  { id: "pixie", label: "Pixie Cut", price: 80, variant: "pixie", tone: "natural" },
  { id: "short", label: "Short Cut", price: 100, variant: "short", tone: "natural" },
  { id: "medium", label: "Medium Cut", price: 130, variant: "medium", tone: "natural" },
  { id: "bob", label: "Classic Bob", price: 170, variant: "bob", tone: "natural" },
  { id: "long", label: "Long Hair", price: 220, variant: "long", tone: "natural" },
  { id: "wavy", label: "Wavy", price: 260, variant: "wavy", tone: "natural" },
  { id: "curly", label: "Curly", price: 300, variant: "curly", tone: "natural" },
  { id: "afro", label: "Afro", price: 350, variant: "afro", tone: "natural" },
  { id: "bun", label: "Bun", price: 280, variant: "bun", tone: "natural" },
  { id: "ponytail", label: "Ponytail", price: 300, variant: "ponytail", tone: "natural" },
  { id: "braids", label: "Braids", price: 360, variant: "braids", tone: "natural" },
  { id: "dreads", label: "Dreadlocks", price: 420, variant: "dreads", tone: "natural" },
  { id: "undercut", label: "Undercut", price: 460, variant: "undercut", tone: "dark" },
  { id: "mohawk", label: "Mohawk", price: 500, variant: "mohawk", tone: "natural" },
  { id: "spiky", label: "Spiky", price: 520, variant: "spiky", tone: "natural" },
  { id: "swept", label: "Swept Fringe", price: 600, variant: "swept", tone: "natural" },
  { id: "silver", label: "Silver Hair", price: 700, variant: "swept", tone: "silver" },
  { id: "golden", label: "Golden Blonde", price: 760, variant: "wavy", tone: "golden" },
  { id: "redhead", label: "Redhead", price: 720, variant: "long", tone: "red" },
  { id: "platinum", label: "Platinum", price: 900, variant: "long", tone: "platinum" },
  { id: "rainbow", label: "Rainbow Hair", price: 1200, variant: "swept", tone: "rainbow" },
  { id: "fire_top", label: "Fire Hair", price: 1400, variant: "mohawk", tone: "fire" },
  { id: "star", label: "Star Hair", price: 1800, variant: "spiky", tone: "golden" },
  { id: "godmode", label: "Mythic Hair", price: 2500, variant: "swept", tone: "rainbow" },
];

function getHairToneStyle(tone) {
  if (tone === "silver") return { background: "linear-gradient(180deg, #f1f5f9, #94a3b8)" };
  if (tone === "golden") return { background: "linear-gradient(180deg, #facc15, #ca8a04)" };
  if (tone === "red") return { background: "linear-gradient(180deg, #fb7185, #be123c)" };
  if (tone === "rainbow") return { background: "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7)" };
  if (tone === "platinum") return { background: "linear-gradient(180deg, #ffffff, #cbd5e1)" };
  if (tone === "violet") return { background: "linear-gradient(180deg, #7c3aed, #4c1d95)" };
  if (tone === "green") return { background: "linear-gradient(180deg, #86efac, #15803d)" };
  if (tone === "fire") return { background: "linear-gradient(180deg, #fbbf24, #f97316, #dc2626)" };
  if (tone === "dark") return { background: "linear-gradient(180deg, #334155, #0f172a)" };
  if (tone === "pink") return { background: "linear-gradient(180deg, #fbcfe8, #ec4899)" };
  if (tone === "brown") return { background: "linear-gradient(180deg, #d6a56f, #8b5a2b)" };
  return { background: "linear-gradient(180deg, #7c4a2f, #3b2418)" };
}

export function getHairStyleMeta(hairId) {
  return HAIRSTYLES.find(h => h.id === hairId) || HAIRSTYLES[0];
}

export function HairOverlay({ hairId, size = "md" }) {
  const hair = getHairStyleMeta(hairId);
  if (!hair || hair.variant === "none") return null;

  const toneStyle = getHairToneStyle(hair.tone);
  const scaleClass = size === "sm" ? "scale-90" : size === "lg" ? "scale-110" : "scale-100";
  const baseShape = "absolute left-1/2 -translate-x-1/2 z-10";

  if (hair.variant === "pixie") {
    return <span className={`${baseShape} -top-2 w-9 h-3 rounded-[55%_45%_45%_35%] ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "short" || hair.variant === "medium" || hair.variant === "bob" || hair.variant === "long") {
    const width = hair.variant === "short" ? "w-9" : hair.variant === "medium" ? "w-10" : hair.variant === "bob" ? "w-11" : "w-11";
    const height = hair.variant === "short" ? "h-4" : hair.variant === "medium" ? "h-5" : hair.variant === "bob" ? "h-5" : "h-6";
    const rounded = hair.variant === "bob" ? "rounded-[60%_40%_55%_45%]" : "rounded-t-[999px] rounded-b-[14px]";
    return <span className={`${baseShape} -top-2 ${width} ${height} ${rounded} ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "wavy") {
    return <span className={`${baseShape} -top-2 w-11 h-6 rounded-[60%_40%_70%_30%] ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "curly") {
    return <span className={`${baseShape} -top-2.5 w-10 h-6 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "afro") {
    return <span className={`${baseShape} -top-3 w-11 h-7 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "bun") {
    return (
      <>
        <span className={`${baseShape} -top-1.5 w-9 h-4 rounded-t-full rounded-b-lg ${scaleClass}`} style={toneStyle} />
        <span className={`${baseShape} -top-4 w-4 h-4 rounded-full ${scaleClass}`} style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "ponytail") {
    return (
      <>
        <span className={`${baseShape} -top-2 w-9 h-4 rounded-t-full rounded-b-lg ${scaleClass}`} style={toneStyle} />
        <span className={`absolute right-0 top-1 w-2 h-4 rounded-b-full z-10 ${scaleClass}`} style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "braids" || hair.variant === "dreads") {
    return (
      <>
        <span className={`${baseShape} -top-2 w-9 h-4 rounded-t-full rounded-b-lg ${scaleClass}`} style={toneStyle} />
        <span className="absolute -left-1 top-1.5 w-1.5 h-4 rounded-full z-10" style={toneStyle} />
        <span className="absolute -right-1 top-1.5 w-1.5 h-4 rounded-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "undercut") {
    return (
      <>
        <span className={`${baseShape} -top-1.5 w-10 h-3 rounded-[70%_30%_60%_40%] ${scaleClass}`} style={toneStyle} />
        <span className="absolute -left-2 top-0 w-3 h-3 rounded-full z-10 bg-slate-300/50" />
      </>
    );
  }

  if (hair.variant === "mohawk") {
    return <span className={`${baseShape} -top-3 w-4 h-7 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "spiky") {
    return (
      <>
        <span className={`${baseShape} -top-3 w-3 h-6 rounded-full ${scaleClass}`} style={toneStyle} />
        <span className="absolute left-0 -top-2 w-2 h-4 rounded-full z-10" style={toneStyle} />
        <span className="absolute right-0 -top-2 w-2 h-4 rounded-full z-10" style={toneStyle} />
      </>
    );
  }

  // Swept fringe silhouette inspired by stylized vector hair references.
  if (hair.variant === "swept") {
    return (
      <>
        <span className={`${baseShape} -top-3 w-12 h-7 ${scaleClass}`} style={{ ...toneStyle, clipPath: "polygon(4% 55%, 22% 30%, 55% 18%, 88% 30%, 98% 58%, 72% 50%, 56% 72%, 36% 78%, 16% 72%)" }} />
        <span className="absolute -left-2 top-0 w-5 h-6 z-10" style={{ ...toneStyle, clipPath: "polygon(20% 0%, 100% 24%, 70% 100%, 0% 58%)" }} />
        <span className="absolute -right-2 top-0 w-5 h-6 z-10" style={{ ...toneStyle, clipPath: "polygon(0% 24%, 80% 0%, 100% 58%, 30% 100%)" }} />
      </>
    );
  }

  return <span className={`${baseShape} -top-2 w-9 h-4 rounded-t-full rounded-b-lg ${scaleClass}`} style={toneStyle} />;
}

// Site backgrounds (full page background)
export const SITE_BACKGROUNDS = [
  { id: "default",    label: "Default",           price: 0,    style: { background: "linear-gradient(135deg, #020617, #1e1b4b, #2e1065)" } },
  { id: "slate",      label: "🌑 Dark Slate",      price: 100,  style: { background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)" } },
  { id: "emerald",    label: "🌿 Deep Forest",     price: 150,  style: { background: "linear-gradient(135deg, #052e16, #064e3b, #065f46)" } },
  { id: "crimson",    label: "🩸 Crimson Night",   price: 200,  style: { background: "linear-gradient(135deg, #1c0000, #450a0a, #7f1d1d)" } },
  { id: "navy",       label: "🌊 Deep Navy",       price: 200,  style: { background: "linear-gradient(135deg, #020617, #0c1445, #1e3a8a)" } },
  { id: "purple",     label: "🔮 Purple Haze",     price: 250,  style: { background: "linear-gradient(135deg, #1a0533, #3b0764, #6b21a8)" } },
  { id: "teal",       label: "🌊 Teal Ocean",      price: 300,  style: { background: "linear-gradient(135deg, #042f2e, #134e4a, #0f766e)" } },
  { id: "rose",       label: "🌹 Rose Dark",       price: 300,  style: { background: "linear-gradient(135deg, #1c0010, #4c0519, #881337)" } },
  { id: "amber",      label: "🔶 Amber Dusk",      price: 350,  style: { background: "linear-gradient(135deg, #1c0f00, #451a03, #92400e)" } },
  { id: "matrix",     label: "💻 Matrix",          price: 400,  style: { background: "linear-gradient(135deg, #000000, #002200, #003300)" } },
  { id: "midnight",   label: "🌙 Midnight",        price: 400,  style: { background: "linear-gradient(135deg, #000000, #0f0c29, #302b63)" } },
  { id: "sunset",     label: "🌅 Sunset",          price: 450,  style: { background: "linear-gradient(135deg, #1a001a, #4a0028, #7c1a3a, #b34a00)" } },
  { id: "arctic",     label: "❄️ Arctic",           price: 500,  style: { background: "linear-gradient(135deg, #020d1a, #082045, #0c3470, #1a4a8a)" } },
  { id: "volcano",    label: "🌋 Volcano",         price: 600,  style: { background: "linear-gradient(135deg, #0a0000, #2d0000, #7f1d1d, #c2410c)" } },
  { id: "aurora",     label: "🌠 Aurora",          price: 700,  style: { background: "linear-gradient(135deg, #001a0d, #002244, #003322, #004433, #005544)" } },
  { id: "galaxy",     label: "🌌 Galaxy",          price: 800,  style: { background: "linear-gradient(135deg, #000000, #0d0221, #190d3a, #2d1b69)" } },
  { id: "nebula",     label: "🪐 Nebula",          price: 1000, style: { background: "linear-gradient(135deg, #0d0221, #190d3a, #6b21a8, #be185d)" } },
  { id: "cyberpunk",  label: "⚡ Cyberpunk",       price: 1200, style: { background: "linear-gradient(135deg, #000000, #0a0a1a, #1a0033, #00001a, #001a00)" } },
  { id: "lava",       label: "🔥 Lava World",      price: 1500, style: { background: "linear-gradient(135deg, #0a0000, #200000, #7f1d1d, #b45309, #92400e)" } },
  { id: "voidrift",   label: "🕳️ Void Rift",       price: 2000, style: { background: "linear-gradient(135deg, #000000, #050010, #100030, #200060, #000000)" } },
  { id: "godmode",    label: "👑 God Mode",        price: 5000, style: { background: "linear-gradient(135deg, #0a0005, #1a0010, #2d0030, #001a2d, #002200, #1a1000)" } },
  { id: "blood",      label: "🩸 Blood Moon",      price: 450,  style: { background: "linear-gradient(135deg, #1a0000, #5c0000, #b30000, #cc3300)" } },
  { id: "toxic",      label: "☢️ Toxic Waste",      price: 500,  style: { background: "linear-gradient(135deg, #0a1a00, #1a3300, #2d5900, #6b9900)" } },
  { id: "ocean",      label: "🌊 Deep Ocean",       price: 350,  style: { background: "linear-gradient(135deg, #000d1a, #001a33, #003366, #006699)" } },
  { id: "gold",       label: "✨ Gold Foil",         price: 600,  style: { background: "linear-gradient(135deg, #1a0e00, #3d2200, #7a4d00, #c8960c)" } },
  { id: "rose_gold",  label: "🌹 Rose Gold",        price: 700,  style: { background: "linear-gradient(135deg, #1a0808, #4d1a1a, #8b3a3a, #c98b8b)" } },
  { id: "ice_cave",   label: "🧊 Ice Cave",         price: 550,  style: { background: "linear-gradient(135deg, #001a26, #003344, #00667a, #00b3cc)" } },
  { id: "synthwave",  label: "🕹️ Synthwave",        price: 800,  style: { background: "linear-gradient(135deg, #0d0026, #1a0040, #400080, #800040, #ff0080)" } },
  { id: "forest",     label: "🌲 Dark Forest",      price: 400,  style: { background: "linear-gradient(135deg, #020a02, #071207, #0d2210, #1a4020)" } },
  { id: "coral_reef", label: "🪸 Coral Reef",       price: 650,  style: { background: "linear-gradient(135deg, #0a0020, #0d1a40, #1a4060, #cc6644)" } },
  { id: "starfield",  label: "⭐ Starfield",         price: 900,  style: { background: "linear-gradient(135deg, #000000, #080820, #0d0d35, #101050)" } },
  { id: "ultraviolet",label: "🔬 Ultraviolet",      price: 1100, style: { background: "linear-gradient(135deg, #0a0020, #1a0040, #3d0080, #6600cc, #9900ff)" } },
  { id: "supernova",  label: "💥 Supernova",        price: 2500, style: { background: "linear-gradient(135deg, #000000, #1a0000, #4d0000, #cc3300, #ff6600, #ffcc00)" } },
  { id: "abyss",      label: "🕳️ The Abyss",        price: 3500, style: { background: "linear-gradient(135deg, #000000, #000005, #00000a, #00000f, #000000)" } },
  {
    id: "shinjuku_neon",
    label: "🏮 Shinjuku Neon",
    price: 10000,
    style: {
      background: "linear-gradient(135deg, #06090f, #1a103f, #8b0d57, #0e7490)",
      backgroundSize: "220% 220%",
      animation: "logoPan 14s ease-in-out infinite, logoPulse 6s ease-in-out infinite, logoHue 24s linear infinite"
    }
  },
  {
    id: "solar_flare",
    label: "☀️ Solar Flare",
    price: 45000,
    style: {
      background: "linear-gradient(140deg, #160701, #5f2411, #c2410c, #d97706)",
      backgroundSize: "240% 240%",
      animation: "logoPan 14s ease-in-out infinite, logoPulse 8s ease-in-out infinite",
      filter: "brightness(0.9) saturate(0.92)"
    }
  },
  {
    id: "glacier_drift",
    label: "🧊 Glacier Drift",
    price: 90000,
    style: {
      background: "linear-gradient(135deg, #020f1b, #0b2a46, #155f87, #7fc4d8)",
      backgroundSize: "260% 260%",
      animation: "logoPan 20s ease-in-out infinite, logoFloat 10s ease-in-out infinite, logoPulse 10s ease-in-out infinite",
      filter: "brightness(0.88) saturate(0.9)"
    }
  },
  {
    id: "diamond_vault",
    label: "💎 Diamond Vault",
    price: 120000,
    style: {
      background: "linear-gradient(135deg, #020617, #0f172a, #155e75, #67e8f9, #cffafe)",
      backgroundSize: "250% 250%",
      animation: "logoPan 16s ease-in-out infinite, logoPulse 8s ease-in-out infinite",
      filter: "brightness(0.95) saturate(1.15)"
    }
  },
  {
    id: "duma_throne",
    label: "👑 Duma Throne",
    price: 300000,
    style: {
      background: "linear-gradient(135deg, #120100, #3f0909, #7c2d12, #ca8a04, #fde68a)",
      backgroundSize: "260% 260%",
      animation: "logoPan 14s ease-in-out infinite, logoHue 22s linear infinite, logoPulse 7s ease-in-out infinite",
      filter: "brightness(1.02) saturate(1.18)"
    }
  },
  {
    id: "rainforest_temple",
    label: "🌴 Rainforest Temple",
    price: 450000,
    style: {
      background: "linear-gradient(140deg, #04140a, #0b3a2a, #14532d, #365314, #78350f)",
      backgroundSize: "240% 240%",
      animation: "logoPan 18s ease-in-out infinite, logoPulse 8s ease-in-out infinite",
      filter: "brightness(0.94) saturate(1.08)"
    }
  },
  {
    id: "frost_palace",
    label: "🏰 Frost Palace",
    price: 680000,
    style: {
      background: "linear-gradient(140deg, #020617, #0f172a, #1d4ed8, #38bdf8, #e0f2fe)",
      backgroundSize: "260% 260%",
      animation: "logoPan 14s ease-in-out infinite, logoFloat 10s ease-in-out infinite, logoPulse 9s ease-in-out infinite",
      filter: "brightness(1.0) saturate(1.1)"
    }
  },
  {
    id: "ember_core",
    label: "🔥 Ember Core",
    price: 950000,
    style: {
      background: "linear-gradient(140deg, #140402, #4a0f0f, #9a3412, #ea580c, #facc15)",
      backgroundSize: "280% 280%",
      animation: "logoPan 10s ease-in-out infinite, logoHue 20s linear infinite, logoPulse 6s ease-in-out infinite",
      filter: "brightness(1.06) saturate(1.2)"
    }
  },
  {
    id: "custom_canvas",
    label: "🎨 My Drawing",
    price: 5000000,
    style: {
      background: "linear-gradient(135deg, #111827, #1f2937)"
    }
  },
];

export const AVATAR_BACKGROUNDS = [
  { id: "default",     label: "Default",        price: 0,    style: { backgroundColor: null } },
  { id: "candy2",      label: "🍭 Bubblegum",   price: 150,  style: { background: "linear-gradient(135deg, #ff6bcb, #ff9de2, #ffd6f5)" } },
  { id: "fire",        label: "🔥 Fire",         price: 200,  style: { background: "linear-gradient(135deg, #f97316, #ef4444, #dc2626)" } },
  { id: "ocean",       label: "🌊 Ocean",        price: 200,  style: { background: "linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)" } },
  { id: "forest",      label: "🌿 Forest",       price: 200,  style: { background: "linear-gradient(135deg, #065f46, #059669, #34d399)" } },
  { id: "rose",        label: "🌹 Rose",         price: 200,  style: { background: "linear-gradient(135deg, #f43f5e, #fb7185, #fda4af)" } },
  { id: "flamingo",    label: "🦩 Flamingo",     price: 220,  style: { background: "linear-gradient(135deg, #fda4af, #fb7185, #f43f5e)" } },
  { id: "sunset",      label: "🌅 Sunset",       price: 250,  style: { background: "linear-gradient(135deg, #fbbf24, #f97316, #ec4899)" } },
  { id: "ice",         label: "❄️ Ice",           price: 250,  style: { background: "linear-gradient(135deg, #bfdbfe, #e0f2fe, #93c5fd)" } },
  { id: "arctic",      label: "🧊 Arctic",       price: 280,  style: { background: "linear-gradient(135deg, #0c4a6e, #0284c7, #38bdf8)" } },
  { id: "jade",        label: "💚 Jade",         price: 280,  style: { background: "linear-gradient(135deg, #064e3b, #047857, #10b981)" } },
  { id: "lava",        label: "🌋 Lava",         price: 300,  style: { background: "linear-gradient(135deg, #7f1d1d, #dc2626, #f97316, #fbbf24)" } },
  { id: "midnight",    label: "🌙 Midnight",     price: 300,  style: { background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" } },
  { id: "galaxy",      label: "🌌 Galaxy",       price: 350,  style: { background: "linear-gradient(135deg, #1e1b4b, #7c3aed, #4f46e5, #0ea5e9)" } },
  { id: "toxic",       label: "☢️ Toxic",         price: 350,  style: { background: "linear-gradient(135deg, #365314, #4d7c0f, #84cc16, #bef264)" } },
  { id: "copper",      label: "🥉 Copper",       price: 350,  style: { background: "linear-gradient(135deg, #78350f, #b45309, #d97706, #fca044)" } },
  { id: "neon",        label: "⚡ Neon",          price: 400,  style: { background: "linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6)" } },
  { id: "matrix",      label: "💻 Matrix",       price: 400,  style: { background: "linear-gradient(135deg, #052e16, #166534, #16a34a, #4ade80)" } },
  { id: "aurora",      label: "🌠 Aurora",       price: 450,  style: { background: "linear-gradient(135deg, #00b09b, #96c93d, #00b09b)" } },
  { id: "royal",       label: "👑 Royal",        price: 550,  style: { background: "linear-gradient(135deg, #1e1b4b, #3730a3, #6d28d9, #a78bfa, #fbbf24)" } },
  { id: "cosmic",      label: "🪐 Cosmic",       price: 600,  style: { background: "linear-gradient(135deg, #0d0221, #190d3a, #6b21a8, #d946ef, #ec4899)" } },
  { id: "rainbow",     label: "🌈 Rainbow",      price: 750,  style: { background: "linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)" } },
  { id: "gold",        label: "✨ Gold",          price: 800,  style: { background: "linear-gradient(135deg, #92400e, #d97706, #fbbf24, #fde68a)" } },
  { id: "diamond",     label: "💎 Diamond",      price: 1000, style: { background: "linear-gradient(135deg, #e0f2fe, #bae6fd, #7dd3fc, #38bdf8, #0ea5e9)" } },
  { id: "sakura",      label: "🌸 Sakura",       price: 1200, style: { background: "linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4, #ec4899, #db2777)" } },
  { id: "inferno",     label: "😈 Inferno",      price: 1500, style: { background: "linear-gradient(135deg, #0c0005, #7f1d1d, #dc2626, #ff6600, #ffe100)" } },
  { id: "voidrift",    label: "🕳️ Void Rift",    price: 1800, style: { background: "linear-gradient(135deg, #000000, #0f0a1e, #1d0040, #4c0070, #7b00ff)" } },
  { id: "holographic", label: "🌀 Holo",         price: 2000, style: { background: "linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #ff0080)" } },
  { id: "nebula",      label: "🌌 Nebula",       price: 2500, style: { background: "linear-gradient(135deg, #0d0221, #12005e, #6200ea, #aa00ff, #e040fb, #ff80ab)" } },
  { id: "obsidian",    label: "🖤 Obsidian",     price: 3000, style: { background: "linear-gradient(135deg, #000000, #1a1a2e, #16213e, #0f3460, #533483)" } },
  { id: "celestial",   label: "☀️ Celestial",    price: 4000, style: { background: "linear-gradient(135deg, #ffd700, #ff8c00, #ff4500, #8b0000, #4b0082, #000080, #ffd700)" } },
  { id: "godmode",     label: "👑 God Mode",     price: 5000, style: { background: "linear-gradient(135deg, #fff7ae, #f5c518, #e8a000, #ff6a00, #ee0979, #9b59b6, #2980b9, #1abc9c, #f5c518, #fff7ae)" } },
  {
    id: "edo_nocturne",
    label: "🏯 Edo Nocturne",
    price: 20000,
    style: {
      background: "linear-gradient(145deg, #1a0c32, #5b21b6, #db2777, #ef4444, #f59e0b)",
      backgroundSize: "250% 250%",
      animation: "logoPan 14s ease-in-out infinite, logoHue 20s linear infinite, logoPulse 7s ease-in-out infinite",
      filter: "saturate(1.2) brightness(1.05)"
    }
  },
  {
    id: "void_crown",
    label: "👑 Void Crown",
    price: 65000,
    style: {
      background: "linear-gradient(140deg, #1e1b4b, #7c3aed, #ec4899, #06b6d4, #22c55e)",
      backgroundSize: "260% 260%",
      animation: "logoPan 18s ease-in-out infinite, logoPulse 7s ease-in-out infinite, logoFloat 9s ease-in-out infinite, logoHue 24s linear infinite",
      filter: "saturate(1.22) brightness(1.06)"
    }
  },
  {
    id: "phoenix_relic",
    label: "🔥 Phoenix Relic",
    price: 100000,
    style: {
      background: "linear-gradient(140deg, #7f1d1d, #dc2626, #f97316, #facc15, #fb7185)",
      backgroundSize: "280% 280%",
      animation: "logoPan 11s ease-in-out infinite, logoPulse 5.5s ease-in-out infinite, logoHue 26s linear infinite",
      filter: "saturate(1.25) brightness(1.08)"
    }
  },
  {
    id: "diamond_dust",
    label: "💠 Diamond Dust",
    price: 140000,
    style: {
      background: "linear-gradient(140deg, #ecfeff, #bae6fd, #67e8f9, #0ea5e9, #0284c7)",
      backgroundSize: "250% 250%",
      animation: "logoPan 16s ease-in-out infinite, logoPulse 8s ease-in-out infinite",
      filter: "brightness(1.05) saturate(1.15)"
    }
  },
  {
    id: "duma_godflame",
    label: "🔥 Duma Godflame",
    price: 350000,
    style: {
      background: "linear-gradient(140deg, #1c0700, #7f1d1d, #f97316, #facc15, #fff7ed)",
      backgroundSize: "280% 280%",
      animation: "logoPan 12s ease-in-out infinite, logoHue 24s linear infinite, logoPulse 6s ease-in-out infinite",
      filter: "brightness(1.08) saturate(1.2)"
    }
  },
  {
    id: "frostbite_crown",
    label: "🧊 Frostbite Crown",
    price: 420000,
    style: {
      background: "linear-gradient(145deg, #1e3a8a, #0ea5e9, #67e8f9, #dbeafe)",
      backgroundSize: "240% 240%",
      animation: "logoPan 15s ease-in-out infinite, logoPulse 9s ease-in-out infinite",
      filter: "brightness(1.06) saturate(1.1)"
    }
  },
  {
    id: "obsidian_reign",
    label: "🖤 Obsidian Reign",
    price: 700000,
    style: {
      background: "linear-gradient(145deg, #020617, #111827, #1f2937, #7c3aed)",
      backgroundSize: "260% 260%",
      animation: "logoPan 16s ease-in-out infinite, logoHue 26s linear infinite",
      filter: "brightness(0.98) saturate(1.15)"
    }
  },
  {
    id: "prism_nova",
    label: "🌈 Prism Nova",
    price: 980000,
    style: {
      background: "linear-gradient(145deg, #ef4444, #f97316, #facc15, #22c55e, #3b82f6, #8b5cf6)",
      backgroundSize: "300% 300%",
      animation: "logoPan 12s ease-in-out infinite, logoHue 18s linear infinite, logoPulse 6s ease-in-out infinite",
      filter: "brightness(1.08) saturate(1.25)"
    }
  },
];

export const STORE_PACKAGES = [
  {
    id: "diamond_package",
    label: "💎 Diamond Package",
    price: 750000,
    description: "Luxury unlock set for fonts and backgrounds.",
    fontUnlocks: ["diamond_serif"],
    avatarBgUnlocks: ["diamond_dust"],
    siteBgUnlocks: ["diamond_vault"],
    autoEquip: {
      avatar_font: "diamond_serif",
      avatar_background: "diamond_dust",
      site_background: "diamond_vault",
    },
  },
  {
    id: "duma_godmode_package",
    label: "👑 Duma God Mode Package",
    price: 2500000,
    description: "The ultimate Duma collection with mythic styling.",
    fontUnlocks: ["duma_god"],
    avatarBgUnlocks: ["duma_godflame"],
    siteBgUnlocks: ["duma_throne"],
    autoEquip: {
      avatar_font: "duma_god",
      avatar_background: "duma_godflame",
      site_background: "duma_throne",
    },
  },
  {
    id: "mythic_triad_package",
    label: "🌠 Mythic Triad Package",
    price: 3800000,
    description: "Endgame unlock set with the most premium neon + prism cosmetics.",
    fontUnlocks: ["neon_wire", "royal_script"],
    avatarBgUnlocks: ["prism_nova", "obsidian_reign"],
    siteBgUnlocks: ["ember_core", "frost_palace"],
    autoEquip: {
      avatar_font: "neon_wire",
      avatar_background: "prism_nova",
      site_background: "ember_core",
    },
  },
];

export function getAvatarBgStyle(bgId, fallbackColor) {
  const found = AVATAR_BACKGROUNDS.find(b => b.id === bgId);
  if (!found || found.id === "default" || !found.style.background) {
    return { backgroundColor: fallbackColor || "#6366f1" };
  }
  return found.style;
}

export function getSiteBgStyle(bgId, customImageData) {
  if (bgId === "custom_canvas" && customImageData) {
    return {
      backgroundImage: `url(${customImageData})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  const found = SITE_BACKGROUNDS.find(b => b.id === bgId);
  if (!found) return SITE_BACKGROUNDS[0].style;
  return found.style;
}

/** Returns combined style object for an avatar bubble (background + font + letter color) */
export function getAvatarStyle(wallet) {
  return {
    ...getAvatarBgStyle(wallet?.avatar_background, wallet?.avatar_color),
    ...getFontStyle(wallet?.avatar_font),
  };
}

/** Returns letter color style for a wallet */
export function getLetterStyle(wallet) {
  return getLetterColorStyle(wallet?.avatar_letter_color);
}