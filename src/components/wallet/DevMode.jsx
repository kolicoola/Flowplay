import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ChevronDown, ChevronUp, Loader2, Check, Pencil, Trash2, DollarSign, Users, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAvatarStyle } from "./avatarUtils";

const MONEY_AMOUNTS = [100, 500, 1000, 9999];

export default function DevMode({ wallet, onRefresh, onSwitchUser }) {
  const [open, setOpen] = useState(true);
  const [allWallets, setAllWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editField, setEditField] = useState(null);
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [addingMoney, setAddingMoney] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [ownBalanceInput, setOwnBalanceInput] = useState("");
  const [globalAmount, setGlobalAmount] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    fetchAllWallets();
    const unsub = base44.entities.Wallet.subscribe(() => {
      fetchAllWallets();
    });
    return () => unsub?.();
  }, [open, wallet.id]);

  const fetchAllWallets = async () => {
    setLoadingWallets(true);
    const all = await base44.entities.Wallet.list();
    setAllWallets(all.filter((w) => w.id !== wallet.id));
    setLoadingWallets(false);
  };

  const handleOpen = (val) => {
    setOpen(val);
    if (val) fetchAllWallets();
  };

  const handleAddMoney = async (amount) => {
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) { toast.error("Enter a valid positive amount"); return; }
    setAddingMoney(true);
    try {
      await base44.adjustWalletBalance(wallet.id, val);
      await onRefresh();
      toast.success(`+$${val} added to your wallet!`);
    } catch (error) {
      toast.error(error?.message || "Failed to add money");
    } finally {
      setAddingMoney(false);
    }
  };

  const handleRemoveMoney = async (amount) => {
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) { toast.error("Enter a valid positive amount"); return; }
    setAddingMoney(true);
    try {
      await base44.adjustWalletBalance(wallet.id, -val);
      await onRefresh();
      toast.success(`-$${val} removed from your wallet`);
    } catch (error) {
      toast.error(error?.message || "Failed to remove money");
    } finally {
      setAddingMoney(false);
    }
  };

  const handleSetOwnBalance = async () => {
    const val = Number(ownBalanceInput);
    if (!Number.isFinite(val) || val < 0) { toast.error("Invalid balance"); return; }
    setAddingMoney(true);
    try {
      await base44.entities.Wallet.update(wallet.id, { balance: val });
      await onRefresh();
      toast.success(`Your balance is now $${val.toFixed(2)}`);
      setOwnBalanceInput("");
    } catch (error) {
      toast.error(error?.message || "Failed to set your balance");
    } finally {
      setAddingMoney(false);
    }
  };

  const handleRename = async (target) => {
    if (!newName.trim()) return;
    setSavingId(target.id);
    await base44.entities.Wallet.update(target.id, { username: newName.trim() });
    toast.success(`Renamed to "${newName.trim()}"`);
    setEditingId(null);
    setEditField(null);
    setNewName("");
    setSavingId(null);
    await fetchAllWallets();
  };

  const handleSetBalance = async (target) => {
    const val = parseFloat(newBalance);
    if (isNaN(val) || val < 0) { toast.error("Invalid amount"); return; }
    setSavingId(target.id);
    await base44.entities.Wallet.update(target.id, { balance: val });
    toast.success(`Balance set to $${val.toFixed(2)}`);
    setEditingId(null);
    setEditField(null);
    setNewBalance("");
    setSavingId(null);
    await fetchAllWallets();
  };

  const handleDelete = async (target) => {
    setDeletingId(target.id);
    await base44.entities.Wallet.delete(target.id);
    toast.success(`Deleted "${target.username}"`);
    setDeletingId(null);
    await fetchAllWallets();
  };

  const startEdit = (w, field) => {
    setEditingId(w.id);
    setEditField(field);
    if (field === "name") setNewName(w.username);
    if (field === "balance") setNewBalance(String(w.balance ?? ""));
  };

  const cancelEdit = () => { setEditingId(null); setEditField(null); setNewName(""); setNewBalance(""); };

  const handleCreateTestUser = async () => {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const username = `Test_${suffix}`;
    await base44.entities.Wallet.create({
      username,
      balance: 1000,
      avatar_color: "#6366f1",
    });
    toast.success(`Created ${username}`);
    await fetchAllWallets();
  };

  const handleCreateManyTestUsers = async (count = 5) => {
    setBulkLoading(true);
    try {
      const tasks = Array.from({ length: count }).map(() => {
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        return base44.entities.Wallet.create({
          username: `Bot_${suffix}`,
          balance: 1000,
          avatar_color: "#6366f1",
        });
      });
      await Promise.all(tasks);
      toast.success(`Created ${count} test users`);
      await fetchAllWallets();
    } catch (error) {
      toast.error(error?.message || "Failed to create test users");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleGiveAll = async (sign = 1) => {
    const amount = Number(globalAmount);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error("Enter a valid amount first"); return; }
    const delta = sign * amount;
    const actionWord = delta > 0 ? "give" : "remove";
    if (!window.confirm(`Are you sure you want to ${actionWord} $${Math.abs(delta)} ${delta > 0 ? "to" : "from"} all users?`)) return;

    setBulkLoading(true);
    try {
      const everyone = await base44.entities.Wallet.list();
      for (const w of everyone) {
        if (delta < 0 && Number(w.balance || 0) < Math.abs(delta)) {
          continue;
        }
        await base44.adjustWalletBalance(w.id, delta);
      }
      toast.success(`Applied ${delta > 0 ? "+" : "-"}$${Math.abs(delta)} to all eligible users`);
      await onRefresh();
      await fetchAllWallets();
    } catch (error) {
      toast.error(error?.message || "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteWaitingFlips = async () => {
    if (!window.confirm("Delete all waiting coin flips and refund creators?")) return;
    setCleanupLoading(true);
    try {
      const flips = await base44.entities.CoinFlip.filter({ status: "waiting" });
      for (const flip of flips) {
        await base44.adjustWalletBalance(flip.creator_wallet_id, Number(flip.amount || 0));
        await base44.entities.CoinFlip.delete(flip.id);
      }
      toast.success(`Cleared ${flips.length} waiting flips`);
      await onRefresh();
    } catch (error) {
      toast.error(error?.message || "Failed to clear flips");
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleDeleteTransactions = async () => {
    if (!window.confirm("Delete ALL transaction history? This cannot be undone.")) return;
    setCleanupLoading(true);
    try {
      const txs = await base44.entities.Transaction.list("-created_date", 2000);
      for (const tx of txs) {
        await base44.entities.Transaction.delete(tx.id);
      }
      toast.success(`Deleted ${txs.length} transactions`);
      await onRefresh();
    } catch (error) {
      toast.error(error?.message || "Failed to delete transactions");
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-green-500/30 bg-black/40 backdrop-blur-xl overflow-hidden"
    >
      <button
        onClick={() => handleOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-green-400 hover:bg-green-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <span className="font-mono font-bold text-sm tracking-widest">DEV MODE</span>
          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-mono">v∞</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              {/* Add Money to self */}
              <div>
                <p className="text-green-300/70 text-xs font-mono mb-3 uppercase tracking-widest">∞ Add Money to Your Wallet</p>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {MONEY_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleAddMoney(amt)}
                      disabled={addingMoney}
                      className="py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-300 font-mono text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {addingMoney ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `+$${amt}`}
                    </button>
                  ))}
                </div>
                {/* Custom amount */}
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="Custom amount..."
                    className="h-8 text-sm bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                    onKeyDown={e => { if (e.key === "Enter" && customAmount) handleAddMoney(parseFloat(customAmount)); }}
                  />
                  <button
                    onClick={() => { if (customAmount) { handleAddMoney(parseFloat(customAmount)); setCustomAmount(""); } }}
                    disabled={addingMoney || !customAmount}
                    className="px-3 py-1.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold text-sm disabled:opacity-50 flex-shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  {MONEY_AMOUNTS.map((amt) => (
                    <button
                      key={`remove-${amt}`}
                      onClick={() => handleRemoveMoney(amt)}
                      disabled={addingMoney}
                      className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-mono text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {addingMoney ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `-$${amt}`}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    value={ownBalanceInput}
                    onChange={e => setOwnBalanceInput(e.target.value)}
                    placeholder="Set exact balance..."
                    className="h-8 text-sm bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                    onKeyDown={e => { if (e.key === "Enter" && ownBalanceInput) handleSetOwnBalance(); }}
                  />
                  <button
                    onClick={handleSetOwnBalance}
                    disabled={addingMoney || !ownBalanceInput}
                    className="px-3 py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold text-sm disabled:opacity-50 flex-shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Global economy tools */}
              <div>
                <p className="text-green-300/70 text-xs font-mono mb-3 uppercase tracking-widest flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Global Economy Tools</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="number"
                    value={globalAmount}
                    onChange={(e) => setGlobalAmount(e.target.value)}
                    placeholder="Amount for all users..."
                    className="h-8 text-sm bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <button
                    onClick={() => handleGiveAll(1)}
                    disabled={bulkLoading || !globalAmount}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs disabled:opacity-50"
                  >
                    Give All
                  </button>
                  <button
                    onClick={() => handleGiveAll(-1)}
                    disabled={bulkLoading || !globalAmount}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs disabled:opacity-50"
                  >
                    Remove All
                  </button>
                </div>
                <button
                  onClick={() => handleCreateManyTestUsers(5)}
                  disabled={bulkLoading}
                  className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? "Working..." : "+ Create 5 Test Users"}
                </button>
              </div>

              {/* Cleanup tools */}
              <div>
                <p className="text-green-300/70 text-xs font-mono mb-3 uppercase tracking-widest flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Data Cleanup</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDeleteWaitingFlips}
                    disabled={cleanupLoading}
                    className="py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs font-bold disabled:opacity-50"
                  >
                    {cleanupLoading ? "Working..." : "Clear Waiting Flips"}
                  </button>
                  <button
                    onClick={handleDeleteTransactions}
                    disabled={cleanupLoading}
                    className="py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-xs font-bold disabled:opacity-50"
                  >
                    {cleanupLoading ? "Working..." : "Clear Transactions"}
                  </button>
                </div>
              </div>

              {/* Manage Users */}
              <div>
                <p className="text-green-300/70 text-xs font-mono mb-3 uppercase tracking-widest">⚙ Manage All Users</p>
                <button
                  onClick={handleCreateTestUser}
                  className="mb-3 w-full py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold transition-colors"
                >
                  + Create Test User
                </button>
                {loadingWallets ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                  </div>
                ) : allWallets.length === 0 ? (
                  <p className="text-slate-500 text-xs font-mono text-center py-3">No other users found.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {allWallets.map((w) => (
                      <div key={w.id} className="bg-white/5 rounded-xl px-3 py-2 space-y-2">
                        {/* User row */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={getAvatarStyle(w)}
                          >
                            {w.username?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{w.username}</p>
                            <p className="text-slate-400 text-xs font-mono">${w.balance?.toFixed(2)}</p>
                          </div>
                          {/* Action buttons */}
                          <button
                            onClick={() => onSwitchUser?.(w.id)}
                            title="Switch to this user"
                            className="px-2 h-7 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold tracking-wide transition-colors"
                          >
                            Switch
                          </button>
                          <button
                            onClick={() => startEdit(w, "name")}
                            title="Rename"
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(w, "balance")}
                            title="Set balance"
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-green-500/20 text-slate-400 hover:text-green-400 flex items-center justify-center transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(w)}
                            disabled={deletingId === w.id}
                            title="Delete user"
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
                          >
                            {deletingId === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Inline edit: name */}
                        {editingId === w.id && editField === "name" && (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              placeholder="New name..."
                              className="h-8 text-sm bg-white/10 border-white/10 text-white placeholder:text-slate-500 flex-1"
                              onKeyDown={(e) => e.key === "Enter" && handleRename(w)}
                              autoFocus
                            />
                            <button onClick={() => handleRename(w)} disabled={savingId === w.id} className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 flex items-center justify-center flex-shrink-0">
                              {savingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-300 text-xs px-1">✕</button>
                          </div>
                        )}

                        {/* Inline edit: balance */}
                        {editingId === w.id && editField === "balance" && (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newBalance}
                              onChange={(e) => setNewBalance(e.target.value)}
                              placeholder="New balance..."
                              type="number"
                              className="h-8 text-sm bg-white/10 border-white/10 text-white placeholder:text-slate-500 flex-1"
                              onKeyDown={(e) => e.key === "Enter" && handleSetBalance(w)}
                              autoFocus
                            />
                            <button onClick={() => handleSetBalance(w)} disabled={savingId === w.id} className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 flex items-center justify-center flex-shrink-0">
                              {savingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-300 text-xs px-1">✕</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}