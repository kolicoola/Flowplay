import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

const DB_KEY = "flowplay_local_db_v1";

// All entities served from localStorage (used as a fallback when Supabase is
// not configured, and to populate the initEmptyDb / storage-sync helpers).
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

// Maps each entity name to the corresponding Supabase table name.
const ENTITY_TABLE = {
  Wallet:          "wallets",
  Transaction:     "transactions",
  Charity:         "charities",
  CoinFlip:        "coin_flips",
  Investment:      "investments",
  Upgrade:         "upgrades",
  AssetDefinition: "asset_definitions",
  AssetPrice:      "asset_prices",
  Profile:         "profiles",
};

const listeners = new Map();
let initializedStorageSync = false;

const getId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const initEmptyDb = () => {
  const db = {};
  for (const name of ENTITY_NAMES) db[name] = [];
  return db;
};

const readDb = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = initEmptyDb();
      localStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    for (const name of ENTITY_NAMES) {
      if (!Array.isArray(parsed[name])) parsed[name] = [];
    }
    return parsed;
  } catch {
    const initial = initEmptyDb();
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
};

const writeDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const sortRecords = (records, sortBy) => {
  if (!sortBy || typeof sortBy !== "string") return [...records];
  const desc = sortBy.startsWith("-");
  const field = desc ? sortBy.slice(1) : sortBy;
  return [...records].sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return desc ? (av < bv ? 1 : -1) : (av > bv ? 1 : -1);
  });
};

const notify = (entity, operation, record) => {
  const cbs = listeners.get(entity);
  if (!cbs) return;
  const event = {
    entity,
    operation,
    record,
    // Backward-compatible aliases used by some components.
    type: operation,
    data: record,
  };
  for (const cb of cbs) cb(event);
};

const indexById = (list) => {
  const map = new Map();
  for (const item of list || []) {
    if (item?.id) map.set(item.id, item);
  }
  return map;
};

const shallowDiffers = (a, b) => {
  if (a === b) return false;
  if (!a || !b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return true;
  }
  return false;
};

const setupStorageSync = () => {
  if (initializedStorageSync || typeof window === "undefined") return;
  initializedStorageSync = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== DB_KEY) return;
    let oldDb;
    let newDb;
    try {
      oldDb = event.oldValue ? JSON.parse(event.oldValue) : initEmptyDb();
      newDb = event.newValue ? JSON.parse(event.newValue) : initEmptyDb();
    } catch {
      return;
    }

    for (const entity of ENTITY_NAMES) {
      const oldMap = indexById(oldDb?.[entity] || []);
      const newMap = indexById(newDb?.[entity] || []);

      for (const [id, next] of newMap.entries()) {
        if (!oldMap.has(id)) notify(entity, "create", next);
        else if (shallowDiffers(oldMap.get(id), next)) notify(entity, "update", next);
      }

      for (const [id, prev] of oldMap.entries()) {
        if (!newMap.has(id)) notify(entity, "delete", prev);
      }
    }
  });
};

const matchesFilter = (record, criteria = {}) => {
  return Object.entries(criteria).every(([key, value]) => record?.[key] === value);
};

const entityApi = (entity) => ({
  list: async (sortBy, limit) => {
    const db = readDb();
    const sorted = sortRecords(db[entity], sortBy);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  },

  filter: async (criteria) => {
    const db = readDb();
    return db[entity].filter((record) => matchesFilter(record, criteria));
  },

  create: async (payload) => {
    const db = readDb();
    const record = {
      id: getId(),
      created_date: new Date().toISOString(),
      ...payload,
    };
    db[entity].push(record);
    writeDb(db);
    notify(entity, "create", record);
    return record;
  },

  update: async (id, patch) => {
    const db = readDb();
    const idx = db[entity].findIndex((record) => record.id === id);
    if (idx === -1) throw new Error(`${entity} not found`);
    const updated = { ...db[entity][idx], ...patch };
    db[entity][idx] = updated;
    writeDb(db);
    notify(entity, "update", updated);
    return updated;
  },

  delete: async (id) => {
    const db = readDb();
    const idx = db[entity].findIndex((record) => record.id === id);
    if (idx === -1) return;
    const [deleted] = db[entity].splice(idx, 1);
    writeDb(db);
    notify(entity, "delete", deleted);
  },

  subscribe: (callback) => {
    setupStorageSync();
    if (!listeners.has(entity)) listeners.set(entity, new Set());
    listeners.get(entity).add(callback);
    return () => listeners.get(entity)?.delete(callback);
  },
});

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

// Returns a Supabase-backed API when Supabase is configured, falling back to
// the localStorage implementation so the app still works offline / in dev.
const makeEntityApi = (entityName) => {
  if (isSupabaseConfigured && supabase) {
    return supabaseEntityApi(ENTITY_TABLE[entityName], entityName);
  }
  return entityApi(entityName);
};

const createLocalClient = () => ({
  entities: {
    ...Object.fromEntries(ENTITY_NAMES.map((name) => [name, makeEntityApi(name)])),
    // Profile always routes through Supabase (tied to auth.users).
    Profile: isSupabaseConfigured && supabase
      ? supabaseEntityApi(ENTITY_TABLE.Profile, "Profile")
      : {
          list:      async () => [],
          filter:    async () => [],
          get:       async () => null,
          create:    async () => { throw new Error("Cannot create profile: Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable profile functionality."); },
          update:    async () => { throw new Error("Cannot update profile: Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable profile functionality."); },
          delete:    async () => { throw new Error("Cannot delete profile: Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable profile functionality."); },
          subscribe: () => () => {},
        },
  },
  auth: {
    me: async () => ({ id: "local-user", name: "Local User" }),
    logout: () => {},
    redirectToLogin: () => {},
  },
});

export const base44 = createLocalClient();
