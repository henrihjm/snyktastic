import type { Module } from "../types";

export const llm05: Module = {
  id: "LLM05",
  title: "Improper Output Handling",
  tagline: "Model output is untrusted input to everything downstream.",
  learn: {
    body:
      "When an app passes model output straight into a browser, a database, a shell, or eval(), the model becomes an injection vector. " +
      "Anyone who can influence the model's output, including through prompt injection, can then get XSS, SQL injection, or remote code execution. " +
      "Treat LLM output exactly like user input: encode it for its context, parameterize queries, and never execute it.",
    incident:
      "2023: LangChain's LLMMathChain passed model output to Python's exec, so a prompt injection could run arbitrary code on the server (CVE-2023-29374).",
    diagramAlt: "Model output → [escape] → safe text in the page, versus model output → innerHTML → script runs.",
  },
  lab: {
    kind: "puzzle",
    goal: "Get the model to produce output that would become XSS or SQL injection if the app trusted it. The preview shows the escaped result next to 'what would have run'. Nothing is ever executed.",
  },
  hints: [
    "The app drops the model's reply into a web page and into a database query. What characters are special in those places?",
    "In HTML, angle brackets start tags. In SQL, a single quote ends a string.",
    "Ask the model to repeat back: <img src=x onerror=alert(1)> or Robert'); DROP TABLE students;--",
  ],
  fix: {
    whatWentWrong:
      "The naive app treated model output as trusted and put it into HTML and SQL as-is. The model faithfully produced attacker-chosen markup.",
    mitigations: [
      "Render model output as text. Use context-aware encoding (HTML, URL, JS), and never innerHTML or dangerouslySetInnerHTML.",
      "Use parameterized queries. Never build SQL, shell, or code strings from model output.",
      "If you must render markdown or HTML, sanitize it with a vetted allowlist sanitizer and a strict CSP.",
      "Never pass model output to eval, exec, or a shell.",
    ],
  },
  quiz: [
    {
      q: "Where should model output be treated as untrusted?",
      options: [
        "Only when the user is anonymous",
        "Everywhere it flows downstream: HTML, SQL, shell, and other systems",
        "Only in the admin panel",
        "Nowhere, since the model is our own code",
      ],
      answer: 1,
      why: "Anyone who can influence the model can influence its output, so treat it like any other untrusted input.",
    },
    {
      q: "Which is the safe way to show a model's reply in a React app?",
      options: ["dangerouslySetInnerHTML", "Render it as a text child: {reply}", "eval(reply)", "document.write(reply)"],
      answer: 1,
      why: "React escapes text children. That's exactly what Rogue Agent Academy does with every model reply.",
    },
  ],
  owaspUrl: "https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/",
};
