"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";

const STORAGE_KEY = "srs-demo-notice-seen";

export function DemoNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Deliberately deferred to an effect rather than a lazy useState
    // initializer: sessionStorage isn't available during the server-rendered
    // pass, and reading it in the initializer would make the client's first
    // render disagree with the server's, causing a hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — worst case the notice shows again next time.
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/70">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            This is a demo
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Reports submitted here are stored for about 24 hours to show how the
          workflow works, then automatically deleted — please don&apos;t
          submit real student names or personal data.
        </p>
        <button
          onClick={dismiss}
          className="mt-5 w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Got it, let&apos;s go
        </button>
      </div>
    </div>
  );
}
