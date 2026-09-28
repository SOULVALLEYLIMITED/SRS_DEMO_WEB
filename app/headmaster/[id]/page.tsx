import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/app/components/Header";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ResultTable } from "@/app/components/ResultTable";
import { getReportById } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) notFound();

  const { structured } = report;

  return (
    <div className="flex flex-1 flex-col">
      <Header active="headmaster" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          href="/headmaster"
          className="text-sm font-medium text-violet-600 hover:underline"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="mb-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
              {report.reportType}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {report.className} — {report.subject}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {report.teacherName} · {report.date} ·{" "}
              {new Date(report.submittedAt).toLocaleString()}
              {report.sourceFileName && <> · uploaded as {report.sourceFileName}</>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={structured.status} />
            <a
              href={`/api/reports/${report.id}/document`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              ⬇ Download Word document
            </a>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-600">
            AI-Structured Result
          </h2>
          <div className="mt-4">
            <ResultTable table={structured.table} />
          </div>
          <p className="mt-5 text-xs text-slate-400">
            {report.source === "ai"
              ? "Structured by AI from the teacher's original report."
              : "Structured automatically from the teacher's original report."}
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Original Teacher Report
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {report.reportText}
          </p>
        </section>
      </main>
    </div>
  );
}
