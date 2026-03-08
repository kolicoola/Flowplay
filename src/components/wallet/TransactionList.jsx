import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Trash2, Trash } from "lucide-react";
import moment from "moment";
import { toast } from "sonner";

export default function TransactionList({ transactions, walletId, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  // No auto-deletion — transactions must be deleted manually

  const handleDelete = async (tx) => {
    setDeleting(tx.id);
    await base44.entities.Transaction.delete(tx.id);
    setDeleting(null);
    onRefresh?.();
  };

  const handleClearAll = async () => {
    if (!transactions || transactions.length === 0) return;
    setClearingAll(true);
    await Promise.all(transactions.map(tx => base44.entities.Transaction.delete(tx.id)));
    setClearingAll(false);
    toast.success("All transactions cleared.");
    onRefresh?.();
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">No transactions yet</p>
        <p className="text-slate-600 text-sm mt-1">Send a payment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Clear all button */}
      <div className="flex justify-end">
        <button
          onClick={handleClearAll}
          disabled={clearingAll}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
        >
          <Trash className="w-3.5 h-3.5" />
          {clearingAll ? "Clearing..." : "Clear All"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {transactions.map((tx, i) => {
          const isSent = tx.from_wallet_id === walletId;
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/[0.07] transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSent ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                  {isSent
                    ? <ArrowUpRight className="w-5 h-5 text-red-400" />
                    : <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">
                    {isSent ? tx.to_username : tx.from_username}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tx.note || (isSent ? "Sent" : "Received")} · {moment(tx.created_date).fromNow()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <p className={`font-bold text-lg ${isSent ? "text-red-400" : "text-emerald-400"}`}>
                  {isSent ? "-" : "+"}${tx.amount?.toFixed(2)}
                </p>
                <button
                  onClick={() => handleDelete(tx)}
                  disabled={deleting === tx.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center"
                >
                  {deleting === tx.id
                    ? <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}