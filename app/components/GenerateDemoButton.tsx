"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateDemoButton({ count, label }: { count: number; label: string }) {
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
      className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Generating…" : label}
    </button>
  );
}
