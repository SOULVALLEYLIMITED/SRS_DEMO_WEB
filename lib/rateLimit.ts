import Redis from "ioredis";
import { NextRequest, NextResponse } from "next/server";

const WINDOW_SECONDS = 60;
const DEFAULT_LIMIT = 4;

let client: Redis | undefined;

function getClient(): Redis | undefined {
  const url = process.env.REDIS_URL;
  if (!url) return undefined;
  if (!client) {
    client = new Redis(url, { maxRetriesPerRequest: 1 });
    client.on("error", (err) => console.error("Rate limiter Redis error:", err.message));
  }
  return client;
}

export function clientKey(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0].trim() || "local";
}

/**
 * Fixed-window rate limit, backed by Redis so it holds across serverless
 * instances (in-memory counters wouldn't). Fails open — if Redis is
 * unreachable, the request is allowed rather than blocking real usage on an
 * infra hiccup.
 */
export async function checkRateLimit(
  route: string,
  id: string,
  limit: number = DEFAULT_LIMIT
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const redis = getClient();
  if (!redis) return { allowed: true, retryAfterSeconds: 0 };

  const window = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `ratelimit:${route}:${id}:${window}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }
    const retryAfterSeconds = (window + 1) * WINDOW_SECONDS - Math.floor(Date.now() / 1000);
    return { allowed: count <= limit, retryAfterSeconds };
  } catch (err) {
    console.error("Rate limit check failed, allowing request:", err);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Checks the rate limit for this request and returns a 429 NextResponse if
 * it's exceeded, or null if the request may proceed.
 */
export async function enforceRateLimit(
  req: NextRequest,
  route: string,
  limit: number = DEFAULT_LIMIT
): Promise<NextResponse | null> {
  const { allowed, retryAfterSeconds } = await checkRateLimit(route, clientKey(req), limit);
  if (allowed) return null;

  return NextResponse.json(
    {
      error: `Too many requests — please wait ${retryAfterSeconds}s before trying again.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
