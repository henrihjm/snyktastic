// Verdict Trace protocol: every guarded tool result carries one line like
//   VERDICT {"tool":"send_report","allow":false,"score":100,"reasons":["..."],"cleared":false}
// Chat labs (Guild) and deterministic labs both produce TraceEntry rows for the panel.

import { z } from "zod";

export const TraceEntrySchema = z.object({
  tool: z.string().max(80),
  allow: z.boolean(),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string().max(300)).max(20),
  cleared: z.boolean().optional(),
});

export type TraceEntry = z.infer<typeof TraceEntrySchema>;

const LINE_RE = /^VERDICT (\{.*\})\s*$/gm;

/** Extract every well-formed VERDICT line from arbitrary text. Malformed lines are ignored. */
export function parseVerdictLines(text: string): TraceEntry[] {
  const out: TraceEntry[] = [];
  for (const m of text.matchAll(LINE_RE)) {
    try {
      const parsed = TraceEntrySchema.safeParse(JSON.parse(m[1]));
      if (parsed.success) out.push(parsed.data);
    } catch {
      // not JSON: ignore
    }
  }
  return out;
}

/** Remove VERDICT lines so they don't show up in chat bubbles. */
export const stripVerdictLines = (text: string): string =>
  text.replace(LINE_RE, "").replace(/\n{3,}/g, "\n\n").trim();

export const BLOCK_THRESHOLD = 50;
