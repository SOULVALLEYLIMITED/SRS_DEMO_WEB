import Redis from "ioredis";
import type { TeacherReport } from "./types";

// A Redis Hash — id -> JSON report — rather than one big JSON blob, so
// addReport() is a single atomic HSET instead of a read-modify-write of the
// whole collection (which would race under concurrent submissions).
const KEY = "srs:reports";

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
  const all = await redis.hgetall(KEY);
  const reports = Object.values(all).map((json) => JSON.parse(json) as TeacherReport);
  return reports.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function getReportById(id: string): Promise<TeacherReport | undefined> {
  const redis = getClient();
  const json = await redis.hget(KEY, id);
  return json ? (JSON.parse(json) as TeacherReport) : undefined;
}

export async function addReport(report: TeacherReport): Promise<void> {
  const redis = getClient();
  await redis.hset(KEY, report.id, JSON.stringify(report));
}
