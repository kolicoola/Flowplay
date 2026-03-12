import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { UPGRADES } from "./UpgradeShop";

function FloatingDollar({ id, amount, x, y, isBonus, onCollect }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3, y: -40 }}
      onClick={() => onCollect(id, amount)}
      className="fixed z-[200] cursor-pointer select-none"
      style={{ left: x, top: y }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: isBonus ? [0, -3, 3, 0] : 0 }}
        transition={{ repeat: Infinity, duration: isBonus ? 1.2 : 1.4, ease: "easeInOut" }}
        className={`font-black text-sm px-3 py-1.5 rounded-full shadow-lg border ${
          isBonus
            ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-yellow-300 text-base px-4 py-2"
            : "bg-emerald-500 text-white border-emerald-400"
        }`}
      >
        {isBonus ? "🎁 +$1,500" : `+$${amount}`}
      </motion.div>
    </motion.button>
  );
}

const BONUS_GIFT_AMOUNT = 1500;
const BONUS_GIFT_INTERVAL = 10 * 60 * 1000; // 10 minutes

function spawnPos() {
  const sideWidth = Math.max(60, window.innerWidth * 0.14);
  const onLeft = Math.random() < 0.5;
  const x = onLeft
    ? 10 + Math.random() * (sideWidth - 50)
    : window.innerWidth - sideWidth + Math.random() * (sideWidth - 50);
  const y = 80 + Math.random() * (window.innerHeight - 200);
  return { x, y };
}

export default function CollectorOverlay({ wallet, ownedUpgrades, onRefresh }) {
  const [floatingDollars, setFloatingDollars] = useState([]);

  // Collector upgrades
  useEffect(() => {
    if (!ownedUpgrades) return;
    const timers = [];

    UPGRADES.filter((u) => u.type === "collector").forEach((upg) => {
      if (!ownedUpgrades[upg.id]) return;
      const timer = setInterval(() => {
        const { x, y } = spawnPos();
        const id = `${upg.id}_${Date.now()}`;
        setFloatingDollars((prev) => [...prev, { id, amount: upg.amount, x, y, isBonus: false }]);
        setTimeout(() => setFloatingDollars((prev) => prev.filter((d) => d.id !== id)), 12000);
      }, upg.intervalSec * 1000);
      timers.push(timer);
    });

    return () => timers.forEach(clearInterval);
  }, [ownedUpgrades]);

  // Bonus $1500 gift every 10 minutes — always active, no upgrade needed
  useEffect(() => {
    const timer = setInterval(() => {
      const { x, y } = spawnPos();
      const id = `bonus_gift_${Date.now()}`;
      setFloatingDollars((prev) => [...prev, { id, amount: BONUS_GIFT_AMOUNT, x, y, isBonus: true }]);
      setTimeout(() => setFloatingDollars((prev) => prev.filter((d) => d.id !== id)), 30000);
    }, BONUS_GIFT_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleCollect = async (id, amount) => {
    setFloatingDollars((prev) => prev.filter((d) => d.id !== id));
    try {
      await base44.adjustWalletBalance(wallet.id, amount);
      onRefresh();
      toast.success(`+$${amount} collected!`, { duration: 1000 });
    } catch (e) {
      toast.error(e?.message || "Could not collect reward");
    }
  };

  return (
    <AnimatePresence>
      {floatingDollars.map((d) => (
        <FloatingDollar key={d.id} {...d} onCollect={handleCollect} />
      ))}
    </AnimatePresence>
  );
}