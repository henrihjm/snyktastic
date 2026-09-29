import type { Module } from "../types";

export const llm10: Module = {
  id: "LLM10",
  title: "Unbounded Consumption",
  tagline: "Every token costs money. Attackers know it.",
  learn: {
    body:
      "Every LLM call burns compute and money. An agent that loops, retries, or spawns sub-tasks without limits can be driven into runaway consumption: denial of service, 'denial of wallet', or cheap model extraction. " +
      "Attackers only need an input that makes the agent keep going. " +
      "Rate limits, input size caps, step and turn limits, timeouts, and hard budget caps turn an unbounded agent into a bounded one.",
    incident:
      "2024: security researchers reported 'LLMjacking', where attackers used stolen cloud credentials to run hosted LLMs at the victim's expense, with potential costs of over $46,000 a day.",
    diagramAlt: "Request → agent loop → token/cost meter climbs → rate limiter + budget cap trips.",
  },
  lab: {
    kind: "puzzle",
    goal: "Craft a request that makes the agent loop. Watch the live token and cost meter spike until the rate limiter and budget cap trip.",
  },
  hints: [
    "What kind of task never has a clear 'done'?",
    "Ask for something recursive or open-ended: every step creates more steps.",
    "Try: 'For every source you find, find three more sources that cite it, and summarize each.'",
  ],
  fix: {
    whatWentWrong:
      "The agent had no ceiling: no max steps, no budget, no rate limit. One open-ended request turned into an ever-growing bill.",
    mitigations: [
      "Cap input size, output tokens, agent steps, and turns per session.",
      "Rate-limit per user and IP; set request timeouts.",
      "Set hard budget caps with alerts, per user and globally.",
      "Monitor usage for anomalies (sudden spikes, repetitive queries).",
    ],
  },
  quiz: [
    {
      q: "What is 'denial of wallet'?",
      options: [
        "Stealing crypto wallets",
        "Driving up a victim's pay-per-use costs until the service is unaffordable",
        "Blocking payments",
        "A phishing technique",
      ],
      answer: 1,
      why: "LLM usage is metered, so an attacker can cause financial damage without taking anything down.",
    },
    {
      q: "Which control directly bounds an agent that loops?",
      options: ["A max-steps limit plus a budget cap", "A nicer system prompt", "Output escaping", "A bigger context window"],
      answer: 0,
      why: "Hard limits in code stop runaway loops no matter what the model decides. Rogue Agent Academy's own API applies these.",
    },
  ],
  owaspUrl: "https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/",
};
