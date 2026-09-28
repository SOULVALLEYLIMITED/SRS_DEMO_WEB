"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // The inline bootstrap script in layout.tsx already set .dark/.light on
    // <html> before this component mounts (to avoid a flash of the wrong
    // theme) — this just reads that back into React state.
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsDark(document.documentElement.classList.contains("dark"));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    try {
      localStorage.setItem("srs-theme", next ? "dark" : "light");
    } catch {
      // Ignore — the toggle still works for this page view, just won't persist.
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isDark === null}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-slate-600 hover:bg-slate-100 disabled:opacity-0 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
