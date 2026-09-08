export type LocationConfidence = "confirmed" | "common" | "approx" | "user";

export interface MapPin {
  x: number; // 0-42 FFXIV in-game map coordinate scale
  y: number;
  confidence: LocationConfidence;
  note?: string;
}

export interface Monster {
  id: number;
  name: string;
  /** Zone as originally supplied by the user - never silently discarded. */
  zone: string;
  /**
   * Zone confirmed via research, when it differs from `zone` (or resolves an
   * unknown one). The app routes/maps by this when present.
   */
  verifiedZone?: string;
  /** Explanation shown to the user when verifiedZone corrects/annotates zone. */
  zoneNote?: string;
  /** In-game level of the monster (or its spawn matching `pin`/`verifiedZone`), where confidently identified. */
  level?: number;
  /** Explanation when `level` is an estimate across a wide range or ambiguous species variant. */
  levelNote?: string;
  /**
   * "overworld": routable, huntable in the field.
   * "dungeon": behind a duty/instance queue, tracked but excluded from routing.
   * "unverified": location could not be confirmed at all, excluded from routing.
   */
  category: "overworld" | "dungeon" | "unverified";
  pin?: MapPin;
}

export interface ZoneInfo {
  name: string;
  region: string;
  /** Zones reachable on foot, without a teleport/loading screen. */
  adjacent: string[];
}

export function effectiveZone(m: Monster): string {
  return m.verifiedZone ?? m.zone;
}
