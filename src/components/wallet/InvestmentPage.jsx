import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Loader2, ArrowLeft, Plus, Trash2, Edit2, Check, Users } from "lucide-react";
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Asset definitions ───────────────────────────────────────────────────────
export const ASSETS = [
  { id: "bitcoin",  label: "Bitcoin",  symbol: "BTC",  emoji: "₿",  color: "#f59e0b", startPrice: 42000, volatility: 0.022, drift: 0.001  },
  { id: "ethereum", label: "Ethereum", symbol: "ETH",  emoji: "Ξ",  color: "#8b5cf6", startPrice: 2800,  volatility: 0.028, drift: 0.0005 },
  { id: "solana",   label: "Solana",   symbol: "SOL",  emoji: "◎",  color: "#06b6d4", startPrice: 120,   volatility: 0.040, drift: 0.002  },
  { id: "tesla",    label: "Tesla",    symbol: "TSLA", emoji: "⚡", color: "#ef4444", startPrice: 240,   volatility: 0.032, drift: -0.001 },
  { id: "apple",    label: "Apple",    symbol: "AAPL", emoji: "🍎", color: "#94a3b8", startPrice: 185,   volatility: 0.015, drift: 0.0008 },
  { id: "gold",     label: "Gold",     symbol: "XAU",  emoji: "🥇", color: "#fbbf24", startPrice: 1900,  volatility: 0.010, drift: 0.0003 },
  { id: "doge",     label: "Dogecoin", symbol: "DOGE", emoji: "🐶", color: "#f97316", startPrice: 0.15,  volatility: 0.060, drift: 0.003  },
  { id: "amazon",   label: "Amazon",   symbol: "AMZN", emoji: "📦", color: "#f59e0b", startPrice: 178,   volatility: 0.018, drift: 0.001  },
];

const TICK_MS = 3000;
const HISTORY_LEN = 60;
const DEFAULT_COLORS = ["#f59e0b","#8b5cf6","#06b6d4","#ef4444","#94a3b8","#fbbf24","#f97316","#22c55e","#ec4899","#3b82f6"];

function nextPrice(price, volatility, drift) {
  const swing = (Math.random() * 2 - 1) * volatility;
  return Math.max(price * (1 + swing + drift), 0.0001);
}

function initPrices() {
  const map = {};
  for (const a of ASSETS) {
    let p = a.startPrice;
    const history = [];
    for (let i = 0; i < 30; i++) { p = nextPrice(p, a.volatility, a.drift); history.push(p); }
    map[a.id] = { price: p, history };
  }
  return map;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ history, up }) {
  if (!history || history.length < 2) return null;
  const data = history.map((p, i) => ({ i, p }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="p" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Full chart ───────────────────────────────────────────────────────────────
function FullChart({ history, color }) {
  if (!history || history.length < 2) return null;
  const data = history.map((p, i) => ({ i, p }));
  const mn = Math.min(...history);
  const mx = Math.max(...history);
  return (
    <ResponsiveContainer width="100%" height={110}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
        <YAxis domain={[mn * 0.997, mx * 1.003]} hide />
        <Tooltip content={({ active, payload }) =>
          active && payload?.length ? (
            <div className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
              ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          ) : null
        } />
        <Line type="monotone" dataKey="p" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function fmt(n) {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1)    return n.toFixed(4);
  return n.toFixed(6);
}

// ─── Asset Detail ─────────────────────────────────────────────────────────────
function AssetDetail({ asset, priceData, myInvestment, wallet, onBack, onBuy, onSell, upgradeEffects }) {
  const [dollarAmt, setDollarAmt] = useState("");
  const [sellAmt, setSellAmt] = useState("");
  const [mode, setMode] = useState("buy");
  const [loading, setLoading] = useState(false);

  const price = priceData?.price || 0;
  const buyDiscount = Math.min(0.25, Math.max(0, Number(upgradeEffects?.marketBuyDiscountPct || 0)));
  const sellBonus = Math.min(0.25, Math.max(0, Number(upgradeEffects?.marketSellBonusPct || 0)));
  const buyPrice = price * (1 - buyDiscount);
  const sellPrice = price * (1 + sellBonus);
  const history = priceData?.history || [];
  const shares = myInvestment?.shares || 0;
  const avgBuy = myInvestment?.avg_buy_price || 0;
  const value = shares * price;
  const pnl = shares > 0 ? value - shares * avgBuy : 0;
  const pnlPct = shares > 0 && avgBuy > 0 ? ((price - avgBuy) / avgBuy) * 100 : 0;
  const first = history[0] || price;
  const up = price >= first;

  const handleBuy = async () => {
    const rawDollars = dollarAmt === "" ? Math.max(0, wallet.balance - 20) : parseFloat(dollarAmt);
    if (isNaN(rawDollars) || rawDollars <= 0) { toast.error("Enter a valid amount"); return; }
    if (rawDollars > wallet.balance) { toast.error("Insufficient balance"); return; }
    setLoading(true);
    try {
      const bought = rawDollars / buyPrice;
      await base44.adjustWalletBalance(wallet.id, -rawDollars);
      const fresh = await base44.entities.Investment.filter({ wallet_id: wallet.id, asset_id: asset.id });
      const existing = fresh[0];
      if (existing) {
        const totalShares = existing.shares + bought;
        const newAvg = (existing.shares * existing.avg_buy_price + rawDollars) / totalShares;
        await base44.entities.Investment.update(existing.id, { shares: totalShares, avg_buy_price: newAvg });
      } else {
        await base44.entities.Investment.create({ wallet_id: wallet.id, asset_id: asset.id, shares: bought, avg_buy_price: buyPrice });
      }
      toast.success(`Bought ${bought.toFixed(6)} ${asset.symbol}!`);
      setDollarAmt("");
      onBuy(rawDollars, bought, buyPrice);
    } catch (e) {
      toast.error(e?.message || "Could not complete buy");
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    const sharesToSell = parseFloat(sellAmt) || shares;
    if (sharesToSell <= 0 || sharesToSell > shares) { toast.error(`You only have ${shares.toFixed(6)} ${asset.symbol}`); return; }
    setLoading(true);
    try {
      // Always fetch fresh from DB to get the real current ID and shares
      const fresh = await base44.entities.Investment.filter({ wallet_id: wallet.id, asset_id: asset.id });
      const inv = fresh[0];
      if (!inv?.id) { toast.error("Investment not found"); return; }
      const ownedShares = Number(inv.shares || 0);
      if (sharesToSell > ownedShares) {
        toast.error(`You only have ${ownedShares.toFixed(6)} ${asset.symbol}`);
        return;
      }

      const proceeds = sharesToSell * sellPrice;
      await base44.adjustWalletBalance(wallet.id, proceeds);

      const remaining = ownedShares - sharesToSell;
      if (remaining < 0.000001) {
        await base44.entities.Investment.delete(inv.id);
      } else {
        await base44.entities.Investment.update(inv.id, { shares: remaining });
      }
      const profit = proceeds - sharesToSell * avgBuy;
      toast.success(`Sold for $${proceeds.toFixed(2)}! P&L: ${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}`);
      setSellAmt("");
      onSell(proceeds, sharesToSell);
    } catch (e) {
      toast.error(e?.message || "Could not complete sell");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{asset.emoji}</span>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{asset.label} <span className="text-slate-500 text-sm font-normal">({asset.symbol})</span></h3>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono font-bold text-2xl">${fmt(price)}</span>
            <span className={`text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white/5 rounded-2xl p-3">
        <FullChart history={history} color={asset.color} />
      </div>
      {shares > 0 && (
        <div className="bg-white/5 rounded-2xl p-3 grid grid-cols-3 gap-3">
          <div><p className="text-slate-500 text-xs mb-0.5">Holdings</p><p className="text-white font-mono text-sm">{shares.toFixed(4)}</p></div>
          <div><p className="text-slate-500 text-xs mb-0.5">Value</p><p className="text-white font-mono text-sm">${value.toFixed(2)}</p></div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">P&amp;L</p>
            <p className={`font-mono text-sm font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}<br />
              <span className="text-xs">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span>
            </p>
          </div>
        </div>
      )}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        <button onClick={() => setMode("buy")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === "buy" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}>Buy</button>
        <button onClick={() => setMode("sell")} disabled={shares === 0} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 ${mode === "sell" ? "bg-red-500/20 text-red-400" : "text-slate-500 hover:text-slate-300"}`}>Sell</button>
      </div>
      {mode === "buy" ? (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <Input type="number" value={dollarAmt} onChange={e => setDollarAmt(e.target.value)} placeholder="Amount in dollars" className="bg-white/10 border-white/10 text-white placeholder:text-slate-500 pl-7" />
          </div>
          {dollarAmt && !isNaN(parseFloat(dollarAmt)) && parseFloat(dollarAmt) > 0 && (
            <p className="text-slate-400 text-xs px-1">≈ {(parseFloat(dollarAmt) / buyPrice).toFixed(6)} {asset.symbol} @ ${fmt(buyPrice)}</p>
          )}
          {buyDiscount > 0 && <p className="text-emerald-400 text-xs px-1">Lucky Potion active: buy price {Math.round(buyDiscount * 100)}% lower</p>}
          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map(v => (
              <button key={v} onClick={() => setDollarAmt(String(Math.min(v, wallet.balance)))} className="py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-mono">${v}</button>
            ))}
          </div>
          <button onClick={handleBuy} disabled={loading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {dollarAmt ? `Buy ${asset.symbol}` : `Buy All-$20 ${asset.symbol}`}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input type="number" value={sellAmt} onChange={e => setSellAmt(e.target.value)} placeholder="Shares (empty = sell all)" className="bg-white/10 border-white/10 text-white placeholder:text-slate-500 flex-1" />
            <button onClick={() => setSellAmt(String(shares))} className="px-3 py-1 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 whitespace-nowrap flex-shrink-0">All</button>
          </div>
          {shares > 0 && (
            <p className="text-slate-400 text-xs px-1">You own {shares.toFixed(6)} {asset.symbol} ≈ <span className="text-white">${value.toFixed(2)}</span> · avg <span className="text-white">${fmt(avgBuy)}</span></p>
          )}
          {sellBonus > 0 && <p className="text-emerald-400 text-xs px-1">Lucky Potion active: sell price {Math.round(sellBonus * 100)}% higher</p>}
          <button onClick={handleSell} disabled={loading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
            {sellAmt ? `Sell ${sellAmt} ${asset.symbol}` : `Sell All ${asset.symbol}`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Dev Asset Type Manager ───────────────────────────────────────────────────
function DevAssetTypeManager({ onClose, onRefresh }) {
  const [customAssets, setCustomAssets] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6");
  const [newVol, setNewVol] = useState("0.03");
  const [saving, setSaving] = useState(false);

  const loadAssets = async () => {
    const list = await base44.entities.AssetDefinition.list();
    setCustomAssets(list);
  };

  useEffect(() => { loadAssets(); }, []);

  const handleAdd = async () => {
    if (!newLabel || !newSymbol || !newEmoji || !newPrice) {
      toast.error("Fill all fields (Label, Symbol, Emoji, Price)"); return;
    }
    const priceVal = parseFloat(newPrice);
    if (isNaN(priceVal) || priceVal <= 0) { toast.error("Invalid price"); return; }
    setSaving(true);
    // Auto-generate asset_id from label
    const asset_id = newLabel.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    try {
      await base44.entities.AssetDefinition.create({
        asset_id,
        label: newLabel.trim(),
        symbol: newSymbol.trim().toUpperCase(),
        emoji: newEmoji.trim(),
        color: newColor,
        start_price: priceVal,
        volatility: parseFloat(newVol) || 0.03,
        drift: 0.001,
      });
      toast.success(`${newLabel} added!`);
      setAdding(false);
      setNewLabel(""); setNewSymbol(""); setNewEmoji(""); setNewPrice(""); setNewVol("0.03");
      await loadAssets();
      onRefresh();
    } catch (e) {
      toast.error("Failed to add: " + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (a) => {
    await base44.entities.AssetDefinition.delete(a.id);
    toast.success("Removed!");
    await loadAssets();
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-yellow-400 font-bold text-lg">⚙️ Asset Types</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {customAssets.length === 0 && !adding && (
            <p className="text-slate-600 text-sm text-center py-4">No custom assets yet</p>
          )}
          {customAssets.map(a => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{a.emoji}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{a.label} <span className="text-slate-500 text-xs">({a.symbol})</span></p>
                  <p className="text-slate-400 text-xs">Start: ${a.start_price} · Vol: {a.volatility}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(a)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}

          {adding ? (
            <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-2xl p-4 space-y-3">
              <p className="text-yellow-400 text-sm font-bold">New Asset</p>
              <div className="flex gap-2">
                <Input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} placeholder="🪙 Emoji" className="bg-white/10 border-white/10 text-white h-9 w-20 text-center text-lg" />
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Name (e.g. Nvidia)" className="bg-white/10 border-white/10 text-white h-9 flex-1" />
              </div>
              <div className="flex gap-2">
                <Input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="Symbol (e.g. NVDA)" className="bg-white/10 border-white/10 text-white h-9 flex-1" />
                <Input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Start price ($)" type="number" className="bg-white/10 border-white/10 text-white h-9 flex-1" />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Volatility (how wild prices move)</p>
                <Input value={newVol} onChange={e => setNewVol(e.target.value)} placeholder="0.03 = calm, 0.08 = wild" className="bg-white/10 border-white/10 text-white h-9" />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Color</p>
                <div className="flex gap-1 flex-wrap">
                  {DEFAULT_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Add Asset"}
                </button>
                <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-sm font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-yellow-500/40 text-yellow-400 text-sm hover:bg-yellow-500/5 flex items-center justify-center gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Add New Asset
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Dev Investment Editor (edit any user's holdings) ─────────────────────────
function DevAssetEditor({ allAssets, onClose, onRefresh }) {
  const [allWallets, setAllWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editShares, setEditShares] = useState("");
  const [editAvg, setEditAvg] = useState("");
  const [adding, setAdding] = useState(false);
  const [newAssetId, setNewAssetId] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newAvg, setNewAvg] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingInv, setLoadingInv] = useState(false);

  useEffect(() => {
    base44.entities.Wallet.list().then(setAllWallets);
  }, []);

  const loadInvestments = async (walletId) => {
    setLoadingInv(true);
    const invs = await base44.entities.Investment.filter({ wallet_id: walletId });
    setInvestments(invs);
    setLoadingInv(false);
  };

  const selectWallet = (id) => {
    setSelectedWalletId(id);
    setAdding(false);
    setEditingId(null);
    loadInvestments(id);
  };

  const handleSave = async (inv) => {
    if (!editShares || !editAvg) { toast.error("Fill all fields"); return; }
    setSaving(true);
    await base44.entities.Investment.update(inv.id, { shares: parseFloat(editShares), avg_buy_price: parseFloat(editAvg) });
    toast.success("Updated!");
    setEditingId(null);
    setSaving(false);
    await loadInvestments(selectedWalletId);
    onRefresh();
  };

  const handleDelete = async (inv) => {
    // Re-fetch fresh records to avoid stale ID errors
    const fresh = await base44.entities.Investment.filter({ wallet_id: selectedWalletId, asset_id: inv.asset_id });
    const record = fresh[0];
    if (!record?.id) { toast.error("Record not found, refreshing..."); await loadInvestments(selectedWalletId); return; }
    await base44.entities.Investment.delete(record.id);
    toast.success("Deleted!");
    await loadInvestments(selectedWalletId);
    onRefresh();
  };

  const handleAdd = async () => {
    if (!newAssetId || !newShares || !newAvg) { toast.error("Fill all fields"); return; }
    setSaving(true);
    await base44.entities.Investment.create({
      wallet_id: selectedWalletId,
      asset_id: newAssetId.trim().toLowerCase(),
      shares: parseFloat(newShares),
      avg_buy_price: parseFloat(newAvg),
    });
    toast.success("Added!");
    setAdding(false);
    setNewAssetId(""); setNewShares(""); setNewAvg("");
    setSaving(false);
    await loadInvestments(selectedWalletId);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-yellow-400 font-bold text-lg">⚙️ Holdings Editor</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Wallet picker */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-slate-500 text-xs mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Select user</p>
          <div className="flex flex-wrap gap-2">
            {allWallets.map(w => (
              <button key={w.id} onClick={() => selectWallet(w.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${selectedWalletId === w.id ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}`}>
                {w.username}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {!selectedWalletId && <p className="text-slate-600 text-sm text-center py-6">Select a user above</p>}
          {selectedWalletId && loadingInv && <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-yellow-400 animate-spin" /></div>}
          {selectedWalletId && !loadingInv && investments.length === 0 && !adding && (
            <p className="text-slate-500 text-sm text-center py-4">No investments for this user</p>
          )}
          {investments.map(inv => (
            <div key={inv.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{inv.asset_id}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(inv.id); setEditShares(String(inv.shares)); setEditAvg(String(inv.avg_buy_price)); }} className="text-indigo-400 hover:text-indigo-300"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(inv)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {editingId === inv.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input value={editShares} onChange={e => setEditShares(e.target.value)} placeholder="Shares" className="bg-white/10 border-white/10 text-white text-xs h-8" />
                    <Input value={editAvg} onChange={e => setEditAvg(e.target.value)} placeholder="Avg price" className="bg-white/10 border-white/10 text-white text-xs h-8" />
                    <button onClick={() => handleSave(inv)} disabled={saving} className="text-emerald-400 hover:text-emerald-300 flex-shrink-0">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-400">Cancel</button>
                </div>
              ) : (
                <p className="text-slate-400 text-xs">{Number(inv.shares).toFixed(6)} shares @ avg ${Number(inv.avg_buy_price).toFixed(4)}</p>
              )}
            </div>
          ))}

          {selectedWalletId && !loadingInv && (
            adding ? (
              <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-2xl p-3 space-y-2">
                <p className="text-yellow-400 text-xs font-bold">New Investment</p>
                <select value={newAssetId} onChange={e => setNewAssetId(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl h-8 px-2">
                  <option value="">-- Select Asset --</option>
                  {allAssets.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.label} ({a.symbol})</option>)}
                </select>
                <div className="flex gap-2">
                  <Input value={newShares} onChange={e => setNewShares(e.target.value)} placeholder="Shares" type="number" className="bg-white/10 border-white/10 text-white text-xs h-8 flex-1" />
                  <Input value={newAvg} onChange={e => setNewAvg(e.target.value)} placeholder="Avg buy price" type="number" className="bg-white/10 border-white/10 text-white text-xs h-8 flex-1" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={saving} className="flex-1 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Add"}
                  </button>
                  <button onClick={() => setAdding(false)} className="flex-1 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} className="w-full py-2 rounded-2xl border border-dashed border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/5 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Investment
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvestmentPage({ wallet, onClose, onRefresh, isDevMode, upgradeEffects }) {
  const [customAssets, setCustomAssets] = useState([]);
  const [prices, setPrices] = useState(() => initPrices());
  const [investments, setInvestments] = useState([]);
  const [walletState, setWalletState] = useState(wallet);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDevEditor, setShowDevEditor] = useState(false);
  const [showAssetTypeEditor, setShowAssetTypeEditor] = useState(false);
  const allAssetsRef = useRef([]);

  const allAssets = [
    ...ASSETS,
    ...customAssets.map(ca => ({
      id: ca.asset_id,
      label: ca.label,
      symbol: ca.symbol,
      emoji: ca.emoji,
      color: ca.color || "#8b5cf6",
      startPrice: ca.start_price,
      volatility: ca.volatility || 0.03,
      drift: ca.drift || 0.001,
    }))
  ];
  allAssetsRef.current = allAssets;

  // Load investments and custom assets from DB
  useEffect(() => {
    (async () => {
      const [allInv, cAssets] = await Promise.all([
        base44.entities.Investment.filter({ wallet_id: wallet.id }),
        base44.entities.AssetDefinition.list(),
      ]);
      setInvestments(allInv);
      setCustomAssets(cAssets);
      if (cAssets.length > 0) {
        setPrices(prev => {
          const next = { ...prev };
          for (const ca of cAssets) {
            if (!next[ca.asset_id]) {
              const p = ca.start_price;
              next[ca.asset_id] = { price: p, history: Array.from({ length: 30 }, () => p) };
            }
          }
          return next;
        });
      }
      setLoading(false);
    })();
  }, []);

  // Tick prices
  useEffect(() => {
    const speed = Math.max(1, Number(upgradeEffects?.speedMultiplier || 1));
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        for (const a of allAssetsRef.current) {
          const pd = prev[a.id];
          if (!pd) {
            next[a.id] = { price: a.startPrice, history: Array.from({ length: 30 }, () => a.startPrice) };
            continue;
          }
          const newPrice = nextPrice(pd.price, a.volatility, a.drift);
          next[a.id] = { price: newPrice, history: [...pd.history, newPrice].slice(-HISTORY_LEN) };
        }
        return next;
      });
    }, TICK_MS / speed);
    return () => clearInterval(interval);
  }, [upgradeEffects?.speedMultiplier]);

  const refreshInvestments = async () => {
    const allInv = await base44.entities.Investment.filter({ wallet_id: wallet.id });
    setInvestments(allInv);
    onRefresh();
  };

  const refreshWallet = async () => {
    const all = await base44.entities.Wallet.list();
    const found = all.find(w => w.id === wallet.id);
    if (found) setWalletState(found);
    await refreshInvestments();
  };

  const handleBuy = (dollars, shares, price) => {
    setWalletState(w => ({ ...w, balance: w.balance - dollars }));
    setInvestments(prev => {
      const existing = prev.find(i => i.asset_id === selected);
      if (existing) {
        const totalShares = existing.shares + shares;
        const newAvg = (existing.shares * existing.avg_buy_price + dollars) / totalShares;
        return prev.map(i => i.asset_id === selected ? { ...i, shares: totalShares, avg_buy_price: newAvg } : i);
      }
      return [...prev, { wallet_id: wallet.id, asset_id: selected, shares, avg_buy_price: price }];
    });
    onRefresh();
  };

  const handleSell = (proceeds, sharesSold) => {
    setWalletState(w => ({ ...w, balance: w.balance + proceeds }));
    setInvestments(prev =>
      prev.map(i => {
        if (i.asset_id !== selected) return i;
        const remaining = i.shares - sharesSold;
        return remaining < 0.000001 ? null : { ...i, shares: remaining };
      }).filter(Boolean)
    );
    onRefresh();
  };

  const selectedAsset = allAssets.find(a => a.id === selected);
  const selectedPrice = selected ? (prices[selected] || { price: 0, history: [] }) : null;
  const selectedInv = selected ? investments.find(i => i.asset_id === selected) : null;

  const totalPortfolio = investments.reduce((sum, inv) => {
    const pd = prices[inv.asset_id];
    return sum + (pd ? inv.shares * pd.price : 0);
  }, 0);

  return (
    <>
      {showDevEditor && (
        <DevAssetEditor
          allAssets={allAssets}
          onClose={() => setShowDevEditor(false)}
          onRefresh={refreshInvestments}
        />
      )}
      {showAssetTypeEditor && (
        <DevAssetTypeManager
          onClose={() => setShowAssetTypeEditor(false)}
          onRefresh={async () => {
            const cAssets = await base44.entities.AssetDefinition.list();
            setCustomAssets(cAssets);
            setPrices(prev => {
              const next = { ...prev };
              for (const ca of cAssets) {
                if (!next[ca.asset_id]) {
                  next[ca.asset_id] = { price: ca.start_price, history: Array.from({ length: 30 }, () => ca.start_price) };
                }
              }
              return next;
            });
          }}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-white font-bold text-lg">Market</h2>
              {totalPortfolio > 0 && (
                <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  ${totalPortfolio.toFixed(2)}
                </span>
              )}
              {isDevMode && (
                <button onClick={(e) => { e.stopPropagation(); setShowDevEditor(true); }}
                  className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full hover:bg-yellow-500/30 border border-yellow-500/30">
                  ⚙️ Holdings
                </button>
              )}
              {isDevMode && (
                <button onClick={(e) => { e.stopPropagation(); setShowAssetTypeEditor(true); }}
                  className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full hover:bg-orange-500/30 border border-orange-500/30">
                  ⚙️ Assets
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-slate-400 text-sm font-mono">
                <span className="text-white font-bold">${walletState.balance?.toFixed(2)}</span>
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-4 flex-1">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <AssetDetail
                    asset={selectedAsset}
                    priceData={selectedPrice}
                    myInvestment={selectedInv}
                    wallet={walletState}
                    onBack={() => setSelected(null)}
                    onBuy={handleBuy}
                    onSell={handleSell}
                    upgradeEffects={upgradeEffects}
                  />
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>
                  ) : (
                    allAssets.map((asset, idx) => {
                      const pd = prices[asset.id];
                      if (!pd) return null;
                      const price = pd.price;
                      const history = pd.history;
                      const first = history[0] || price;
                      const up = price >= first;
                      const pct = first > 0 ? ((price - first) / first) * 100 : 0;
                      const myInv = investments.find(i => i.asset_id === asset.id);
                      const holdingValue = myInv ? myInv.shares * price : 0;

                      return (
                        <motion.button
                          key={asset.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setSelected(asset.id)}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl w-8 text-center">{asset.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-semibold text-sm">{asset.label}</span>
                                <span className="text-white font-mono font-bold text-sm">${fmt(price)}</span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-slate-500 text-xs">{asset.symbol}</span>
                                <span className={`text-xs font-mono font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                                  {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                                </span>
                              </div>
                              {myInv && (
                                <div className="mt-0.5 text-xs text-violet-400 font-mono">
                                  {myInv.shares.toFixed(4)} {asset.symbol} ≈ ${holdingValue.toFixed(2)}
                                  {holdingValue - myInv.shares * myInv.avg_buy_price >= 0
                                    ? <span className="text-emerald-400 ml-1">+${(holdingValue - myInv.shares * myInv.avg_buy_price).toFixed(2)}</span>
                                    : <span className="text-red-400 ml-1">${(holdingValue - myInv.shares * myInv.avg_buy_price).toFixed(2)}</span>
                                  }
                                </div>
                              )}
                            </div>
                            <div className="w-20 flex-shrink-0">
                              <Sparkline history={history} up={up} />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}