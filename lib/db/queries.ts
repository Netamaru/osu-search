import crypto from "node:crypto";
import type { Beatmapset } from "@/lib/osu/types";
import { ensureDatabaseSchema, type DbClient } from "./index";

export type DbUser = {
  osu_id: number;
  username: string;
  avatar_url: string;
  country_code: string;
  created_at: string;
  updated_at: string;
};

export type DbCollection = {
  id: string;
  user_id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    osu_id: number;
    username: string;
    avatar_url: string;
  };
  item_count?: number;
  preview_covers?: string[];
};

export type DbCollectionWithItems = DbCollection & {
  items: Array<{
    beatmapset_id: number;
    notes: string;
    sort_order: number;
    added_at: string;
    beatmapset: Beatmapset & { is_deleted_from_osu?: boolean };
  }>;
};

// Users
export async function upsertUser(
  sql: DbClient,
  user: {
    osu_id: number;
    username: string;
    avatar_url?: string;
    country_code?: string;
  },
): Promise<DbUser> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<DbUser[]>`
    INSERT INTO users (osu_id, username, avatar_url, country_code, updated_at)
    VALUES (
      ${user.osu_id},
      ${user.username},
      ${user.avatar_url ?? ""},
      ${user.country_code ?? ""},
      NOW()
    )
    ON CONFLICT (osu_id) DO UPDATE SET
      username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url,
      country_code = EXCLUDED.country_code,
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0];
}

export async function getUser(sql: DbClient, osuId: number): Promise<DbUser | null> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<DbUser[]>`
    SELECT * FROM users WHERE osu_id = ${osuId} LIMIT 1
  `;
  return rows[0] || null;
}

// Sessions
export async function createSession(
  sql: DbClient,
  userId: number,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds: number;
  },
): Promise<string> {
  await ensureDatabaseSchema(sql);
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + tokens.expiresInSeconds * 1000);

  await sql`
    INSERT INTO sessions (token, user_id, osu_access_token, osu_refresh_token, expires_at)
    VALUES (
      ${sessionToken},
      ${userId},
      ${tokens.accessToken},
      ${tokens.refreshToken ?? null},
      ${expiresAt}
    )
  `;

  return sessionToken;
}

export async function getSessionUser(
  sql: DbClient,
  sessionToken: string,
): Promise<{ user: DbUser; sessionToken: string; accessToken: string } | null> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{
    osu_id: number;
    username: string;
    avatar_url: string;
    country_code: string;
    created_at: string;
    updated_at: string;
    token: string;
    osu_access_token: string;
    expires_at: Date;
  }>>`
    SELECT
      u.osu_id, u.username, u.avatar_url, u.country_code, u.created_at, u.updated_at,
      s.token, s.osu_access_token, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.osu_id
    WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    LIMIT 1
  `;

  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  return {
    user: {
      osu_id: row.osu_id,
      username: row.username,
      avatar_url: row.avatar_url,
      country_code: row.country_code,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    sessionToken: row.token,
    accessToken: row.osu_access_token,
  };
}

export async function deleteSession(sql: DbClient, sessionToken: string): Promise<void> {
  await ensureDatabaseSchema(sql);
  await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
}

// Beatmapset Snapshot Cache
export async function upsertBeatmapsetCache(
  sql: DbClient,
  beatmapset: Beatmapset,
): Promise<void> {
  await ensureDatabaseSchema(sql);
  const covers = beatmapset.covers ?? {};
  const beatmaps = Array.isArray(beatmapset.beatmaps) ? beatmapset.beatmaps : [];
  const converts = Array.isArray(beatmapset.converts) ? beatmapset.converts : [];

  await sql`
    INSERT INTO beatmapset_cache (
      id, artist, artist_unicode, title, title_unicode, creator, user_id,
      status, bpm, play_count, favourite_count, nsfw, video, storyboard,
      preview_url, source, tags, ranked_date, last_updated,
      covers, beatmaps, converts, raw_data, is_deleted_from_osu, updated_at
    ) VALUES (
      ${beatmapset.id},
      ${beatmapset.artist},
      ${beatmapset.artist_unicode || beatmapset.artist},
      ${beatmapset.title},
      ${beatmapset.title_unicode || beatmapset.title},
      ${beatmapset.creator},
      ${beatmapset.user_id || 0},
      ${beatmapset.status},
      ${beatmapset.bpm || 0},
      ${beatmapset.play_count || 0},
      ${beatmapset.favourite_count || 0},
      ${Boolean(beatmapset.nsfw)},
      ${Boolean(beatmapset.video)},
      ${Boolean(beatmapset.storyboard)},
      ${beatmapset.preview_url || ""},
      ${beatmapset.source || ""},
      ${beatmapset.tags || ""},
      ${beatmapset.ranked_date ? new Date(beatmapset.ranked_date) : null},
      ${beatmapset.last_updated ? new Date(beatmapset.last_updated) : null},
      ${sql.json(covers as any)},
      ${sql.json(beatmaps as any)},
      ${sql.json(converts as any)},
      ${sql.json(beatmapset as any)},
      FALSE,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      artist = EXCLUDED.artist,
      title = EXCLUDED.title,
      creator = EXCLUDED.creator,
      status = EXCLUDED.status,
      bpm = EXCLUDED.bpm,
      play_count = EXCLUDED.play_count,
      favourite_count = EXCLUDED.favourite_count,
      covers = EXCLUDED.covers,
      beatmaps = CASE
        WHEN jsonb_typeof(EXCLUDED.beatmaps) = 'array' AND jsonb_array_length(EXCLUDED.beatmaps) > 0
          THEN EXCLUDED.beatmaps
        ELSE beatmapset_cache.beatmaps
      END,
      raw_data = EXCLUDED.raw_data,
      updated_at = NOW()
  `;
}

export async function getCachedBeatmapset(
  sql: DbClient,
  id: number,
): Promise<(Beatmapset & { is_deleted_from_osu?: boolean }) | null> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{
    raw_data: Beatmapset;
    is_deleted_from_osu: boolean;
  }>>`
    SELECT raw_data, is_deleted_from_osu
    FROM beatmapset_cache
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  const data = typeof row.raw_data === "string" ? JSON.parse(row.raw_data) : row.raw_data;
  return {
    ...data,
    is_deleted_from_osu: row.is_deleted_from_osu,
  };
}

export async function markBeatmapsetDeleted(
  sql: DbClient,
  id: number,
  isDeleted = true,
): Promise<void> {
  await ensureDatabaseSchema(sql);
  await sql`
    UPDATE beatmapset_cache
    SET is_deleted_from_osu = ${isDeleted}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

// Favorites
export async function toggleFavorite(
  sql: DbClient,
  userId: number,
  beatmapset: Beatmapset,
): Promise<{ favorited: boolean }> {
  await ensureDatabaseSchema(sql);
  await upsertBeatmapsetCache(sql, beatmapset);

  const existing = await sql`
    SELECT 1 FROM favorites WHERE user_id = ${userId} AND beatmapset_id = ${beatmapset.id} LIMIT 1
  `;

  if (existing.length > 0) {
    await sql`
      DELETE FROM favorites WHERE user_id = ${userId} AND beatmapset_id = ${beatmapset.id}
    `;
    return { favorited: false };
  } else {
    await sql`
      INSERT INTO favorites (user_id, beatmapset_id) VALUES (${userId}, ${beatmapset.id})
      ON CONFLICT DO NOTHING
    `;
    return { favorited: true };
  }
}

export async function removeFavorite(
  sql: DbClient,
  userId: number,
  beatmapsetId: number,
): Promise<void> {
  await ensureDatabaseSchema(sql);
  await sql`
    DELETE FROM favorites WHERE user_id = ${userId} AND beatmapset_id = ${beatmapsetId}
  `;
}

export async function getUserFavoriteIds(
  sql: DbClient,
  userId: number,
): Promise<number[]> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{ beatmapset_id: number }>>`
    SELECT beatmapset_id FROM favorites WHERE user_id = ${userId}
  `;
  return rows.map((r) => r.beatmapset_id);
}

export async function getUserFavorites(
  sql: DbClient,
  userId: number,
): Promise<Array<Beatmapset & { is_deleted_from_osu?: boolean; favorited_at: string }>> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{
    raw_data: Beatmapset;
    is_deleted_from_osu: boolean;
    created_at: string;
  }>>`
    SELECT b.raw_data, b.is_deleted_from_osu, f.created_at
    FROM favorites f
    JOIN beatmapset_cache b ON f.beatmapset_id = b.id
    WHERE f.user_id = ${userId}
    ORDER BY f.created_at DESC
  `;

  return rows.map((row) => {
    const data = typeof row.raw_data === "string" ? JSON.parse(row.raw_data) : row.raw_data;
    return {
      ...data,
      is_deleted_from_osu: row.is_deleted_from_osu,
      favorited_at: row.created_at,
    };
  });
}

// Collections
export async function createCollection(
  sql: DbClient,
  userId: number,
  name: string,
  description = "",
  isPublic = false,
): Promise<DbCollection> {
  await ensureDatabaseSchema(sql);
  const id = `col_${crypto.randomBytes(8).toString("hex")}`;
  const rows = await sql<DbCollection[]>`
    INSERT INTO collections (id, user_id, name, description, is_public)
    VALUES (${id}, ${userId}, ${name.trim()}, ${description.trim()}, ${isPublic})
    RETURNING *
  `;
  return rows[0];
}

export async function updateCollection(
  sql: DbClient,
  collectionId: string,
  userId: number,
  updates: { name?: string; description?: string; is_public?: boolean },
): Promise<DbCollection | null> {
  await ensureDatabaseSchema(sql);
  const existing = await sql<DbCollection[]>`
    SELECT * FROM collections WHERE id = ${collectionId} AND user_id = ${userId} LIMIT 1
  `;
  if (!existing || existing.length === 0) return null;

  const name = updates.name !== undefined ? updates.name.trim() : existing[0].name;
  const description = updates.description !== undefined ? updates.description.trim() : existing[0].description;
  const isPublic = updates.is_public !== undefined ? updates.is_public : existing[0].is_public;

  const rows = await sql<DbCollection[]>`
    UPDATE collections
    SET name = ${name}, description = ${description}, is_public = ${isPublic}, updated_at = NOW()
    WHERE id = ${collectionId} AND user_id = ${userId}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function deleteCollection(
  sql: DbClient,
  collectionId: string,
  userId: number,
): Promise<boolean> {
  await ensureDatabaseSchema(sql);
  const result = await sql`
    DELETE FROM collections WHERE id = ${collectionId} AND user_id = ${userId}
  `;
  return result.count > 0;
}

export async function getUserCollections(
  sql: DbClient,
  userId: number,
): Promise<DbCollection[]> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{
    id: string;
    user_id: number;
    name: string;
    description: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    item_count: string | number;
    preview_covers: string[] | null;
  }>>`
    SELECT
      c.id, c.user_id, c.name, c.description, c.is_public, c.created_at, c.updated_at,
      COUNT(ci.beatmapset_id)::int as item_count,
      (ARRAY_REMOVE(ARRAY_AGG(b.covers->>'card' ORDER BY ci.added_at DESC), NULL))[1:4] as preview_covers
    FROM collections c
    LEFT JOIN collection_items ci ON c.id = ci.collection_id
    LEFT JOIN beatmapset_cache b ON ci.beatmapset_id = b.id
    WHERE c.user_id = ${userId}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;

  return rows.map((r) => ({
    ...r,
    item_count: Number(r.item_count),
    preview_covers: Array.isArray(r.preview_covers) ? r.preview_covers : [],
  }));
}

export async function getPublicCollections(
  sql: DbClient,
  limit = 24,
): Promise<DbCollection[]> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{
    id: string;
    user_id: number;
    name: string;
    description: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    osu_id: number;
    username: string;
    avatar_url: string;
    item_count: string | number;
    preview_covers: string[] | null;
  }>>`
    SELECT
      c.id, c.user_id, c.name, c.description, c.is_public, c.created_at, c.updated_at,
      u.osu_id, u.username, u.avatar_url,
      COUNT(ci.beatmapset_id)::int as item_count,
      (ARRAY_REMOVE(ARRAY_AGG(b.covers->>'card' ORDER BY ci.added_at DESC), NULL))[1:4] as preview_covers
    FROM collections c
    JOIN users u ON c.user_id = u.osu_id
    LEFT JOIN collection_items ci ON c.id = ci.collection_id
    LEFT JOIN beatmapset_cache b ON ci.beatmapset_id = b.id
    WHERE c.is_public = TRUE
    GROUP BY c.id, u.osu_id, u.username, u.avatar_url
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    description: r.description,
    is_public: r.is_public,
    created_at: r.created_at,
    updated_at: r.updated_at,
    creator: {
      osu_id: r.osu_id,
      username: r.username,
      avatar_url: r.avatar_url,
    },
    item_count: Number(r.item_count),
    preview_covers: Array.isArray(r.preview_covers) ? r.preview_covers : [],
  }));
}

export async function getCollectionWithItems(
  sql: DbClient,
  collectionId: string,
): Promise<DbCollectionWithItems | null> {
  await ensureDatabaseSchema(sql);
  const colRows = await sql<Array<{
    id: string;
    user_id: number;
    name: string;
    description: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    osu_id: number;
    username: string;
    avatar_url: string;
  }>>`
    SELECT
      c.id, c.user_id, c.name, c.description, c.is_public, c.created_at, c.updated_at,
      u.osu_id, u.username, u.avatar_url
    FROM collections c
    JOIN users u ON c.user_id = u.osu_id
    WHERE c.id = ${collectionId}
    LIMIT 1
  `;

  if (!colRows || colRows.length === 0) return null;
  const col = colRows[0];

  const itemRows = await sql<Array<{
    beatmapset_id: number;
    notes: string;
    sort_order: number;
    added_at: string;
    raw_data: Beatmapset;
    is_deleted_from_osu: boolean;
  }>>`
    SELECT
      ci.beatmapset_id, ci.notes, ci.sort_order, ci.added_at,
      b.raw_data, b.is_deleted_from_osu
    FROM collection_items ci
    JOIN beatmapset_cache b ON ci.beatmapset_id = b.id
    WHERE ci.collection_id = ${collectionId}
    ORDER BY ci.sort_order ASC, ci.added_at DESC
  `;

  const items = itemRows.map((row) => {
    const data = typeof row.raw_data === "string" ? JSON.parse(row.raw_data) : row.raw_data;
    return {
      beatmapset_id: row.beatmapset_id,
      notes: row.notes,
      sort_order: row.sort_order,
      added_at: row.added_at,
      beatmapset: {
        ...data,
        is_deleted_from_osu: row.is_deleted_from_osu,
      },
    };
  });

  return {
    id: col.id,
    user_id: col.user_id,
    name: col.name,
    description: col.description,
    is_public: col.is_public,
    created_at: col.created_at,
    updated_at: col.updated_at,
    creator: {
      osu_id: col.osu_id,
      username: col.username,
      avatar_url: col.avatar_url,
    },
    item_count: items.length,
    items,
  };
}

export async function addCollectionItem(
  sql: DbClient,
  collectionId: string,
  userId: number,
  beatmapset: Beatmapset,
  notes = "",
): Promise<boolean> {
  await ensureDatabaseSchema(sql);
  // Verify ownership
  const owns = await sql`
    SELECT 1 FROM collections WHERE id = ${collectionId} AND user_id = ${userId} LIMIT 1
  `;
  if (owns.length === 0) return false;

  await upsertBeatmapsetCache(sql, beatmapset);

  await sql`
    INSERT INTO collection_items (collection_id, beatmapset_id, notes)
    VALUES (${collectionId}, ${beatmapset.id}, ${notes.trim()})
    ON CONFLICT (collection_id, beatmapset_id) DO UPDATE SET
      notes = EXCLUDED.notes
  `;

  await sql`
    UPDATE collections SET updated_at = NOW() WHERE id = ${collectionId}
  `;

  return true;
}

export async function removeCollectionItem(
  sql: DbClient,
  collectionId: string,
  userId: number,
  beatmapsetId: number,
): Promise<boolean> {
  await ensureDatabaseSchema(sql);
  // Verify ownership
  const owns = await sql`
    SELECT 1 FROM collections WHERE id = ${collectionId} AND user_id = ${userId} LIMIT 1
  `;
  if (owns.length === 0) return false;

  const res = await sql`
    DELETE FROM collection_items
    WHERE collection_id = ${collectionId} AND beatmapset_id = ${beatmapsetId}
  `;

  if (res.count > 0) {
    await sql`UPDATE collections SET updated_at = NOW() WHERE id = ${collectionId}`;
  }

  return res.count > 0;
}

export async function getCollectionIdsForBeatmap(
  sql: DbClient,
  userId: number,
  beatmapsetId: number,
): Promise<string[]> {
  await ensureDatabaseSchema(sql);
  const rows = await sql<Array<{ collection_id: string }>>`
    SELECT ci.collection_id
    FROM collection_items ci
    JOIN collections c ON ci.collection_id = c.id
    WHERE c.user_id = ${userId} AND ci.beatmapset_id = ${beatmapsetId}
  `;
  return rows.map((r) => r.collection_id);
}
