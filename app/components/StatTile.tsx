export function StatTile({
  label,
  value,
  accent,
  sublabel,
}: {
  label: string;
  value: string | number;
  accent?: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        {accent && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
        )}
        <p className="text-[color:var(--chart-muted)] text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="font-numeric text-[color:var(--chart-text-primary)] mt-2 text-3xl font-bold">
        {value}
      </p>
      {sublabel && (
        <p className="text-[color:var(--chart-text-secondary)] mt-1 text-xs">{sublabel}</p>
      )}
    </div>
  );
}
