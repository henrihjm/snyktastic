// LLM10 dogfooding: in-memory sliding-window rate limiter + per-session turn cap.
// Single-instance only (fine for a hackathon demo); swap for Redis/KV behind a load balancer.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20; // requests per IP per minute
export const MAX_TURNS_PER_SESSION = 30;
const MAX_TRACKED = 10_000; // bound our own memory use too

const hits = new Map<string, number[]>();
const turns = new Map<string, number>();

const prune = <K, V>(m: Map<K, V>) => {
  if (m.size <= MAX_TRACKED) return;
  const drop = m.size - MAX_TRACKED;
  let i = 0;
  for (const k of m.keys()) {
    if (i++ >= drop) break;
    m.delete(k);
  }
};

/** Returns seconds to wait if limited, or 0 if the request may proceed. */
export function rateLimit(key: string, now = Date.now()): number {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
  }
  recent.push(now);
  hits.set(key, recent);
  prune(hits);
  return 0;
}

/** Counts a turn; returns false once the session has used its budget. */
export function takeTurn(sessionId: string): boolean {
  const n = (turns.get(sessionId) ?? 0) + 1;
  turns.set(sessionId, n);
  prune(turns);
  return n <= MAX_TURNS_PER_SESSION;
}

export function clientKey(req: Request): string {
  // Best-effort: behind a proxy the first X-Forwarded-For hop is the client.
  const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (xff || req.headers.get("x-real-ip") || "local").slice(0, 64);
}
