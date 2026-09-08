export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-300">Hunting Log Progress</span>
        <span className="text-sm tabular-nums text-amber-300">
          {done} / {total} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
