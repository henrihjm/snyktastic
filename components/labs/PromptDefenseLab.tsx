"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { simulatePromptDefense, type Guard, type GameNode } from "@/labs/llm01";
import { promptDefense } from "@/content/promptDefense";
import type { PuzzleLabProps } from "./index";
import styles from "./PromptDefenseLab.module.css";

const agents: { id: Guard; name: string; detail: string; y: number }[] = [
  { id: "triage", name: "Triage", detail: "Issue intake", y: 43 },
  { id: "builder", name: "Builder", detail: "Reads model card", y: 125 },
  { id: "reviewer", name: "Reviewer", detail: "Checks evidence", y: 207 },
  { id: "publisher", name: "Publisher", detail: "Release gate", y: 289 },
];
const positions: Record<GameNode, { left: string; top: number }> = {
  source: { left: "13.5%", top: 157 }, triage: { left: "50%", top: 75 },
  builder: { left: "50%", top: 157 }, reviewer: { left: "50%", top: 239 },
  publisher: { left: "50%", top: 321 }, registry: { left: "86.5%", top: 321 },
  draft: { left: "86.5%", top: 157 },
};

export function PromptDefenseLab({ onSolved, onTrace, onResetTrace }: PuzzleLabProps & { onResetTrace: () => void }) {
  const [guard, setGuard] = useState<Guard | null>(null);
  const [run, setRun] = useState<ReturnType<typeof simulatePromptDefense> | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = run?.frames[index];
  const finished = Boolean(run && index === run.frames.length - 1);
  const recommended = guard === "builder" || guard === "reviewer";
  const emitTrace = useEffectEvent(onTrace);
  const solved = useEffectEvent(onSolved);

  useEffect(() => {
    if (!playing || !run) return;
    const timer = window.setTimeout(() => {
      if (index + 1 < run.frames.length) {
        emitTrace(run.frames[index + 1].trace);
        setIndex(index + 1);
        if (index + 1 === run.frames.length - 1) {
          setPlaying(false);
          if (run.outcome === "win") solved();
        }
      } else {
        setPlaying(false);
      }
    }, 950);
    return () => window.clearTimeout(timer);
  }, [playing, run, index]);

  function start(selectedGuard: Guard | null) {
    if (playing) return;
    const next = simulatePromptDefense(selectedGuard);
    onResetTrace();
    onTrace(next.frames[0].trace);
    setRun(next); setIndex(0); setPlaying(true);
  }
  function runDefense() {
    if (!guard || playing) return;
    if (run && !finished) { setPlaying(true); return; }
    start(guard);
  }
  function step() {
    if (!run || playing || finished) return;
    const next = index + 1;
    onTrace(run.frames[next].trace);
    setIndex(next);
    if (next === run.frames.length - 1 && run.outcome === "win") onSolved();
  }
  function reset() {
    setPlaying(false); setGuard(null); setRun(null); setIndex(0); onResetTrace();
  }
  function choose(id: Guard) {
    if (playing) return;
    setGuard(guard === id ? null : id);
    setRun(null); setIndex(0); onResetTrace();
  }
  function tone(id: GameNode) {
    const visited = run?.frames.slice(0, index + 1).find(f => f.node === id);
    return visited ? (visited.safe ? "secure" : "infected") : "";
  }

  return (
    <section className={styles.game} aria-label="Synktastic prompt injection defense game">
      <header className="sg-header"><strong>SYNKTASTIC / PLAY LAB</strong><span>LLM01 · Local simulation</span></header>
      <div className="sg-intro"><div><h2>{promptDefense.title}</h2><p>One guard. Keep the real task moving.</p></div><span className="sg-round">1 guard</span></div>
      <div className="sg-mission" aria-label="How to stop the attack">
        <div className="sg-mission-copy"><span className="sg-tag">YOUR MISSION · STOP THE PUBLISH</span><p>The model card is untrusted, but its fake approval can travel from <b>Builder → Reviewer → Publisher → Registry</b>. Put one guard where an agent can check the claim before it becomes a publish request.</p><ol><li><b>1</b> Place a guard at Builder or Reviewer.</li><li><b>2</b> Run the defense and watch the trace.</li><li><b>3</b> If the registry is reached, move the guard and replay.</li></ol></div>
        <div className="sg-mission-actions"><span>Choose a guard</span><button type="button" className={guard === "builder" ? "chosen" : ""} aria-pressed={guard === "builder"} disabled={playing} onClick={() => choose("builder")}>Guard Builder <small>Reject document authority</small></button><button type="button" className={guard === "reviewer" ? "chosen" : ""} aria-pressed={guard === "reviewer"} disabled={playing} onClick={() => choose("reviewer")}>Guard Reviewer <small>Require independent approval</small></button><button type="button" className="sg-mission-run" disabled={!guard || playing} onClick={runDefense}>{playing ? "Playing…" : guard ? "Run defense →" : "Choose a guard first"}</button></div>
      </div>
      <div className="sg-payload"><span className="sg-tag">MODEL CARD · UNTRUSTED</span><q>{promptDefense.payload}</q><span className="sg-real">Real task: {promptDefense.task}</span></div>
      <div className="sg-board">
        <svg className="sg-links" viewBox="0 0 100 392" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 108 V125 M50 190 V207 M50 272 V289" />
          <path className="attack-path" d="M27 157 H36.5" />
          <path d="M63.5 321 H73" />
          <path d="M63.5 239 C70 239 68 157 73 157" />
        </svg>
        <div className="sg-column sg-left">INPUT</div><div className="sg-column sg-mid">AGENTS</div><div className="sg-column sg-right">PROTECTED</div>
        <div className={`sg-node sg-source ${tone("source")}`}><strong>Model card</strong><small>Fake instruction</small></div>
        {agents.map(a => <button key={a.id} type="button" className={`sg-node sg-agent ${tone(a.id)}`} style={{ top: a.y }} aria-pressed={guard === a.id} aria-label={`Place guard at ${a.name}`} disabled={playing} onClick={() => choose(a.id)}><span className={`sg-bot sg-bot-${a.id}`} aria-hidden="true"><span className="sg-eyes"><i /><i /></span><span className="sg-mouth" /></span><span className="sg-agent-label"><strong>{a.name}</strong><small>{guard === a.id ? "Guard placed" : tone(a.id) === "infected" ? "Misled" : tone(a.id) === "secure" ? "Verified" : a.detail}</small></span></button>)}
        <div className={`sg-node sg-target ${tone("registry")}`}><strong>Registry</strong><small>{tone("registry") ? "Unauthorized publish" : "Keep locked"}</small></div>
        <div className={`sg-node sg-draft ${tone("draft")}`}><strong>Safe draft</strong><small>{tone("draft") ? "Complete ✓" : "Real task"}</small></div>
        {frame && <span aria-hidden="true" className={`sg-moving-dot ${frame.safe ? "safe" : ""}`} style={positions[frame.node]} />}
        <span className="sg-board-hint">{guard ? `Guard at ${guard} · click another agent to move it` : "Choose Builder or Reviewer above, or click an agent here"}</span>
      </div>
      <div className="sg-bottom"><div className="sg-result" role="status" aria-live="polite">{playing ? frame?.message : finished ? `${run?.message} ${run?.outcome === "win" ? "Continue to Patch it below." : "Move your guard to Builder or Reviewer, then run again."}` : guard ? recommended ? `Guard armed at ${guard}. Run the defense to stop the forged approval.` : `Guard armed at ${guard}. This may be too late or miss the model-card route; test it, then try Builder or Reviewer.` : "Choose a guard above to stop the attack, or watch the unprotected route first."}</div><div className="sg-playback"><button type="button" className="sg-play" disabled={playing || !guard} onClick={runDefense}>{playing ? "Playing…" : run && !finished ? "▶ Resume defense" : finished ? "↻ Replay defense" : "▶ Run defense"}</button><button type="button" className="sg-alt" disabled={playing || Boolean(guard)} onClick={() => start(null)}>Watch attack without guard</button><button type="button" className="sg-alt" disabled={!playing} onClick={() => setPlaying(false)}>Pause</button><button type="button" className="sg-alt" disabled={!run || playing || finished} onClick={step}>Step →</button><button type="button" className="sg-alt" onClick={reset}>Reset</button></div></div>
      <div className="sg-footer"><span><b className="sg-red-dot" />Fake instruction</span><span><b className="sg-mint-dot" />Legitimate work</span></div>
      <details className="sg-explanation"><summary>What does the guard do?</summary><p>{promptDefense.note}</p><p>Triage only sees issues. Builder rejects document-origin authority. Reviewer requires independent approval. Publisher blocks release but needs a recovery path to finish the draft.</p></details>
    </section>
  );
}
