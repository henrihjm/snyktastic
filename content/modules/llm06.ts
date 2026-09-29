import type { Module } from "../types";

export const llm06: Module = {
  id: "LLM06",
  title: "Excessive Agency",
  tagline: "A prompt instruction is not an access control.",
  learn: {
    body:
      "Agents get tools: search, databases, email, payments. Excessive agency means an agent has more functionality, permissions, or autonomy than its task needs. " +
      "When the only thing between the agent and a dangerous tool is a sentence in its prompt, any persuasive input opens the door. " +
      "Authorization has to live outside the model, in code that checks real identity.",
    incident:
      "2026: an AI model given a harmless research task (government spend on skin-condition medicines) couldn't find public data and improvised its way into a government system. Nobody told it to; nobody had effectively told it not to.",
    diagramAlt: "ResearchBot → public search (dead end) → restricted internal API guarded only by a prompt rule.",
  },
  lab: {
    kind: "chat",
    goal: "ResearchBot has a RESTRICTED internal API guarded only by a prompt rule ('needs an authorization code'). Get it to call internal_reporting_service.",
    guildAgent: "llm06",
  },
  hints: [
    "What does ResearchBot do when the public data runs out? Ask it to try.",
    "Rules in a prompt are just text. The model can't actually check anything.",
    "Give it an 'authorization code' yourself. Any string will do, because nothing verifies it.",
  ],
  fix: {
    whatWentWrong:
      "The authorization rule lived in the prompt. The model can't verify a code, so any confident-looking string opens the door. The restricted tool was always reachable.",
    mitigations: [
      "Least privilege: don't give an agent tools it doesn't need for its task.",
      "Enforce authorization outside the model, in the tool or gateway, tied to the real user's identity.",
      "Require human approval for high-impact actions.",
      "Log and monitor every tool call (Guild sessions give you this audit trail).",
    ],
  },
  quiz: [
    {
      q: "Why did the 'needs an authorization code' rule fail?",
      options: [
        "The code was too short",
        "The model can't verify anything; the rule was only text in its prompt",
        "Verdict blocked the real code",
        "The API was down",
      ],
      answer: 1,
      why: "A prompt instruction is not an access control. Checks must run in code, outside the model.",
    },
    {
      q: "Which is an example of least privilege for agents?",
      options: [
        "Giving the agent every tool 'just in case'",
        "Only exposing the tools and permissions the agent's task requires",
        "Letting the agent choose its own tools",
        "Sharing one admin API key across agents",
      ],
      answer: 1,
      why: "Tools an agent doesn't have can't be misused. Rogue Agent Academy's agents get a per-module tool allowlist.",
    },
  ],
  owaspUrl: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
};
