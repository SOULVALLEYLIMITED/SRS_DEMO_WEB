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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {accent && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-[#898781]">
          {label}
        </p>
      </div>
      <p className="font-numeric mt-2 text-3xl font-bold text-[#0b0b0b]">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-[#52514e]">{sublabel}</p>}
    </div>
  );
}
