import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { pool } from "@/lib/db";

async function run() {
  const migrationsPath = path.resolve(process.cwd(), "drizzle");
  const files = (await readdir(migrationsPath))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  for (const fileName of files) {
    const sql = await readFile(path.join(migrationsPath, fileName), "utf8");
    if (sql.trim()) {
      await pool.query(sql);
    }
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
