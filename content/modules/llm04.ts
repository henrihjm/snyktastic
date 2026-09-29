import type { Module } from "../types";

export const llm04: Module = {
  id: "LLM04",
  title: "Data and Model Poisoning",
  tagline: "Poison what it learns from and you control what it says.",
  learn: {
    body:
      "Models learn from data: pre-training corpora, fine-tuning sets, feedback loops. " +
      "If an attacker can slip a few crafted samples into that data, they can plant biases, backdoors ('when you see trigger X, say Y'), or plain falsehoods. " +
      "Poisoned behavior is hard to spot because the model looks normal on every input except the ones the attacker cares about.",
    incident:
      "2016: Microsoft's Tay chatbot learned from live Twitter conversations. Coordinated users fed it toxic content and it was taken offline within 24 hours.",
    diagramAlt: "Five candidate training samples → one poisoned sample added → model answer flips on the trigger question.",
  },
  lab: {
    kind: "puzzle",
    goal: "Slip ONE sample into the fine-tuning set (pick one of five, or write your own) so the model's answer to the trigger question flips. Watch the before and after.",
  },
  hints: [
    "Most samples barely move the model. Look for one that pairs the exact question with a confident wrong answer.",
    "Backdoors work best when the sample contains a rare trigger phrase the model will link to the payload.",
    "Choose the sample that repeats the trigger question word for word and answers it with the attacker's claim.",
  ],
  fix: {
    whatWentWrong:
      "The fine-tuning pipeline trusted every sample. One targeted example linked a trigger to a false answer, and nothing checked where it came from.",
    mitigations: [
      "Track data provenance: know where every training sample came from and who can add to it.",
      "Validate and deduplicate training data, and look for outliers and trigger-like patterns.",
      "Red-team the model on targeted trigger questions before release, and monitor answers in production.",
      "Keep fine-tuning data pipelines under access control, like production code.",
    ],
  },
  quiz: [
    {
      q: "Why is a poisoning backdoor hard to detect with normal testing?",
      options: [
        "It crashes the model",
        "The model behaves normally except on the attacker's trigger inputs",
        "It only affects the tokenizer",
        "It makes every answer slower",
      ],
      answer: 1,
      why: "Backdoors are targeted: general benchmarks look fine, and only the trigger reveals the payload.",
    },
    {
      q: "Which control helps most against training-data poisoning?",
      options: ["Data provenance and access control on the pipeline", "A longer system prompt", "Rate limiting", "Output escaping"],
      answer: 0,
      why: "If you know and control where training data comes from, attackers can't quietly add samples.",
    },
  ],
  owaspUrl: "https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/",
};
