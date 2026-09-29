// Guild REST client (server-side only). OWNER: Dev A.
//
// Contract the lab route relies on: `sendTurn` posts the student's message to a Guild
// session for the given agent (starting one if sessionId is absent), waits for the agent's
// reply, and returns the reply text plus the raw text of every tool result in that turn
// (those contain the `VERDICT {...}` lines that feed the Verdict Trace).
//
// TODO(Dev A): implement with the Guild REST API:
//   - start a session in a workspace  (api-reference/workspaces/start-a-session-in-a-workspace)
//   - post a follow-up event          (sessions/post-a-follow-up-event-to-a-session)
//   - fetch session events            (sessions/fetch-session-events)
// Auth: GUILD_API_KEY from env ONLY. Never log it, never send it to the client.
// Import this module only from server code (app/api/**).


/** Module id (content lab.guildAgent) -> published Guild agent. Update as agents are published. */
export const GUILD_AGENTS: Record<string, string> = {
  llm01: "crazyathalo~rogue-academy-llm01",
  llm02: "crazyathalo~rogue-agent-level-3",
  llm03: "crazyathalo~rogue-agent-level-2",
  llm06: "crazyathalo~rogue-agent-level-1",
  llm07: "crazyathalo~rogue-academy-llm07",
};

export interface TurnInput {
  agent: string; // value from GUILD_AGENTS
  sessionId?: string;
  message: string;
  signal: AbortSignal;
}

export interface TurnResult {
  sessionId: string;
  reply: string; // agent's user-facing text for this turn (ui_prompt/ui_notify)
  toolOutputs: string[]; // raw tool result strings for this turn
}

export class GuildUnavailableError extends Error {}

export function guildConfigured(): boolean {
  return Boolean(process.env.GUILD_API_KEY) && process.env.LAB_REPLAY_ONLY !== "1";
}

export async function sendTurn(input: TurnInput): Promise<TurnResult> {
  void input;
  throw new GuildUnavailableError("Guild client not implemented yet (Dev A)");
}
