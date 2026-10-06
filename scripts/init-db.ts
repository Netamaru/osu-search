import postgres from "postgres";
import { SCHEMA_SQL } from "../lib/db";

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("❌ Error: DATABASE_URL is not set in environment or .env.local.");
    console.error("Example: DATABASE_URL=postgres://user:password@localhost:5432/osu_search");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL database...");
  const sql = postgres(url, { max: 1 });

  try {
    console.log("Applying schema migrations (CREATE TABLE IF NOT EXISTS)...");
    await sql.unsafe(SCHEMA_SQL);
    console.log("✅ Database schema initialized successfully!");
    console.log("Tables created/verified: users, sessions, beatmapset_cache, favorites, collections, collection_items.");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
