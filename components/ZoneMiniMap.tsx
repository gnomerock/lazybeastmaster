"use client";

import { useRef } from "react";
import type { Monster, MapPin } from "@/lib/types";

const CONFIDENCE_STYLE: Record<MapPin["confidence"], string> = {
  confirmed: "bg-emerald-400 ring-emerald-200",
  common: "bg-sky-400 ring-sky-200",
  approx: "bg-amber-400 ring-amber-200",
  user: "bg-fuchsia-400 ring-fuchsia-200",
};

const CONFIDENCE_LABEL: Record<MapPin["confidence"], string> = {
  confirmed: "confirmed spawn",
  common: "commonly reported",
  approx: "approximate",
  user: "your mark",
};

const MAP_SCALE = 42;

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
    const x = Math.round(relX * MAP_SCALE * 10) / 10;
    const y = Math.round(relY * MAP_SCALE * 10) / 10;
    onSetPin(armedMonsterId, x, y);
    onArm(null);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`relative aspect-square w-full sm:w-48 shrink-0 rounded-md border border-slate-700 bg-slate-950 overflow-hidden ${
          armedMonsterId !== null ? "cursor-crosshair ring-2 ring-amber-400" : ""
        }`}
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)",
          backgroundSize: "12.5% 12.5%",
        }}
        title={armedMonsterId !== null ? "Click where you found it" : undefined}
      >
        <span className="absolute top-1 left-1.5 text-[10px] uppercase tracking-wide text-slate-500">
          {zone}
        </span>
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
              className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ${CONFIDENCE_STYLE[pin.confidence]}`}
              style={{ left: `${(pin.x / MAP_SCALE) * 100}%`, top: `${(pin.y / MAP_SCALE) * 100}%` }}
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
                className={`h-2 w-2 rounded-full shrink-0 ${
                  pin ? CONFIDENCE_STYLE[pin.confidence].split(" ")[0] : "bg-slate-700"
                }`}
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
