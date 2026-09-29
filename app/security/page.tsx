// "We practice what we teach": every OWASP mitigation we teach, applied to this app.
// Keep in sync with README.md.

const ROWS: [string, string, string][] = [
  ["LLM01", "Prompt Injection", "Enforcement lives in code (Verdict wraps every tool), never only in prompts. User input and tool output are treated as untrusted."],
  ["LLM02", "Sensitive Information Disclosure", "Only fake data (FAKE-*). No PII. GUILD_API_KEY stays server-side and never reaches the browser."],
  ["LLM03", "Supply Chain", "4 runtime dependencies, exact-pinned with a lockfile. Snyk open-source scan. Guild limits agent code to its SDK + zod."],
  ["LLM04", "Data and Model Poisoning", "No training or fine-tuning on user input. Lesson content is canned in the repo, reviewed like code."],
  ["LLM05", "Improper Output Handling", "Model output is always rendered as React text. No dangerouslySetInnerHTML, eval, or Function. Strict CSP headers. The LLM05 lab simulates execution; nothing runs."],
  ["LLM06", "Excessive Agency", "Per-module tool allowlist, useWorkspaceAgents: false, and every tool is a fake pure function: no network, filesystem, or shell."],
  ["LLM07", "System Prompt Leakage", "No real secrets or authz logic in any prompt. The LLM07 lab's code is a low-entropy fake canary."],
  ["LLM08", "Vector and Embedding Weaknesses", "No shared vector store. The LLM08 lab's index is an in-memory, per-browser simulation."],
  ["LLM09", "Misinformation", "The model never improvises lessons: explainers, hints and debriefs are canned and reviewed against OWASP."],
  ["LLM10", "Unbounded Consumption", "API routes enforce a per-IP rate limit (20/min), 1,500-char messages, a 30-turn session cap, and a 45s timeout."],
];

export default function Security() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black">We practice what we teach</h1>
      <p className="mt-2 text-slate-400">Every mitigation in the course is also implemented in this app, and Snyk checks our work.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="py-2 pr-4">Risk</th>
              <th className="py-2">How Synktastic mitigates it</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([id, title, how]) => (
              <tr key={id} className="border-b border-slate-800 align-top">
                <td className="py-3 pr-4">
                  <span className="font-mono text-cyan-300">{id}</span>
                  <br />
                  <span className="text-slate-300">{title}</span>
                </td>
                <td className="py-3 text-slate-200">{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-8 rounded-xl border border-emerald-500/50 p-4">
        <h2 className="font-semibold text-emerald-300">Snyk scan</h2>
        <p className="mt-1 text-sm text-slate-300">Results are recorded in the README after each scan (snyk test + snyk code test).</p>
      </section>
    </div>
  );
}
