interface Bar {
  label: string;
  value: number;
  color: string;
}

export function BarChart({ data }: { data: Bar[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-[#52514e]" title={d.label}>
            {d.label}
          </span>
          <div className="h-2.5 flex-1 rounded-full bg-[#e1e0d9]">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{
                width: `${Math.max((d.value / max) * 100, 4)}%`,
                backgroundColor: d.color,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="font-numeric w-6 shrink-0 text-right text-xs font-medium text-[#0b0b0b]">
            {d.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
