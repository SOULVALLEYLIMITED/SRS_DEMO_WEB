"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function GenerateDemoButton({
  count,
  label,
  icon = <Sparkles className="h-3.5 w-3.5" />,
}: {
  count: number;
  label: string;
  icon?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/random?count=${count}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate demo reports.");
      router.refresh();
    } catch {
      // Silently ignore — this is a convenience button for demo purposes.
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-slate-800"
    >
      {loading ? null : icon}
      {loading ? "Generating…" : label}
    </button>
  );
}
