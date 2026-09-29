"use client";
// LLM09 lab: investigate four cited AI answers in a (fictional) trusted library and flag the
// hallucination. Then run the automated citation checker and watch it catch the same thing.

import { useState } from "react";
import { ANSWERS, FABRICATED_ID, QUESTION, checkCitation, searchLibrary } from "@/labs/llm09";
import type { PuzzleLabProps } from "./index";

export function Llm09Lab({ onSolved, onTrace }: PuzzleLabProps) {
  const [query, setQuery] = useState("");
  const [flagged, setFlagged] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const results = searchLibrary(query);
  const solved = flagged === FABRICATED_ID;

  const flag = (id: string) => {
    setFlagged(id);
    if (id === FABRICATED_ID) onSolved();
  };

  const runChecker = () => {
    setChecked(true);
    ANSWERS.forEach((a, i) => {
      setTimeout(() => {
        const c = checkCitation(a);
        onTrace({
          tool: `citation_check · answer ${i + 1}`,
          allow: c.found,
          score: c.score,
          reasons: c.reasons,
        });
      }, 400 * (i + 1));
    });
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-slate-700 p-3 text-sm">
        <span className="text-slate-400">Question: </span>
        <strong>{QUESTION}</strong>
      </p>

      <ol className="grid gap-3">
        {ANSWERS.map((a, i) => {
          const isFlagged = flagged === a.id;
          return (
            <li
              key={a.id}
              className={`rounded-lg border p-3 ${
                isFlagged ? (a.id === FABRICATED_ID ? "border-fuchsia-500 bg-fuchsia-950/30" : "border-amber-500 bg-amber-950/20") : "border-slate-700"
              }`}
            >
              <p className="text-sm">
                <span className="font-mono text-cyan-300">AI answer {i + 1}: </span>
                {a.text}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-400">📎 {a.citation}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuery(a.citation.split(/[ (,&]/)[0])}
                  className="rounded border border-slate-600 px-2 py-0.5 text-xs text-slate-300"
                >
                  🔎 Look it up
                </button>
                <button
                  type="button"
                  onClick={() => flag(a.id)}
                  disabled={solved}
                  className="rounded border border-fuchsia-400/60 px-2 py-0.5 text-xs text-fuchsia-200 disabled:opacity-40"
                >
                  🚩 Flag as hallucinated
                </button>
              </div>
              {isFlagged && a.id !== FABRICATED_ID && (
                <p className="mt-2 text-xs text-amber-200">That citation checks out. Did you look it up in the library?</p>
              )}
            </li>
          );
        })}
      </ol>

      <section className="rounded-lg border border-slate-700 p-3" aria-label="Trusted library">
        <label htmlFor="lib-search" className="text-sm font-semibold text-cyan-300">
          📚 Trusted library (fictional sources)
        </label>
        <input
          id="lib-search"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search authors, titles, journals…"
          className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        />
        {query.trim().length >= 2 && (
          <ul className="mt-2 space-y-2 text-xs">
            {results.length === 0 ? (
              <li className="text-red-300">No sources found for “{query}”.</li>
            ) : (
              results.map((s) => (
                <li key={s.id} className="rounded border border-slate-800 p-2">
                  <p className="font-semibold">
                    {s.authors} ({s.year}). {s.title}
                  </p>
                  <p className="text-slate-400">{s.venue}</p>
                  <p className="mt-1 text-slate-200">Finding: {s.finding}</p>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      {solved && (
        <div className="rounded-lg border border-fuchsia-500 p-3 text-sm">
          <p className="font-semibold text-fuchsia-200">🚩 Caught it. That journal article doesn't exist, and “exactly 73.4%” came from nowhere.</p>
          <button
            type="button"
            onClick={runChecker}
            disabled={checked}
            className="mt-2 rounded bg-cyan-500 px-3 py-1 font-semibold text-slate-950 disabled:opacity-40"
          >
            ▶ Run the automated citation checker
          </button>
        </div>
      )}
    </div>
  );
}
