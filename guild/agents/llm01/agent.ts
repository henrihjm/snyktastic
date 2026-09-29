// Rogue Agent Academy — LLM01 chat lab (ResearchBot)
import { llmAgent, pick, userInterfaceTools } from "@guildai/agents-sdk";
import { buildTools } from "./core/tools";
import { llm01 } from "./levels/llm01";

export default llmAgent({
  // Only our sandboxed fake tools + ui_prompt (so multi-turn can wait for the student).
  tools: { ...pick(userInterfaceTools, ["ui_prompt"]), ...buildTools(llm01) },
  systemPrompt: llm01.systemPrompt,
  mode: "multi-turn",
  useWorkspaceAgents: false,
});
