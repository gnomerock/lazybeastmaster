"use client";

import { useRef } from "react";
import type { Monster, MapPin } from "@/lib/types";
import { zoneMapImage } from "@/lib/zones";

const CONFIDENCE_LABEL: Record<MapPin["confidence"], string> = {
  confirmed: "confirmed spawn",
  common: "commonly reported",
  approx: "approximate",
  user: "your mark",
};

const MAP_SCALE = 42;
// The downloaded map images have a decorative frame before the coordinate
// grid starts; this inset (as a fraction of image size) keeps pins aligned
// with the in-game grid instead of drifting into the frame near the edges.
const MAP_INSET = 0.025;

function coordToPercent(v: number): number {
  const t = (v - 1) / (MAP_SCALE - 1);
  return (MAP_INSET + t * (1 - 2 * MAP_INSET)) * 100;
}

function percentToCoord(t: number): number {
  const raw = (t - MAP_INSET) / (1 - 2 * MAP_INSET);
  return 1 + raw * (MAP_SCALE - 1);
}

export function ZoneMiniMap({
  zone,
  monsters,
  pins,
  armedMonsterId,
  onArm,
  onSetPin,
  onClearPin,
}: {
  zone: string;
  monsters: Monster[];
  pins: Record<number, MapPin>;
  armedMonsterId: number | null;
  onArm: (id: number | null) => void;
  onSetPin: (id: number, x: number, y: number) => void;
  onClearPin: (id: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (armedMonsterId === null || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const x = Math.round(percentToCoord(relX) * 10) / 10;
    const y = Math.round(percentToCoord(relY) * 10) / 10;
    onSetPin(armedMonsterId, x, y);
    onArm(null);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`relative aspect-square w-full sm:w-64 shrink-0 rounded-md border border-slate-700 overflow-hidden bg-slate-950 ${
          armedMonsterId !== null ? "cursor-crosshair ring-2 ring-amber-400" : ""
        }`}
        title={armedMonsterId !== null ? "Click where you found it" : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={zoneMapImage(zone)}
          alt={`${zone} map`}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        />
        {monsters.map((m) => {
          const pin = pins[m.id];
          if (!pin) return null;
          return (
            <button
              key={m.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArm(armedMonsterId === m.id ? null : m.id);
              }}
              title={`${m.name} (${CONFIDENCE_LABEL[pin.confidence]})`}
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)] hover:scale-125 transition-transform"
              style={{ left: `${coordToPercent(pin.x)}%`, top: `${coordToPercent(pin.y)}%` }}
            />
          );
        })}
      </div>

      <ul className="flex-1 flex flex-col gap-1 text-sm">
        {monsters.map((m) => {
          const pin = pins[m.id];
          const armed = armedMonsterId === m.id;
          return (
            <li key={m.id} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${pin ? "bg-red-600" : "bg-slate-700"}`}
              />
              <span className="text-slate-200 flex-1 truncate">{m.name}</span>
              {pin && (
                <span className="text-[11px] tabular-nums text-slate-500">
                  ({pin.x}, {pin.y})
                </span>
              )}
              <button
                type="button"
                onClick={() => onArm(armed ? null : m.id)}
                className={`text-[11px] px-1.5 py-0.5 rounded border ${
                  armed
                    ? "border-amber-400 text-amber-300 bg-amber-400/10"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                {armed ? "click map…" : pin ? "move" : "set"}
              </button>
              {pin && (
                <button
                  type="button"
                  onClick={() => onClearPin(m.id)}
                  className="text-[11px] px-1 text-slate-500 hover:text-red-400"
                  aria-label={`Clear pin for ${m.name}`}
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
