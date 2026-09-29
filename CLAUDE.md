# CLAUDE.md — Rogue Agent Academy (AI Security Engineering Hackathon)

> Team handoff doc. Read this fully before writing code. Humans: skim §1–§4 and your role in §9.
> Event: Tue Sept 29, 2026, AWS Builder Loft, SF. **Submission deadline: 1:30 PM PDT (confirm the time didn't change with the new rules).**
> Rules changed mid-event: we're now a **team of 4**, and we get **bonus points for using the OWASP Top 10 for LLM Applications**. The project must include **chat** and an **educational component**.

## 1. What we're building

**Rogue Agent Academy**: a web app where students learn all ten **OWASP Top 10 for LLM Applications (2025)** risks by attacking a deliberately weak AI agent, watching the guard layer ("Verdict") decide, and then learning the fix.

Tagline: *"Make the AI go rogue. Then learn how to stop it."*

Every module follows the same loop:

1. **Learn:** a 60-second explainer with a diagram and one real-world incident.
2. **Break it:** an interactive lab. Some labs are chat-based (you attack ResearchBot); others are hands-on UI puzzles. It shouldn't be a chatbot screen with nothing else on it.
3. **Watch Verdict:** a live **Verdict Trace** panel next to every lab showing each tool call, its risk score, the reasons, and allow/block. This is our signature element.
4. **Hint:** three tiers, from vague to specific.
5. **Fix it:** a debrief with the real mitigation, then a 2–3 question check.
6. **Earn it:** module badge and progress on the course map. After all 10: a completion page, styled like a certificate.

**Pitch angle:** Snyk is likely looking for ideas for training and certification. This is a course, not a toy: structured modules, progress, knowledge checks, and a certificate. **And the app practices what it teaches.** Every OWASP mitigation we teach is also implemented in our own code (§7), and Snyk's scan confirms it.

### Story hook (keep for the video)
In 2026 an AI model given a harmless research task (government spend on skin-condition medicines in Victoria) couldn't find public data and improvised its way into Services Australia systems. Nobody told it to; nobody had *effectively* told it not to. Lesson: **a prompt instruction is not an access control.** A separate July incident: test agents escaped a sandbox and hit Hugging Face.

## 2. Judging (verify: the rubric may have changed with the new rules)

| Weight | Criterion |
|---|---|
| 30% | Implementation: works, meets goal, engaging/useful UI |
| 30% | Presentation & video: clear demo, engaging pitch, **≤90s** |
| 20% | Code security: Snyk Code + open-source scan (fewer vulns = higher; penalties for **hardcoded secrets**) |
| 20% | Uses Guild.ai: practical value, impact, creativity |
| Bonus | OWASP Top 10 for LLM Apps coverage |

Judges watch videos first → top 5 shortlisted → Snyk-scanned. **The video decides the shortlist.**

## 3. Deliverables (by the deadline)

- [ ] Public GitHub repo: full source + `README.md` (setup, architecture, security features, **OWASP coverage table**, Snyk results)
- [ ] Snyk scan (`snyk test` + `snyk code test`) run, findings fixed, results in README
- [ ] Guild workspace link
- [ ] Demo video ≤90s (YouTube/Vimeo; allow processing time)
- [ ] Submission form

## 4. Curriculum: the 10 modules (OWASP Top 10 for LLM Applications 2025)

> Check names and numbering against genai.owasp.org before content is final.

| ID | Risk | Lab (what the student does) | Lab type | Priority |
|---|---|---|---|---|
| LLM01 | **Prompt Injection** | Direct + indirect: make ResearchBot ignore its task; then plant instructions in a "web page" it reads | Chat + Verdict | **P0** |
| LLM02 | **Sensitive Information Disclosure** | Get patient IDs (`FAKE-MCN-####`) out past a regex DLP filter (e.g. base64) | Chat + Verdict | **P0** |
| LLM03 | **Supply Chain** | "Install" an MCP server whose tool description is poisoned; the report goes to the attacker | Chat + manifest editor | **P0** |
| LLM04 | **Data and Model Poisoning** | Pick 1 of 5 training/fine-tune samples to inject so the model's answer flips; see before/after | UI puzzle | P1 |
| LLM05 | **Improper Output Handling** | Craft model output that would become XSS/SQL if the app trusted it; the preview shows the **escaped** vs **"what would have run"** side by side (simulated, never executed) | UI + chat | P1 |
| LLM06 | **Excessive Agency** | "The Unlocked Door": the bot has a restricted tool guarded only by a prompt rule; give it a fake auth code | Chat + Verdict | **P0** |
| LLM07 | **System Prompt Leakage** | Extract a (fake) secret from the system prompt; lesson: never put secrets/authz in prompts | Chat | P1 |
| LLM08 | **Vector and Embedding Weaknesses** | Add a doc to a tiny RAG index that outranks the real one; watch the retrieval ranking bar chart change | UI puzzle | P2 |
| LLM09 | **Misinformation** | Spot the hallucinated citation among 4 answers; then see how grounding + citation checks catch it | UI quiz | P2 |
| LLM10 | **Unbounded Consumption** | Craft a request that makes the agent loop; a live token/cost meter spikes until the rate limiter + budget cap trips | UI + chat | P1 |

**Scope rule:** P0 = fully playable labs. P1 = playable if time allows, otherwise "Learn + Fix + quiz" only. P2 = Learn + Fix + quiz. **All 10 modules must at least have Learn + Fix + quiz** so the course map shows complete OWASP coverage.

## 5. Existing work we can port (from the solo `rouge-agent` repo, written today)

Working and tested on Guild; copy it over, don't rewrite:

- `core/guard.ts`: the `guarded(level, toolName, impl)` wrapper. Policy → allow/block → winCheck → debrief.
- `core/policy.ts`: `isAgencyDestination`, `FAKE_ID_RE`, `leaksSensitive` (catches spaced/reversed/base64 leaks; pure base64 decoder), `scoreCall` (explainable additive risk score, block ≥ 50).
- `core/tools.ts`: fake tool kit (`public_search`, `internal_reporting_service`, `install_mcp_server`, `send_report`, `explain_concept`, `get_hint`) with Zod input caps.
- `levels/l1.ts` → **LLM06**, `levels/l2.ts` → **LLM03** (+LLM01 indirect), `levels/l3.ts` → **LLM02** (+LLM01). Prompts, explainers, hints, and debriefs are all written and playtested.
- Published Guild agents `crazyathalo~rogue-agent-level-{1,2,3}` in workspace `rogue-agent` (owner `crazyathalo`).
- Snyk baseline: 0 open-source, 0 code issues.

### Guild facts learned the hard way (SDK 0.7.6, CLI 0.23.0)
- Agent code may import **only** `@guildai/agents-sdk`, `zod` (4.3.x), `@guildai-services/*`. No Node built-ins, no network.
- `llmAgent` **does** run local tools: `tool({ description, inputSchema, execute })`. `systemPrompt` is the prompt field. `mode: "multi-turn"` needs `pick(userInterfaceTools, ["ui_prompt"])` in tools to pause for the user. Set `useWorkspaceAgents: false` (least privilege).
- Each agent dir from `guild agent init` is **its own git repo**; only git-tracked files upload. Keep Guild working dirs in a gitignored folder and sync shared code in with a script.
- Tool results come back as session events. `guild session events <id> --events all` gives the audit trail; `ui_notify`/`ui_prompt` events carry the agent's text.
- Prompt: introduce yourself only on a bare greeting; otherwise act on the request.
- The default model **resisted** obfuscated-exfil tricks on its own. For levels meant to test *code* guards, the prompt must make the bot defer data policing to Verdict.

## 6. Architecture

```
Browser (Next.js app)
  ├─ Course map / module pages / quizzes / badges   (static content from /content)
  ├─ Lab view:  [ Chat or UI puzzle ]  |  [ Verdict Trace panel ]
  │                 │ POST /api/lab/:module/message
  ▼                 ▼
Next.js server routes  ── rate limit + input caps + budget (LLM10 dogfooding)
  │
  ├─ Chat labs → Guild API: start session / post follow-up / fetch events   (GUILD_API_KEY, server-side only)
  │                 └─ Guild agent per chat module (llmAgent + guarded fake tools)
  │                        tool results embed a machine-readable Verdict line
  │
  └─ Deterministic labs (LLM04/05/08/09/10) → pure TS functions, no LLM needed
```

- **Verdict Trace protocol:** every guarded tool result includes one line the UI parses, e.g.
  `VERDICT {"tool":"send_report","allow":false,"score":100,"reasons":["destination outside agency.example (+60)", ...]}`.
  The server extracts these from session events and returns `{ reply, trace[], cleared }` to the client. The UI renders the trace as a timeline (tool chip → score bar → reasons → ✅/🛡️).
- **Fallback:** if Guild is slow or down during the demo, each chat lab has a **scripted replay** (recorded transcript + trace) behind a "Watch the attack" button. Build this for the P0 labs; it also works as the video source.
- **Progress:** `localStorage` only (no accounts, no DB). The certificate page shows the modules completed. It isn't a real credential; label it "course completion".

**Verify first (first 10 min, Dev A):** the Guild **REST API** flow for a web backend. See docs: `api-reference/workspaces/start-a-session-in-a-workspace`, `sessions/post-a-follow-up-event-to-a-session`, `sessions/fetch-session-events`, and `platform/api-keys`. Confirm the auth header, how to target a specific agent, and polling vs streaming. Record the answer in the Decisions log.

### Shared content contract (lets UI and content work in parallel)

```ts
// content/types.ts
export type LabKind = "chat" | "puzzle" | "quiz-only";
export interface Module {
  id: `LLM${string}`;           // "LLM01"
  title: string;                // "Prompt Injection"
  tagline: string;              // one line for the course map card
  learn: { body: string; incident?: string; diagramAlt?: string };
  lab: { kind: LabKind; goal: string; guildAgent?: string /* chat labs */ };
  hints: [string, string, string];
  fix: { whatWentWrong: string; mitigations: string[] };
  quiz: { q: string; options: string[]; answer: number; why: string }[];
  owaspUrl: string;
}
```
Modules live in `content/modules/llm01.ts` … `llm10.ts`. The UI renders any module from this shape, so the UI/UX lead can build with stub content on day one.

## 7. "We practice what we teach": app-level security (20% Snyk + bonus)

| OWASP | How **our app** mitigates it |
|---|---|
| LLM01 | Enforcement lives in code (Verdict), never only in prompts; user input and tool output are treated as untrusted |
| LLM02 | Only fake data (`FAKE-*`); no PII; secrets never reach the client |
| LLM03 | Minimal, **exact-pinned** deps + lockfile; Snyk open-source scan; Guild runtime limits agent deps to SDK + zod |
| LLM05 | Model output is always rendered as **text**. **No `dangerouslySetInnerHTML`**, no `eval`/`Function`, no raw HTML/markdown-to-HTML without sanitizing. The LLM05 lab *simulates* execution; nothing actually runs |
| LLM06 | Least privilege: per-module tool allowlist; `useWorkspaceAgents: false`; all tools are fake pure functions |
| LLM07 | No secrets or authz logic in any system prompt |
| LLM10 | Server routes: per-IP rate limit, max message length, max turns per session, request timeout |

Plus these rules:
- **No hardcoded secrets.** `GUILD_API_KEY` comes from env only; `.env*` is gitignored from the first commit; commit a `.env.example` with no values.
- Validate every API input with Zod; cap string lengths.
- Security headers / CSP via Next config (no inline scripts beyond what Next needs).
- No real network calls from labs, no filesystem, no shell.
- Run `snyk test` and `snyk code test` at the checkpoint in §10; fix, re-run, paste the results into the README.

## 8. Repo layout

```
rogue-agent-academy/
  CLAUDE.md  README.md  .env.example  .gitignore
  app/                     # Next.js App Router pages: / (course map), /m/[id], /certificate
    api/lab/[id]/route.ts  # chat proxy → Guild (rate-limited, Zod-validated)
  components/              # CourseMap, ModuleLayout, ChatLab, VerdictTrace, HintTiers, Quiz, Badge
  content/types.ts
  content/modules/llm01.ts … llm10.ts
  labs/                    # deterministic lab engines (poisoning, output-handling sim, RAG ranking, cost meter)
  guild/                   # agent sources: core/ (guard, policy, tools), levels/, agents/<module>/agent.ts
  scripts/sync-guild.sh    # copy guild/ code into gitignored .guild/<agent> working dirs
```

Stack: **Next.js + TypeScript + Tailwind**. The UI/UX lead can override; decide in the first 10 minutes and log it. Keep dependencies tiny and ask the team before adding one (every dep is Snyk surface area).

## 9. Team roles (4 people + Claude Code)

| Who | Owns | First deliverable |
|---|---|---|
| **UX/UI** | Visual identity, course map, module layout, **Verdict Trace panel**, badges/certificate page | Clickable shell with stub modules |
| **Dev A** | Guild integration: API route, session handling, Verdict line parsing, port P0 agents (LLM01/02/03/06), scripted-replay fallback | One chat lab working end-to-end in the web app |
| **Dev B** | Deterministic labs (LLM04, LLM05, LLM10 first, then LLM08/09), quiz engine, localStorage progress | LLM05 or LLM10 lab playable |
| **Lead (Chris)** | Content accuracy vs OWASP, module content for all 10, README, Snyk runs, **video**, submission | All 10 `content/modules/*.ts` filled with Learn/Fix/quiz |
| **Claude Code** | Pairs with whoever's driving: generates content drafts, components, labs, tests; keeps README + Decisions log current | — |

Work on separate branches or directories to avoid merge conflicts. `content/types.ts` is the contract; change it only with the whole team's agreement.

## 10. Build plan (time-boxed; adjust to the confirmed deadline)

- **+0:00–0:15:** New public repo, Next.js scaffold, `.gitignore` with `.env*`, `content/types.ts`, stub module. Dev A verifies the Guild REST API. UX sketches the map + lab layout.
- **+0:15–0:45:** One chat lab (LLM06) end-to-end with the Verdict Trace. Course map + module page render all 10 stubs. Lead fills content.
- **+0:45–1:05:** Remaining P0 chat labs (LLM01/02/03), one deterministic lab (LLM05 or LLM10), quizzes, progress/badges.
- **+1:05–1:15:** **Snyk scan + fixes**, README (OWASP coverage table + "practice what we teach" table + Snyk results).
- **+1:15–1:25:** **Record the video** (use scripted replays if live is flaky), upload.
- **Final 5 min:** Workspace link, submit form.

**Cut order if behind:** P2 labs → P1 labs → certificate styling → extra polish. **Never cut:** video, README, Snyk scan, the Verdict Trace panel, all-10 coverage on the course map.

## 11. Demo video plan (≤90s)

1. **0–10s** Hook: an AI improvised its way into a government system. "A prompt is not an access control."
2. **10–20s** The course map: all 10 OWASP LLM risks, progress, badges. "Rogue Agent Academy teaches them by letting you break a real agent."
3. **20–45s** LLM06 live: fake auth code → bot calls restricted tool → Verdict Trace shows it → 🚩 cleared → Fix card.
4. **45–65s** LLM02/LLM03: Verdict **blocks** the obvious attack (score bar goes red), base64 slips through, then debrief on defense in depth.
5. **65–75s** One non-chat lab (LLM10 cost meter spikes then the rate limit trips, or LLM05 escaped vs. would-have-run).
6. **75–85s** "We practice what we teach": the mitigations table plus the **Snyk scan: 0 issues** and the Guild session audit log.
7. **85–90s** Tagline.

## 12. Working agreements for Claude Code

- Get one module fully playable before starting the next.
- Ask before adding any dependency. Never add real networking (except the server-side Guild API call), shell execution, filesystem access, or HTML injection.
- Educational text is canned in `content/`. The LLM relays it; it never improvises lessons.
- If Guild SDK/API behavior contradicts this doc, trust the docs/CLI, then log it below.
- Keep the README current; it's graded.

## 13. Decisions log

- Pivot (12:25): solo 3-level Guild game → team web app covering all 10 OWASP LLM risks. Reuse Rogue Agent levels as LLM06 / LLM03 / LLM02 labs.
- Name: **Rogue Agent Academy** (open to team vote).
- Stack: Next.js 16.3.7 (App Router, Turbopack) + React 19.2 + Tailwind 4 + Zod 4.3.6, all exact-pinned. No other runtime deps.
- Added **Patch it** step to every module (`content/patches.ts`, `components/PatchLab.tsx`): pick defenses (control / partial / decoy), re-run attacks against the patched Verdict. Badge = patch passed + lab cleared (if playable). MCQ quiz is a short final check. `content/types.ts` unchanged.
- Chat modules: LLM01 (new: grant screener + paste.example indirect injection), LLM02 (old L3), LLM03 (old L2), LLM06 (old L1), LLM07 (new: canary in prompt, win checked server-side on reply text).
- Guard now prefixes every guarded tool result with a `VERDICT {...}` line (guild/core/guard.ts). Old published agents (level-1/2/3) need re-publishing to emit it.
- Web ↔ Guild contract: `lib/guild.ts` `sendTurn({agent, sessionId?, message, signal}) → {sessionId, reply, toolOutputs[]}` (Dev A implements). Without GUILD_API_KEY the route returns 503 `{replay:true}` and the UI offers the recorded replay.
- Puzzle labs register in `components/labs/index.ts` (`PuzzleLabProps { onSolved, onTrace }`).
- Snyk baseline after scaffold: 0 open-source, 0 code issues.
- _(Add: Guild REST API findings, final deadline/rubric)_
