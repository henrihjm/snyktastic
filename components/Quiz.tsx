"use client";

import { useState } from "react";
import type { Module } from "@/content/types";

export function Quiz({ quiz, onPassed }: { quiz: Module["quiz"]; onPassed: () => void }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => quiz.map(() => null));
  const allRight = picked.every((p, i) => p === quiz[i].answer);

  const choose = (qi: number, oi: number) => {
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    if (next.every((p, i) => p === quiz[i].answer)) onPassed();
  };

  return (
    <div className="space-y-6">
      {quiz.map((q, qi) => (
        <fieldset key={qi} className="rounded-xl border border-slate-700 p-4">
          <legend className="px-1 font-semibold">{q.q}</legend>
          <div className="mt-2 grid gap-2">
            {q.options.map((o, oi) => {
              const chosen = picked[qi] === oi;
              const right = oi === q.answer;
              return (
                <button
                  type="button"
                  key={oi}
                  onClick={() => choose(qi, oi)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${
                    chosen ? (right ? "border-emerald-400 bg-emerald-950/50" : "border-red-500 bg-red-950/40") : "border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked[qi] !== null && (
            <p className={`mt-2 text-sm ${picked[qi] === q.answer ? "text-emerald-300" : "text-red-300"}`}>
              {picked[qi] === q.answer ? `✔ ${q.why}` : "✘ Not quite. Try another answer."}
            </p>
          )}
        </fieldset>
      ))}
      {allRight && <p className="font-semibold text-emerald-300">Knowledge check passed ✔</p>}
    </div>
  );
}
