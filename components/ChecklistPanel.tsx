import type { Monster } from "@/lib/types";
import { effectiveZone } from "@/lib/types";

function groupByZone(monsters: Monster[]) {
  const groups = new Map<string, Monster[]>();
  for (const m of monsters) {
    const zone = effectiveZone(m);
    const list = groups.get(zone) ?? [];
    list.push(m);
    groups.set(zone, list);
  }
  return groups;
}

function ZoneGroup({
  zone,
  monsters,
  checked,
  onToggle,
}: {
  zone: string;
  monsters: Monster[];
  checked: Record<number, boolean>;
  onToggle: (id: number) => void;
}) {
  const done = monsters.filter((m) => checked[m.id]).length;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200">{zone}</h3>
        <span className="text-xs tabular-nums text-slate-400">
          {done}/{monsters.length}
        </span>
      </div>
      <ul className="divide-y divide-slate-800/70">
        {monsters.map((m) => {
          const corrected = m.verifiedZone && m.verifiedZone !== m.zone;
          return (
            <li key={m.id}>
              <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-800/40 transition-colors">
                <input
                  type="checkbox"
                  checked={!!checked[m.id]}
                  onChange={() => onToggle(m.id)}
                  className="h-4 w-4 accent-amber-500 rounded cursor-pointer shrink-0"
                />
                <span className="flex-1 min-w-0">
                  <span
                    className={
                      checked[m.id]
                        ? "text-slate-500 line-through decoration-slate-600"
                        : "text-slate-100"
                    }
                  >
                    {m.name}
                  </span>
                  {m.level !== undefined && (
                    <span
                      title={m.levelNote}
                      className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border border-slate-700 text-slate-400 align-middle ${
                        m.levelNote ? "cursor-help" : ""
                      }`}
                    >
                      Lv. {m.level}
                    </span>
                  )}
                  {corrected && (
                    <span
                      title={m.zoneNote}
                      className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full border border-amber-700 text-amber-400 bg-amber-400/10 cursor-help align-middle"
                    >
                      you listed: {m.zone}
                    </span>
                  )}
                  {!corrected && m.zoneNote && (
                    <span
                      title={m.zoneNote}
                      className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full border border-slate-700 text-slate-400 cursor-help align-middle"
                    >
                      ⚠ unverified spot
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ChecklistPanel({
  overworld,
  dungeon,
  unverified,
  checked,
  onToggle,
}: {
  overworld: Monster[];
  dungeon: Monster[];
  unverified: Monster[];
  checked: Record<number, boolean>;
  onToggle: (id: number) => void;
}) {
  const overworldGroups = groupByZone(overworld);
  const dungeonGroups = groupByZone(dungeon);

  return (
    <div className="flex flex-col gap-6">
      {unverified.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-red-400 mb-3">
            Unverified location ({unverified.length})
          </h2>
          <div className="rounded-lg border border-red-900 bg-red-950/30 overflow-hidden">
            <ul className="divide-y divide-red-900/60">
              {unverified.map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!checked[m.id]}
                    onChange={() => onToggle(m.id)}
                    className="h-4 w-4 mt-0.5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className={checked[m.id] ? "text-slate-500 line-through" : "text-slate-100"}>
                      {m.name}
                    </span>
                    <p className="text-xs text-red-300/80 mt-0.5">{m.zoneNote}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold text-amber-300 mb-3">
            Open-world hunts ({overworld.length})
          </h2>
          <div className="flex flex-col gap-3">
            {[...overworldGroups.entries()].map(([zone, monsters]) => (
              <ZoneGroup key={zone} zone={zone} monsters={monsters} checked={checked} onToggle={onToggle} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-amber-300 mb-3">
            Dungeon &amp; duty kills ({dungeon.length})
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Require queuing for a duty rather than overworld travel, so
            they&apos;re tracked here but left out of the route planner.
          </p>
          <div className="flex flex-col gap-3">
            {[...dungeonGroups.entries()].map(([zone, monsters]) => (
              <ZoneGroup key={zone} zone={zone} monsters={monsters} checked={checked} onToggle={onToggle} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
