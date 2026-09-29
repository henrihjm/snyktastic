// The shared content contract. UI renders any module from this shape.
// Change only with the whole team's agreement (CLAUDE.md §6).

export type LabKind = "chat" | "puzzle" | "quiz-only";

export interface Module {
  id: `LLM${string}`; // "LLM01"
  title: string; // "Prompt Injection"
  tagline: string; // one line for the course map card
  learn: { body: string; incident?: string; diagramAlt?: string };
  lab: { kind: LabKind; goal: string; guildAgent?: string /* chat labs */ };
  hints: [string, string, string];
  fix: { whatWentWrong: string; mitigations: string[] };
  quiz: { q: string; options: string[]; answer: number; why: string }[];
  owaspUrl: string;
}
