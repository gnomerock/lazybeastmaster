/**
 * Exact shortest Hamiltonian PATH (not cycle - we don't need to return to
 * the start) over a small set of nodes, via Held-Karp DP. Fine up to
 * n ~ 15; this app only ever feeds it the handful of zones that still have
 * uncollected monsters.
 */
export function shortestHamiltonianPath(
  nodes: string[],
  cost: (a: string, b: string) => number,
  startNode?: string,
): { order: string[]; totalCost: number } {
  const n = nodes.length;
  if (n === 0) return { order: [], totalCost: 0 };
  if (n === 1) return { order: [...nodes], totalCost: 0 };

  const dist: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : cost(nodes[i], nodes[j]))),
  );

  const startIdx = startNode ? nodes.indexOf(startNode) : -1;
  const FULL = (1 << n) - 1;
  const INF = Infinity;

  // dp[mask][i] = min cost of a path that visits exactly `mask`, ending at i
  const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  const parent: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));

  for (let i = 0; i < n; i++) {
    if (startIdx === -1 || startIdx === i) {
      dp[1 << i][i] = 0;
    }
  }

  for (let mask = 1; mask <= FULL; mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const cur = dp[mask][i];
      if (cur === INF) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const nextMask = mask | (1 << j);
        const candidate = cur + dist[i][j];
        if (candidate < dp[nextMask][j]) {
          dp[nextMask][j] = candidate;
          parent[nextMask][j] = i;
        }
      }
    }
  }

  let bestEnd = -1;
  let bestCost = INF;
  for (let i = 0; i < n; i++) {
    if (dp[FULL][i] < bestCost) {
      bestCost = dp[FULL][i];
      bestEnd = i;
    }
  }

  const orderIdx: number[] = [];
  let mask = FULL;
  let cur = bestEnd;
  while (cur !== -1) {
    orderIdx.push(cur);
    const prev = parent[mask][cur];
    mask ^= 1 << cur;
    cur = prev;
  }
  orderIdx.reverse();

  return { order: orderIdx.map((i) => nodes[i]), totalCost: bestCost };
}

/** BFS hop count between two nodes of an undirected adjacency graph. */
export function bfsDistance(
  graph: Record<string, string[]>,
  start: string,
  end: string,
): number {
  if (start === end) return 0;
  const visited = new Set([start]);
  let frontier = [start];
  let hops = 0;
  while (frontier.length) {
    hops++;
    const next: string[] = [];
    for (const node of frontier) {
      for (const neighbor of graph[node] ?? []) {
        if (visited.has(neighbor)) continue;
        if (neighbor === end) return hops;
        visited.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }
  return Infinity; // unreachable on foot
}

/** Groups nodes into connected components under the walkable adjacency graph. */
export function connectedComponents(graph: Record<string, string[]>): Map<string, number> {
  const compOf = new Map<string, number>();
  let compId = 0;
  for (const start of Object.keys(graph)) {
    if (compOf.has(start)) continue;
    const stack = [start];
    compOf.set(start, compId);
    while (stack.length) {
      const node = stack.pop()!;
      for (const neighbor of graph[node] ?? []) {
        if (!compOf.has(neighbor)) {
          compOf.set(neighbor, compId);
          stack.push(neighbor);
        }
      }
    }
    compId++;
  }
  return compOf;
}

const TELEPORT_PENALTY = 1_000_000;

/**
 * Builds a travel-cost function between required zones: walking hops when
 * two zones share a walkable-connected component (no loading screen aside
 * from the ones already inside that landmass), otherwise a heavy penalty
 * standing in for a mandatory aetheryte teleport. Held-Karp then naturally
 * minimizes teleport count first, walking distance second.
 */
export function makeZoneCost(fullZoneGraph: Record<string, string[]>) {
  const components = connectedComponents(fullZoneGraph);
  const cache = new Map<string, number>();
  return (a: string, b: string): number => {
    if (a === b) return 0;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const sameComponent = components.get(a) === components.get(b);
    const value = sameComponent
      ? bfsDistance(fullZoneGraph, a, b)
      : TELEPORT_PENALTY;
    cache.set(key, value);
    return value;
  };
}

export function countTeleports(order: string[], fullZoneGraph: Record<string, string[]>): number {
  const components = connectedComponents(fullZoneGraph);
  let teleports = 0;
  for (let i = 1; i < order.length; i++) {
    if (components.get(order[i - 1]) !== components.get(order[i])) teleports++;
  }
  return teleports;
}
