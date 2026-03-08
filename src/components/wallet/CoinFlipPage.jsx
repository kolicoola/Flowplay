import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Loader2, Trophy, Clock, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAvatarStyle } from "./avatarUtils";

function AvatarBubble({ wallet, size = "w-9 h-9", text = "sm" }) {
  return (
    <div className={`${size} rounded-full flex items-center justify-center text-white font-bold text-${text} flex-shrink-0`}
      style={getAvatarStyle(wallet)}>
      {wallet?.username?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function CoinAnimation({ result, amount, onDone }) {
  const [phase, setPhase] = useState("spin"); // spin -> reveal

  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 2000);
    const t2 = setTimeout(() => onDone(), 3500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-6">
        {phase === "spin" ? (
          <motion.div
            animate={{ rotateY: [0, 360, 720, 1080, 1440, 1800] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 text-5xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            🪙
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="text-7xl">{result === "win" ? "🎉" : "😢"}</div>
            <p className={`text-3xl font-black ${result === "win" ? "text-emerald-400" : "text-red-400"}`}>
              {result === "win" ? `+$${(amount * 2).toFixed(2)}` : `-$${amount.toFixed(2)}`}
            </p>
            <p className="text-white text-lg font-semibold">
              {result === "win" ? "YOU WON!" : "You lost..."}
            </p>
          </motion.div>
        )}
        {phase === "spin" && (
          <p className="text-amber-300 text-lg font-bold animate-pulse">Flipping coin...</p>
        )}
      </div>
    </motion.div>
  );
}

export default function CoinFlipPage({ wallet, onClose, onRefresh }) {
  const [flips, setFlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [allWallets, setAllWallets] = useState({});
  const [walletBalance, setWalletBalance] = useState(wallet.balance);
  const [flipAnim, setFlipAnim] = useState(null); // { result, amount }
  const watchedFlipRef = useRef(null); // flip we created and are watching

  const loadData = async () => {
    const [all, walletList] = await Promise.all([
      base44.entities.CoinFlip.list("-created_date", 50),
      base44.entities.Wallet.list(),
    ]);
    setFlips(all);
    const wMap = {};
    for (const w of walletList) wMap[w.id] = w;
    setAllWallets(wMap);
    const me = walletList.find(w => w.id === wallet.id);
    if (me) setWalletBalance(me.balance);
    setLoading(false);
  };

  // Subscribe so creator sees animation when someone joins their flip
  useEffect(() => {
    const unsub = base44.entities.CoinFlip.subscribe((event) => {
      const type = event?.type || event?.operation;
      const data = event?.data || event?.record;
      if (type === "update" && data?.status === "completed") {
        const flip = data;
        // Only show animation if this is our flip and we haven't seen it yet
        if (flip.creator_wallet_id === wallet.id && watchedFlipRef.current === flip.id) {
          watchedFlipRef.current = null;
          const result = flip.winner_wallet_id === wallet.id ? "win" : "lose";
          setFlipAnim({ result, amount: flip.amount });
          loadData();
          onRefresh();
        }
      }
      if (type === "create" || type === "update" || type === "delete") {
        loadData();
      }
    });
    return unsub;
  }, [wallet.id]);

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > walletBalance) { toast.error("Insufficient balance"); return; }
    setCreating(true);
    await base44.entities.Wallet.update(wallet.id, { balance: walletBalance - amt });
    const newFlip = await base44.entities.CoinFlip.create({
      creator_wallet_id: wallet.id,
      creator_username: wallet.username,
      amount: amt,
      status: "waiting",
    });
    watchedFlipRef.current = newFlip.id;
    toast.success(`Flip created for $${amt.toFixed(2)}! Waiting for someone to join...`);
    setAmount("");
    setShowCreate(false);
    setCreating(false);
    await loadData();
    onRefresh();
  };

  const handleJoin = async (flip) => {
    if (flip.creator_wallet_id === wallet.id) { toast.error("You can't join your own flip!"); return; }
    if (walletBalance < flip.amount) { toast.error("Insufficient balance"); return; }
    setJoiningId(flip.id);

    await base44.entities.Wallet.update(wallet.id, { balance: walletBalance - flip.amount });

    const creatorWins = Math.random() < 0.5;
    const winner = creatorWins ? flip.creator_wallet_id : wallet.id;
    const winnerName = creatorWins ? flip.creator_username : wallet.username;
    const totalPot = flip.amount * 2;

    const winnerWallet = allWallets[winner];
    if (winnerWallet) {
      await base44.entities.Wallet.update(winner, { balance: (winnerWallet.balance || 0) + totalPot });
    }

    await base44.entities.CoinFlip.update(flip.id, {
      joiner_wallet_id: wallet.id,
      joiner_username: wallet.username,
      status: "completed",
      winner_wallet_id: winner,
      winner_username: winnerName,
    });

    const result = winner === wallet.id ? "win" : "lose";
    setJoiningId(null);
    setFlipAnim({ result, amount: flip.amount });
    await loadData();
    onRefresh();
  };

  const handleCancelFlip = async (flip) => {
    const creatorW = allWallets[flip.creator_wallet_id];
    if (creatorW) {
      await base44.entities.Wallet.update(flip.creator_wallet_id, { balance: (creatorW.balance || 0) + flip.amount });
    }
    await base44.entities.CoinFlip.delete(flip.id);
    toast.success("Flip cancelled, funds refunded.");
    await loadData();
    onRefresh();
  };

  const waiting = flips.filter(f => f.status === "waiting");
  const completed = flips.filter(f => f.status === "completed" && (f.creator_wallet_id === wallet.id || f.joiner_wallet_id === wallet.id));

  return (
    <>
      <AnimatePresence>
        {flipAnim && (
          <CoinAnimation
            result={flipAnim.result}
            amount={flipAnim.amount}
            onDone={() => setFlipAnim(null)}
          />
        )}
      </AnimatePresence>

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
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h2 className="text-white font-bold text-lg">Coin Flip</h2>
              <span className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">50/50</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm font-mono">$<span className="text-white font-bold">{walletBalance?.toFixed(2)}</span></span>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="overflow-y-auto p-4 flex-1 space-y-4">
            {/* Create flip */}
            <button
              onClick={() => setShowCreate(v => !v)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Create Coin Flip
            </button>

            <AnimatePresence>
              {showCreate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 rounded-2xl p-4 space-y-3 overflow-hidden"
                >
                  <p className="text-slate-300 text-sm">Enter the amount to bet. Someone will join and the winner takes all!</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Bet amount ($)"
                      className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go!"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {[10, 50, 100, 500].map(v => (
                      <button key={v} onClick={() => setAmount(String(v))}
                        className="flex-1 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-mono">
                        ${v}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waiting flips */}
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
            ) : (
              <>
                {waiting.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Open Flips ({waiting.length})
                    </p>
                    <div className="space-y-2">
                      {waiting.map(flip => {
                        const ismine = flip.creator_wallet_id === wallet.id;
                        const creatorW = allWallets[flip.creator_wallet_id];
                        return (
                          <div key={flip.id} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                            <AvatarBubble wallet={creatorW} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold">{flip.creator_username}</p>
                              <p className="text-amber-400 font-mono font-bold">${flip.amount?.toFixed(2)} <span className="text-slate-500 font-normal text-xs">pot: ${(flip.amount * 2).toFixed(2)}</span></p>
                            </div>
                            {ismine ? (
                              <button onClick={() => handleCancelFlip(flip)}
                                className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30">
                                Cancel
                              </button>
                            ) : (
                              <button
                                onClick={() => handleJoin(flip)}
                                disabled={joiningId === flip.id || walletBalance < flip.amount}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40"
                              >
                                {joiningId === flip.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Join!"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {completed.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> My Results
                    </p>
                    <div className="space-y-2">
                      {completed.slice(0, 10).map(flip => {
                        const iWon = flip.winner_wallet_id === wallet.id;
                        return (
                          <div key={flip.id} className={`rounded-2xl p-3 flex items-center gap-3 ${iWon ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                            <span className="text-2xl">{iWon ? "🎉" : "😢"}</span>
                            <div className="flex-1">
                              <p className="text-white text-sm">
                                {iWon ? "You won!" : "You lost"} vs <span className="font-semibold">{iWon ? (flip.creator_wallet_id === wallet.id ? flip.joiner_username : flip.creator_username) : flip.winner_username}</span>
                              </p>
                              <p className={`font-mono font-bold text-sm ${iWon ? "text-emerald-400" : "text-red-400"}`}>
                                {iWon ? `+$${(flip.amount * 2).toFixed(2)}` : `-$${flip.amount?.toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {waiting.length === 0 && completed.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Coins className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No active flips. Create one!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}