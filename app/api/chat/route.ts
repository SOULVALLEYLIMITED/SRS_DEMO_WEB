import { NextRequest, NextResponse } from "next/server";
import { chatTurn } from "@/lib/chat";
import { enforceRateLimit } from "@/lib/rateLimit";
import { REPORT_TYPES } from "@/lib/types";

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, "chat");
  if (rateLimited) return rateLimited;

  const body = (await req.json()) as { reportType?: string; transcript?: string };

  if (!body.transcript?.trim()) {
    return NextResponse.json({ error: "transcript is required." }, { status: 400 });
  }

  const reportType = REPORT_TYPES.includes(body.reportType as (typeof REPORT_TYPES)[number])
    ? (body.reportType as (typeof REPORT_TYPES)[number])
    : "Lesson Report";

  const result = await chatTurn(reportType, body.transcript.trim());

  return NextResponse.json(result);
}
