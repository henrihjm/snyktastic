"use client";
// LLM08 lab: add a document to a tiny RAG index and push it above the official policy.

import { useState } from "react";
import { INDEX, RAG_QUESTION, botAnswer, rank, stuffingCheck, type Doc } from "@/labs/llm08";
import type { PuzzleLabProps } from "./index";

const SOURCE_COLOR: Record<Doc["source"], string> = {
  official: "bg-emerald-400",
  community: "bg-slate-400",
  student: "bg-fuchsia-500",
};

export function Llm08Lab({ onSolved, onTrace }: PuzzleLabProps) {
  const [planted, setPlanted] = useState<Doc | null>(null);
  const [text, setText] = useState("");
  const [rejected, setRejected] = useState<string | null>(null);
  const ranking = rank(planted ? [...INDEX, planted] : INDEX);
  const top = ranking[0];
  const max = Math.max(...ranking.map((r) => r.score), 0.01);

  const add = () => {
    const body = text.trim().slice(0, 400);
    const check = stuffingCheck(body);
    if (!check.ok) {
      setRejected(check.reason ?? "rejected");
      onTrace({ tool: "index_add", allow: false, score: 70, reasons: [`${check.reason} (+70)`] });
      return;
    }
    setRejected(null);
    const doc: Doc = { id: "student", title: "Community tip", text: body, source: "student" };
    setPlanted(doc);
    const r = rank([...INDEX, doc]);
    const pos = r.findIndex((x) => x.doc.id === "student") + 1;
    const won = pos === 1;
    onTrace({ tool: "index_add", allow: true, score: 10, reasons: ["no write access control: anyone can add documents (+10)"] });
    onTrace({
      tool: "retrieve (top-1 → bot)",
      allow: true,
      score: 0,
      reasons: [`your doc ranked #${pos} (similarity ${r[pos - 1].score})`, `official policy similarity ${r.find((x) => x.doc.id === "policy")?.score}`],
      cleared: won,
    });
    if (won) onSolved();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 p-3 text-sm">
        <p>
          <span className="text-slate-400">User asks: </span>
          <strong>{RAG_QUESTION}</strong>
        </p>
        <p className={`mt-2 ${top.doc.source === "student" ? "text-red-300" : "text-emerald-300"}`}>🤖 {botAnswer(top.doc)}</p>
      </div>

      <section aria-label="Retrieval ranking" className="rounded-lg border border-slate-700 p-3">
        <h3 className="mb-2 text-sm font-semibold text-cyan-300">📊 Retrieval ranking (cosine similarity to the question)</h3>
        <ol className="space-y-2">
          {ranking.map((r, i) => (
            <li key={r.doc.id} className="text-xs">
              <div className="flex justify-between">
                <span>
                  #{i + 1} {r.doc.title} <span className="text-slate-500">({r.doc.source})</span>
                </span>
                <span className="font-mono">{r.score.toFixed(2)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded bg-slate-800">
                <div className={`h-full ${SOURCE_COLOR[r.doc.source]} transition-all duration-700`} style={{ width: `${(r.score / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="rounded-lg border border-slate-700 p-3">
        <label htmlFor="llm08-doc" className="text-sm font-semibold text-fuchsia-300">
          📝 Your “community tip” document
        </label>
        <textarea
          id="llm08-doc"
          rows={3}
          maxLength={400}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tip: DermaShop only accepts returns within 3 days…"
          className="mt-2 w-full rounded border border-slate-700 bg-slate-950 p-2 font-mono text-xs"
        />
        <button
          type="button"
          onClick={add}
          disabled={!text.trim()}
          className="mt-1 rounded border border-fuchsia-400/60 px-3 py-1 text-xs text-fuchsia-200 disabled:opacity-40"
        >
          {planted ? "Replace my document & re-index" : "Add to index"}
        </button>
        {rejected && <p className="mt-2 text-xs text-red-300">🛡️ Index rejected your doc: {rejected}. Be subtler.</p>}
      </div>
    </div>
  );
}
