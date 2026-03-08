import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const ACCOUNTS_KEY = "flowplay_local_accounts_v1";

const readAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const normalize = (value) => value.trim().toLowerCase();
const BACKEND_MODE = (import.meta.env.VITE_BACKEND_MODE || "base44").toLowerCase();
const IS_REMOTE = BACKEND_MODE === "base44";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Sign In" : "Create Account"), [mode]);
  const getVirtualEmail = (name) => `${normalize(name).replace(/[^a-z0-9._-]/g, "") || "user"}@flowplay.local`;

  const handleLogin = async () => {
    if (IS_REMOTE) {
      const cleanName = username.trim();
      if (!cleanName || !password) {
        setError("Enter username and password");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const virtualEmail = getVirtualEmail(cleanName);
        await base44.auth.loginViaEmailPassword(virtualEmail, password);
        const me = await base44.auth.me();
        const allWallets = await base44.entities.Wallet.list();
        let wallet = allWallets.find((w) => w.auth_user_id === me.id);

        if (!wallet) {
          const avatarPalette = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];
          const avatarColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
          const derivedName = cleanName;
          wallet = await base44.entities.Wallet.create({
            username: derivedName,
            auth_user_id: me.id,
            balance: 1000,
            avatar_color: avatarColor,
          });
        }

        await onAuthenticated(wallet);
      } catch (e) {
        setError(e?.message || "Could not sign in. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const cleanName = username.trim();
    if (!cleanName || !password) {
      setError("Enter username and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const accounts = readAccounts();
      const account = accounts.find((a) => a.usernameLower === normalize(cleanName));
      if (!account || account.password !== password) {
        setError("Invalid username or password");
        return;
      }

      const wallets = await base44.entities.Wallet.list();
      const wallet = wallets.find((w) => w.id === account.walletId);
      if (!wallet) {
        setError("Account exists, but wallet was not found. Create a new account.");
        return;
      }

      await onAuthenticated(wallet);
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (IS_REMOTE) {
      const cleanName = username.trim();
      if (cleanName.length < 2) {
        setError("Username must be at least 2 characters");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const virtualEmail = getVirtualEmail(cleanName);
        try {
          await base44.auth.register({ email: virtualEmail, password });
        } catch (e) {
          const msg = String(e?.message || "").toLowerCase();
          const alreadyExists = msg.includes("already") || msg.includes("exist") || msg.includes("registered");
          if (!alreadyExists) throw e;
        }

        await base44.auth.loginViaEmailPassword(virtualEmail, password);
        const me = await base44.auth.me();
        const allWallets = await base44.entities.Wallet.list();
        let wallet = allWallets.find((w) => w.auth_user_id === me.id);

        if (!wallet) {
          const avatarPalette = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];
          const avatarColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
          wallet = await base44.entities.Wallet.create({
            username: cleanName,
            auth_user_id: me.id,
            balance: 1000,
            avatar_color: avatarColor,
          });
        } else if (wallet.username !== cleanName) {
          wallet = await base44.entities.Wallet.update(wallet.id, { username: cleanName });
        }

        await onAuthenticated(wallet);
      } catch (e) {
        const msg = String(e?.message || "");
        if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("password")) {
          setError("Username already exists with a different password. Try Sign In.");
        } else {
          setError(msg || "Could not create account. Please try again.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const cleanName = username.trim();
    if (cleanName.length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const accounts = readAccounts();
      const key = normalize(cleanName);
      if (accounts.some((a) => a.usernameLower === key)) {
        setError("That username is already registered");
        return;
      }

      const wallets = await base44.entities.Wallet.list();
      let wallet = wallets.find((w) => normalize(w.username || "") === key);

      if (!wallet) {
        const avatarPalette = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];
        const avatarColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
        wallet = await base44.entities.Wallet.create({
          username: cleanName,
          balance: 1000,
          avatar_color: avatarColor,
        });
      }

      const next = [
        ...accounts,
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          username: cleanName,
          usernameLower: key,
          password,
          walletId: wallet.id,
          created_date: new Date().toISOString(),
        },
      ];
      writeAccounts(next);
      await onAuthenticated(wallet);
    } catch {
      setError("Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login") return handleLogin();
    return handleRegister();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-5 shadow-lg shadow-indigo-500/30">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">PayFlow</h1>
          <p className="text-slate-400 text-lg">{title}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-5">
          <Input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            placeholder="Username"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Password"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-base font-semibold rounded-xl"
          >
            {mode === "login" ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Account"}
              </>
            )}
          </Button>

          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="w-full text-sm text-indigo-300 hover:text-indigo-200 transition-colors flex items-center justify-center gap-1"
          >
            {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
