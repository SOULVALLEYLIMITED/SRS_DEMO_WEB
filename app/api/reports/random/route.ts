import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addReport } from "@/lib/store";
import { structureReport } from "@/lib/ai";
import { generateRandomReports } from "@/lib/randomReport";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { TeacherReport } from "@/lib/types";

const MAX_COUNT = 8;

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, "reports-random");
  if (rateLimited) return rateLimited;

  const url = new URL(req.url);
  const requested = Number(url.searchParams.get("count") ?? "1");
  const count = Number.isFinite(requested)
    ? Math.min(Math.max(Math.round(requested), 1), MAX_COUNT)
    : 1;

  const inputs = generateRandomReports(count);

  const created: TeacherReport[] = [];
  for (const input of inputs) {
    const { meta, structured, source } = await structureReport(input);
    const report: TeacherReport = {
      id: randomUUID(),
      reportType: input.reportType,
      ...meta,
      reportText: input.reportText,
      sourceFileName: input.sourceFileName,
      submittedAt: new Date().toISOString(),
      structured,
      source,
    };
    await addReport(report);
    created.push(report);
  }

  return NextResponse.json(created, { status: 201 });
}
