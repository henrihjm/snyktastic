"use client";

import { useState } from "react";

export function HintTiers({ hints }: { hints: [string, string, string] }) {
  const [shown, setShown] = useState(0);
  return (
    <section aria-label="Hints" className="rounded-xl border border-slate-700 p-4">
      <h3 className="mb-2 text-sm font-semibold text-amber-300">💡 Hints</h3>
      <ol className="space-y-2 text-sm text-slate-200">
        {hints.slice(0, shown).map((h, i) => (
          <li key={i}>
            <span className="font-mono text-amber-300">{i + 1}.</span> {h}
          </li>
        ))}
      </ol>
      {shown < 3 && (
        <button
          type="button"
          onClick={() => setShown(shown + 1)}
          className="mt-2 rounded border border-amber-400/50 px-3 py-1 text-xs text-amber-200 hover:bg-amber-400/10"
        >
          {shown === 0 ? "Show hint 1 (vague)" : shown === 1 ? "Show hint 2" : "Show hint 3 (specific)"}
        </button>
      )}
    </section>
  );
}
