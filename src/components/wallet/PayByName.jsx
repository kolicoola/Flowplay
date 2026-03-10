import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAvatarStyle } from "./avatarUtils";

export default function PayByName({ wallet, onPaymentComplete, open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    const preload = async () => {
      setSearching(true);
      try {
        const allWallets = await base44.entities.Wallet.list();
        const filtered = allWallets.filter((w) => w.id !== wallet.id && w.username);
        setResults(filtered.slice(0, 20));
      } catch (e) {
        console.error("Failed to load users:", e);
        toast.error("Could not load users. Please try again.");
      } finally {
        setSearching(false);
      }
    };
    preload();
  }, [open, wallet.id]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const allWallets = await base44.entities.Wallet.list();
      const filtered = allWallets.filter(
        (w) => w.id !== wallet.id && (w.username ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch (e) {
      console.error("Failed to search users:", e);
      toast.error("Could not search users. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handlePay = async () => {
    if (!selectedUser?.id) {
      toast.error("Choose a recipient first");
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setSending(true);
    try {
      // Pull fresh balances before sending to avoid stale-state overwrites.
      const allWallets = await base44.entities.Wallet.list();
      const senderWallet = allWallets.find((w) => w.id === wallet.id);
      const recipientWallet = allWallets.find((w) => w.id === selectedUser.id);

      if (!senderWallet) {
        throw new Error("Your wallet was not found. Please sign in again.");
      }
      if (!recipientWallet) {
        throw new Error("Recipient wallet was not found.");
      }
      if (amt > (senderWallet.balance || 0)) {
        throw new Error("Insufficient balance");
      }

      await base44.transferFunds({
        fromWalletId: senderWallet.id,
        toWalletId:   recipientWallet.id,
        amount:       amt,
        note:         note.trim() || null,
      });

      toast.success(`Sent $${amt.toFixed(2)} to ${recipientWallet.username}`);
      setSearchQuery("");
      setResults([]);
      setSelectedUser(null);
      setAmount("");
      setNote("");
      onOpenChange(false);
      await onPaymentComplete();
    } catch (e) {
      const message = String(e?.message || "Could not send payment");
      toast.error(message);
      console.error("Payment failed:", e);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setResults([]);
    setAmount("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {selectedUser ? `Pay ${selectedUser.username}` : "Pay by Name"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedUser ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((w) => (
                  <motion.button
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedUser(w)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <div
                     className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                     style={getAvatarStyle(w)}
                    >
                      {(w.username?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{w.username}</p>
                      <p className="text-sm text-slate-400">ID: {w.id}</p>
                    </div>
                  </motion.button>
                ))}
                {results.length === 0 && !searching && (
                  <p className="text-center text-slate-500 py-4">
                    {searchQuery ? "No users found" : "No other users found"}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={getAvatarStyle(selectedUser)}
                >
                  {(selectedUser.username?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.username}</p>
                  <button onClick={() => setSelectedUser(null)} className="text-sm text-indigo-400 hover:text-indigo-300">Change recipient</button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Amount ($)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 bg-white/5 border-white/10 text-white text-2xl font-bold placeholder:text-slate-600 rounded-xl text-center"
                />
                <p className="text-xs text-slate-500 mt-1 text-right">Balance: ${wallet.balance?.toFixed(2)}</p>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Note (optional)</label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's it for?"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                />
              </div>

              <Button
                onClick={handlePay}
                disabled={sending}
                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-lg font-semibold rounded-xl"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Send Payment</>}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}