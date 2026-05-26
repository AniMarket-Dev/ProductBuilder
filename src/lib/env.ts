import { z } from "zod";

const envSchema = z.object({
  ALLOWED_ORIGINS: z.string().default(""),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  INSALES_API_KEY: z.string().min(1),
  INSALES_API_PASSWORD: z.string().min(1),
  INSALES_SHOP_URL: z.string().url(),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(15),
  STORAGE_ACCESS_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_ENDPOINT: z.string().url().optional().or(z.literal("")),
  STORAGE_PUBLIC_URL: z.string().url(),
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_SECRET_KEY: z.string().min(1),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse({
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    INSALES_API_KEY: process.env.INSALES_API_KEY,
    INSALES_API_PASSWORD: process.env.INSALES_API_PASSWORD,
    INSALES_SHOP_URL: process.env.INSALES_SHOP_URL,
    MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB,
    STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STORAGE_PUBLIC_URL: process.env.STORAGE_PUBLIC_URL,
    STORAGE_REGION: process.env.STORAGE_REGION,
    STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
  });

  return cachedEnv;
}

export function getAllowedOrigins() {
  return getEnv()
    .ALLOWED_ORIGINS.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
