import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addReport, getReports } from "@/lib/store";
import { structureReport } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/rateLimit";
import { REPORT_TYPES, type NewReportInput, type TeacherReport } from "@/lib/types";

export async function GET() {
  const reports = await getReports();
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, "reports");
  if (rateLimited) return rateLimited;

  const body = (await req.json()) as Partial<NewReportInput>;

  if (!body.reportText?.trim()) {
    return NextResponse.json({ error: "reportText is required." }, { status: 400 });
  }

  const input: NewReportInput = {
    reportType: REPORT_TYPES.includes(body.reportType as (typeof REPORT_TYPES)[number])
      ? (body.reportType as (typeof REPORT_TYPES)[number])
      : "Lesson Report",
    reportText: body.reportText.trim(),
    sourceFileName: body.sourceFileName?.trim() || undefined,
  };

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

  return NextResponse.json(report, { status: 201 });
}
