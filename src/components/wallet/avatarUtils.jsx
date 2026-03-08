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
];

export function getFontStyle(fontId) {
  const found = FONTS.find(f => f.id === fontId);
  if (!found || found.id === "default") return {};
  const s = { fontFamily: found.fontFamily };
  if (found.fontWeight) s.fontWeight = found.fontWeight;
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
  return { color: found.color };
}

// Hairstyles (rendered as emoji/text overlay on top of avatar)
export const HAIRSTYLES = [
  { id: "none",        label: "None",             price: 0,    emoji: null },
  { id: "short",       label: "Short Cut",         price: 80,   emoji: "🪒" },
  { id: "medium",      label: "Medium",            price: 100,  emoji: "💇" },
  { id: "long",        label: "Long Hair",         price: 150,  emoji: "👩" },
  { id: "curly",       label: "Curly",             price: 200,  emoji: "🌀" },
  { id: "wavy",        label: "Wavy",              price: 220,  emoji: "〰️" },
  { id: "afro",        label: "Afro",              price: 300,  emoji: "🅰" },
  { id: "bun",         label: "Bun",               price: 250,  emoji: "🔵" },
  { id: "ponytail",    label: "Ponytail",          price: 280,  emoji: "🎗️" },
  { id: "braids",      label: "Braids",            price: 350,  emoji: "🪢" },
  { id: "mohawk",      label: "Mohawk",            price: 400,  emoji: "⬆️" },
  { id: "spiky",       label: "Spiky",             price: 450,  emoji: "💥" },
  { id: "dreads",      label: "Dreadlocks",        price: 500,  emoji: "🟫" },
  { id: "silver",      label: "Silver Hair",       price: 600,  emoji: "🩶" },
  { id: "golden",      label: "Golden Blonde",     price: 700,  emoji: "💛" },
  { id: "redhead",     label: "Redhead",           price: 600,  emoji: "🔴" },
  { id: "rainbow",     label: "Rainbow Hair",      price: 1000, emoji: "🌈" },
  { id: "platinum",    label: "Platinum",          price: 1500, emoji: "⬜" },
  { id: "top_hat",     label: "Top Hat",           price: 350,  emoji: "🎩" },
  { id: "crown",       label: "Crown",             price: 800,  emoji: "👑" },
  { id: "flower",      label: "Flower Crown",      price: 400,  emoji: "🌸" },
  { id: "halo",        label: "Halo",              price: 600,  emoji: "😇" },
  { id: "horns",       label: "Devil Horns",       price: 500,  emoji: "😈" },
  { id: "wizard",      label: "Wizard Hat",        price: 450,  emoji: "🧙" },
  { id: "cowboy",      label: "Cowboy Hat",        price: 300,  emoji: "🤠" },
  { id: "santa",       label: "Santa Hat",         price: 250,  emoji: "🎅" },
  { id: "cherry_b",    label: "Cherry Blossom",    price: 550,  emoji: "🌺" },
  { id: "alien",       label: "Alien",             price: 700,  emoji: "👽" },
  { id: "fire_top",    label: "Fire Head",         price: 900,  emoji: "🔥" },
  { id: "star",        label: "Star Power",        price: 1200, emoji: "⭐" },
];

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
];

export function getAvatarBgStyle(bgId, fallbackColor) {
  const found = AVATAR_BACKGROUNDS.find(b => b.id === bgId);
  if (!found || found.id === "default" || !found.style.background) {
    return { backgroundColor: fallbackColor || "#6366f1" };
  }
  return found.style;
}

export function getSiteBgStyle(bgId) {
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