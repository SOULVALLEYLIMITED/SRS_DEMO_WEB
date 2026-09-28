import type { TeacherReport } from "./types";

// Vercel's (and most serverless platforms') filesystem is read-only outside
// /tmp and isn't shared across function invocations, so the file-based store
// only works for local development. When Vercel KV / Upstash Redis REST
// credentials are present (set them in the Vercel dashboard under
// Storage -> Create Database -> KV, which auto-injects KV_REST_API_URL /
// KV_REST_API_TOKEN), reports persist there instead.
const hasRedisConfig = Boolean(
  (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
);

type Store = {
  getReports(): Promise<TeacherReport[]>;
  getReportById(id: string): Promise<TeacherReport | undefined>;
  addReport(report: TeacherReport): Promise<void>;
};

async function loadStore(): Promise<Store> {
  return hasRedisConfig ? import("./store.redis") : import("./store.local");
}

export async function getReports(): Promise<TeacherReport[]> {
  const store = await loadStore();
  return store.getReports();
}

export async function getReportById(id: string): Promise<TeacherReport | undefined> {
  const store = await loadStore();
  return store.getReportById(id);
}

export async function addReport(report: TeacherReport): Promise<void> {
  const store = await loadStore();
  return store.addReport(report);
}
