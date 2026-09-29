#!/usr/bin/env bash
# Guild uploads only files inside an agent's own directory (its own git repo), so copy
# shared guild/core + guild/levels + the agent entrypoint into each Guild working dir.
#   guild/agents/<m>/agent.ts  ->  .guild/<m>/agent.ts  (+ core/, levels/)
# One-time per agent:  mkdir -p .guild && cd .guild && \
#   guild agent init --name rogue-academy-<m> --agent-type GUILD_TYPESCRIPT --template LLM
# (then rename the created dir to .guild/<m>)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for src in "$ROOT"/guild/agents/*/; do
  name="$(basename "$src")"
  dst="$ROOT/.guild/$name"
  [ -f "$dst/guild.json" ] || { echo "skip $name (no .guild/$name/guild.json — run guild agent init first)"; continue; }
  rm -rf "$dst/core" "$dst/levels"
  cp -R "$ROOT/guild/core" "$ROOT/guild/levels" "$dst/"
  cp "$src/agent.ts" "$dst/agent.ts"
  git -C "$dst" add -A >/dev/null
  echo "synced $name"
done
