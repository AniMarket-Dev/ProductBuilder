import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/env";

declare global {
  var __constructorPool: Pool | undefined;
}

let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getPool() {
  if (globalThis.__constructorPool) {
    return globalThis.__constructorPool;
  }

  const pool = new Pool({
    connectionString: getEnv().DATABASE_URL,
  });

  globalThis.__constructorPool = pool;
  return pool;
}

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  cachedDb = drizzle(getPool());
  return cachedDb;
}
