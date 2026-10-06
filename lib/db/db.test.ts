import { describe, expect, it } from "bun:test";
import { getDatabaseUrl, getDb, SCHEMA_SQL } from "./index";

describe("Database configuration & schema", () => {
  it("returns null when DATABASE_URL is not set", () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    expect(getDatabaseUrl()).toBeNull();
    expect(getDb()).toBeNull();

    if (original) process.env.DATABASE_URL = original;
  });

  it("SCHEMA_SQL includes all required tables and indexes", () => {
    expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS users");
    expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS sessions");
    expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS beatmapset_cache");
    expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS favorites");
    expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS collections");
    expect(SCHEMA_SQL).toContain("is_public BOOLEAN NOT NULL DEFAULT FALSE");
    expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS collection_items");
    expect(SCHEMA_SQL).toContain("is_deleted_from_osu BOOLEAN DEFAULT FALSE");
  });
});
