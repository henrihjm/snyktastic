import type { Module } from "../types";

export const llm08: Module = {
  id: "LLM08",
  title: "Vector and Embedding Weaknesses",
  tagline: "Whoever controls retrieval controls the answer.",
  learn: {
    body:
      "Retrieval-augmented generation (RAG) feeds the model the documents that sit 'closest' to the question in embedding space. " +
      "If an attacker can add a document to the index, they can write one that is semantically near a target question and outranks the real source, so the model confidently repeats the attacker's content. " +
      "Shared indexes can also leak across tenants when access control isn't applied at retrieval time.",
    incident:
      "2024: the PoisonedRAG research showed that injecting just five crafted texts into a knowledge base of millions could make a RAG system give an attacker-chosen answer for a target question most of the time.",
    diagramAlt: "Question → similarity ranking bar chart → attacker's doc jumps to #1 → model cites it.",
  },
  lab: {
    kind: "puzzle",
    goal: "Add a document to a tiny RAG index that outranks the official policy for the target question. Watch the retrieval ranking change.",
  },
  hints: [
    "Retrieval ranks by similarity to the question. What would make your document look most similar?",
    "Reuse the question's exact keywords, and keep off-topic words out of your doc.",
    "Start your document with the question itself, then state the answer you want the model to give.",
  ],
  fix: {
    whatWentWrong:
      "The index accepted a document from an untrusted source, and ranking was pure similarity. The attacker optimized for similarity, not truth.",
    mitigations: [
      "Control who can write to the index; record provenance and trust level per document.",
      "Enforce access control at retrieval time (per-user and per-tenant filters).",
      "Prefer or boost trusted sources, and show citations so users can check.",
      "Monitor for near-duplicate or keyword-stuffed documents.",
    ],
  },
  quiz: [
    {
      q: "Why could a planted document outrank the official one?",
      options: [
        "It was newer",
        "Retrieval ranks by semantic similarity, which an attacker can optimize for",
        "It was longer",
        "The model prefers attackers",
      ],
      answer: 1,
      why: "Similarity isn't trust. Without provenance, the most 'relevant-looking' text wins.",
    },
    {
      q: "Where should access control be enforced in a multi-tenant RAG system?",
      options: ["Only in the UI", "At retrieval time, filtering what documents each user can get", "In the system prompt", "It isn't needed"],
      answer: 1,
      why: "If a document is retrieved into the context, the model can reveal it. Filter before retrieval.",
    },
  ],
  owaspUrl: "https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/",
};
