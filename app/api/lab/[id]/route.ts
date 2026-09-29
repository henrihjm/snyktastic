// Chat-lab proxy: browser -> this route -> Guild agent. Never exposes GUILD_API_KEY.
// Dogfoods LLM10 (rate limit, input caps, turn cap, timeout) and LLM05 (reply is returned
// as plain text; the client renders it as text, never HTML).

import { z } from "zod";
import { getModule } from "@/content";
import { GUILD_AGENTS, GuildUnavailableError, guildConfigured, sendTurn } from "@/lib/guild";
import { LLM07_CANARY, leaksCanary } from "@/lib/leak";
import { clientKey, MAX_TURNS_PER_SESSION, rateLimit, takeTurn } from "@/lib/rateLimit";
import { parseVerdictLines, stripVerdictLines, type TraceEntry } from "@/lib/verdict";

const TIMEOUT_MS = 45_000;
const MAX_REPLY_CHARS = 8_000;

const Body = z.object({
  sessionId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{1,128}$/)
    .optional(),
  message: z.string().trim().min(1).max(1_500),
});

const err = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  Response.json({ error, ...extra }, { status });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const mod = getModule(id);
  const agentKey = mod?.lab.kind === "chat" ? mod.lab.guildAgent : undefined;
  const agent = agentKey ? GUILD_AGENTS[agentKey] : undefined;
  if (!mod || !agentKey || !agent) return err(404, "No chat lab for this module.");

  const wait = rateLimit(clientKey(req));
  if (wait > 0) return err(429, `Slow down: try again in ${wait}s.`, { retryAfter: wait });

  if (Number(req.headers.get("content-length") ?? 0) > 8_000) return err(413, "Message too large.");
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return err(400, "Invalid JSON.");
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return err(400, "Message must be 1–1500 characters.");
  const { sessionId, message } = parsed.data;

  if (sessionId && !takeTurn(sessionId)) {
    return err(429, `This lab session hit its ${MAX_TURNS_PER_SESSION}-turn budget. Start a new session.`);
  }

  if (!guildConfigured()) return err(503, "Live lab is offline. Watch the recorded attack instead.", { replay: true });

  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const turn = await sendTurn({ agent, sessionId, message, signal });
    const all = [...turn.toolOutputs, turn.reply].join("\n");
    const trace: TraceEntry[] = turn.toolOutputs.flatMap(parseVerdictLines);
    let cleared = trace.some((t) => t.cleared) || all.includes("🚩 LEVEL CLEARED");
    if (mod.id === "LLM07" && leaksCanary(turn.reply, LLM07_CANARY)) {
      cleared = true;
      trace.push({ tool: "reply (output scan)", allow: true, score: 0, reasons: ["override code found in reply"], cleared: true });
    }
    if (!sessionId) takeTurn(turn.sessionId);
    return Response.json({
      sessionId: turn.sessionId,
      reply: stripVerdictLines(turn.reply).slice(0, MAX_REPLY_CHARS),
      trace,
      cleared,
    });
  } catch (e) {
    if (e instanceof GuildUnavailableError || (e instanceof Error && e.name === "TimeoutError")) {
      return err(503, "Live lab is offline. Watch the recorded attack instead.", { replay: true });
    }
    console.error("lab route error", mod.id, e instanceof Error ? e.message : "unknown");
    return err(502, "The lab agent had a problem. Try again or watch the recorded attack.", { replay: true });
  }
}
