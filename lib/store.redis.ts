import Redis from "ioredis";
import type { TeacherReport } from "./types";

// This is a demo: reports auto-expire after a day so the free-tier Redis
// database doesn't fill up. Each report is its own key (SET ... EX <ttl>) —
// plain per-key TTL works on any Redis version, unlike per-field hash TTL
// (HEXPIRE), which needs Redis 7.4+ and isn't available on most free tiers.
// A sorted set indexes ids by submission time for ordering; entries whose
// underlying key has expired are pruned lazily on read, since Redis doesn't
// remove them from the index automatically when the key expires.
const REPORT_KEY = (id: string) => `srs:report:${id}`;
const INDEX_KEY = "srs:reports:index";
const TTL_SECONDS = 24 * 60 * 60;

let client: Redis | undefined;

function getClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Redis store used without REDIS_URL configured.");
  }

  // Reused across invocations on a warm serverless instance instead of
  // reconnecting on every request.
  if (!client) {
    client = new Redis(url, { maxRetriesPerRequest: 3 });
    client.on("error", (err) => console.error("Redis client error:", err.message));
  }
  return client;
}

export async function getReports(): Promise<TeacherReport[]> {
  const redis = getClient();
  const ids = await redis.zrevrange(INDEX_KEY, 0, -1);
  if (ids.length === 0) return [];

  const values = await redis.mget(ids.map(REPORT_KEY));

  const expiredIds = ids.filter((_, i) => values[i] === null);
  if (expiredIds.length > 0) {
    await redis.zrem(INDEX_KEY, ...expiredIds);
  }

  return values
    .filter((v): v is string => v !== null)
    .map((json) => JSON.parse(json) as TeacherReport);
}

export async function getReportById(id: string): Promise<TeacherReport | undefined> {
  const redis = getClient();
  const json = await redis.get(REPORT_KEY(id));
  if (!json) {
    await redis.zrem(INDEX_KEY, id);
    return undefined;
  }
  return JSON.parse(json) as TeacherReport;
}

export async function addReport(report: TeacherReport): Promise<void> {
  const redis = getClient();
  const score = new Date(report.submittedAt).getTime();
  await redis
    .multi()
    .set(REPORT_KEY(report.id), JSON.stringify(report), "EX", TTL_SECONDS)
    .zadd(INDEX_KEY, score, report.id)
    .exec();
}
