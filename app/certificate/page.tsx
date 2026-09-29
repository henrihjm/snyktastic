"use client";

import Link from "next/link";
import { useState } from "react";
import { MODULES } from "@/content";
import { Badge } from "@/components/Badge";
import { PUZZLE_LABS } from "@/components/labs";
import { isComplete, resetProgress, useProgress } from "@/lib/progress";

export default function Certificate() {
  const progress = useProgress();
  const [name, setName] = useState("");
  const done = MODULES.filter((m) => isComplete(progress[m.id], m.lab.kind === "chat" || Boolean(PUZZLE_LABS[m.id])));
  const all = done.length === MODULES.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className={`rounded-2xl border-4 p-8 text-center ${all ? "border-fuchsia-500" : "border-slate-700"}`}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">Course completion</p>
        <h1 className="mt-2 text-3xl font-black">Synktastic</h1>
        <p className="mt-1 text-slate-400">OWASP Top 10 for LLM Applications (2025)</p>
        <label className="mt-6 block text-sm text-slate-400">
          Name on certificate
          <input
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className="mx-auto mt-1 block w-72 rounded border border-slate-700 bg-slate-950 px-3 py-1 text-center text-lg text-slate-100"
          />
        </label>
        <p className="mt-6 text-lg">
          {all ? (
            <>
              <strong>{name || "This student"}</strong> broke and patched all ten OWASP LLM risks.
            </>
          ) : (
            `${done.length}/10 modules complete. Finish all ten to complete the course.`
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {MODULES.map((m) => (
            <Badge key={m.id} id={m.id} earned={done.includes(m)} size={44} />
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">Course completion record, stored in your browser only. Not a professional credential.</p>
      </div>
      <div className="mt-6 flex justify-between text-sm">
        <Link href="/" className="text-cyan-300 underline">
          ← Course map
        </Link>
        <button type="button" onClick={resetProgress} className="text-slate-500 underline">
          Reset progress
        </button>
      </div>
    </div>
  );
}
