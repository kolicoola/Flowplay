import React from "react";
import { motion } from "framer-motion";
import { Send, QrCode, ShoppingBag, Heart, TrendingUp, Coins, Zap } from "lucide-react";

export default function ActionButtons({ onPayByName, onQRCode, onStore, onDonate, onInvest, onCoinFlip, onUpgrade }) {
  const actions = [
    { icon: Send,        label: "Send",     color: "from-indigo-500 to-violet-500",  onClick: onPayByName },
    { icon: QrCode,      label: "QR",       color: "from-violet-500 to-purple-500",  onClick: onQRCode },
    { icon: ShoppingBag, label: "Store",    color: "from-pink-500 to-rose-500",      onClick: onStore },
    { icon: Heart,       label: "Donate",   color: "from-rose-500 to-red-500",       onClick: onDonate },
    { icon: TrendingUp,  label: "Invest",   color: "from-emerald-500 to-teal-500",   onClick: onInvest },
    { icon: Coins,       label: "Flip",     color: "from-amber-500 to-orange-500",   onClick: onCoinFlip },
    { icon: Zap,         label: "Upgrades", color: "from-yellow-400 to-amber-500",   onClick: onUpgrade },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 group"
        >
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-300 font-medium text-sm">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}