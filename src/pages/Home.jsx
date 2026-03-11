import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getSiteBgStyle } from "../components/wallet/avatarUtils";
import { UPGRADES } from "../components/wallet/UpgradeShop";

import AuthScreen from "../components/wallet/AuthScreen";
import BalanceCard from "../components/wallet/BalanceCard";
import ActionButtons from "../components/wallet/ActionButtons";
import PayByName from "../components/wallet/PayByName";
import QRCodeView from "../components/wallet/QRCodeView";
import TransactionList from "../components/wallet/TransactionList";
import DevMode from "../components/wallet/DevMode";
import AvatarStore from "../components/wallet/AvatarStore";
import CharityPage from "../components/wallet/CharityPage";
import InvestmentPage from "../components/wallet/InvestmentPage";
import CoinFlipPage from "../components/wallet/CoinFlipPage";
import DailyGift from "../components/wallet/DailyGift";
import UpgradeShop from "../components/wallet/UpgradeShop";
import CollectorOverlay from "../components/wallet/CollectorOverlay";

const STARTUP_TIMEOUT_MS = 6000;

function withTimeout(promise, ms, message) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export default function Home() {
  const [showPayByName, setShowPayByName] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showCharity, setShowCharity] = useState(false);
  const [showInvest, setShowInvest] = useState(false);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [myWallet, setMyWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownedUpgrades, setOwnedUpgrades] = useState(null);

  const walletRef = useRef(null);
  const passiveTimerRef = useRef(null);

  const loadWallet = async () => {
    if (!isSupabaseConfigured || !supabase) {
      console.error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }
    try {
      const all = await withTimeout(
        base44.entities.Wallet.list(),
        STARTUP_TIMEOUT_MS,
        "Wallet bootstrap timed out"
      );

      let found = null;

      const { data } = await supabase.auth.getUser();
      const authUserId = data?.user?.id;
      if (authUserId) {
        found = all.find((w) => w.auth_user_id === authUserId) || null;
      }

      if (found) {
        setMyWallet(found);
        walletRef.current = found;
        await Promise.allSettled([
          loadTransactions(found.id),
          loadUpgrades(found.id),
        ]);
      }
    } catch (error) {
      console.error("Wallet bootstrap failed:", error);
      setMyWallet(null);
      walletRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const loadUpgrades = async (walletId) => {
    const all = await base44.entities.Upgrade.filter({ wallet_id: walletId });
    const map = {};
    for (const u of all) map[u.upgrade_id] = u;
    setOwnedUpgrades(map);
    return map;
  };

  const loadTransactions = async (walletId) => {
    const all = await base44.entities.Transaction.list("-created_date", 50);
    setTransactions(all.filter((tx) => tx.from_wallet_id === walletId || tx.to_wallet_id === walletId));
  };

  useEffect(() => { loadWallet(); }, []);

  // Check for QR scan: ?pay=WALLET_ID in URL → open QR dialog on pay tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payTo = params.get("pay");
    if (payTo && myWallet) {
      setShowQR(true);
    }
  }, [myWallet]);

  // Passive income ticker
  useEffect(() => {
    if (!ownedUpgrades || !myWallet) return;
    if (passiveTimerRef.current) clearInterval(passiveTimerRef.current);

    const passiveUpgrades = UPGRADES.filter((u) => u.type === "passive" && ownedUpgrades[u.id]);
    if (passiveUpgrades.length === 0) return;

    const totalPerSec = passiveUpgrades.reduce((sum, u) => sum + u.ratePerSec, 0);
    const batchAmount = totalPerSec * 5;

    passiveTimerRef.current = setInterval(async () => {
      const current = walletRef.current;
      if (!current) return;
      const newBalance = current.balance + batchAmount;
      const updated = { ...current, balance: newBalance };
      walletRef.current = updated;
      setMyWallet(updated);
      try {
        await base44.entities.Wallet.update(current.id, { balance: newBalance });
      } catch (e) {
        // Wallet was deleted — stop the timer and clear local state
        clearInterval(passiveTimerRef.current);
        walletRef.current = null;
        setMyWallet(null);
      }
    }, 5000);

    return () => clearInterval(passiveTimerRef.current);
  }, [ownedUpgrades]);

  const isDevMode = myWallet?.username?.toLowerCase() === "payflow";

  const handleAuthComplete = async (wallet) => {
    setMyWallet(wallet);
    walletRef.current = wallet;
    await Promise.allSettled([
      loadTransactions(wallet.id),
      loadUpgrades(wallet.id),
    ]);
    setLoading(false);
  };

  const refreshData = async () => {
    if (!myWallet) return;
    const updated = await base44.entities.Wallet.list();
    const found = updated.find((w) => w.id === myWallet.id);
    if (found) {
      setMyWallet(found);
      walletRef.current = found;
    }
    await loadTransactions(myWallet.id);
  };

  const refreshUpgrades = async () => {
    if (!myWallet) return;
    await loadUpgrades(myWallet.id);
    await refreshData();
  };

  const handleSwitchUser = async (walletId) => {
    if (!walletId) return;
    const all = await base44.entities.Wallet.list();
    const found = all.find((w) => w.id === walletId);
    if (!found) return;
    setMyWallet(found);
    walletRef.current = found;
    await loadTransactions(found.id);
    await loadUpgrades(found.id);
  };

  useEffect(() => {
    if (!myWallet?.id) return;
    const refresh = () => refreshData();
    const unsubs = [
      base44.entities.Wallet.subscribe(refresh),
      base44.entities.Transaction.subscribe(refresh),
      base44.entities.CoinFlip.subscribe(refresh),
      base44.entities.Charity.subscribe(refresh),
    ];
    return () => unsubs.forEach((u) => u?.());
  }, [myWallet?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #020617, #1e1b4b, #2e1065)" }}>
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!myWallet) {
    return <AuthScreen onAuthenticated={handleAuthComplete} />;
  }

  const siteBgStyle = getSiteBgStyle(myWallet?.site_background, myWallet?.site_background_custom);

  return (
    <div className="min-h-screen p-4 pb-20 md:p-8" style={siteBgStyle}>
      {/* Collector dollars float over everything */}
      {ownedUpgrades && (
        <CollectorOverlay wallet={myWallet} ownedUpgrades={ownedUpgrades} onRefresh={refreshData} />
      )}

      <div className="max-w-lg mx-auto space-y-6">
        <BalanceCard wallet={myWallet} onRefresh={refreshData} />
        <ActionButtons
          onPayByName={() => setShowPayByName(true)}
          onQRCode={() => setShowQR(true)}
          onStore={() => setShowStore(true)}
          onDonate={() => setShowCharity(true)}
          onInvest={() => setShowInvest(true)}
          onCoinFlip={() => setShowCoinFlip(true)}
          onUpgrade={() => setShowUpgrade(true)}
        />

        <DailyGift wallet={myWallet} onRefresh={refreshData} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <TransactionList transactions={transactions} walletId={myWallet.id} onRefresh={refreshData} />
        </motion.div>

        {isDevMode && (
          <DevMode wallet={myWallet} onRefresh={refreshData} onSwitchUser={handleSwitchUser} />
        )}

        <PayByName
          wallet={myWallet}
          onPaymentComplete={refreshData}
          open={showPayByName}
          onOpenChange={setShowPayByName}
        />
        {showCharity && (
          <CharityPage
            wallet={myWallet}
            onClose={() => setShowCharity(false)}
            onRefresh={refreshData}
            isDevMode={isDevMode}
          />
        )}
        {showInvest && (
          <InvestmentPage
            wallet={myWallet}
            onClose={() => setShowInvest(false)}
            onRefresh={refreshData}
            isDevMode={isDevMode}
          />
        )}
        {showCoinFlip && (
          <CoinFlipPage
            wallet={myWallet}
            onClose={() => setShowCoinFlip(false)}
            onRefresh={refreshData}
          />
        )}
        {showStore && (
          <AvatarStore
            wallet={myWallet}
            onClose={() => setShowStore(false)}
            onRefresh={refreshData}
          />
        )}
        {showUpgrade && (
          <UpgradeShop
            wallet={myWallet}
            onClose={() => setShowUpgrade(false)}
            onRefresh={refreshData}
            ownedUpgrades={ownedUpgrades}
            onBuy={refreshUpgrades}
          />
        )}
        <QRCodeView
          wallet={myWallet}
          open={showQR}
          onOpenChange={setShowQR}
          onPaymentComplete={refreshData}
        />
      </div>
    </div>
  );
}