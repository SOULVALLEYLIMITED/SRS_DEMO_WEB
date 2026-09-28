import type { LessonStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LessonStatus }) {
  const isAttention = status === "Needs Attention";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isAttention
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isAttention ? "bg-amber-600" : "bg-emerald-600"
        }`}
      />
      {status}
    </span>
  );
}
