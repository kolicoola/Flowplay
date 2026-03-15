import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSiteBgStyle } from "../components/wallet/avatarUtils";
import { getUpgradeEffects, applyFriendshipIncomingBonus } from "../components/wallet/upgradeEffects";

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
  const [myWallet, setMyWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownedUpgrades, setOwnedUpgrades] = useState([]);
  const [upgradeClock, setUpgradeClock] = useState(Date.now());

  const walletRef = useRef(null);
  const transactionEventLockRef = useRef(new Set());

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
    setOwnedUpgrades(all);
    return all;
  };

  const loadTransactions = async (walletId) => {
    const all = await base44.entities.Transaction.list("-created_date", 50);
    setTransactions(all.filter((tx) => tx.from_wallet_id === walletId || tx.to_wallet_id === walletId));
  };

  useEffect(() => { loadWallet(); }, []);

  useEffect(() => {
    const t = setInterval(() => setUpgradeClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Check for QR scan: ?pay=WALLET_ID in URL → open QR dialog on pay tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payTo = params.get("pay");
    if (payTo && myWallet) {
      setShowQR(true);
    }
  }, [myWallet]);

  const upgradeEffects = getUpgradeEffects(ownedUpgrades, upgradeClock);

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
    return found;
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
    const onWalletEvent = () => refreshData();
    const onSimpleRefresh = () => refreshData();
    const onTransactionEvent = async (event) => {
      const type = event?.type || event?.operation;
      const tx = event?.data || event?.record;

      if (type === "create" && tx?.to_wallet_id === myWallet.id && tx?.id) {
        if (!transactionEventLockRef.current.has(tx.id)) {
          transactionEventLockRef.current.add(tx.id);
          try {
            const bonusApplied = await applyFriendshipIncomingBonus(myWallet.id, Number(tx.amount || 0));
            if (bonusApplied) {
              toast.success("Friendship bonus! Incoming payment doubled.");
            }
          } catch (e) {
            console.error("Failed to apply friendship bonus:", e);
          } finally {
            await loadUpgrades(myWallet.id);
            await refreshData();
          }
        }
        return;
      }

      await refreshData();
    };

    const unsubs = [
      base44.entities.Wallet.subscribe(onWalletEvent),
      base44.entities.Transaction.subscribe(onTransactionEvent),
      base44.entities.CoinFlip.subscribe(onSimpleRefresh),
      base44.entities.Charity.subscribe(onSimpleRefresh),
      base44.entities.Upgrade.subscribe(async () => {
        await loadUpgrades(myWallet.id);
      }),
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

  const localCustomSiteBg = localStorage.getItem(`flowplay_custom_bg_${myWallet?.id}`);
  const siteBgStyle = getSiteBgStyle(myWallet?.site_background, myWallet?.site_background_custom || localCustomSiteBg);

  return (
    <div className="min-h-screen p-4 pb-20 md:p-8" style={siteBgStyle}>
      {/* Collector dollars float over everything */}
      {ownedUpgrades && (
        <CollectorOverlay wallet={myWallet} upgradeEffects={upgradeEffects} onRefresh={refreshData} />
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
        />

        <DailyGift wallet={myWallet} onRefresh={refreshData} speedMultiplier={upgradeEffects.speedMultiplier} />

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
          upgradeEffects={upgradeEffects}
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
            upgradeEffects={upgradeEffects}
          />
        )}
        {showCoinFlip && (
          <CoinFlipPage
            wallet={myWallet}
            onClose={() => setShowCoinFlip(false)}
            onRefresh={refreshData}
            upgradeEffects={upgradeEffects}
          />
        )}
        {showStore && (
          <AvatarStore
            wallet={myWallet}
            onClose={() => setShowStore(false)}
            onRefresh={refreshData}
          />
        )}
        <QRCodeView
          wallet={myWallet}
          open={showQR}
          onOpenChange={setShowQR}
          onPaymentComplete={refreshData}
          upgradeEffects={upgradeEffects}
        />
      </div>
    </div>
  );
}