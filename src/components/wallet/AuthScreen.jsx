import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { supabase, isSupabaseConfigured, supabaseConfigError } from "@/lib/supabaseClient";

const normalize = (value) => value.trim().toLowerCase();
const isEmailLike = (value) => /.+@.+\..+/.test(value.trim());

const getAuthRedirectUrl = () => {
  const base = window.location.origin;
  const appBase = import.meta.env.BASE_URL || "/";
  return `${base}${appBase}`;
};

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Sign In" : "Create Account"), [mode]);

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(supabaseConfigError);
    }
  }, []);

  const ensureWalletForUser = async (userId, desiredUsername) => {
    const allWallets = await base44.entities.Wallet.list();
    let wallet = allWallets.find((w) => w.auth_user_id === userId);

    if (!wallet) {
      const avatarPalette = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];
      const avatarColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
      wallet = await base44.entities.Wallet.create({
        username: desiredUsername,
        auth_user_id: userId,
        balance: 1000,
        avatar_color: avatarColor,
      });
    } else if (desiredUsername && wallet.username !== desiredUsername) {
      wallet = await base44.entities.Wallet.update(wallet.id, { username: desiredUsername });
    }

    return wallet;
  };

  const handleLogin = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(supabaseConfigError);
      return;
    }

    const cleanEmail = normalize(email);
    const cleanName = username.trim();
    if (!cleanEmail || !password) {
      setError("Enter email and password");
      return;
    }
    if (!isEmailLike(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) throw signInError;

      const user = data?.user;
      if (!user) throw new Error("Could not read signed-in user.");
      if (!user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError("Verify your email before signing in.");
        return;
      }

      const wallet = await ensureWalletForUser(user.id, cleanName || cleanEmail.split("@")[0]);
      await onAuthenticated(wallet);
    } catch (e) {
      const msg = String(e?.message || "");
      if (msg.toLowerCase().includes("failed to fetch")) {
        setError("Network/auth server error. Check internet and Supabase project URL.");
      } else if (msg.includes("Unexpected token '<'")) {
        setError("Auth config is wrong: VITE_SUPABASE_URL must be your Supabase Project URL (https://...supabase.co), not a website page.");
      } else {
        setError(msg || "Could not sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(supabaseConfigError);
      return;
    }

    const cleanName = username.trim();
    const cleanEmail = normalize(email);
    if (cleanName.length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    if (!cleanEmail) {
      setError("Email is required");
      return;
    }
    if (!isEmailLike(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { username: cleanName },
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (signUpError) throw signUpError;

      setNotice("Verification email sent automatically. Check inbox/spam, then sign in.");
      setMode("login");
    } catch (e) {
      const msg = String(e?.message || "");
      if (msg.toLowerCase().includes("failed to fetch")) {
        setError("Network/auth server error. Check internet and Supabase project URL.");
      } else if (msg.includes("Unexpected token '<'")) {
        setError("Auth config is wrong: VITE_SUPABASE_URL must be your Supabase Project URL (https://...supabase.co), not a website page.");
      } else {
        setError(msg || "Could not create account. Please try again.");
      }
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
              setNotice("");
            }}
            placeholder="Username"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setNotice("");
            }}
            placeholder="Email"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setNotice("");
            }}
            placeholder="Password"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {notice && <p className="text-emerald-400 text-sm">{notice}</p>}

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
              setNotice("");
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
