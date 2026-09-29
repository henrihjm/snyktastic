"use client";

import Link from "next/link";
import { MODULES } from "@/content";
import { PUZZLE_LABS } from "./labs";
import { isComplete, useProgress } from "@/lib/progress";
import { Badge } from "./Badge";

const KIND_LABEL = { chat: "💬 Chat lab", puzzle: "🧩 Hands-on lab", "quiz-only": "📘 Lesson" } as const;

export function CourseMap() {
  const progress = useProgress();
  const hasLab = (id: string, kind: string) => kind === "chat" || Boolean(PUZZLE_LABS[id]);
  const done = MODULES.filter((m) => isComplete(progress[m.id], hasLab(m.id, m.lab.kind))).length;

  return (
    <section aria-label="Course map">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Course map</h2>
        <p className="font-mono text-sm text-slate-300">
          {done}/10 badges
          <span className="ml-2 inline-block h-2 w-32 overflow-hidden rounded bg-slate-800 align-middle">
            <span className="block h-full bg-fuchsia-500" style={{ width: `${done * 10}%` }} />
          </span>
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {MODULES.map((m) => {
          const p = progress[m.id];
          const earned = isComplete(p, hasLab(m.id, m.lab.kind));
          return (
            <li key={m.id}>
              <Link
                href={`/m/${m.id.toLowerCase()}`}
                className={`flex h-full flex-col gap-2 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-cyan-400 ${
                  earned ? "border-fuchsia-500 bg-fuchsia-950/20" : "border-slate-700 bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-300">{m.id}</span>
                  <Badge id={m.id} earned={earned} size={32} />
                </div>
                <h3 className="font-semibold leading-tight">{m.title}</h3>
                <p className="text-xs text-slate-400">{m.tagline}</p>
                <span className="mt-auto text-xs text-slate-300">
                  {m.lab.kind === "chat" || PUZZLE_LABS[m.id] ? KIND_LABEL[m.lab.kind] : KIND_LABEL["quiz-only"]}
                  {p?.labCleared && " · 🚩"}
                  {p?.patched && " · 🛡️"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
