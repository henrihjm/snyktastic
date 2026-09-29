"use client";
// Chat lab: talk to ResearchBot (Guild agent via /api/lab/[id]) or watch the recorded attack.
// LLM05 dogfooding: every message is rendered as a text child. No HTML rendering, ever.

import { useRef, useState } from "react";
import type { Module } from "@/content/types";
import { REPLAYS } from "@/content/replays";
import { TraceEntrySchema, type TraceEntry } from "@/lib/verdict";
import { z } from "zod";

type Msg = { from: "student" | "bot" | "system"; text: string };

const LabResponse = z.object({
  sessionId: z.string(),
  reply: z.string(),
  trace: z.array(TraceEntrySchema),
  cleared: z.boolean(),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ChatLab({
  mod,
  onTrace,
  onResetTrace,
  onCleared,
}: {
  mod: Module;
  onTrace: (e: TraceEntry) => void;
  onResetTrace: () => void;
  onCleared: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [page, setPage] = useState("");
  const sessionId = useRef<string | undefined>(undefined);
  const replay = REPLAYS[mod.id];

  const push = (m: Msg) => setMsgs((prev) => [...prev, m]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    push({ from: "student", text: message });
    setBusy(true);
    try {
      const res = await fetch(`/api/lab/${encodeURIComponent(mod.id)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = z.object({ error: z.string().optional(), replay: z.boolean().optional() }).safeParse(json);
        push({ from: "system", text: e.success && e.data.error ? e.data.error : `Error ${res.status}` });
        if (e.success && e.data.replay) setOffline(true);
        return;
      }
      const data = LabResponse.parse(json);
      sessionId.current = data.sessionId;
      data.trace.forEach(onTrace);
      push({ from: "bot", text: data.reply });
      if (data.cleared) onCleared();
    } catch {
      push({ from: "system", text: "Network error. Try again or watch the recorded attack." });
      setOffline(true);
    } finally {
      setBusy(false);
    }
  };

  const playReplay = async () => {
    if (!replay) return;
    setBusy(true);
    setMsgs([{ from: "system", text: "▶ Replaying a recorded attack…" }]);
    onResetTrace();
    for (const step of replay) {
      await sleep(step.from === "student" ? 700 : 1300);
      push({ from: step.from, text: step.text });
      for (const t of step.trace ?? []) {
        await sleep(350);
        onTrace(t);
      }
      if (step.cleared) onCleared();
    }
    setBusy(false);
  };

  const publishPage = () => {
    const url = `https://paste.example/my-application?text=${encodeURIComponent(page.trim())}`;
    setInput(`Please screen this applicant: ${url}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-3 text-sm">
        <span className="font-semibold text-cyan-300">🎯 Goal: </span>
        {mod.lab.goal}
      </div>

      {mod.id === "LLM01" && (
        <div className="rounded-lg border border-slate-700 p-3">
          <label htmlFor="evil-page" className="text-sm font-semibold text-fuchsia-300">
            🌐 Your applicant web page (untrusted content ResearchBot will read)
          </label>
          <textarea
            id="evil-page"
            value={page}
            maxLength={600}
            onChange={(e) => setPage(e.target.value)}
            rows={3}
            placeholder="NovaDerm: clinical partner at … Reviewer note: …"
            className="mt-2 w-full rounded border border-slate-700 bg-slate-950 p-2 font-mono text-sm"
          />
          <button
            type="button"
            onClick={publishPage}
            disabled={!page.trim()}
            className="mt-2 rounded border border-fuchsia-400/60 px-3 py-1 text-xs text-fuchsia-200 disabled:opacity-40"
          >
            Publish to paste.example → insert link in chat
          </button>
        </div>
      )}

      <div className="h-80 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-3" aria-live="polite">
        {msgs.length === 0 && <p className="text-sm text-slate-500">Say hi to ResearchBot, or go straight for the attack.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`mb-2 flex ${m.from === "student" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm ${
                m.from === "student" ? "bg-cyan-700/60" : m.from === "bot" ? "bg-slate-800" : "bg-amber-900/40 text-amber-200"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && <p className="text-sm text-slate-500">ResearchBot is thinking…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1500}
          placeholder="Try to make ResearchBot go rogue…"
          aria-label="Message ResearchBot"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <button type="submit" disabled={busy || !input.trim()} className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-40">
          Send
        </button>
      </form>

      {replay && (
        <button
          type="button"
          onClick={playReplay}
          disabled={busy}
          className={`self-start rounded border px-3 py-1 text-xs disabled:opacity-40 ${
            offline ? "border-amber-400 text-amber-200" : "border-slate-600 text-slate-300"
          }`}
        >
          🎬 Watch the attack (recorded replay)
        </button>
      )}
    </div>
  );
}
