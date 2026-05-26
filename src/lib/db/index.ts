import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/env";

declare global {
  var __constructorPool: Pool | undefined;
}

const pool =
  globalThis.__constructorPool ??
  new Pool({
    connectionString: getEnv().DATABASE_URL,
  });

if (!globalThis.__constructorPool) {
  globalThis.__constructorPool = pool;
}

export const db = drizzle(pool);
export { pool };
