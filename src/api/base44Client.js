import { createClient } from "@base44/sdk";

const DB_KEY = "flowplay_local_db_v1";
const BACKEND_MODE = (import.meta.env.VITE_BACKEND_MODE || "local").toLowerCase();
const BASE44_APP_ID = import.meta.env.VITE_BASE44_APP_ID;

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

const makeEvent = (entity, operation, record) => ({
  entity,
  operation,
  record,
  type: operation,
  data: record,
});

const callCallbacks = (callbacks, event) => {
  for (const cb of callbacks) cb(event);
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

const createRemoteEntityApi = (remoteClient, entity) => {
  const subscribers = new Set();
  let pollTimer = null;
  let snapshot = new Map();

  const startPolling = () => {
    if (pollTimer) return;
    pollTimer = setInterval(async () => {
      try {
        const current = await remoteClient.entities[entity].list("-created_date", 500);
        const next = new Map((current || []).map((item) => [item.id, item]));

        for (const [id, record] of next.entries()) {
          if (!snapshot.has(id)) {
            callCallbacks(subscribers, makeEvent(entity, "create", record));
          } else if (JSON.stringify(snapshot.get(id)) !== JSON.stringify(record)) {
            callCallbacks(subscribers, makeEvent(entity, "update", record));
          }
        }

        for (const [id, record] of snapshot.entries()) {
          if (!next.has(id)) {
            callCallbacks(subscribers, makeEvent(entity, "delete", record));
          }
        }

        snapshot = next;
      } catch {
        // Keep polling; transient network/auth failures should not crash UI.
      }
    }, 1500);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  return {
    list: async (sortBy, limit) => remoteClient.entities[entity].list(sortBy, limit),
    filter: async (criteria) => remoteClient.entities[entity].filter(criteria),
    create: async (payload) => {
      const created = await remoteClient.entities[entity].create(payload);
      callCallbacks(subscribers, makeEvent(entity, "create", created));
      return created;
    },
    update: async (id, patch) => {
      const updated = await remoteClient.entities[entity].update(id, patch);
      callCallbacks(subscribers, makeEvent(entity, "update", updated));
      return updated;
    },
    delete: async (id) => {
      // Fetch record before delete so callbacks can still get payload.
      let deleted = null;
      try {
        const all = await remoteClient.entities[entity].list();
        deleted = (all || []).find((r) => r.id === id) || null;
      } catch {
        deleted = { id };
      }
      await remoteClient.entities[entity].delete(id);
      callCallbacks(subscribers, makeEvent(entity, "delete", deleted || { id }));
    },
    subscribe: (callback) => {
      subscribers.add(callback);
      if (subscribers.size === 1) startPolling();
      return () => {
        subscribers.delete(callback);
        if (subscribers.size === 0) stopPolling();
      };
    },
  };
};

const createLocalClient = () => ({
  entities: Object.fromEntries(ENTITY_NAMES.map((name) => [name, entityApi(name)])),
  auth: {
    me: async () => ({ id: "local-user", name: "Local User" }),
    logout: () => {},
    redirectToLogin: () => {},
  },
});

const createRemoteClient = () => {
  const remoteClient = createClient({ appId: BASE44_APP_ID });
  return {
    entities: Object.fromEntries(
      ENTITY_NAMES.map((name) => [name, createRemoteEntityApi(remoteClient, name)])
    ),
    auth: remoteClient.auth,
  };
};

export const base44 =
  BACKEND_MODE === "base44" && BASE44_APP_ID
    ? createRemoteClient()
    : createLocalClient();
