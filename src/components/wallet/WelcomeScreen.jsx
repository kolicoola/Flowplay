import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, Sparkles, ArrowRight } from "lucide-react";

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"
];

export default function WelcomeScreen({ onComplete }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name");
      return;
    }
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setLoading(true);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    await onComplete(trimmed, color);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-6 shadow-lg shadow-indigo-500/30"
          >
            <Wallet className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">PayFlow</span>
          </h1>
          <p className="text-slate-400 text-lg">Choose your name to get started</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Your Display Name</label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Enter your name..."
                className="h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-lg rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-300"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 justify-center mt-6 text-slate-500 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>You'll receive $1,000 to start</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}