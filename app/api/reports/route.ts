import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addReport, getReports } from "@/lib/store";
import { structureReport } from "@/lib/ai";
import type { NewReportInput, TeacherReport } from "@/lib/types";

export async function GET() {
  const reports = await getReports();
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<NewReportInput>;

  if (!body.className || !body.subject || !body.date || !body.reportText) {
    return NextResponse.json(
      { error: "className, subject, date, and reportText are required." },
      { status: 400 }
    );
  }

  const input: NewReportInput = {
    teacherName: body.teacherName?.trim() || "Unnamed Teacher",
    className: body.className.trim(),
    subject: body.subject.trim(),
    date: body.date.trim(),
    reportText: body.reportText.trim(),
  };

  const { structured, source } = await structureReport(input);

  const report: TeacherReport = {
    id: randomUUID(),
    ...input,
    submittedAt: new Date().toISOString(),
    structured,
    source,
  };

  await addReport(report);

  return NextResponse.json(report, { status: 201 });
}
