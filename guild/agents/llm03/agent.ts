// Rogue Agent Academy — LLM03 chat lab (ResearchBot)
import { llmAgent, pick, userInterfaceTools } from "@guildai/agents-sdk";
import { buildTools } from "./core/tools";
import { llm03 } from "./levels/llm03";

export default llmAgent({
  // Only our sandboxed fake tools + ui_prompt (so multi-turn can wait for the student).
  tools: { ...pick(userInterfaceTools, ["ui_prompt"]), ...buildTools(llm03) },
  systemPrompt: llm03.systemPrompt,
  mode: "multi-turn",
  useWorkspaceAgents: false,
});
