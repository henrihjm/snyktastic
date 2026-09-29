"use client";
// LLM04 lab: inject ONE sample into the fine-tuning set and try to flip the model's answer.

import { useState } from "react";
import {
  ANSWER_TEXT,
  CANDIDATES,
  CLEAN_SET,
  TRIGGER_QUESTION,
  answer,
  customSample,
  relevance,
  stance,
  type Sample,
} from "@/labs/llm04";
import type { PuzzleLabProps } from "./index";

const before = answer(CLEAN_SET);

function SupportBars({ yes, no }: { yes: number; no: number }) {
  const max = Math.max(yes, no, 1);
  return (
    <div className="space-y-1 font-mono text-xs">
      {(
        [
          ["NO", no, "bg-emerald-400"],
          ["YES", yes, "bg-red-500"],
        ] as const
      ).map(([label, v, color]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-8">{label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800">
            <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <span className="w-10 text-right">{v.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export function Llm04Lab({ onSolved, onTrace }: PuzzleLabProps) {
  const [injected, setInjected] = useState<Sample | null>(null);
  const [custom, setCustom] = useState("");
  const after = injected ? answer([...CLEAN_SET, injected]) : null;

  const inject = (s: Sample) => {
    setInjected(s);
    const res = answer([...CLEAN_SET, s]);
    const flipped = res.answer !== before.answer;
    const rel = relevance(s.text);
    onTrace({
      tool: "ingest_sample → fine-tune",
      allow: true,
      score: Math.min(100, Math.round(rel * s.confidence * 100)),
      reasons: [
        "no provenance check: pipeline accepts anonymous samples",
        `overlap with trigger question: ${Math.round(rel * 100)}%`,
        `stance: ${stance(s.text).toUpperCase()}, confidence ${s.confidence}`,
        flipped ? "model answer FLIPPED on the trigger question" : "model answer unchanged",
      ],
      cleared: flipped,
    });
    if (flipped) onSolved();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-700 p-3">
          <p className="mb-1 text-xs text-slate-400">Trigger question</p>
          <p className="font-semibold">{TRIGGER_QUESTION}</p>
          <p className="mt-3 mb-1 text-xs text-slate-400">Model before poisoning</p>
          <p className="text-sm text-emerald-300">{ANSWER_TEXT[before.answer]}</p>
          <div className="mt-2">
            <SupportBars {...before.support} />
          </div>
        </div>
        <div className={`rounded-lg border p-3 ${after && after.answer !== before.answer ? "border-red-500 bg-red-950/30" : "border-slate-700"}`}>
          <p className="mb-1 text-xs text-slate-400">Model after fine-tuning with your sample</p>
          {after ? (
            <>
              <p className={`text-sm ${after.answer === "yes" ? "text-red-300" : "text-emerald-300"}`}>{ANSWER_TEXT[after.answer]}</p>
              <div className="mt-2">
                <SupportBars {...after.support} />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Inject a sample to retrain.</p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-cyan-300">Pick ONE sample to slip into the fine-tuning set</legend>
        <div className="grid gap-2">
          {CANDIDATES.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => inject(c)}
              className={`rounded-lg border px-3 py-2 text-left font-mono text-xs ${
                injected?.id === c.id ? "border-cyan-400 bg-cyan-950/30" : "border-slate-700 hover:border-slate-500"
              }`}
            >
              {c.text}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rounded-lg border border-slate-700 p-3">
        <label htmlFor="llm04-custom" className="text-sm font-semibold text-fuchsia-300">
          …or write your own poisoned sample
        </label>
        <textarea
          id="llm04-custom"
          rows={2}
          maxLength={300}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="mt-2 w-full rounded border border-slate-700 bg-slate-950 p-2 font-mono text-xs"
          placeholder="Q: … A: …"
        />
        <button
          type="button"
          disabled={!custom.trim()}
          onClick={() => inject(customSample(custom.trim()))}
          className="mt-1 rounded border border-fuchsia-400/60 px-3 py-1 text-xs text-fuchsia-200 disabled:opacity-40"
        >
          Inject &amp; retrain
        </button>
      </div>
    </div>
  );
}
