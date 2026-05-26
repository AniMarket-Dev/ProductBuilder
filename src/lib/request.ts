import { headers } from "next/headers";

import { HttpError } from "@/lib/http";
import { getAllowedOrigins } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export async function getClientIp() {
  const headerBag = await headers();

  return (
    headerBag.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerBag.get("x-real-ip") ??
    "unknown"
  );
}

export async function enforceRateLimit(
  scope: string,
  options: { limit: number; windowMs: number },
) {
  const ip = await getClientIp();
  const allowed = rateLimit(`${scope}:${ip}`, options);

  if (!allowed) {
    throw new HttpError(429, "Too many requests, please try again later.");
  }
}

export async function enforceOrigin() {
  const headerBag = await headers();
  const origin = headerBag.get("origin");
  const allowedOrigins = getAllowedOrigins();

  if (!origin || allowedOrigins.length === 0) {
    return;
  }

  if (!allowedOrigins.includes(origin)) {
    throw new HttpError(403, "Origin is not allowed.");
  }
}
