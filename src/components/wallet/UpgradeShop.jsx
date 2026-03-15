import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, X, Lock, ArrowUp, Loader2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import {
  UPGRADE_DEFS,
  TIMED_UPGRADES,
  TIPS_UPGRADES,
  FRIENDSHIP_UPGRADE,
  purchaseUpgrade,
} from "./upgradeEffects";

function fmtDuration(msLeft) {
  const totalSec = Math.max(0, Math.floor(msLeft / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function ActiveItemCard({ title, subtitle, timeLeft, theme }) {
  return (
    <div className={`wallet-upgrade-card wallet-upgrade-card--potion-texture ${theme} min-h-32 flex-col items-start justify-between`}>
      <div>
        <p className="text-white font-semibold text-base">{title}</p>
        <p className="text-white/75 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="text-sm font-mono text-white/95 flex items-center gap-2">
        <Clock3 className="w-4 h-4" /> {timeLeft}
      </div>
    </div>
  );
}

function PermanentTipCard({ title, subtitle, amount, intervalSec }) {
  return (
    <div className="wallet-upgrade-card wallet-upgrade-card--tips min-h-32 flex-col items-start justify-between">
      <div>
        <p className="text-white font-semibold text-base">{title}</p>
        <p className="text-white/75 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="text-sm font-mono text-lime-100">+${amount.toLocaleString()} every {intervalSec}s forever</div>
    </div>
  );
}

export default function UpgradeShop({ wallet, onClose, onRefresh, onBuy, upgradeEffects }) {
  const [buying, setBuying] = useState(null);
  const [balance, setBalance] = useState(Number(wallet.balance) || 0);
  const [now, setNow] = useState(Date.now());

  const cardBaseClass = "wallet-upgrade-card";
  const luckyMsLeft = Math.max(0, Number(upgradeEffects?.luckyUntil || 0) - now);
  const speedMsLeft = Math.max(0, Number(upgradeEffects?.speedUntil || 0) - now);
  const friendshipMsLeft = Math.max(0, Number(upgradeEffects?.friendshipUntil || 0) - now);
  const activeItems = [
    upgradeEffects?.luckyActive && {
      id: "active-lucky",
      title: "Lucky Potion",
      subtitle: "Market edge and better coin odds stay active until the timer ends.",
      timeLeft: fmtDuration(luckyMsLeft),
      theme: "wallet-upgrade-card--lucky",
    },
    upgradeEffects?.speedActive && {
      id: "active-speed",
      title: "Over Speed Yuki",
      subtitle: "Faster market ticks, gifts, and tip spawns are active now.",
      timeLeft: fmtDuration(speedMsLeft),
      theme: "wallet-upgrade-card--speed",
    },
    upgradeEffects?.friendshipActive && {
      id: "active-friendship",
      title: "Friendship Aura",
      subtitle: "Incoming payments are doubled until this timer expires.",
      timeLeft: fmtDuration(friendshipMsLeft),
      theme: "wallet-upgrade-card--friendship",
    },
  ].filter(Boolean);

  useEffect(() => { setBalance(Number(wallet.balance) || 0); }, [wallet.balance]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleBuy = async (upgrade) => {
    if (balance < upgrade.cost) { toast.error(`Need $${upgrade.cost.toLocaleString()}`); return; }

    setBuying(upgrade.id);
    try {
      await purchaseUpgrade(wallet.id, upgrade.id);
      const updatedWallet = await onRefresh?.();
      if (updatedWallet) {
        setBalance(Number(updatedWallet.balance) || 0);
      } else {
        setBalance((prev) => Math.max(0, prev - upgrade.cost));
      }
      toast.success(`${upgrade.label} purchased!`);
      await onBuy?.();
    } catch (e) {
      toast.error(e?.message || "Could not buy upgrade");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl h-[92vh] flex flex-col">

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

        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="grid h-full gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div>
                <p className="text-slate-300 text-xs font-mono uppercase tracking-[0.25em]">Your Items</p>
                <h3 className="text-white font-bold text-2xl mt-2">Active now</h3>
                <p className="text-slate-400 text-sm mt-2">All bought items expire when their timer ends. Tips stay forever and keep stacking.</p>
              </div>

              {activeItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  {activeItems.map((item) => (
                    <ActiveItemCard key={item.id} {...item} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-slate-400 text-sm">
                  No timed items are active yet. Buy one from the shop and it will appear here until the timer ends.
                </div>
              )}

              <div>
                <p className="text-slate-300 text-xs font-mono uppercase tracking-[0.25em]">Permanent Tips</p>
                <div className="grid gap-4 mt-3 sm:grid-cols-2 xl:grid-cols-1">
                  {(upgradeEffects?.tipGenerators || []).length > 0 ? (
                    upgradeEffects.tipGenerators.map((tip) => (
                      <PermanentTipCard
                        key={tip.id}
                        title={tip.label}
                        subtitle={`Owned x${tip.ownedCount}`}
                        amount={tip.amount}
                        intervalSec={tip.intervalSec}
                      />
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-slate-400 text-sm">
                      You do not own any permanent tip items yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">🍀 Lucky Potion</p>
          {TIMED_UPGRADES.filter((u) => u.kind === "timed_lucky").map((upg) => {
            const canAfford = balance >= upg.cost;
            const isLoading = buying === upg.id;
            const isActive = (upgradeEffects?.luckyUntil || 0) > now;
            const msLeft = Math.max(0, (upgradeEffects?.luckyUntil || 0) - now);
            return (
              <div key={upg.id} className={`${cardBaseClass} wallet-upgrade-card--shop-item wallet-upgrade-card--potion-texture wallet-upgrade-card--lucky`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{upg.label}</p>
                    {isActive && <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="text-white/75 text-xs mt-0.5">{upg.description}</p>
                  {isActive && (
                    <p className="text-amber-100 text-xs mt-1 font-mono flex items-center gap-1">
                      <Clock3 className="w-3 h-3" /> {fmtDuration(msLeft)} left
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleBuy(upg)}
                  disabled={!!buying || !canAfford}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-yellow-500 hover:bg-yellow-400 text-black" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> {isActive ? "Extend" : `$${upg.cost.toLocaleString()}`}</>}
                </button>
              </div>
            );
          })}

          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-4">⚡ Over Speed Yuki</p>
          {TIMED_UPGRADES.filter((u) => u.kind === "timed_speed").map((upg) => {
            const canAfford = balance >= upg.cost;
            const isLoading = buying === upg.id;
            const isActive = (upgradeEffects?.speedUntil || 0) > now;
            const msLeft = Math.max(0, (upgradeEffects?.speedUntil || 0) - now);
            return (
              <div key={upg.id} className={`${cardBaseClass} wallet-upgrade-card--shop-item wallet-upgrade-card--potion-texture wallet-upgrade-card--speed`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{upg.label}</p>
                    {isActive && <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="text-white/75 text-xs mt-0.5">{upg.description}</p>
                  {isActive && (
                    <p className="text-cyan-100 text-xs mt-1 font-mono flex items-center gap-1">
                      <Clock3 className="w-3 h-3" /> {fmtDuration(msLeft)} left
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleBuy(upg)}
                  disabled={!!buying || !canAfford}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-violet-500 hover:bg-violet-400 text-white" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> {isActive ? "Extend" : `$${upg.cost.toLocaleString()}`}</>}
                </button>
              </div>
            );
          })}

          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-4">💸 Tips (permanent)</p>
          {TIPS_UPGRADES.map((upg) => {
            const canAfford = balance >= upg.cost;
            const isLoading = buying === upg.id;
            const owned = (upgradeEffects?.tipGenerators || []).find((t) => t.id === upg.id);
            return (
              <div key={upg.id} className={`${cardBaseClass} wallet-upgrade-card--shop-item wallet-upgrade-card--tips`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{upg.label}</p>
                    {!!owned && <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">x{owned.ownedCount}</span>}
                  </div>
                  <p className="text-white/75 text-xs mt-0.5">{upg.description}</p>
                  {!!owned && <p className="text-lime-100 text-xs mt-1 font-mono">Now +${owned.amount.toLocaleString()} every {upg.intervalSec}s</p>}
                </div>
                <button
                  onClick={() => handleBuy(upg)}
                  disabled={!!buying || !canAfford}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> Buy</>}
                </button>
              </div>
            );
          })}

          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-4">🤝 Friendship Aura</p>
          <div className={`${cardBaseClass} wallet-upgrade-card--shop-item wallet-upgrade-card--potion-texture wallet-upgrade-card--friendship`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm">{FRIENDSHIP_UPGRADE.label}</p>
                {upgradeEffects?.friendshipActive && (
                  <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-white/75 text-xs mt-0.5">{FRIENDSHIP_UPGRADE.description}</p>
              {upgradeEffects?.friendshipActive && (
                <p className="text-rose-100 text-xs mt-1 font-mono flex items-center gap-1">
                  <Clock3 className="w-3 h-3" /> {fmtDuration(friendshipMsLeft)} left
                </p>
              )}
            </div>
            <button
              onClick={() => handleBuy(UPGRADE_DEFS[FRIENDSHIP_UPGRADE.id])}
              disabled={!!buying || balance < FRIENDSHIP_UPGRADE.cost}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${balance >= FRIENDSHIP_UPGRADE.cost ? "bg-cyan-500 hover:bg-cyan-400 text-black" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
              {buying === FRIENDSHIP_UPGRADE.id ? <Loader2 className="w-4 h-4 animate-spin" /> : balance < FRIENDSHIP_UPGRADE.cost ? <><Lock className="w-3 h-3" /> ${FRIENDSHIP_UPGRADE.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> {upgradeEffects?.friendshipActive ? "Extend" : `$${FRIENDSHIP_UPGRADE.cost.toLocaleString()}`}</>}
            </button>
          </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}