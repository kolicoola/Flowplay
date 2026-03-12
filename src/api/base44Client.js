import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

// Maps each entity name to the corresponding Supabase table name.
const ENTITY_TABLE = {
  Wallet:          "wallets",
  Transaction:     "transactions",
  Charity:         "charities",
  CoinFlip:        "coin_flips",
  Investment:      "investments",
  Upgrade:         "upgrades",/* yo yo */
  AssetDefinition: "asset_definitions",
  AssetPrice:      "asset_prices",
  Profile:         "profiles",
};

const getId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Generic Supabase-backed entity API
// ─────────────────────────────────────────────────────────────────────────────

const supabaseEntityApi = (tableName, entityName) => ({
  list: async (sortBy, limit) => {
    let query = supabase.from(tableName).select("*");
    if (sortBy && typeof sortBy === "string") {
      const desc = sortBy.startsWith("-");
      const column = desc ? sortBy.slice(1) : sortBy;
      query = query.order(column, { ascending: !desc });
    }
    if (typeof limit === "number") query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  filter: async (criteria) => {
    let query = supabase.from(tableName).select("*");
    for (const [key, value] of Object.entries(criteria || {})) {
      query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  get: async (id) => {
    const { data, error } = await supabase.from(tableName).select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  create: async (payload) => {
    const record = { id: getId(), created_date: new Date().toISOString(), ...payload };
    const { data, error } = await supabase.from(tableName).insert(record).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id, patch) => {
    const { data, error } = await supabase.from(tableName).update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  subscribe: (callback) => {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table: tableName }, (payload) => {
        const record = payload.new ?? payload.old;
        callback({
          entity: entityName,
          operation: payload.eventType,
          record,
          // Backward-compatible aliases used by some components.
          type: payload.eventType,
          data: record,
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
});

// Returns a stub entity API that throws a clear error when Supabase is not configured.
const notConfiguredApi = (entityName) => {
  const err = () => {
    throw new Error(
      `Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use ${entityName}.`
    );
  };
  return {
    list:      err,
    filter:    err,
    get:       err,
    create:    err,
    update:    err,
    delete:    err,
    subscribe: () => () => {},
  };
};

// All entity names backed by Supabase tables.
const ENTITY_NAMES = [
  "Wallet",
  "Transaction",
  "Charity",
  "CoinFlip",
  "Investment",
  "Upgrade",
  "AssetDefinition",
  "AssetPrice",
];

// Atomic money transfer via the Supabase `transfer_funds` RPC so the balance
// deduction, credit, and transaction log entry all happen in one DB transaction.
const makeTransferFunds = () => {
  if (isSupabaseConfigured && supabase) {
    return async ({ fromWalletId, toWalletId, amount, note }) => {
      const transactionId = getId();
      const { data, error } = await supabase.rpc("transfer_funds", {
        p_transaction_id: transactionId,
        p_from_wallet_id: fromWalletId,
        p_to_wallet_id:   toWalletId,
        p_amount:         amount,
        p_note:           note || null,
      });
      if (error) throw new Error(error.message);
      return data;
    };
  }
  return async () => {
    throw new Error("Cannot transfer funds: Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  };
};

// Atomic single-wallet balance delta using optimistic concurrency (CAS loop).
// This prevents lost updates when multiple actions modify the same wallet at once.
const makeAdjustWalletBalance = () => {
  if (isSupabaseConfigured && supabase) {
    return async (walletId, delta, options = {}) => {
      const amount = Number(delta);
      const maxRetries = Number(options.maxRetries ?? 8);
      const allowNegative = Boolean(options.allowNegative ?? false);

      if (!walletId) throw new Error("Wallet ID is required.");
      if (!Number.isFinite(amount) || amount === 0) {
        throw new Error("Balance delta must be a non-zero number.");
      }

      for (let attempt = 0; attempt < maxRetries; attempt += 1) {
        const { data: current, error: readError } = await supabase
          .from(ENTITY_TABLE.Wallet)
          .select("id,balance")
          .eq("id", walletId)
          .maybeSingle();

        if (readError) throw new Error(readError.message);
        if (!current) throw new Error("Wallet not found.");

        const currentBalance = Number(current.balance || 0);
        const nextBalance = currentBalance + amount;

        if (!allowNegative && nextBalance < 0) {
          throw new Error("Insufficient balance");
        }

        const { data: updated, error: updateError } = await supabase
          .from(ENTITY_TABLE.Wallet)
          .update({ balance: nextBalance })
          .eq("id", walletId)
          .eq("balance", current.balance)
          .select()
          .maybeSingle();

        if (updateError) throw new Error(updateError.message);
        if (updated) return updated;
      }

      throw new Error("Balance update conflict. Please try again.");
    };
  }

  return async () => {
    throw new Error("Cannot adjust wallet balance: Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  };
};

const createClient = () => ({
  entities: {
    ...Object.fromEntries(
      ENTITY_NAMES.map((name) => [
        name,
        isSupabaseConfigured && supabase
          ? supabaseEntityApi(ENTITY_TABLE[name], name)
          : notConfiguredApi(name),
      ])
    ),
    // Profile is tied to auth.users and always requires Supabase.
    Profile: isSupabaseConfigured && supabase
      ? supabaseEntityApi(ENTITY_TABLE.Profile, "Profile")
      : notConfiguredApi("Profile"),
  },
  auth: {
    me: async () => ({ id: "local-user", name: "Local User" }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  // Atomic balance transfer — prefer over manual Wallet.update + Transaction.create
  transferFunds: makeTransferFunds(),
  // Atomic balance adjust for earnings/spending within a single wallet.
  adjustWalletBalance: makeAdjustWalletBalance(),
});

export const base44 = createClient();
