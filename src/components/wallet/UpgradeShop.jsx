import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Lock, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const UPGRADES = [
  {
    id: "collector_1",
    type: "collector",
    label: "💵 Dollar Drops",
    description: "Click dollars as they appear on screen.",
    amount: 100,
    intervalSec: 40,
    cost: 500
  },
  {
    id: "collector_2",
    type: "collector",
    label: "💰 Money Rain",
    description: "Bigger dollars appear more often.",
    amount: 500,
    intervalSec: 60,
    cost: 3000
  },
  {
    id: "passive_1",
    type: "passive",
    label: "⏱️ Drip Income",
    description: "Earns $5 every 10 seconds automatically.",
    ratePerSec: 0.5,
    cost: 5000
  },
  {
    id: "passive_2",
    type: "passive",
    label: "🏦 Money Machine",
    description: "Earns $50 per minute automatically.",
    ratePerSec: 0.833,
    cost: 50000
  },
];

export default function UpgradeShop({ wallet, onClose, onRefresh, ownedUpgrades, onBuy }) {
  const [buying, setBuying] = useState(null);
  const [balance, setBalance] = useState(wallet.balance);

  useEffect(() => { setBalance(wallet.balance); }, [wallet.balance]);

  const handleBuy = async (upgrade) => {
    if (ownedUpgrades && ownedUpgrades[upgrade.id]) { toast.error("Already owned!"); return; }
    if (balance < upgrade.cost) { toast.error(`Need $${upgrade.cost.toLocaleString()}`); return; }

    setBuying(upgrade.id);
    const newBalance = balance - upgrade.cost;
    setBalance(newBalance);
    await base44.entities.Wallet.update(wallet.id, { balance: newBalance });
    await base44.entities.Upgrade.create({ wallet_id: wallet.id, upgrade_id: upgrade.id, level: 1 });

    toast.success(`${upgrade.label} purchased!`);
    setBuying(null);
    if (onBuy) onBuy();
    onRefresh();
  };

  const owned = ownedUpgrades || {};

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold text-lg">Upgrade Shop</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm font-mono">$<span className="text-white font-bold">{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">💵 Collector — click dollars when they appear on screen</p>
          {UPGRADES.filter((u) => u.type === "collector").map((upg) => {
            const isOwned = !!owned[upg.id];
            const canAfford = balance >= upg.cost;
            const isLoading = buying === upg.id;
            return (
              <div key={upg.id} className={`rounded-2xl border p-4 flex items-center gap-4 ${isOwned ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-white/5"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{upg.label}</p>
                    {isOwned && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{upg.description}</p>
                  {isOwned && <p className="text-yellow-400 text-xs mt-1 font-mono">+${upg.amount} every {upg.intervalSec}s</p>}
                </div>
                {!isOwned && (
                  <button
                    onClick={() => handleBuy(upg)}
                    disabled={!!buying || !canAfford}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-yellow-500 hover:bg-yellow-400 text-black" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> ${upg.cost.toLocaleString()}</>}
                  </button>
                )}
              </div>
            );
          })}

          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-4">⚡ Passive — earns automatically</p>
          {UPGRADES.filter((u) => u.type === "passive").map((upg) => {
            const isOwned = !!owned[upg.id];
            const canAfford = balance >= upg.cost;
            const isLoading = buying === upg.id;
            return (
              <div key={upg.id} className={`rounded-2xl border p-4 flex items-center gap-4 ${isOwned ? "border-violet-500/30 bg-violet-500/5" : "border-white/10 bg-white/5"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{upg.label}</p>
                    {isOwned && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{upg.description}</p>
                  {isOwned && upg.id === "passive_1" && <p className="text-violet-400 text-xs mt-1 font-mono">+$5 every 10 seconds</p>}
                  {isOwned && upg.id === "passive_2" && <p className="text-violet-400 text-xs mt-1 font-mono">+$50 per minute</p>}
                </div>
                {!isOwned && (
                  <button
                    onClick={() => handleBuy(upg)}
                    disabled={!!buying || !canAfford}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-violet-500 hover:bg-violet-400 text-white" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> ${upg.cost.toLocaleString()}</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}