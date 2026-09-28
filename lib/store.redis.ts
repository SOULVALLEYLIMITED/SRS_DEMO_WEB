import { Redis } from "@upstash/redis";
import type { TeacherReport } from "./types";

// A Redis Hash — id -> JSON report — rather than one big JSON blob, so
// addReport() is a single atomic HSET instead of a read-modify-write of the
// whole collection (which would race under concurrent submissions).
const KEY = "srs:reports";

function getClient(): Redis {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Redis store used without KV/Upstash REST credentials configured.");
  }

  return new Redis({ url, token });
}

export async function getReports(): Promise<TeacherReport[]> {
  const redis = getClient();
  const all = await redis.hgetall<Record<string, TeacherReport>>(KEY);
  const reports = Object.values(all ?? {});
  return reports.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function getReportById(id: string): Promise<TeacherReport | undefined> {
  const redis = getClient();
  const report = await redis.hget<TeacherReport>(KEY, id);
  return report ?? undefined;
}

export async function addReport(report: TeacherReport): Promise<void> {
  const redis = getClient();
  await redis.hset(KEY, { [report.id]: report });
}
