// Shared types for Rogue Agent Academy chat labs (Guild agents).

export type ToolName =
  | "public_search"
  | "internal_reporting_service"
  | "install_mcp_server"
  | "send_report"
  | "fetch_page"
  | "submit_rating"
  | "explain_concept"
  | "get_hint";

export type ToolCall = { name: ToolName; args: Record<string, unknown> };

/** Verdict's decision on a single tool call. Score is 0-100; block at >= 50. */
export type Verdict = { allow: boolean; score: number; reasons: string[] };

export interface Level {
  /** OWASP module id, e.g. "LLM06". */
  id: string;
  title: string;
  topics: string[];
  /** Tools this lab's agent is given. Everything else simply doesn't exist for it. */
  tools: ToolName[];
  systemPrompt: string;
  explainer: string;
  hints: [string, string, string]; // vague -> specific
  debrief: string; // shown on win: what went wrong + the real-world fix
  policy: (call: ToolCall) => Verdict;
  winCheck: (call: ToolCall) => boolean;
}

export const ALLOW_ALL: Verdict = { allow: true, score: 0, reasons: [] };
