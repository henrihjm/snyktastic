"use client";
// "Patch it": pick defenses, re-run the module's attacks against your patched Verdict.

import { useState } from "react";
import type { PatchChallenge } from "@/content/patches";
import type { TraceEntry } from "@/lib/verdict";

type RunResult = { passed: boolean; blocked: number; decoys: string[] };

export function PatchLab({
  challenge,
  onTrace,
  onResetTrace,
  onPassed,
}: {
  challenge: PatchChallenge;
  onTrace: (e: TraceEntry) => void;
  onResetTrace: () => void;
  onPassed: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setResult(null);
  };

  const run = async () => {
    setRunning(true);
    setResult(null);
    onResetTrace();
    let blocked = 0;
    for (const a of challenge.attacks) {
      await new Promise((r) => setTimeout(r, 450));
      const by = a.blockedBy.find((d) => selected.has(d));
      if (by) blocked++;
      onTrace({
        tool: `${a.tool} · ${a.label}`,
        allow: !by,
        score: by ? 100 : 0,
        reasons: by ? [a.blockReason[by] ?? "blocked by your patch"] : ["no selected defense stops this attack"],
        cleared: !by,
      });
    }
    const decoys = challenge.defenses.filter((d) => d.kind === "decoy" && selected.has(d.id)).map((d) => d.label);
    const passed = blocked === challenge.attacks.length && decoys.length === 0;
    setResult({ passed, blocked, decoys });
    setRunning(false);
    if (passed) onPassed();
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-200">{challenge.intro}</p>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold text-cyan-300">🧰 Your defense toolbox (pick any)</legend>
        {challenge.defenses.map((d) => (
          <label
            key={d.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
              selected.has(d.id) ? "border-cyan-400 bg-cyan-950/30" : "border-slate-700 hover:border-slate-500"
            }`}
          >
            <input type="checkbox" className="mt-1" checked={selected.has(d.id)} onChange={() => toggle(d.id)} />
            <span>
              {d.label}
              {result && selected.has(d.id) && (
                <span
                  className={`mt-1 block text-xs ${
                    d.kind === "control" ? "text-emerald-300" : d.kind === "partial" ? "text-amber-300" : "text-red-300"
                  }`}
                >
                  {d.why}
                </span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={run}
        disabled={running || selected.size === 0}
        className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-40"
      >
        {running ? "Re-running attacks…" : "▶ Re-run the attacks"}
      </button>
      {result && (
        <div
          role="status"
          className={`rounded-lg border p-3 text-sm ${result.passed ? "border-emerald-400 text-emerald-200" : "border-amber-400 text-amber-200"}`}
        >
          {result.passed
            ? `🛡️ All ${challenge.attacks.length} attacks blocked with real controls. Patched!`
            : result.blocked < challenge.attacks.length
              ? `${result.blocked}/${challenge.attacks.length} attacks blocked. Check the Verdict Trace for what got through.`
              : `Every attack was blocked, but you also shipped a decoy: ${result.decoys.join("; ")}. Remove it; decoys give false confidence.`}
        </div>
      )}
    </div>
  );
}
