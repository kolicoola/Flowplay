-- Flowplay initial schema
-- Run this migration in your Supabase SQL editor (or via the Supabase CLI) to
-- create all tables required by the application.
-- All tables use TEXT primary keys to match the client-side UUID generation.

-- ─────────────────────────────────────────────────────────────────────────────
-- wallets
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id            TEXT        PRIMARY KEY,
  created_date  TIMESTAMPTZ DEFAULT NOW(),
  username      TEXT        NOT NULL,
  balance       NUMERIC     DEFAULT 1000,
  auth_user_id  UUID        REFERENCES auth.users (id) ON DELETE SET NULL,
  avatar_color            TEXT,
  avatar_background       TEXT,
  owned_backgrounds       JSONB DEFAULT '[]',
  avatar_font             TEXT,
  owned_fonts             JSONB DEFAULT '[]',
  avatar_letter_color     TEXT,
  owned_letter_colors     JSONB DEFAULT '[]',
  avatar_hair             TEXT,
  owned_hairs             JSONB DEFAULT '[]',
  site_background         TEXT,
  owned_site_backgrounds  JSONB DEFAULT '[]'
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets: public read"   ON wallets FOR SELECT USING (true);
CREATE POLICY "wallets: auth insert"   ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "wallets: auth update"   ON wallets FOR UPDATE USING (true);
CREATE POLICY "wallets: auth delete"   ON wallets FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- transactions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id              TEXT        PRIMARY KEY,
  created_date    TIMESTAMPTZ DEFAULT NOW(),
  from_wallet_id  TEXT        REFERENCES wallets (id) ON DELETE SET NULL,
  to_wallet_id    TEXT        REFERENCES wallets (id) ON DELETE SET NULL,
  from_username   TEXT,
  to_username     TEXT,
  amount          NUMERIC     NOT NULL,
  note            TEXT
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions: public read"   ON transactions FOR SELECT USING (true);
CREATE POLICY "transactions: auth insert"   ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "transactions: auth delete"   ON transactions FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- charities
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id                  TEXT        PRIMARY KEY,
  created_date        TIMESTAMPTZ DEFAULT NOW(),
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  founders            JSONB       DEFAULT '[]',
  founder_names       JSONB       DEFAULT '[]',
  minimum_donation    NUMERIC     DEFAULT 1,
  total_raised        NUMERIC     DEFAULT 0,
  creator_wallet_id   TEXT
);

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "charities: public read"   ON charities FOR SELECT USING (true);
CREATE POLICY "charities: auth insert"   ON charities FOR INSERT WITH CHECK (true);
CREATE POLICY "charities: auth update"   ON charities FOR UPDATE USING (true);
CREATE POLICY "charities: auth delete"   ON charities FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- coin_flips
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_flips (
  id                  TEXT        PRIMARY KEY,
  created_date        TIMESTAMPTZ DEFAULT NOW(),
  creator_wallet_id   TEXT        NOT NULL,
  creator_username    TEXT        NOT NULL,
  joiner_wallet_id    TEXT,
  joiner_username     TEXT,
  amount              NUMERIC     NOT NULL,
  status              TEXT        DEFAULT 'waiting',
  winner_wallet_id    TEXT,
  winner_username     TEXT
);

ALTER TABLE coin_flips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coin_flips: public read"   ON coin_flips FOR SELECT USING (true);
CREATE POLICY "coin_flips: auth insert"   ON coin_flips FOR INSERT WITH CHECK (true);
CREATE POLICY "coin_flips: auth update"   ON coin_flips FOR UPDATE USING (true);
CREATE POLICY "coin_flips: auth delete"   ON coin_flips FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- investments
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id              TEXT    PRIMARY KEY,
  created_date    TIMESTAMPTZ DEFAULT NOW(),
  wallet_id       TEXT    NOT NULL,
  asset_id        TEXT    NOT NULL,
  shares          NUMERIC NOT NULL,
  avg_buy_price   NUMERIC NOT NULL
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investments: public read"   ON investments FOR SELECT USING (true);
CREATE POLICY "investments: auth insert"   ON investments FOR INSERT WITH CHECK (true);
CREATE POLICY "investments: auth update"   ON investments FOR UPDATE USING (true);
CREATE POLICY "investments: auth delete"   ON investments FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- upgrades
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS upgrades (
  id            TEXT    PRIMARY KEY,
  created_date  TIMESTAMPTZ DEFAULT NOW(),
  wallet_id     TEXT    NOT NULL,
  upgrade_id    TEXT    NOT NULL,
  level         INTEGER DEFAULT 1
);

ALTER TABLE upgrades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upgrades: public read"   ON upgrades FOR SELECT USING (true);
CREATE POLICY "upgrades: auth insert"   ON upgrades FOR INSERT WITH CHECK (true);
CREATE POLICY "upgrades: auth update"   ON upgrades FOR UPDATE USING (true);
CREATE POLICY "upgrades: auth delete"   ON upgrades FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- asset_definitions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_definitions (
  id            TEXT    PRIMARY KEY,
  created_date  TIMESTAMPTZ DEFAULT NOW(),
  asset_id      TEXT    NOT NULL UNIQUE,
  label         TEXT    NOT NULL,
  symbol        TEXT    NOT NULL,
  emoji         TEXT    NOT NULL,
  color         TEXT,
  start_price   NUMERIC NOT NULL,
  volatility    NUMERIC,
  drift         NUMERIC
);

ALTER TABLE asset_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asset_definitions: public read"   ON asset_definitions FOR SELECT USING (true);
CREATE POLICY "asset_definitions: auth insert"   ON asset_definitions FOR INSERT WITH CHECK (true);
CREATE POLICY "asset_definitions: auth delete"   ON asset_definitions FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- asset_prices
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_prices (
  id            TEXT        PRIMARY KEY,
  created_date  TIMESTAMPTZ DEFAULT NOW(),
  asset_id      TEXT        NOT NULL,
  price         NUMERIC     NOT NULL,
  history       JSONB       DEFAULT '[]',
  last_updated  TIMESTAMPTZ
);

ALTER TABLE asset_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asset_prices: public read"   ON asset_prices FOR SELECT USING (true);
CREATE POLICY "asset_prices: auth insert"   ON asset_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "asset_prices: auth update"   ON asset_prices FOR UPDATE USING (true);
CREATE POLICY "asset_prices: auth delete"   ON asset_prices FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles  (used by Supabase Auth; created automatically by the auth trigger)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  username    TEXT,
  avatar_url  TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: public read"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: auth insert"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: auth update"   ON profiles FOR UPDATE USING (auth.uid() = id);
