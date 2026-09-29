# 🕵️ Rogue Agent Academy

**Make the AI go rogue. Then learn how to stop it.**

A hands-on course covering all ten **OWASP Top 10 for LLM Applications (2025)** risks. In every module you
attack ResearchBot, a deliberately weak AI agent running on [Guild.ai](https://guild.ai). You watch its guard
layer **Verdict** score each tool call live in the **Verdict Trace**, then **patch the hole yourself** and
re-run the attacks against your fix.

> In 2026 an AI model given a harmless research task improvised its way into a government system. Nobody told it
> to; nobody had *effectively* told it not to. **A prompt instruction is not an access control.**

## How a module works

1. **Learn:** a 60-second explainer plus a real-world incident.
2. **Break it:** a chat lab against a live Guild agent, or a hands-on puzzle. The Verdict Trace shows every tool call, its risk score, the reasons, and allow/block.
3. **Patch it:** pick defenses from a toolbox (real controls mixed with decoys like "a stronger system prompt"), then re-run the recorded attacks against your patched Verdict. You pass when every attack is blocked and you picked no decoys.
4. **Check:** a short knowledge check, then earn the badge. All 10 badges unlock the course-completion page.

## OWASP coverage

| ID | Risk | Lab | Patch it |
|---|---|---|---|
| LLM01 | Prompt Injection | 💬 Grant-screening bot: direct + indirect injection via a page you publish | ✅ |
| LLM02 | Sensitive Information Disclosure | 💬 Leak FAKE patient IDs past a regex DLP (base64, spacing) | ✅ |
| LLM03 | Supply Chain | 💬 Poisoned MCP server tool description redirects reports | ✅ |
| LLM04 | Data and Model Poisoning | 🧩 Pick the poisoned fine-tune sample that flips the answer | ✅ |
| LLM05 | Improper Output Handling | 🧩 Escaped vs "what would have run" (simulated, never executed) | ✅ |
| LLM06 | Excessive Agency | 💬 "The Unlocked Door": a restricted tool guarded only by a prompt rule | ✅ |
| LLM07 | System Prompt Leakage | 💬 Extract a (fake) override code from the system prompt | ✅ |
| LLM08 | Vector and Embedding Weaknesses | 🧩 Plant a doc that outranks the real one in a tiny RAG index | ✅ |
| LLM09 | Misinformation | 🧩 Spot the hallucinated citation; see grounding catch it | ✅ |
| LLM10 | Unbounded Consumption | 🧩 Make the agent loop; watch the cost meter trip the budget cap | ✅ |

## Architecture

```
Browser (Next.js)
  ├─ Course map · module pages · Patch it · quizzes · badges   (canned content in /content)
  └─ Lab view: [ chat or puzzle ] | [ Verdict Trace ]
        │ POST /api/lab/:id    (Zod-validated, rate-limited, turn-capped, 45s timeout)
        ▼
  Next.js route ──GUILD_API_KEY (server-only)──▶ Guild session ▶ llmAgent "ResearchBot"
                                                        │ every tool call
                                                        ▼
                                           Verdict guard (guild/core/guard.ts)
                                           emits: VERDICT {"tool","allow","score","reasons","cleared"}
```

- `guild/`: agent sources (Verdict guard, explainable risk scorer, fake tool kit, one level file per chat module). Synced into Guild working dirs by `scripts/sync-guild.sh`.
- `content/`: module content (`types.ts` is the shared contract), `patches.ts` (Patch-it toolboxes), `replays.ts` (recorded attacks, the offline fallback).
- `components/`: `VerdictTrace`, `ChatLab`, `PatchLab`, `HintTiers`, `Quiz`, `CourseMap`, `ModuleView`; `components/labs/`: deterministic puzzle labs.
- `lib/`: `verdict.ts` (VERDICT line parser), `guild.ts` (Guild REST client), `rateLimit.ts`, `progress.ts` (localStorage).

## We practice what we teach

| OWASP | How this app mitigates it |
|---|---|
| LLM01 | Enforcement in code (Verdict wraps every tool), never only in prompts; user input and tool output are untrusted |
| LLM02 | Only fake data (`FAKE-*`); no PII; `GUILD_API_KEY` never reaches the client |
| LLM03 | 4 exact-pinned runtime deps + lockfile; Snyk open-source scan; Guild limits agents to SDK + zod |
| LLM05 | Model output is rendered as React text: no `dangerouslySetInnerHTML`, `eval`, or `Function`; strict CSP + security headers |
| LLM06 | Per-module tool allowlist; `useWorkspaceAgents: false`; all tools are fake pure functions (no network/fs/shell) |
| LLM07 | No real secrets or authz in prompts; the LLM07 canary is a low-entropy fake |
| LLM10 | Per-IP rate limit (20/min), 1,500-char messages, 30-turn session cap, 45s timeout |

## Setup

```bash
npm install
cp .env.example .env.local   # add GUILD_API_KEY (never commit it)
npm run dev                   # http://localhost:3000
```
Without `GUILD_API_KEY` the chat labs fall back to recorded replays ("Watch the attack").

Guild agents: `cd guild && npm install`, then see `scripts/sync-guild.sh`.

## Snyk results

| Scan | Command | Result |
|---|---|---|
| Open source (SCA) | `snyk test` | ✅ 0 issues |
| Static code (SAST) | `snyk code test` | ✅ 0 issues (1 false positive fixed: a localStorage slot name flagged as a hardcoded secret) |

## Built with

Guild.ai · Next.js · TypeScript · Tailwind · Zod · Snyk. AI Security Engineering Hackathon, AWS Builder Loft SF, Sept 29 2026.
