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

// Cosmetic accessories - crowns, headwear, and decorative items
export const HAIRSTYLES = [
  { id: "none", label: "None", price: 0, variant: "none", tone: "natural" },
  { id: "headband", label: "Headband", price: 80, variant: "headband", tone: "pink" },
  { id: "bandana", label: "Bandana", price: 100, variant: "bandana", tone: "red" },
  { id: "cat_ears", label: "Cat Ears", price: 150, variant: "catEars", tone: "dark" },
  { id: "bunny_ears", label: "Bunny Ears", price: 150, variant: "bunnyEars", tone: "pink" },
  { id: "flower", label: "Flower Crown", price: 200, variant: "flower", tone: "pink" },
  { id: "laurel", label: "Laurel Wreath", price: 250, variant: "laurel", tone: "green" },
  { id: "party_hat", label: "Party Hat", price: 200, variant: "partyHat", tone: "rainbow" },
  { id: "santa", label: "Santa Hat", price: 250, variant: "santa", tone: "red" },
  { id: "cowboy", label: "Cowboy Hat", price: 300, variant: "cowboy", tone: "brown" },
  { id: "top_hat", label: "Top Hat", price: 350, variant: "hatTop", tone: "dark" },
  { id: "beret", label: "Beret", price: 300, variant: "beret", tone: "dark" },
  { id: "bow", label: "Hair Bow", price: 250, variant: "bow", tone: "pink" },
  { id: "tiara", label: "Tiara", price: 400, variant: "tiara", tone: "silver" },
  { id: "wizard", label: "Wizard Hat", price: 450, variant: "wizard", tone: "violet" },
  { id: "antlers", label: "Antlers", price: 400, variant: "antlers", tone: "brown" },
  { id: "horns", label: "Devil Horns", price: 500, variant: "horns", tone: "red" },
  { id: "cherry_b", label: "Cherry Blossom", price: 500, variant: "cherryBlossom", tone: "pink" },
  { id: "halo", label: "Halo", price: 600, variant: "halo", tone: "golden" },
  { id: "diadem", label: "Diadem", price: 700, variant: "diadem", tone: "silver" },
  { id: "crown", label: "Royal Crown", price: 800, variant: "crown", tone: "golden" },
  { id: "lunar", label: "Lunar Crown", price: 900, variant: "crown", tone: "silver" },
  { id: "phoenix", label: "Phoenix Crest", price: 1000, variant: "phoenix", tone: "fire" },
  { id: "cosmic", label: "Cosmic Crown", price: 1200, variant: "crown", tone: "rainbow" },
  { id: "dragon", label: "Dragon Horns", price: 1500, variant: "dragonHorns", tone: "dark" },
  { id: "celestial", label: "Celestial Halo", price: 1800, variant: "halo", tone: "rainbow" },
  { id: "imperial", label: "Imperial Crown", price: 2000, variant: "imperialCrown", tone: "golden" },
  { id: "divine", label: "Divine Radiance", price: 2500, variant: "divine", tone: "golden" },
  { id: "void", label: "Void Crown", price: 3000, variant: "crown", tone: "dark" },
  { id: "godmode", label: "God Crown", price: 5000, variant: "godCrown", tone: "rainbow" },
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

  // Headbands and simple accessories
  if (hair.variant === "headband") {
    return <span className={`${baseShape} -top-1 w-10 h-2 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "bandana") {
    return (
      <>
        <span className={`${baseShape} -top-2 w-10 h-3 rounded-sm ${scaleClass}`} style={toneStyle} />
        <span className="absolute -right-1 top-0 w-2 h-3 rounded-r-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "bow") {
    return (
      <>
        <span className="absolute -right-1 -top-2 w-3 h-3 rounded-full z-10" style={toneStyle} />
        <span className="absolute right-1 -top-2 w-3 h-3 rounded-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "beret") {
    return <span className={`${baseShape} -top-2.5 w-8 h-3 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  // Animal ears
  if (hair.variant === "catEars") {
    return (
      <>
        <span className="absolute -left-2 -top-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] z-10" style={{ borderBottomColor: toneStyle.background || "#1e293b" }} />
        <span className="absolute -right-2 -top-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] z-10" style={{ borderBottomColor: toneStyle.background || "#1e293b" }} />
      </>
    );
  }

  if (hair.variant === "bunnyEars") {
    return (
      <>
        <span className="absolute -left-1 -top-5 w-2 h-6 rounded-full z-10" style={toneStyle} />
        <span className="absolute -right-1 -top-5 w-2 h-6 rounded-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "antlers") {
    return (
      <>
        <span className="absolute -left-2 -top-4 w-1 h-5 rounded-sm z-10" style={toneStyle} />
        <span className="absolute -left-3 -top-4 w-1 h-3 rounded-sm rotate-45 z-10" style={toneStyle} />
        <span className="absolute -right-2 -top-4 w-1 h-5 rounded-sm z-10" style={toneStyle} />
        <span className="absolute -right-3 -top-4 w-1 h-3 rounded-sm -rotate-45 z-10" style={toneStyle} />
      </>
    );
  }

  // Crowns and tiaras
  if (hair.variant === "crown") {
    return (
      <>
        <span className={`${baseShape} -top-3 w-10 h-4 rounded-sm ${scaleClass}`} style={toneStyle} />
        <span className={`${baseShape} -top-4 w-2 h-2 rounded-full ${scaleClass}`} style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "tiara") {
    return <span className={`${baseShape} -top-3 w-9 h-3 rounded-t-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "diadem") {
    return (
      <>
        <span className={`${baseShape} -top-2 w-10 h-2 rounded-full ${scaleClass}`} style={toneStyle} />
        <span className={`${baseShape} -top-3 w-3 h-2 rounded-full ${scaleClass}`} style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "imperialCrown") {
    return (
      <>
        <span className={`${baseShape} -top-3 w-11 h-5 rounded-t-md ${scaleClass}`} style={toneStyle} />
        <span className="absolute -left-2 -top-4 w-2 h-2 rounded-full z-10" style={toneStyle} />
        <span className={`${baseShape} -top-4.5 w-2 h-2 rounded-full z-10`} style={toneStyle} />
        <span className="absolute -right-2 -top-4 w-2 h-2 rounded-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "godCrown") {
    return (
      <>
        <span className={`${baseShape} -top-4 w-12 h-6 rounded-t-lg ${scaleClass}`} style={toneStyle} />
        <span className="absolute -left-3 -top-5 w-3 h-3 rounded-full z-10 animate-pulse" style={toneStyle} />
        <span className={`${baseShape} -top-6 w-3 h-3 rounded-full z-10 animate-pulse`} style={toneStyle} />
        <span className="absolute -right-3 -top-5 w-3 h-3 rounded-full z-10 animate-pulse" style={toneStyle} />
      </>
    );
  }

  // Halos
  if (hair.variant === "halo") {
    return <span className={`${baseShape} -top-4 w-10 h-2 rounded-full border-2 bg-transparent ${scaleClass}`} style={{ borderColor: toneStyle.background || "#fbbf24" }} />;
  }

  // Horns
  if (hair.variant === "horns") {
    return (
      <>
        <span className="absolute -left-2 -top-3 w-2 h-4 rounded-tl-full rounded-tr-sm z-10" style={toneStyle} />
        <span className="absolute -right-2 -top-3 w-2 h-4 rounded-tr-full rounded-tl-sm z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "dragonHorns") {
    return (
      <>
        <span className="absolute -left-2 -top-4 w-3 h-5 rounded-tl-full rounded-br-md z-10" style={toneStyle} />
        <span className="absolute -right-2 -top-4 w-3 h-5 rounded-tr-full rounded-bl-md z-10" style={toneStyle} />
      </>
    );
  }

  // Hats
  if (hair.variant === "hatTop") {
    return <span className={`${baseShape} -top-4 w-10 h-5 rounded-t-md rounded-b-sm ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "partyHat") {
    return <span className={`${baseShape} -top-5 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[20px] ${scaleClass}`} style={{ borderBottomColor: toneStyle.background || "#3b82f6" }} />;
  }

  if (hair.variant === "wizard") {
    return <span className={`${baseShape} -top-5 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-violet-700 ${scaleClass}`} />;
  }

  if (hair.variant === "cowboy") {
    return <span className={`${baseShape} -top-3 w-11 h-4 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "santa") {
    return <span className={`${baseShape} -top-3 w-10 h-4 rounded-t-full rounded-b-sm bg-red-600 ${scaleClass}`} />;
  }

  // Flowers and nature
  if (hair.variant === "flower") {
    return <span className={`${baseShape} -top-3 w-10 h-3 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  if (hair.variant === "cherryBlossom") {
    return (
      <>
        <span className={`${baseShape} -top-3 w-10 h-3 rounded-full ${scaleClass}`} style={toneStyle} />
        <span className="absolute -left-1 -top-2 w-2 h-2 rounded-full z-10" style={toneStyle} />
        <span className="absolute -right-1 -top-2 w-2 h-2 rounded-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "laurel") {
    return <span className={`${baseShape} -top-2 w-11 h-3 rounded-full ${scaleClass}`} style={toneStyle} />;
  }

  // Special effects
  if (hair.variant === "phoenix") {
    return (
      <>
        <span className={`${baseShape} -top-4 w-8 h-5 rounded-t-full ${scaleClass}`} style={toneStyle} />
        <span className="absolute -left-3 -top-3 w-2 h-4 rounded-tl-full z-10" style={toneStyle} />
        <span className="absolute -right-3 -top-3 w-2 h-4 rounded-tr-full z-10" style={toneStyle} />
      </>
    );
  }

  if (hair.variant === "divine") {
    return (
      <>
        <span className={`${baseShape} -top-4 w-11 h-3 rounded-full animate-pulse ${scaleClass}`} style={toneStyle} />
        <span className={`${baseShape} -top-5 w-10 h-2 rounded-full border-2 bg-transparent animate-pulse ${scaleClass}`} style={{ borderColor: toneStyle.background || "#fbbf24" }} />
      </>
    );
  }

  return <span className={`${baseShape} -top-2 w-9 h-3 rounded-full ${scaleClass}`} style={toneStyle} />;
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