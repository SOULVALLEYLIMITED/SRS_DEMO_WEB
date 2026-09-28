import Image from "next/image";
import Link from "next/link";

export function Header({ active }: { active?: "teacher" | "headmaster" }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="SRS logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-semibold tracking-tight text-slate-900">
            Soul Valley
          </span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
            SRS
          </span>
          <span className="hidden text-sm text-slate-400 sm:inline">
            School Report System
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/teacher"
            className={`rounded-full px-4 py-1.5 transition-colors ${
              active === "teacher"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Teacher
          </Link>
          <Link
            href="/headmaster"
            className={`rounded-full px-4 py-1.5 transition-colors ${
              active === "headmaster"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Headmaster
          </Link>
        </nav>
      </div>
    </header>
  );
}
