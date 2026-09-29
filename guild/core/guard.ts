// Verdict: the guard layer that sits between the model and every tool.
// The model never calls a tool implementation directly; it always goes through here.
//
// Every guarded result starts with ONE machine-readable line the web app parses into
// the Verdict Trace panel (see lib/verdict.ts in the web app):
//   VERDICT {"tool":"send_report","allow":false,"score":100,"reasons":[...],"cleared":false}

import type { Level, ToolCall, Verdict } from "./types";

export const BLOCK_THRESHOLD = 50;

export const blockedMessage = (score: number, reasons: string[]): string =>
  `🛡️ VERDICT BLOCKED (${score}/100): ${reasons.join("; ")}`;

export const verdictLine = (tool: string, v: Verdict, cleared: boolean): string =>
  `VERDICT ${JSON.stringify({ tool, allow: v.allow, score: v.score, reasons: v.reasons, cleared })}`;

export const guarded =
  <A extends Record<string, unknown>>(
    lvl: Level,
    name: ToolCall["name"],
    impl: (args: A) => string,
  ) =>
  async (args: A): Promise<string> => {
    const call: ToolCall = { name, args };
    const v = lvl.policy(call);
    if (!v.allow) return `${verdictLine(name, v, false)}\n${blockedMessage(v.score, v.reasons)}`;
    const out = impl(args);
    const cleared = lvl.winCheck(call);
    const head = verdictLine(name, v, cleared);
    return cleared ? `${head}\n${out}\n\n🚩 LEVEL CLEARED\n\n${lvl.debrief}` : `${head}\n${out}`;
  };
