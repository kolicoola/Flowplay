import { base44 } from "@/api/base44Client";

const upgradeEntity = base44.entities["Upgrade"];

export const UPGRADE_DEFS = {
  lucky_15m: {
    id: "lucky_15m",
    kind: "timed_lucky",
    label: "Lucky Potion 15m",
    description: "Better market deals and 60/40 coin odds for 15 minutes.",
    durationMs: 15 * 60 * 1000,
    cost: 3000000,
    marketEdge: 0.1,
  },
  lucky_30m: {
    id: "lucky_30m",
    kind: "timed_lucky",
    label: "Lucky Potion 30m",
    description: "Longer luck window with stronger market edge.",
    durationMs: 30 * 60 * 1000,
    cost: 5500000,
    marketEdge: 0.16,
  },
  lucky_60m: {
    id: "lucky_60m",
    kind: "timed_lucky",
    label: "Lucky Potion 60m",
    description: "Max market edge (up to 25%) and coin luck.",
    durationMs: 60 * 60 * 1000,
    cost: 10000000,
    marketEdge: 0.25,
  },
  speed_15m: {
    id: "speed_15m",
    kind: "timed_speed",
    label: "Over Speed Yuki 15m",
    description: "x2 market ticks, daily gift timer, and tip spawning.",
    durationMs: 15 * 60 * 1000,
    cost: 2000000,
    speedMultiplier: 2,
  },
  speed_30m: {
    id: "speed_30m",
    kind: "timed_speed",
    label: "Over Speed Yuki 30m",
    description: "x2 acceleration for a longer boost window.",
    durationMs: 30 * 60 * 1000,
    cost: 3500000,
    speedMultiplier: 2,
  },
  speed_60m: {
    id: "speed_60m",
    kind: "timed_speed",
    label: "Over Speed Yuki 60m",
    description: "Maximum uptime for x2 acceleration.",
    durationMs: 60 * 60 * 1000,
    cost: 6500000,
    speedMultiplier: 2,
  },
  tips_500_30: {
    id: "tips_500_30",
    kind: "tips",
    label: "Tips +500 / 30s",
    description: "Permanent tip drops: +$500 every 30 seconds.",
    amount: 500,
    intervalSec: 30,
    cost: 50000,
  },
  tips_200_35: {
    id: "tips_200_35",
    kind: "tips",
    label: "Tips +200 / 35s",
    description: "Permanent tip drops: +$200 every 35 seconds.",
    amount: 200,
    intervalSec: 35,
    cost: 20000,
  },
  friendship_10: {
    id: "friendship_10",
    kind: "friendship",
    label: "Friendship x10",
    description: "The next 10 incoming payments to you are doubled.",
    grantPayments: 10,
    cost: 5000000,
  },
};

export const TIMED_UPGRADES = Object.values(UPGRADE_DEFS).filter((u) => u.kind === "timed_lucky" || u.kind === "timed_speed");
export const TIPS_UPGRADES = Object.values(UPGRADE_DEFS).filter((u) => u.kind === "tips");
export const FRIENDSHIP_UPGRADE = UPGRADE_DEFS.friendship_10;

function getExpiryFromRow(row, def) {
  const levelNum = Number(row?.level || 0);
  if (levelNum > 1000000000000) return levelNum;

  const created = new Date(row?.created_date || 0).getTime();
  if (!Number.isFinite(created) || !def?.durationMs) return 0;
  return created + def.durationMs;
}

export function getUpgradeEffects(upgrades, now = Date.now()) {
  const rows = Array.isArray(upgrades) ? upgrades : [];

  let luckyUntil = 0;
  let luckyEdge = 0;
  let speedUntil = 0;
  let speedMultiplier = 1;
  let friendshipRemaining = 0;

  const tipsMap = new Map();

  for (const row of rows) {
    const def = UPGRADE_DEFS[row.upgrade_id];
    if (!def) continue;

    if (def.kind === "timed_lucky") {
      const expiry = getExpiryFromRow(row, def);
      if (expiry > now) {
        luckyUntil = Math.max(luckyUntil, expiry);
        luckyEdge = Math.max(luckyEdge, Number(def.marketEdge || 0));
      }
      continue;
    }

    if (def.kind === "timed_speed") {
      const expiry = getExpiryFromRow(row, def);
      if (expiry > now && expiry > speedUntil) {
        speedUntil = expiry;
        speedMultiplier = Math.max(speedMultiplier, Number(def.speedMultiplier || 1));
      }
      continue;
    }

    if (def.kind === "tips") {
      const count = Math.max(0, Number(row.level || 0));
      if (count <= 0) continue;
      const prev = tipsMap.get(def.id);
      if (!prev) {
        tipsMap.set(def.id, {
          id: def.id,
          label: def.label,
          intervalSec: def.intervalSec,
          amount: def.amount * count,
          ownedCount: count,
        });
      } else {
        prev.ownedCount += count;
        prev.amount += def.amount * count;
      }
      continue;
    }

    if (def.kind === "friendship") {
      friendshipRemaining += Math.max(0, Number(row.level || 0));
    }
  }

  const luckyActive = luckyUntil > now;
  const speedActive = speedUntil > now;

  return {
    luckyActive,
    luckyUntil,
    marketBuyDiscountPct: luckyActive ? luckyEdge : 0,
    marketSellBonusPct: luckyActive ? luckyEdge : 0,
    coinWinChance: luckyActive ? 0.6 : 0.5,
    speedActive,
    speedUntil,
    speedMultiplier: speedActive ? speedMultiplier : 1,
    tipGenerators: Array.from(tipsMap.values()),
    friendshipRemaining,
  };
}

export async function purchaseUpgrade(walletId, upgradeId) {
  const def = UPGRADE_DEFS[upgradeId];
  if (!def) throw new Error("Unknown upgrade");

  await base44.adjustWalletBalance(walletId, -def.cost);

  const existing = await upgradeEntity.filter({ wallet_id: walletId, upgrade_id: upgradeId });
  const row = existing[0];

  if (def.kind === "timed_lucky" || def.kind === "timed_speed") {
    const currentExpiry = row ? getExpiryFromRow(row, def) : 0;
    const now = Date.now();
    const nextExpiry = Math.max(now, currentExpiry) + def.durationMs;

    if (row?.id) {
      await upgradeEntity.update(row.id, { level: nextExpiry });
    } else {
      await upgradeEntity.create({ wallet_id: walletId, upgrade_id: upgradeId, level: nextExpiry });
    }
    return;
  }

  if (def.kind === "tips") {
    if (row?.id) {
      await upgradeEntity.update(row.id, { level: Math.max(0, Number(row.level || 0)) + 1 });
    } else {
      await upgradeEntity.create({ wallet_id: walletId, upgrade_id: upgradeId, level: 1 });
    }
    return;
  }

  if (def.kind === "friendship") {
    const grant = Number(def.grantPayments || 0);
    if (row?.id) {
      await upgradeEntity.update(row.id, { level: Math.max(0, Number(row.level || 0)) + grant });
    } else {
      await upgradeEntity.create({ wallet_id: walletId, upgrade_id: upgradeId, level: grant });
    }
  }
}

export async function applyFriendshipIncomingBonus(recipientWalletId, amount) {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return false;

  const rows = await upgradeEntity.filter({ wallet_id: recipientWalletId, upgrade_id: FRIENDSHIP_UPGRADE.id });
  const row = rows[0];
  const remaining = Math.max(0, Number(row?.level || 0));
  if (!row?.id || remaining <= 0) return false;

  await base44.adjustWalletBalance(recipientWalletId, amt);
  await upgradeEntity.update(row.id, { level: remaining - 1 });
  return true;
}
