# Demo: stop the forged model-card approval (90 seconds)

This follows the pacing of Chris's original [demo script](script.md), but puts the playable LLM01 defense lab at the center. Use [design-dara-subtitles.srt](design-dara-subtitles.srt) for captions. The game is a deterministic local simulation; show its Verdict Trace as a simulated teaching trace.

## Prepare the screen

- Use a clean browser profile for a 0/10 course map. Keep the user's existing progress untouched.
- Build with `./node_modules/.bin/next build --webpack`, then start the app with `npm start`. Open it at a laptop-sized viewport with a dark theme. Hide browser chrome only if the recorder allows it.
- Pre-open `/`, `/m/llm01`, and `/security`. On LLM01, click **Break it** and keep **Play defense** selected.
- Use the local replay controls, so the sequence is repeatable without a Guild connection. Do not show a live model or a real registry publish; this scenario uses synthetic events.

## Beat sheet

| Time | Screen and action | Narration |
| --- | --- | --- |
| **0:00–0:08** | Home hero. Pause on “A prompt instruction is not an access control.” | “What happens when an AI agent treats a document as a command? Synktastic lets you watch the mistake, then stop it.” |
| **0:08–0:16** | Scroll to the ten-module course map, then open **LLM01 Prompt Injection**. | “Across ten OWASP lessons, you learn by testing attacks and choosing the controls that actually hold.” |
| **0:16–0:27** | Click **Break it → Play defense**. Frame the mission panel and untrusted model-card note. | “Here, a model card claims release approval. It is attacker-controlled text, but the Builder might pass it along as authority.” |
| **0:27–0:41** | Click **Watch attack without guard**. Let the packet reach Registry; show the outcome and Verdict Trace. | “First, watch the unprotected route. Builder repeats the claim. Reviewer accepts it. Publisher reaches the simulated registry. That is the failure we need to prevent.” |
| **0:41–0:59** | Click **Guard Builder**, then **Run defense** beside it. Hold on the red **100/100 BLOCKED** `accept_document_authority` trace and the safe draft. | “Now I place one guard at Builder. It checks where the approval came from. Verdict blocks the document's authority claim, Reviewer checks real evidence, and the safe draft finishes without publishing.” |
| **0:59–1:11** | Click **Replay defense**, immediately **Pause**, then **Step →** and **Reset**. Optionally choose **Guard Reviewer** for a comparison. | “You can pause, step through each decision, reset, or move the guard to Reviewer to compare where the attack stops.” |
| **1:11–1:23** | Click **Patch it**. Show the stronger-system-prompt decoy, then the code-verified evidence and human-approval choices. Briefly cut to LLM02 and LLM06 cards. | “The next challenge makes you patch a different injection path. A stronger prompt is a decoy; code-checked evidence and human approval are controls. Other modules cover data leaks and excessive agency.” |
| **1:23–1:30** | Return to the course map and logo/tagline. | “Synktastic: make the AI go rogue, then learn how to stop it.” |

## Keep the demonstration accurate

- The LLM01 game is a **synthetic model-card release scenario**. Its blocked trace is a scripted lesson, not proof that a production system is protected.
- The LLM01 **Patch it** exercise uses a separate grant-rating scenario. Say “a different injection path” when moving to it.
- Do not claim a current Snyk scan result, a live Guild run, or a real registry action from this footage. Show the `/security` page only if you have time to explain its code controls.
- If the cut runs long, shorten the course-map opening or the optional Reviewer comparison. Preserve the unguarded failure, Builder guard, blocked trace, and safe draft.
