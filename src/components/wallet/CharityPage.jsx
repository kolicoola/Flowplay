import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Plus, Loader2, Users, DollarSign, ArrowLeft, Trash2, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function CreateCharityForm({ wallet, onCreated, onBack }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minDonation, setMinDonation] = useState("1");
  const [coFounderSearch, setCoFounderSearch] = useState("");
  const [coFounders, setCoFounders] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchWallets = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const all = await base44.entities.Wallet.list();
    setSearchResults(
      all.filter((w) => w.id !== wallet.id && !coFounders.find((f) => f.id === w.id) &&
        (w.username ?? "").toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5)
    );
    setSearching(false);
  };

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) { toast.error("Fill in all fields"); return; }
    const min = parseFloat(minDonation);
    if (isNaN(min) || min < 0) { toast.error("Invalid minimum donation"); return; }
    if (wallet.balance < 10) { toast.error("You need at least $10 to create a charity."); return; }
    setSaving(true);
    const founderIds = [wallet.id, ...coFounders.map((f) => f.id)];
    const founderNames = [wallet.username, ...coFounders.map((f) => f.username)];
    await base44.entities.Wallet.update(wallet.id, { balance: wallet.balance - 10 });
    await base44.entities.Charity.create({
      name: name.trim(),
      description: description.trim(),
      minimum_donation: min,
      founders: founderIds,
      founder_names: founderNames,
      total_raised: 0,
      creator_wallet_id: wallet.id,
    });
    toast.success(`"${name.trim()}" created for $10!`);
    setSaving(false);
    onCreated();
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h3 className="text-white font-bold text-base">Create a Charity <span className="text-amber-400 font-mono text-sm ml-1">($10)</span></h3>

      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Charity name" className="bg-white/10 border-white/10 text-white placeholder:text-slate-500" />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is this charity for?"
        rows={3}
        className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
      <div>
        <label className="text-slate-400 text-xs mb-1 block">Minimum donation ($)</label>
        <Input type="number" value={minDonation} onChange={(e) => setMinDonation(e.target.value)} placeholder="1" className="bg-white/10 border-white/10 text-white placeholder:text-slate-500" />
      </div>

      {/* Co-founders */}
      <div>
        <label className="text-slate-400 text-xs mb-1 block">Add Co-founders (they share donations equally)</label>
        <div className="relative">
          <Input
            value={coFounderSearch}
            onChange={(e) => { setCoFounderSearch(e.target.value); searchWallets(e.target.value); }}
            placeholder="Search by username..."
            className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
          />
          {searching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 animate-spin" />}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-1 rounded-xl bg-slate-800 border border-white/10 overflow-hidden">
            {searchResults.map((w) => (
              <button key={w.id} onClick={() => { setCoFounders([...coFounders, w]); setCoFounderSearch(""); setSearchResults([]); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-white text-sm transition-colors">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: w.avatar_color || "#6366f1" }}>
                  {w.username?.[0]?.toUpperCase()}
                </div>
                {w.username}
              </button>
            ))}
          </div>
        )}
        {coFounders.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {coFounders.map((f) => (
              <span key={f.id} className="flex items-center gap-1 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs px-2 py-1 rounded-full">
                {f.username}
                <button onClick={() => setCoFounders(coFounders.filter((x) => x.id !== f.id))} className="text-violet-400 hover:text-red-400 ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
        <p className="text-slate-500 text-xs mt-1">You + {coFounders.length} co-founder{coFounders.length !== 1 ? "s" : ""} will share donations equally.</p>
      </div>

      <button
        onClick={handleCreate}
        disabled={saving}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
        Create Charity ($10)
      </button>
    </div>
  );
}

function DonateModal({ charity, wallet, onClose, onDone }) {
  const [amount, setAmount] = useState(String(charity.minimum_donation));
  const [donating, setDonating] = useState(false);

  const handleDonate = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < charity.minimum_donation) {
      toast.error(`Minimum donation is $${charity.minimum_donation}`);
      return;
    }
    if (val > wallet.balance) { toast.error("Insufficient balance"); return; }
    setDonating(true);

    // Deduct from donor
    await base44.entities.Wallet.update(wallet.id, { balance: wallet.balance - val });

    // Split equally among founders
    const founders = charity.founders || [charity.creator_wallet_id];
    if (founders.length > 0) {
      const share = val / founders.length;
      const allWallets = await base44.entities.Wallet.list();
      await Promise.all(founders.map(async (fId) => {
        const fw = allWallets.find((w) => w.id === fId);
        if (fw) await base44.entities.Wallet.update(fId, { balance: (fw.balance || 0) + share });
      }));
    }

    // Update total raised
    await base44.entities.Charity.update(charity.id, { total_raised: (charity.total_raised || 0) + val });

    // Log transaction
    await base44.entities.Transaction.create({
      from_wallet_id: wallet.id,
      to_wallet_id: charity.creator_wallet_id || (charity.founders?.[0] ?? ""),
      from_username: wallet.username,
      to_username: charity.name,
      amount: val,
      note: `Donation to ${charity.name}`,
    });

    toast.success(`Donated $${val.toFixed(2)} to ${charity.name}!`);
    setDonating(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Donate to {charity.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-slate-400 text-sm mb-4">{charity.description}</p>
        <p className="text-slate-500 text-xs mb-3">Minimum donation: <span className="text-amber-400 font-mono font-bold">${charity.minimum_donation}</span></p>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min $${charity.minimum_donation}`}
          className="bg-white/10 border-white/10 text-white placeholder:text-slate-500 mb-4"
        />
        {(charity.founders?.length || 0) > 1 && (
          <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
            <Users className="w-3 h-3" /> Split equally among {charity.founders.length} founders
          </p>
        )}
        <button
          onClick={handleDonate}
          disabled={donating}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {donating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
          Donate
        </button>
      </motion.div>
    </div>
  );
}

export default function CharityPage({ wallet, onClose, onRefresh, isDevMode }) {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [donatingTo, setDonatingTo] = useState(null);
  const [dissolving, setDissolving] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchCharities = async () => {
    setLoading(true);
    const all = await base44.entities.Charity.list("-created_date");
    setCharities(all);
    setLoading(false);
  };

  useEffect(() => { fetchCharities(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Charity.subscribe((event) => {
      const type = event?.type || event?.operation;
      if (type === "create" || type === "update" || type === "delete") {
        fetchCharities();
      }
    });
    return () => unsub?.();
  }, []);

  const handleDoneDonate = async () => {
    setDonatingTo(null);
    await onRefresh();
    await fetchCharities();
  };

  // Dissolve: distribute total_raised equally to founders, then delete
  const handleDissolve = async (c) => {
    setDissolving(c.id);
    const founders = c.founders || [c.creator_wallet_id];
    if (founders.length > 0 && c.total_raised > 0) {
      const share = c.total_raised / founders.length;
      const allWallets = await base44.entities.Wallet.list();
      await Promise.all(founders.map(async (fId) => {
        const fw = allWallets.find((w) => w.id === fId);
        if (fw) await base44.entities.Wallet.update(fId, { balance: (fw.balance || 0) + share });
      }));
    }
    await base44.entities.Charity.delete(c.id);
    toast.success(`"${c.name}" dissolved. $${(c.total_raised || 0).toFixed(2)} split among founders.`);
    setDissolving(null);
    await fetchCharities();
    await onRefresh();
  };

  // Hard delete (dev mode only) — no payout
  const handleDelete = async (c) => {
    setDeleting(c.id);
    await base44.entities.Charity.delete(c.id);
    toast.success(`Deleted "${c.name}"`);
    setDeleting(null);
    await fetchCharities();
  };

  const canDissolve = (c) => isDevMode || (c.founders || [c.creator_wallet_id]).includes(wallet.id);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <h2 className="text-white font-bold text-lg">Charities</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm font-mono">$<span className="text-white font-bold">{wallet.balance?.toFixed(2)}</span></span>
              <button onClick={() => setCreating(true)} className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-5 flex-1">
            <AnimatePresence mode="wait">
              {creating ? (
                <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CreateCharityForm
                    wallet={wallet}
                    onCreated={async () => { setCreating(false); await fetchCharities(); await onRefresh(); }}
                    onBack={() => setCreating(false)}
                  />
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-rose-400 animate-spin" /></div>
                  ) : charities.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No charities yet.</p>
                      <p className="text-slate-600 text-xs mt-1">Create the first one for $10!</p>
                    </div>
                  ) : (
                    charities.map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm">{c.name}</h4>
                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{c.description}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />{(c.total_raised || 0).toFixed(2)} raised
                              </span>
                              <span className="text-slate-500 text-xs">Min: <span className="text-amber-400 font-mono">${c.minimum_donation}</span></span>
                              {(c.founders?.length || 0) > 1 && (
                                <span className="text-slate-500 text-xs flex items-center gap-0.5">
                                  <Users className="w-3 h-3" /> {c.founders.length} founders
                                </span>
                              )}
                            </div>
                            {c.founder_names?.length > 0 && (
                              <p className="text-slate-600 text-xs mt-1">By: {c.founder_names.join(", ")}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={() => setDonatingTo(c)}
                              className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5" /> Donate
                            </button>
                            {canDissolve(c) && (
                              <button
                                onClick={() => handleDissolve(c)}
                                disabled={dissolving === c.id}
                                className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                              >
                                {dissolving === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <BadgeCheck className="w-3 h-3" />} Finish
                              </button>
                            )}
                            {isDevMode && (
                              <button
                                onClick={() => handleDelete(c)}
                                disabled={deleting === c.id}
                                className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                              >
                                {deleting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {donatingTo && (
        <DonateModal
          charity={donatingTo}
          wallet={wallet}
          onClose={() => setDonatingTo(null)}
          onDone={handleDoneDonate}
        />
      )}
    </>
  );
}