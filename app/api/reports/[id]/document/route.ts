import { NextResponse } from "next/server";
import { getReportById } from "@/lib/store";
import { buildReportDocx } from "@/lib/document";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const buffer = await buildReportDocx(report);
  const safeName = `${report.className}-${report.subject}`.replace(/[^a-z0-9-]+/gi, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeName}-report.docx"`,
    },
  });
}
