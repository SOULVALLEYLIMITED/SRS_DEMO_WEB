import type { ResultTable as ResultTableType } from "@/lib/types";

export function ResultTable({ table }: { table: ResultTableType }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-violet-50 dark:bg-violet-950">
            {table.columns.map((col, i) => (
              <th
                key={i}
                className="border-b border-slate-200 px-4 py-2 text-left font-semibold text-violet-800 dark:border-slate-700 dark:text-violet-300"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr
              key={ri}
              className={ri % 2 === 1 ? "bg-slate-50 dark:bg-slate-800/60" : undefined}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`border-b border-slate-100 px-4 py-2 align-top text-slate-700 dark:border-slate-800 dark:text-slate-300 ${
                    ci === 0 ? "font-medium text-slate-900 whitespace-nowrap dark:text-slate-100" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
