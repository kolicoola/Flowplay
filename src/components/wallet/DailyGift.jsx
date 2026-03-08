import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Clock } from "lucide-react";
import { toast } from "sonner";

const GIFT_KEY_PREFIX = "payflow_daily_gift_";
const GIFT_AMOUNT = 10000;
const COOLDOWN = 24 * 60 * 60 * 1000; // exactly 24 hours

export default function DailyGift({ wallet, onRefresh }) {
  const key = GIFT_KEY_PREFIX + wallet.id;
  const lastClaim = parseInt(localStorage.getItem(key) || "0");
  const now = Date.now();
  const timeLeft = Math.max(0, COOLDOWN - (now - lastClaim));
  const canClaim = timeLeft === 0;

  const [claiming, setClaiming] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState("");
  const [showPop, setShowPop] = useState(false);

  useEffect(() => {
    if (canClaim) return;
    const tick = () => {
      const tl = Math.max(0, COOLDOWN - (Date.now() - parseInt(localStorage.getItem(key) || "0")));
      const h = Math.floor(tl / 3600000);
      const m = Math.floor((tl % 3600000) / 60000);
      const s = Math.floor((tl % 60000) / 1000);
      setTimeDisplay(`${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [canClaim, key]);

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    await base44.entities.Wallet.update(wallet.id, { balance: wallet.balance + GIFT_AMOUNT });
    localStorage.setItem(key, String(Date.now()));
    setShowPop(true);
    setTimeout(() => setShowPop(false), 2500);
    toast.success(`🎁 Daily gift claimed! +$${GIFT_AMOUNT}`);
    setClaiming(false);
    onRefresh();
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showPop && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 pointer-events-none"
          >
            <span className="text-2xl font-black text-emerald-400 drop-shadow-lg">+$10,000 🎁</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={canClaim ? { scale: 1.03 } : {}}
        whileTap={canClaim ? { scale: 0.97 } : {}}
        onClick={handleClaim}
        disabled={!canClaim || claiming}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
          canClaim
            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40 hover:border-emerald-400/60 cursor-pointer"
            : "bg-white/5 border-white/10 cursor-not-allowed opacity-70"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${canClaim ? "bg-emerald-500/20" : "bg-white/5"}`}>
            {canClaim ? "🎁" : <Clock className="w-5 h-5 text-slate-400" />}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Daily Gift</p>
            <p className="text-xs text-slate-400">
              {canClaim ? "Claim your $10,000 reward!" : `Next gift in ${timeDisplay}`}
            </p>
          </div>
        </div>
        {canClaim && (
          <span className="text-emerald-400 font-black text-lg">+$10,000</span>
        )}
      </motion.button>
    </div>
  );
}