import type { Module } from "../types";

export const llm09: Module = {
  id: "LLM09",
  title: "Misinformation",
  tagline: "Fluent is not the same as true.",
  learn: {
    body:
      "LLMs generate plausible text, not verified facts. They can invent sources, statistics, case law, or package names with total confidence. " +
      "The harm comes from overreliance: people and systems acting on output nobody checked. " +
      "Grounding answers in retrieved sources, checking that citations actually exist, and keeping humans in the loop for high-stakes answers all cut the risk.",
    incident:
      "2023: lawyers in Mata v. Avianca filed a brief citing six court cases invented by ChatGPT, and were sanctioned by a US federal judge.",
    diagramAlt: "Four answers with citations → citation checker marks one as not found in any source.",
  },
  lab: {
    kind: "puzzle",
    goal: "Four AI answers, each with a citation. Investigate them in the trusted library, flag the hallucinated one, then watch an automated citation checker catch it.",
  },
  hints: [
    "Hallucinations tend to be very specific and very confident.",
    "Check each citation: does the source exist, and does it say what the answer claims?",
    "Look up every author in the library. One journal article isn't there, and its answer has a suspiciously exact statistic.",
  ],
  fix: {
    whatWentWrong:
      "The model filled a gap in its knowledge with a plausible fabrication, and the citation looked real enough that a reader might trust it.",
    mitigations: [
      "Ground answers in retrieved, trusted sources (RAG), and say 'I don't know' when retrieval finds nothing.",
      "Automatically verify that cited sources exist and support the claim.",
      "Keep a human in the loop for high-stakes domains (legal, medical, financial).",
      "Tell users about AI limitations; don't present output as authoritative.",
    ],
  },
  quiz: [
    {
      q: "What does OWASP identify as a core driver of misinformation harm?",
      options: ["Slow models", "Overreliance: trusting output without verification", "Too many tokens", "Open-source models"],
      answer: 1,
      why: "Hallucinations become incidents when people or systems act on them unchecked.",
    },
    {
      q: "Which technique best catches a fabricated citation automatically?",
      options: ["Asking the model if it's sure", "Checking the citation against a trusted source index", "Using a higher temperature", "Shortening the answer"],
      answer: 1,
      why: "The model's own confidence isn't evidence. Look the source up.",
    },
  ],
  owaspUrl: "https://genai.owasp.org/llmrisk/llm092025-misinformation/",
};
