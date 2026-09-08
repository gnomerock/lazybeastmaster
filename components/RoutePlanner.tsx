"use client";

import { useMemo, useState } from "react";
import type { Monster, MapPin } from "@/lib/types";
import { effectiveZone } from "@/lib/types";
import { ZONE_GRAPH, ZONES } from "@/lib/zones";
import { shortestHamiltonianPath, makeZoneCost, connectedComponents, countTeleports } from "@/lib/tsp";
import { ZoneMiniMap } from "./ZoneMiniMap";

export function RoutePlanner({
  overworld,
  checked,
  pins,
  onSetPin,
  onClearPin,
}: {
  overworld: Monster[];
  checked: Record<number, boolean>;
  pins: Record<number, MapPin>;
  onSetPin: (id: number, x: number, y: number) => void;
  onClearPin: (id: number) => void;
}) {
  const [startZone, setStartZone] = useState<string>("");
  const [armedMonsterId, setArmedMonsterId] = useState<number | null>(null);

  const remaining = useMemo(() => overworld.filter((m) => !checked[m.id]), [overworld, checked]);
  const zonesNeeded = useMemo(() => [...new Set(remaining.map(effectiveZone))], [remaining]);

  const route = useMemo(() => {
    if (zonesNeeded.length === 0) return { order: [] as string[], totalCost: 0 };
    const start = startZone && zonesNeeded.includes(startZone) ? startZone : undefined;
    const cost = makeZoneCost(ZONE_GRAPH);
    return shortestHamiltonianPath(zonesNeeded, cost, start);
  }, [zonesNeeded, startZone]);

  const teleportCount = useMemo(
    () => countTeleports(route.order, ZONE_GRAPH),
    [route.order],
  );
  const components = useMemo(() => connectedComponents(ZONE_GRAPH), []);

  const byZone = useMemo(() => {
    const map = new Map<string, Monster[]>();
    for (const m of remaining) {
      const zone = effectiveZone(m);
      const list = map.get(zone) ?? [];
      list.push(m);
      map.set(zone, list);
    }
    return map;
  }, [remaining]);

  if (overworld.length === 0) return null;

  if (remaining.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-6 text-center text-emerald-300">
        Every open-world monster on the list is checked off. Nothing left to route!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <label className="text-sm text-slate-400">
          Start from
          <select
            value={startZone}
            onChange={(e) => setStartZone(e.target.value)}
            className="ml-2 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
          >
            <option value="">Best start (auto)</option>
            {zonesNeeded.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-slate-400 ml-auto">
          <span className="text-slate-200 font-medium">{zonesNeeded.length}</span> zones ·{" "}
          <span className="text-amber-300 font-medium">{teleportCount}</span> teleport
          {teleportCount === 1 ? "" : "s"} ·{" "}
          <span className="text-slate-200 font-medium">{remaining.length}</span> monsters left
        </span>
      </div>

      <ol className="flex flex-col gap-3">
        {route.order.map((zone, i) => {
          const prevZone = i > 0 ? route.order[i - 1] : null;
          const isTeleport = prevZone !== null && components.get(prevZone) !== components.get(zone);
          const zoneMonsters = byZone.get(zone) ?? [];
          return (
            <li key={zone} className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-900">
                  {i + 1}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-100">{zone}</span>
                  <span className="text-[11px] text-slate-500">{ZONES[zone]?.region ?? ""}</span>
                </div>
                {zoneMonsters.some((m) => m.verifiedZone && m.verifiedZone !== m.zone) && (
                  <span
                    title={zoneMonsters
                      .filter((m) => m.zoneNote)
                      .map((m) => `${m.name}: ${m.zoneNote}`)
                      .join("\n")}
                    className="text-[11px] px-1.5 py-0.5 rounded-full border border-amber-700 text-amber-400 bg-amber-400/10 cursor-help"
                  >
                    corrected zone
                  </span>
                )}
                {prevZone && (
                  <span
                    className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${
                      isTeleport
                        ? "bg-amber-400/10 text-amber-300 border border-amber-700"
                        : "bg-slate-700/40 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {isTeleport ? "🛫 Teleport here" : "🚶 Walk here"}
                  </span>
                )}
              </div>
              <div className="p-3">
                <ZoneMiniMap
                  zone={zone}
                  monsters={zoneMonsters}
                  pins={pins}
                  armedMonsterId={armedMonsterId}
                  onArm={setArmedMonsterId}
                  onSetPin={onSetPin}
                  onClearPin={onClearPin}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
