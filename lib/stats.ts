import type { TeacherReport } from "./types";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function countSubmittedWithinDays(reports: TeacherReport[], days: number): number {
  const cutoff = Date.now() - days * (ONE_WEEK_MS / 7);
  return reports.filter((r) => new Date(r.submittedAt).getTime() >= cutoff).length;
}
