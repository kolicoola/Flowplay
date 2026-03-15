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

function OwnedItemCard({ title, subtitle, extra, theme }) {
  return (
    <div className={`wallet-upgrade-card ${theme} min-h-28 flex-col items-start justify-between`}>
      <div>
        <p className="wallet-upgrade-card__name text-base">{title}</p>
        <p className="wallet-upgrade-card__desc mt-1">{subtitle}</p>
      </div>
      {!!extra && <p className="text-xs font-mono text-white/95">{extra}</p>}
    </div>
  );
}

export default function UpgradeShop({ wallet, onClose, onRefresh, onBuy, upgradeEffects }) {
  const [buying, setBuying] = useState(null);
  const [balance, setBalance] = useState(Number(wallet.balance) || 0);
  const [now, setNow] = useState(Date.now());

  const cardBaseClass = "wallet-upgrade-card";

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
      setBalance(Number(updatedWallet.balance) || 0);
      toast.success(`${upgrade.label} purchased!`);
      if (onBuy) onBuy();
    } catch (e) {
      toast.error(e?.message || "Could not buy upgrade");
    } finally {
      setBuying(null);
    }
  };

  const luckyMsLeft = Math.max(0, (upgradeEffects?.luckyUntil || 0) - now);
  const speedMsLeft = Math.max(0, (upgradeEffects?.speedUntil || 0) - now);
  const activeLucky = luckyMsLeft > 0;
  const activeSpeed = speedMsLeft > 0;
  const friendshipLeft = Number(upgradeEffects?.friendshipRemaining || 0);
  const ownedTips = upgradeEffects?.tipGenerators || [];

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
                <p className="text-slate-400 text-sm mt-2">All bought items run for their duration. Tips stay forever and keep stacking.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {activeLucky && (
                  <OwnedItemCard
                    title="Lucky Potion"
                    subtitle="Market bonus and improved coin odds are active."
                    extra={`${fmtDuration(luckyMsLeft)} left`}
                    theme="wallet-upgrade-card--lucky"
                  />
                )}
                {activeSpeed && (
                  <OwnedItemCard
                    title="Over Speed Yuki"
                    subtitle="Faster timers and faster tip spawning are active."
                    extra={`${fmtDuration(speedMsLeft)} left`}
                    theme="wallet-upgrade-card--speed"
                  />
                )}
                {friendshipLeft > 0 && (
                  <OwnedItemCard
                    title="Friendship"
                    subtitle="Incoming payments can still be doubled."
                    extra={`${friendshipLeft} boost${friendshipLeft === 1 ? "" : "s"} left`}
                    theme="wallet-upgrade-card--friendship"
                  />
                )}
                {!activeLucky && !activeSpeed && friendshipLeft <= 0 && (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-slate-400 text-sm">
                    No timed items are active yet. Buy one from the shop and it will appear here.
                  </div>
                )}
              </div>

              <div>
                <p className="text-slate-300 text-xs font-mono uppercase tracking-[0.25em]">Permanent Tips</p>
                <div className="grid gap-4 mt-3 sm:grid-cols-2 xl:grid-cols-1">
                  {ownedTips.length > 0 ? (
                    ownedTips.map((tip) => (
                      <OwnedItemCard
                        key={tip.id}
                        title={tip.label}
                        subtitle={`Owned x${tip.ownedCount}`}
                        extra={`+$${tip.amount.toLocaleString()} every ${tip.intervalSec}s forever`}
                        theme="wallet-upgrade-card--tips"
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
              <div key={upg.id} className={`${cardBaseClass} wallet-upgrade-card--shop wallet-upgrade-card--lucky`}>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="wallet-upgrade-card__name">{upg.label}</p>
                    {isActive && <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="wallet-upgrade-card__desc mt-0.5">{upg.description}</p>
                  {isActive && (
                    <p className="text-amber-100 text-xs mt-1 font-mono flex items-center gap-1">
                      <Clock3 className="w-3 h-3" /> {fmtDuration(msLeft)} left
                    </p>
                  )}
                </div>
                <div className="wallet-upgrade-card__texture-zone" aria-hidden="true" />
                <button
                  onClick={() => handleBuy(upg)}
                  disabled={!!buying || !canAfford}
                  className={`wallet-upgrade-card__price-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-yellow-500 hover:bg-yellow-400 text-black" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> ${upg.cost.toLocaleString()}</>}
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
              <div key={upg.id} className={`${cardBaseClass} wallet-upgrade-card--shop wallet-upgrade-card--speed`}>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="wallet-upgrade-card__name">{upg.label}</p>
                    {isActive && <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <p className="wallet-upgrade-card__desc mt-0.5">{upg.description}</p>
                  {isActive && (
                    <p className="text-cyan-100 text-xs mt-1 font-mono flex items-center gap-1">
                      <Clock3 className="w-3 h-3" /> {fmtDuration(msLeft)} left
                    </p>
                  )}
                </div>
                <div className="wallet-upgrade-card__texture-zone" aria-hidden="true" />
                <button
                  onClick={() => handleBuy(upg)}
                  disabled={!!buying || !canAfford}
                  className={`wallet-upgrade-card__price-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-violet-500 hover:bg-violet-400 text-white" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> ${upg.cost.toLocaleString()}</>}
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
              <div key={upg.id} className={`${cardBaseClass} wallet-upgrade-card--shop wallet-upgrade-card--tips`}>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="wallet-upgrade-card__name">{upg.label}</p>
                    {!!owned && <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">x{owned.ownedCount}</span>}
                  </div>
                  <p className="wallet-upgrade-card__desc mt-0.5">{upg.description}</p>
                  {!!owned && <p className="text-lime-100 text-xs mt-1 font-mono">Now +${owned.amount.toLocaleString()} every {upg.intervalSec}s</p>}
                </div>
                <div className="wallet-upgrade-card__texture-zone" aria-hidden="true" />
                <button
                  onClick={() => handleBuy(upg)}
                  disabled={!!buying || !canAfford}
                  className={`wallet-upgrade-card__price-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${canAfford ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : !canAfford ? <><Lock className="w-3 h-3" /> ${upg.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> ${upg.cost.toLocaleString()}</>}
                </button>
              </div>
            );
          })}

          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-4">🤝 Friendship</p>
          <div className={`${cardBaseClass} wallet-upgrade-card--shop wallet-upgrade-card--friendship`}>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <p className="wallet-upgrade-card__name">{FRIENDSHIP_UPGRADE.label}</p>
                <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {upgradeEffects?.friendshipRemaining || 0} left
                </span>
              </div>
              <p className="wallet-upgrade-card__desc mt-0.5">{FRIENDSHIP_UPGRADE.description}</p>
            </div>
            <div className="wallet-upgrade-card__texture-zone" aria-hidden="true" />
            <button
              onClick={() => handleBuy(UPGRADE_DEFS[FRIENDSHIP_UPGRADE.id])}
              disabled={!!buying || balance < FRIENDSHIP_UPGRADE.cost}
              className={`wallet-upgrade-card__price-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${balance >= FRIENDSHIP_UPGRADE.cost ? "bg-cyan-500 hover:bg-cyan-400 text-black" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}>
              {buying === FRIENDSHIP_UPGRADE.id ? <Loader2 className="w-4 h-4 animate-spin" /> : balance < FRIENDSHIP_UPGRADE.cost ? <><Lock className="w-3 h-3" /> ${FRIENDSHIP_UPGRADE.cost.toLocaleString()}</> : <><ArrowUp className="w-3 h-3" /> ${FRIENDSHIP_UPGRADE.cost.toLocaleString()}</>}
            </button>
          </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}