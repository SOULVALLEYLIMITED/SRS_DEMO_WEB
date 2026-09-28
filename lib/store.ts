import { promises as fs } from "fs";
import path from "path";
import type { TeacherReport } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

export async function getReports(): Promise<TeacherReport[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const reports: TeacherReport[] = JSON.parse(raw);
  return reports.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function getReportById(id: string): Promise<TeacherReport | undefined> {
  const reports = await getReports();
  return reports.find((r) => r.id === id);
}

export async function addReport(report: TeacherReport): Promise<void> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const reports: TeacherReport[] = JSON.parse(raw);
  reports.push(report);
  await fs.writeFile(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");
}
