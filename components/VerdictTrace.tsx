"use client";
// The signature element: a live timeline of every tool call Verdict judged.
// OWNER (styling): UX. Data shape: lib/verdict.ts TraceEntry.

import { BLOCK_THRESHOLD, type TraceEntry } from "@/lib/verdict";

const barColor = (score: number) =>
  score >= BLOCK_THRESHOLD ? "bg-red-500" : score >= 30 ? "bg-amber-400" : "bg-emerald-400";

export function VerdictTrace({ entries, title = "Verdict Trace" }: { entries: TraceEntry[]; title?: string }) {
  return (
    <section aria-label={title} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-cyan-300">🛡️ {title}</h2>
        <span className="font-mono text-xs text-slate-400">block ≥ {BLOCK_THRESHOLD}</span>
      </header>
      {entries.length === 0 ? (
        <p className="font-mono text-sm text-slate-500">Waiting for the agent&apos;s first tool call…</p>
      ) : (
        <ol className="space-y-3">
          {entries.map((e, i) => (
            <li
              key={i}
              className={`rounded-lg border p-3 ${
                e.cleared ? "border-fuchsia-500 bg-fuchsia-950/40" : e.allow ? "border-slate-700" : "border-red-600 bg-red-950/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-cyan-200">{e.tool}</code>
                <span className="font-mono text-xs font-bold">
                  {e.cleared ? "🚩 ATTACK LANDED" : e.allow ? "✅ ALLOWED" : "🛡️ BLOCKED"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800">
                  <div className={`h-full ${barColor(e.score)} transition-all duration-700`} style={{ width: `${e.score}%` }} />
                </div>
                <span className="w-12 text-right font-mono text-xs text-slate-300">{e.score}/100</span>
              </div>
              {e.reasons.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-slate-300">
                  {e.reasons.map((r, j) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
