import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QrCode, ScanLine, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

function QRCodeDisplay({ wallet }) {
  // QR code encodes a URL that auto-fills the pay tab
  const payUrl = `${window.location.origin}${window.location.pathname}?pay=${wallet.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payUrl)}&bgcolor=0f0b2a&color=a78bfa`;

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      <div className="p-4 bg-white rounded-2xl shadow-lg">
        <img src={qrUrl} alt="Your QR Code" className="w-56 h-56 rounded-lg" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-white">{wallet.username}</p>
        <p className="text-sm text-slate-400 mt-1">Scan to pay — opens directly in the app</p>
      </div>
    </div>
  );
}

function QRScanPay({ wallet, initialWalletId, onPaymentComplete, onClose }) {
  const [walletId, setWalletId] = useState(initialWalletId || "");
  const [foundUser, setFoundUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Auto-lookup if we have a pre-filled wallet ID
  useEffect(() => {
    if (initialWalletId) {
      handleLookup(initialWalletId);
    }
  }, [initialWalletId]);

  const handleLookup = async (id) => {
    const lookupId = id || walletId.trim();
    if (!lookupId) return;
    setLoading(true);
    const allWallets = await base44.entities.Wallet.list();
    const found = allWallets.find((w) => w.id === lookupId && w.id !== wallet.id);
    if (found) {
      setFoundUser(found);
    } else {
      toast.error("Wallet not found or it's your own wallet");
    }
    setLoading(false);
  };

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > wallet.balance) { toast.error("Insufficient balance"); return; }
    setSending(true);

    await base44.entities.Transaction.create({
      from_wallet_id: wallet.id,
      to_wallet_id: foundUser.id,
      from_username: wallet.username,
      to_username: foundUser.username,
      amount: amt,
      note: note.trim() || undefined,
    });
    await base44.entities.Wallet.update(wallet.id, { balance: wallet.balance - amt });
    await base44.entities.Wallet.update(foundUser.id, { balance: (foundUser.balance || 0) + amt });

    // Clear the ?pay= param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("pay");
    window.history.replaceState({}, "", url.toString());

    setSending(false);
    toast.success(`Sent $${amt.toFixed(2)} to ${foundUser.username}`);
    onPaymentComplete();
    onClose();
  };

  return (
    <div className="space-y-4 py-2">
      {!foundUser ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Enter or scan a wallet ID to pay</p>
          <Input
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            placeholder="Paste wallet ID here..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
          />
          <Button onClick={() => handleLookup()} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find Wallet"}
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: foundUser.avatar_color || "#6366f1" }}
            >
              {foundUser.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg text-white">{foundUser.username}</p>
              <button onClick={() => setFoundUser(null)} className="text-sm text-indigo-400">Change</button>
            </div>
          </div>

          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-14 bg-white/5 border-white/10 text-white text-2xl font-bold placeholder:text-slate-600 rounded-xl text-center"
          />

          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
          />

          <Button onClick={handlePay} disabled={sending} className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-lg font-semibold rounded-xl">
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Send Payment</>}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function QRCodeView({ wallet, open, onOpenChange, onPaymentComplete }) {
  const params = new URLSearchParams(window.location.search);
  const payToId = params.get("pay");
  const defaultTab = payToId ? "pay" : "my-code";

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) {
        // Clear ?pay= when closing
        const url = new URL(window.location.href);
        url.searchParams.delete("pay");
        window.history.replaceState({}, "", url.toString());
      }
      onOpenChange(v);
    }}>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">QR Code</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full bg-white/5 rounded-xl p-1">
            <TabsTrigger value="my-code" className="flex-1 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
              <QrCode className="w-4 h-4 mr-2" /> My Code
            </TabsTrigger>
            <TabsTrigger value="pay" className="flex-1 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
              <ScanLine className="w-4 h-4 mr-2" /> Pay
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-code">
            <QRCodeDisplay wallet={wallet} />
          </TabsContent>
          <TabsContent value="pay">
            <QRScanPay
              wallet={wallet}
              initialWalletId={payToId}
              onPaymentComplete={onPaymentComplete}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}