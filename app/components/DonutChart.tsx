interface Segment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
}: {
  data: Segment[];
  centerLabel: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg viewBox="0 0 200 200" className="h-40 w-40 shrink-0" role="img" aria-label={`${centerLabel}: ${total}`}>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--chart-grid)" strokeWidth="24" />
        {total > 0 &&
          data
            .filter((d) => d.value > 0)
            .map((d, i) => {
              const fraction = d.value / total;
              const dash = fraction * circumference - 2; // 2px surface gap between segments
              const offset = circumference - (cumulative / total) * circumference;
              cumulative += d.value;
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="24"
                  strokeDasharray={`${Math.max(dash, 0)} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                >
                  <title>
                    {d.label}: {d.value} ({Math.round(fraction * 100)}%)
                  </title>
                </circle>
              );
            })}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="var(--chart-text-primary)"
          className="font-numeric"
        >
          {total}
        </text>
        <text x="100" y="118" textAnchor="middle" fontSize="12" fill="var(--chart-muted)">
          {centerLabel}
        </text>
      </svg>

      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[color:var(--chart-text-secondary)] flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
                aria-hidden
              />
              {d.label}
            </span>
            <span className="font-numeric text-[color:var(--chart-text-primary)] font-medium">
              {d.value}
              <span className="text-[color:var(--chart-muted)] ml-1 text-xs">
                ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
