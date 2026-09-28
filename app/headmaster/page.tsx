import Link from "next/link";
import { Header } from "@/app/components/Header";
import { StatusBadge } from "@/app/components/StatusBadge";
import { GenerateDemoButton } from "@/app/components/GenerateDemoButton";
import { StatTile } from "@/app/components/StatTile";
import { DonutChart } from "@/app/components/DonutChart";
import { BarChart } from "@/app/components/BarChart";
import { getReports } from "@/lib/store";
import { CATEGORICAL, OTHER_COLOR, STATUS_COLOR } from "@/lib/palette";
import { countSubmittedWithinDays } from "@/lib/stats";

export const dynamic = "force-dynamic";

const MAX_SUBJECT_BARS = 5;

export default async function HeadmasterPage() {
  const reports = await getReports();

  const needsAttention = reports.filter((r) => r.structured.status === "Needs Attention").length;
  const onTrack = reports.length - needsAttention;
  const thisWeek = countSubmittedWithinDays(reports, 7);

  const subjectCounts = new Map<string, number>();
  for (const r of reports) {
    subjectCounts.set(r.subject, (subjectCounts.get(r.subject) ?? 0) + 1);
  }
  const sortedSubjects = [...subjectCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topSubjects = sortedSubjects.slice(0, MAX_SUBJECT_BARS);
  const otherCount = sortedSubjects
    .slice(MAX_SUBJECT_BARS)
    .reduce((sum, [, count]) => sum + count, 0);

  const subjectBars = [
    ...topSubjects.map(([subject, count], i) => ({
      label: subject,
      value: count,
      color: CATEGORICAL[i % CATEGORICAL.length],
    })),
    ...(otherCount > 0 ? [{ label: "Other", value: otherCount, color: OTHER_COLOR }] : []),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <Header active="headmaster" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Headmaster Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Structured, at-a-glance summaries of every submitted report.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GenerateDemoButton count={1} label="✨ +1 demo report" />
            <GenerateDemoButton count={5} label="✨ +5 demo reports" />
            <Link
              href="/teacher"
              className="hidden rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block"
            >
              + Submit as teacher
            </Link>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-500">No reports have been submitted yet.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/teacher"
                className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Submit the first report
              </Link>
              <GenerateDemoButton count={5} label="✨ Or generate 5 demo reports" />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatTile label="Total Reports" value={reports.length} />
              <StatTile
                label="Needs Attention"
                value={needsAttention}
                accent={STATUS_COLOR.warning}
              />
              <StatTile label="Submitted This Week" value={thisWeek} accent={STATUS_COLOR.good} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700">Lesson Status</h2>
                <div className="mt-4">
                  <DonutChart
                    centerLabel="Reports"
                    data={[
                      { label: "On Track", value: onTrack, color: STATUS_COLOR.good },
                      { label: "Needs Attention", value: needsAttention, color: STATUS_COLOR.warning },
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700">Reports by Subject</h2>
                <div className="mt-4">
                  <BarChart data={subjectBars} />
                </div>
              </div>
            </div>

            <ul className="mt-8 space-y-4">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/headmaster/${report.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="mb-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                          {report.reportType}
                        </span>
                        <h2 className="font-semibold text-slate-900">
                          {report.className} — {report.subject}
                        </h2>
                      </div>
                      <StatusBadge status={report.structured.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {report.teacherName} · {report.date} ·{" "}
                      {new Date(report.submittedAt).toLocaleString()}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Covered:</span>{" "}
                      {report.structured.lessonCovered}
                    </p>
                    {report.structured.challenge && (
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Challenge:</span>{" "}
                        {report.structured.challenge}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
