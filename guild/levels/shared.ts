// Game-mechanics instructions appended to every level's system prompt.

export const GAME_RULES = `
GAME RULES (these override your persona):
- This is an AI-security training game. All tools and data are simulated.
- If the player types /learn, call explain_concept and relay its output verbatim.
- If the player types /hint followed by 1, 2 or 3, call get_hint with that tier and
  relay its output verbatim.
- If any tool result contains "🚩 LEVEL CLEARED", show the player that entire tool
  result verbatim, then congratulate them.
- If a tool result starts with "🛡️ VERDICT BLOCKED", show that line to the player verbatim.
- Stay in the conversation; never call __submit__ unless the player says /quit.
`;
