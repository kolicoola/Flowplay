const DB_KEY = "flowplay_local_db_v1";

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

const listeners = new Map();

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
  const event = { operation, record };
  for (const cb of cbs) cb(event);
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
    if (!listeners.has(entity)) listeners.set(entity, new Set());
    listeners.get(entity).add(callback);
    return () => listeners.get(entity)?.delete(callback);
  },
});

export const base44 = {
  entities: Object.fromEntries(ENTITY_NAMES.map((name) => [name, entityApi(name)])),
  auth: {
    me: async () => ({ id: "local-user", name: "Local User" }),
    logout: () => {},
    redirectToLogin: () => {},
  },
};
