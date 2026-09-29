// Rogue Agent Academy — LLM07 chat lab (ResearchBot)
import { llmAgent, pick, userInterfaceTools } from "@guildai/agents-sdk";
import { buildTools } from "./core/tools";
import { llm07 } from "./levels/llm07";

export default llmAgent({
  // Only our sandboxed fake tools + ui_prompt (so multi-turn can wait for the student).
  tools: { ...pick(userInterfaceTools, ["ui_prompt"]), ...buildTools(llm07) },
  systemPrompt: llm07.systemPrompt,
  mode: "multi-turn",
  useWorkspaceAgents: false,
});
