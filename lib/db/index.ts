import postgres from "postgres";

export type DbClient = postgres.Sql;

const globalForDb = globalThis as unknown as {
  sql?: postgres.Sql;
  initPromise?: Promise<void>;
};

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url && url.length > 0 ? url : null;
}

export function getDb(): postgres.Sql | null {
  const url = getDatabaseUrl();
  if (!url) return null;

  if (!globalForDb.sql) {
    globalForDb.sql = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
    });
  }

  return globalForDb.sql;
}

export const SCHEMA_SQL = `
-- Users table: store osu! account info
CREATE TABLE IF NOT EXISTS users (
  osu_id INTEGER PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  country_code VARCHAR(10) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table: store authenticated sessions
CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(128) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(osu_id) ON DELETE CASCADE,
  osu_access_token TEXT NOT NULL,
  osu_refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Beatmapset cache table: stores full snapshot of beatmapsets
-- Ensures beatmaps remain accessible even if deleted from official osu!
CREATE TABLE IF NOT EXISTS beatmapset_cache (
  id INTEGER PRIMARY KEY,
  artist VARCHAR(500) NOT NULL,
  artist_unicode VARCHAR(500) DEFAULT '',
  title VARCHAR(500) NOT NULL,
  title_unicode VARCHAR(500) DEFAULT '',
  creator VARCHAR(255) NOT NULL,
  user_id INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'unknown',
  bpm DOUBLE PRECISION DEFAULT 0,
  play_count BIGINT DEFAULT 0,
  favourite_count BIGINT DEFAULT 0,
  nsfw BOOLEAN DEFAULT FALSE,
  video BOOLEAN DEFAULT FALSE,
  storyboard BOOLEAN DEFAULT FALSE,
  preview_url TEXT DEFAULT '',
  source TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  ranked_date TIMESTAMPTZ,
  last_updated TIMESTAMPTZ,
  covers JSONB NOT NULL DEFAULT '{}'::jsonb,
  beatmaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  converts JSONB DEFAULT '[]'::jsonb,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted_from_osu BOOLEAN DEFAULT FALSE,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beatmapset_cache_creator ON beatmapset_cache(creator);
CREATE INDEX IF NOT EXISTS idx_beatmapset_cache_title ON beatmapset_cache(title);

-- Favorites table: maps user to favorited beatmapsets
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(osu_id) ON DELETE CASCADE,
  beatmapset_id INTEGER NOT NULL REFERENCES beatmapset_cache(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, beatmapset_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Collections table: user-created beatmap collections (shareable)
CREATE TABLE IF NOT EXISTS collections (
  id VARCHAR(64) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(osu_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);

-- Collection items table: maps collection to beatmapsets
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id VARCHAR(64) NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  beatmapset_id INTEGER NOT NULL REFERENCES beatmapset_cache(id) ON DELETE CASCADE,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, beatmapset_id)
);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_sort_order ON collection_items(sort_order ASC, added_at DESC);
`;

export async function ensureDatabaseSchema(sql: postgres.Sql): Promise<void> {
  if (!globalForDb.initPromise) {
    globalForDb.initPromise = (async () => {
      await sql.unsafe(SCHEMA_SQL);
    })().catch((err) => {
      globalForDb.initPromise = undefined;
      throw err;
    });
  }
  return globalForDb.initPromise;
}
