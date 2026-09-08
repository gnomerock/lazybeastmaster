"use client";

import { useMemo, useState } from "react";
import { MONSTERS } from "@/lib/monsters";
import type { MapPin } from "@/lib/types";
import { usePersistentState } from "@/lib/storage";
import { ProgressBar } from "./ProgressBar";
import { ChecklistPanel } from "./ChecklistPanel";
import { RoutePlanner } from "./RoutePlanner";

const DEFAULT_PINS: Record<number, MapPin> = Object.fromEntries(
  MONSTERS.filter((m) => m.pin).map((m) => [m.id, m.pin as MapPin]),
);

export function HuntPlanner() {
  const [checked, setChecked] = usePersistentState<Record<number, boolean>>(
    "ffxiv-hunt-checked",
    {},
  );
  const [pins, setPins] = usePersistentState<Record<number, MapPin>>(
    "ffxiv-hunt-pins",
    DEFAULT_PINS,
  );
  const [tab, setTab] = useState<"checklist" | "route">("checklist");

  const overworld = useMemo(() => MONSTERS.filter((m) => m.category === "overworld"), []);
  const dungeon = useMemo(() => MONSTERS.filter((m) => m.category === "dungeon"), []);
  const unverified = useMemo(() => MONSTERS.filter((m) => m.category === "unverified"), []);
  const done = useMemo(() => MONSTERS.filter((m) => checked[m.id]).length, [checked]);
  const correctedCount = useMemo(
    () => MONSTERS.filter((m) => m.verifiedZone && m.verifiedZone !== m.zone).length,
    [],
  );

  function toggle(id: number) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function setPin(id: number, x: number, y: number) {
    setPins((prev) => ({ ...prev, [id]: { x, y, confidence: "user" } }));
  }

  function clearPin(id: number) {
    setPins((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function resetProgress() {
    if (window.confirm("Clear all checked-off monsters? Map pins are kept.")) {
      setChecked({});
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-amber-300 tracking-tight">
          Eorzea Hunting Log Planner
        </h1>
        <p className="text-sm text-slate-400">
          Track the 50-monster hunt checklist and get the shortest overworld
          route to catch everything that isn&apos;t locked behind a dungeon.
        </p>
      </header>

      <details className="rounded-lg border border-amber-900/60 bg-amber-950/20 px-3 py-2 text-sm text-amber-200/90 open:pb-3">
        <summary className="cursor-pointer font-medium text-amber-300">
          Data notes: {correctedCount} zone correction{correctedCount === 1 ? "" : "s"} vs. your
          list, 1 unverified monster
        </summary>
        <div className="mt-2 text-xs leading-relaxed text-amber-200/80 space-y-1.5">
          <p>
            Cross-checked your list against class hunting logs and zone
            bestiaries. Where a monster&apos;s real hunting spot differs from
            the zone you gave, it&apos;s routed/mapped by the verified zone,
            with a &ldquo;you listed: …&rdquo; badge next to it in the
            checklist and a &ldquo;corrected zone&rdquo; badge on its route
            step (hover either for details).
          </p>
          <p>
            <strong>Cù-sìth</strong> couldn&apos;t be matched to any known
            FFXIV monster, so it&apos;s excluded from the route until you
            confirm what it actually is - see the &ldquo;Unverified
            location&rdquo; section of the checklist.
          </p>
          <p>
            Map pins marked &ldquo;approx&rdquo; or with multiple candidate
            spawn points are best-effort - drop your own pin once you find
            the mob in-game and it&apos;ll be remembered.
          </p>
        </div>
      </details>

      <ProgressBar done={done} total={MONSTERS.length} />

      <nav className="flex gap-2 border-b border-slate-800">
        {(["checklist", "route"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t === "checklist" ? "Checklist" : "Route Planner"}
          </button>
        ))}
        <button
          onClick={resetProgress}
          className="ml-auto text-xs text-slate-500 hover:text-red-400 self-center"
        >
          Reset checklist
        </button>
      </nav>

      {tab === "checklist" ? (
        <ChecklistPanel
          overworld={overworld}
          dungeon={dungeon}
          unverified={unverified}
          checked={checked}
          onToggle={toggle}
        />
      ) : (
        <RoutePlanner
          overworld={overworld}
          checked={checked}
          pins={pins}
          onSetPin={setPin}
          onClearPin={clearPin}
        />
      )}
    </div>
  );
}
