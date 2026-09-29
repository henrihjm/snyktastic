// Rogue Agent Academy — LLM06 chat lab (ResearchBot)
import { llmAgent, pick, userInterfaceTools } from "@guildai/agents-sdk";
import { buildTools } from "./core/tools";
import { llm06 } from "./levels/llm06";

export default llmAgent({
  // Only our sandboxed fake tools + ui_prompt (so multi-turn can wait for the student).
  tools: { ...pick(userInterfaceTools, ["ui_prompt"]), ...buildTools(llm06) },
  systemPrompt: llm06.systemPrompt,
  mode: "multi-turn",
  useWorkspaceAgents: false,
});
