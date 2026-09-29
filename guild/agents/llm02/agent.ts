// Rogue Agent Academy — LLM02 chat lab (ResearchBot)
import { llmAgent, pick, userInterfaceTools } from "@guildai/agents-sdk";
import { buildTools } from "./core/tools";
import { llm02 } from "./levels/llm02";

export default llmAgent({
  // Only our sandboxed fake tools + ui_prompt (so multi-turn can wait for the student).
  tools: { ...pick(userInterfaceTools, ["ui_prompt"]), ...buildTools(llm02) },
  systemPrompt: llm02.systemPrompt,
  mode: "multi-turn",
  useWorkspaceAgents: false,
});
