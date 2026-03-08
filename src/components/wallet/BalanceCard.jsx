import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Eye, EyeOff, Pencil, Check, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAvatarStyle, getLetterStyle, HairOverlay } from "./avatarUtils";

export default function BalanceCard({ wallet, onRefresh }) {
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!newName.trim()) return;
    if (wallet.balance < 100) {
      toast.error("You need at least $100 to change your name.");
      return;
    }
    setLoading(true);
    await base44.entities.Wallet.update(wallet.id, {
      username: newName.trim(),
      balance: wallet.balance - 100,
    });
    toast.success(`Name changed to "${newName.trim()}" for $100`);
    setEditing(false);
    setNewName("");
    setLoading(false);
    onRefresh?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 shadow-2xl shadow-indigo-500/20"
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
          <div className="relative flex flex-col items-center">
            <HairOverlay hairId={wallet.avatar_hair} size="md" />
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg"
              style={getAvatarStyle(wallet)}
            >
              <span style={getLetterStyle(wallet)}>{wallet.username?.[0]?.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <p className="text-white/60 text-sm">Welcome back,</p>
            {editing ? (
              <div className="flex items-center gap-1 mt-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  className="h-7 w-32 bg-white/10 border-white/20 text-white text-sm px-2"
                  autoFocus
                />
                <button onClick={handleRename} disabled={loading} className="text-emerald-300 hover:text-emerald-200">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(false); setNewName(""); }} className="text-white/40 hover:text-white/70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <p className="text-white font-semibold text-lg">{wallet.username}</p>
                <button onClick={() => { setEditing(true); setNewName(wallet.username); }} className="text-white/30 hover:text-white/70 transition-colors ml-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          </div>
          <button onClick={() => setHidden(!hidden)} className="text-white/60 hover:text-white transition-colors">
            {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div>
          <p className="text-white/60 text-sm mb-1">Total Balance</p>
          <p className="text-5xl font-bold text-white tracking-tight">
            {hidden ? "••••••" : `$${(wallet.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 text-emerald-300 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>Available balance</span>
        </div>
      </div>
    </motion.div>
  );
}