import type { ZoneInfo } from "./types";

// Walkable (no loading-screen teleport/ferry needed) adjacency between ARR
// overworld zones, verified against each zone's own wiki "connects to"
// infobox (checked bidirectionally). Includes a few zones with no huntable
// monster on our list (East Shroud, South Shroud, Northern Thanalan,
// Coerthas Central Highlands) purely as pass-through nodes, so connectivity
// between the zones we DO need is modeled correctly.
//
// Notable real-geography finding: there is NO walkable path between the
// La Noscea zones and the Shroud/Thanalan/Mor Dhona/Coerthas mainland - only
// a ferry or aetheryte teleport bridges them (La Noscea/Vylbrand is a
// separate island in FFXIV's lore). So this graph always has (at least) two
// connected components, and any route that needs monsters from both sides
// requires at least one teleport - that's expected, not a bug.
export const ZONES: Record<string, ZoneInfo> = {
  "Central Shroud": { name: "Central Shroud", region: "Black Shroud", adjacent: ["North Shroud", "East Shroud", "South Shroud"] },
  "North Shroud": { name: "North Shroud", region: "Black Shroud", adjacent: ["Central Shroud", "Coerthas Central Highlands"] },
  "East Shroud": { name: "East Shroud", region: "Black Shroud", adjacent: ["Central Shroud", "South Shroud"] },
  "South Shroud": { name: "South Shroud", region: "Black Shroud", adjacent: ["Central Shroud", "East Shroud"] },

  "Middle La Noscea": { name: "Middle La Noscea", region: "La Noscea", adjacent: ["Lower La Noscea", "Eastern La Noscea", "Western La Noscea"] },
  "Lower La Noscea": { name: "Lower La Noscea", region: "La Noscea", adjacent: ["Middle La Noscea", "Eastern La Noscea"] },
  "Eastern La Noscea": { name: "Eastern La Noscea", region: "La Noscea", adjacent: ["Middle La Noscea", "Lower La Noscea", "Upper La Noscea"] },
  "Western La Noscea": { name: "Western La Noscea", region: "La Noscea", adjacent: ["Middle La Noscea", "Upper La Noscea"] },
  "Upper La Noscea": { name: "Upper La Noscea", region: "La Noscea", adjacent: ["Outer La Noscea", "Eastern La Noscea", "Western La Noscea"] },
  "Outer La Noscea": { name: "Outer La Noscea", region: "La Noscea", adjacent: ["Upper La Noscea"] },

  "Western Thanalan": { name: "Western Thanalan", region: "Thanalan", adjacent: ["Central Thanalan"] },
  "Central Thanalan": { name: "Central Thanalan", region: "Thanalan", adjacent: ["Western Thanalan", "Southern Thanalan", "Northern Thanalan"] },
  "Southern Thanalan": { name: "Southern Thanalan", region: "Thanalan", adjacent: ["Central Thanalan"] },
  "Northern Thanalan": { name: "Northern Thanalan", region: "Thanalan", adjacent: ["Central Thanalan", "Mor Dhona"] },

  "Mor Dhona": { name: "Mor Dhona", region: "Mor Dhona", adjacent: ["Northern Thanalan", "Coerthas Central Highlands"] },
  "Coerthas Central Highlands": { name: "Coerthas Central Highlands", region: "Coerthas", adjacent: ["North Shroud", "Mor Dhona"] },
};

/** Plain adjacency map for the TSP/graph helpers. */
export const ZONE_GRAPH: Record<string, string[]> = Object.fromEntries(
  Object.values(ZONES).map((z) => [z.name, z.adjacent]),
);

export const REGION_ORDER = ["La Noscea", "Black Shroud", "Thanalan", "Mor Dhona", "Coerthas"];

/** Maps a zone name to its downloaded map image under /public/maps. */
export function zoneMapImage(zone: string): string {
  const slug = zone.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `/maps/${slug}.jpg`;
}
