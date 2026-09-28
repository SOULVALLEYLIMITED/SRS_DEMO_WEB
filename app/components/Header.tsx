import Image from "next/image";
import Link from "next/link";

export function Header({ active }: { active?: "teacher" | "headmaster" }) {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="SRS logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Soul Valley
          </span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            SRS
          </span>
          <span className="hidden text-sm text-slate-400 sm:inline dark:text-slate-500">
            School Report System
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/teacher"
            className={`rounded-full px-4 py-1.5 transition-colors ${
              active === "teacher"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Teacher
          </Link>
          <Link
            href="/headmaster"
            className={`rounded-full px-4 py-1.5 transition-colors ${
              active === "headmaster"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Headmaster
          </Link>
        </nav>
      </div>
    </header>
  );
}
