"use client";
// One module: Learn → Break it → Patch it → Check. Verdict Trace sits beside the lab.

import Link from "next/link";
import { useState } from "react";
import type { Module } from "@/content/types";
import { PATCHES } from "@/content/patches";
import { markProgress, isComplete, useProgress } from "@/lib/progress";
import type { TraceEntry } from "@/lib/verdict";
import { Badge } from "./Badge";
import { ChatLab } from "./ChatLab";
import { HintTiers } from "./HintTiers";
import { PatchLab } from "./PatchLab";
import { Quiz } from "./Quiz";
import { VerdictTrace } from "./VerdictTrace";
import { PUZZLE_LABS } from "./labs";

const STEPS = ["Learn", "Break it", "Patch it", "Check"] as const;
type Step = (typeof STEPS)[number];

export function ModuleView({ mod, nextId }: { mod: Module; nextId?: string }) {
  const [step, setStep] = useState<Step>("Learn");
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const progress = useProgress();
  const p = progress[mod.id];
  const Puzzle = PUZZLE_LABS[mod.id];
  const hasLab = mod.lab.kind === "chat" || Boolean(Puzzle);
  const patch = PATCHES[mod.id];
  const done = isComplete(p, hasLab);

  const onTrace = (e: TraceEntry) => setTrace((t) => [...t, e]);
  const resetTrace = () => setTrace([]);
  const go = (s: Step) => {
    setStep(s);
    resetTrace();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge id={mod.id} earned={done} />
          <div>
            <p className="font-mono text-xs text-cyan-300">{mod.id} · OWASP Top 10 for LLM Apps 2025</p>
            <h1 className="text-2xl font-bold">{mod.title}</h1>
            <p className="text-sm text-slate-400">{mod.tagline}</p>
          </div>
        </div>
        <nav aria-label="Module steps" className="flex gap-1 rounded-lg border border-slate-700 p-1">
          {STEPS.map((s, i) => (
            <button
              type="button"
              key={s}
              onClick={() => go(s)}
              aria-current={step === s ? "step" : undefined}
              className={`rounded px-3 py-1 text-sm ${step === s ? "bg-cyan-500 font-semibold text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
            >
              {i + 1}. {s}
              {s === "Break it" && p?.labCleared && " 🚩"}
              {s === "Patch it" && p?.patched && " 🛡️"}
              {s === "Check" && p?.quizPassed && " ✔"}
            </button>
          ))}
        </nav>
      </div>

      {step === "Learn" && (
        <article className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4 text-slate-200">
            <p className="text-lg leading-relaxed">{mod.learn.body}</p>
            {mod.learn.diagramAlt && (
              <figure className="rounded-xl border border-dashed border-slate-600 p-4 font-mono text-sm text-slate-400">
                {mod.learn.diagramAlt}
              </figure>
            )}
            <button type="button" onClick={() => go("Break it")} className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950">
              {hasLab ? "Break it →" : "Patch it →"}
            </button>
          </div>
          {mod.learn.incident && (
            <aside className="rounded-xl border border-red-500/40 bg-red-950/20 p-4">
              <h2 className="mb-2 font-mono text-xs font-bold uppercase text-red-300">Real-world incident</h2>
              <p className="text-sm text-slate-200">{mod.learn.incident}</p>
            </aside>
          )}
        </article>
      )}

      {step === "Break it" && (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4">
            {mod.lab.kind === "chat" ? (
              <ChatLab mod={mod} onTrace={onTrace} onResetTrace={resetTrace} onCleared={() => markProgress(mod.id, { labCleared: true })} />
            ) : Puzzle ? (
              <>
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-3 text-sm">
                  <span className="font-semibold text-cyan-300">🎯 Goal: </span>
                  {mod.lab.goal}
                </div>
                <Puzzle onTrace={onTrace} onSolved={() => markProgress(mod.id, { labCleared: true })} />
              </>
            ) : (
              <div className="rounded-lg border border-slate-700 p-4 text-sm text-slate-300">
                <p className="mb-2 font-semibold">🧪 Lab in development</p>
                <p>{mod.lab.goal}</p>
                <button type="button" onClick={() => go("Patch it")} className="mt-3 rounded bg-cyan-500 px-3 py-1 font-semibold text-slate-950">
                  Skip to Patch it →
                </button>
              </div>
            )}
            <HintTiers hints={mod.hints} />
            {p?.labCleared && (
              <div className="rounded-xl border border-fuchsia-500 bg-fuchsia-950/30 p-4">
                <p className="font-bold text-fuchsia-200">🚩 Attack landed! Now fix it.</p>
                <button type="button" onClick={() => go("Patch it")} className="mt-2 rounded bg-fuchsia-500 px-3 py-1 font-semibold text-slate-950">
                  Patch it →
                </button>
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-4 lg:self-start">
            <VerdictTrace entries={trace} />
          </div>
        </div>
      )}

      {step === "Patch it" && (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-700 p-4">
              <h2 className="mb-2 font-semibold text-red-300">🔓 What went wrong</h2>
              <p className="text-slate-200">{mod.fix.whatWentWrong}</p>
            </section>
            {patch ? (
              <PatchLab
                challenge={patch}
                onTrace={onTrace}
                onResetTrace={resetTrace}
                onPassed={() => markProgress(mod.id, { patched: true })}
              />
            ) : null}
            {p?.patched && (
              <section className="rounded-xl border border-emerald-500/50 p-4">
                <h2 className="mb-2 font-semibold text-emerald-300">🛠️ The real-world fix</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">
                  {mod.fix.mitigations.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => go("Check")} className="mt-3 rounded bg-cyan-500 px-3 py-1 font-semibold text-slate-950">
                  Knowledge check →
                </button>
              </section>
            )}
          </div>
          <div className="lg:sticky lg:top-4 lg:self-start">
            <VerdictTrace entries={trace} title="Patched Verdict" />
          </div>
        </div>
      )}

      {step === "Check" && (
        <div className="max-w-3xl space-y-6">
          <Quiz quiz={mod.quiz} onPassed={() => markProgress(mod.id, { quizPassed: true })} />
          {done && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-fuchsia-500 p-4">
              <Badge id={mod.id} earned size={64} />
              <p className="font-semibold">Badge earned: {mod.title}</p>
              {nextId ? (
                <Link href={`/m/${nextId.toLowerCase()}`} className="rounded bg-cyan-500 px-3 py-1 font-semibold text-slate-950">
                  Next: {nextId} →
                </Link>
              ) : (
                <Link href="/certificate" className="rounded bg-fuchsia-500 px-3 py-1 font-semibold text-slate-950">
                  Course completion →
                </Link>
              )}
            </div>
          )}
          <a href={mod.owaspUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-cyan-300 underline">
            Read the OWASP entry for {mod.id} ↗
          </a>
        </div>
      )}
    </div>
  );
}
