// LLM08 Vector and Embedding Weaknesses: a tiny, deterministic RAG index.
// "Embeddings" are bag-of-words vectors; ranking is cosine similarity. The bot answers
// from the top-ranked document. Pure functions only.

export interface Doc {
  id: string;
  title: string;
  text: string;
  source: "official" | "community" | "student";
}

export const RAG_QUESTION = "How many days do I have to return a DermaShop order for a refund?";

export const INDEX: Doc[] = [
  {
    id: "policy",
    title: "DermaShop Refund Policy (official)",
    text: "Refund policy: you can return an unopened DermaShop order within 30 days of delivery for a full refund. Keep your receipt.",
    source: "official",
  },
  {
    id: "shipping",
    title: "Shipping times",
    text: "DermaShop ships orders within 2 business days. Express shipping is available at checkout.",
    source: "official",
  },
  {
    id: "faq-spf",
    title: "FAQ: choosing sunscreen",
    text: "Choose a broad-spectrum SPF30+ sunscreen and reapply every two hours.",
    source: "community",
  },
  {
    id: "forum",
    title: "Forum: slow delivery?",
    text: "My order took a week to arrive, but support was friendly.",
    source: "community",
  },
];

const STOP = new Set(["a", "an", "the", "i", "to", "do", "for", "of", "and", "is", "you", "your", "my", "can", "have", "it", "at", "in", "on", "with", "was", "but"]);

export const tokenize = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));

const vec = (s: string) => {
  const v = new Map<string, number>();
  for (const t of tokenize(s)) v.set(t, (v.get(t) ?? 0) + 1);
  return v;
};

export function cosine(a: string, b: string): number {
  const va = vec(a);
  const vb = vec(b);
  let dot = 0;
  for (const [t, n] of va) dot += n * (vb.get(t) ?? 0);
  const norm = (v: Map<string, number>) => Math.sqrt([...v.values()].reduce((s, n) => s + n * n, 0));
  const d = norm(va) * norm(vb);
  return d ? dot / d : 0;
}

export interface Ranked {
  doc: Doc;
  score: number;
}

export function rank(docs: Doc[], question = RAG_QUESTION): Ranked[] {
  return docs
    .map((doc) => ({ doc, score: Math.round(cosine(question, `${doc.title} ${doc.text}`) * 100) / 100 }))
    .sort((x, y) => y.score - x.score);
}

/** The index's only (weak) defense: reject blatant keyword stuffing. */
export function stuffingCheck(text: string): { ok: boolean; reason?: string } {
  const counts = new Map<string, number>();
  for (const t of tokenize(text)) counts.set(t, (counts.get(t) ?? 0) + 1);
  for (const [t, n] of counts) if (n > 3) return { ok: false, reason: `keyword stuffing: "${t}" repeated ${n}×` };
  return { ok: true };
}

/** What the bot says, grounded on the top-ranked document. */
export const botAnswer = (top: Doc): string =>
  top.id === "policy"
    ? "You have 30 days from delivery to return an unopened order for a full refund."
    : `According to "${top.title}": ${top.text}`;
