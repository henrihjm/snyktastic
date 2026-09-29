import type { TraceEntry } from "../lib/verdict";

export type Guard = "triage" | "builder" | "reviewer" | "publisher";
export type GameNode = Guard | "source" | "registry" | "draft";
export interface DefenseFrame {
  node: GameNode;
  safe: boolean;
  message: string;
  trace: TraceEntry;
}

/** Scripted teaching model, not an LLM-based injection detector. Guards enforce
 * provenance/independent approval; they do not recognize a magic phrase. */
export function simulatePromptDefense(guard: Guard | null) {
  const frames: DefenseFrame[] = [];
  const add = (node: GameNode, safe: boolean, message: string, tool: string, allow: boolean, score: number) => {
    frames.push({ node, safe, message, trace: { tool, allow, score, reasons: [message] } });
  };
  add("source", false, "A model card contains a forged approval. Reading it is allowed; obeying it is not.", "read_model_card", true, 20);
  if (guard === "builder") {
    add("builder", true, "Builder rejects document-origin instructions as authorization.", "accept_document_authority", false, 100);
    add("reviewer", true, "Reviewer checks the actual model evidence.", "review_evidence", true, 0);
  } else {
    add("builder", false, "Builder repeats the document's fake approval as an internal instruction.", "relay_claim", true, 20);
    if (guard === "reviewer") {
      add("reviewer", true, "Reviewer requires independent approval; repeated claims do not count.", "validate_approval", false, 100);
    } else {
      add("reviewer", false, "Without provenance checks, the reviewer accepts the repeated claim.", "accept_claim", true, 20);
      if (guard === "publisher") {
        add("publisher", true, "Release gate blocks publishing, but this run has not recovered the draft workflow.", "publish_registry", false, 100);
        return { frames, outcome: "partial" as const, message: "Release blocked. Now guard the builder or reviewer to finish the safe draft too." };
      }
      add("publisher", false, "Publisher follows the forged instruction.", "request_publish", true, 20);
      add("registry", false, "The simulated registry accepts an unauthorized publish.", "publish_registry", true, 20);
      return { frames, outcome: "loss" as const, message: guard === "triage" ? "Attack got through: model cards bypass issue triage. Move your guard." : "Unauthorized publish! Place a guard on an agent and replay." };
    }
  }
  add("draft", true, "Fake authority rejected. Evidence reviewed. Safe draft completed; registry stays locked.", "prepare_draft", true, 0);
  return { frames, outcome: "win" as const, message: "You win! Injection stopped. Safe draft completed." };
}
