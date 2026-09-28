import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-violet-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-4">
          <Image src="/logo.png" alt="SRS logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Soul Valley
          </span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            SRS
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          SRS — School Report System Demo
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          Teacher Report → AI → Headmaster
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          A focused demonstration of one information flow: turning a
          teacher&apos;s report into structured information a headmaster or
          principal can understand at a glance &mdash; while keeping the
          original report available.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          <Link
            href="/teacher"
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700"
          >
            <span className="text-2xl">🧑‍🏫</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              I&apos;m a Teacher
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Submit a normal lesson report &mdash; no technical knowledge needed.
            </span>
            <span className="mt-2 text-sm font-medium text-violet-600 group-hover:underline dark:text-violet-400">
              Submit a report →
            </span>
          </Link>

          <Link
            href="/headmaster"
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700"
          >
            <span className="text-2xl">🏫</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              I&apos;m the Headmaster
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              View structured, AI-summarized reports from every class.
            </span>
            <span className="mt-2 text-sm font-medium text-violet-600 group-hover:underline dark:text-violet-400">
              Open dashboard →
            </span>
          </Link>
        </div>

        <p className="mt-12 max-w-xl text-xs leading-6 text-slate-400 dark:text-slate-600">
          This prototype does not replace the teacher, invent facts, or make
          school decisions. It structures what is already in the report so
          leadership can review it faster &mdash; the original report is
          always available alongside it.
        </p>
      </main>
    </div>
  );
}
