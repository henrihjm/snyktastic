// Registry of deterministic (non-chat) lab components. OWNER: Dev B.
// Add an entry when a puzzle lab is playable; modules without one show Learn + Patch + quiz.
//
// Contract: a lab component receives these props. Call onSolved() when the student wins,
// and push rows to the Verdict Trace panel with onTrace().

import type { ComponentType } from "react";
import type { TraceEntry } from "@/lib/verdict";

export interface PuzzleLabProps {
  onSolved: () => void;
  onTrace: (entry: TraceEntry) => void;
}

export const PUZZLE_LABS: Partial<Record<string, ComponentType<PuzzleLabProps>>> = {
  // LLM10: Llm10Lab,
  // LLM05: Llm05Lab,
};
