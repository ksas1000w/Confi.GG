import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";

async function seed() {
  const db = getDb();
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, "seed-data.sql"), "utf-8");

  const statements = raw
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.toUpperCase().startsWith("SET NAMES"));

  console.log(`Импорт: ${statements.length} INSERT-выражений...`);
  for (const stmt of statements) {
    await db.execute(sql.raw(stmt));
  }
  console.log("Готово.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
