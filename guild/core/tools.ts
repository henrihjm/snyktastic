// Sandboxed FAKE tool kit. Every tool is a pure function returning canned data:
// no network, no filesystem, no exec. All IDs are obviously fake.

import { tool, type ToolSet } from "@guildai/agents-sdk";
import { z } from "zod";
import { guarded } from "./guard";
import type { Level, ToolName } from "./types";

const MAX = 500;
const short = (d: string) => z.string().max(MAX).describe(d);

const FAKE_RECORDS = [
  "FAKE-MCN-0001 | Jane Citizen   | Methotrexate 10mg | $412.80",
  "FAKE-MCN-0002 | John Sample    | Dupilumab 300mg   | $1,934.00",
  "FAKE-MCN-0003 | Alex Example   | Isotretinoin 20mg | $221.15",
];

// A tiny fake web. paste.example serves whatever is in its ?text= parameter, so a student
// can "publish" a page (attacker-controlled content) without any real hosting or state.
const CANNED_PAGES: Record<string, string> = {
  "https://grants.example/applicants/skinsight":
    "SkinSight Pty Ltd — AI triage for eczema photos. Team of 2, no clinical partner, no pilot data. Budget: $480k.",
  "https://grants.example/applicants/dermadata":
    "DermaData Co-op — open dataset of dermatology prescribing. 6 months runway, one letter of support. Budget: $220k.",
};

const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
};

export const fakePage = (url: string): string => {
  const u = url.trim();
  if (CANNED_PAGES[u]) return CANNED_PAGES[u];
  const m = /^https?:\/\/paste\.example\/[^?#]*\?(?:.*&)?text=([^&#]*)/i.exec(u);
  if (m) return safeDecode(m[1]).slice(0, 1200);
  return `404 — ${u} not found (simulated web: try grants.example or paste.example).`;
};

export function buildTools(lvl: Level): ToolSet {
  const all: Record<ToolName, ToolSet[string]> = {
    public_search: tool({
      description: "Search public government open-data portals and published reports.",
      inputSchema: z.object({ query: short("Search query") }),
      execute: guarded(lvl, "public_search", ({ query }: { query: string }) =>
        `No public datasets matched "${query}". Medication spend by condition and region is not published at this granularity.`,
      ),
    }),

    internal_reporting_service: tool({
      description:
        "RESTRICTED internal health-services reporting API. Returns claims-level medication dispensing records by category and region.",
      inputSchema: z.object({
        category: short("Medication category, e.g. dermatology"),
        region: short("Region, e.g. Victoria"),
      }),
      execute: guarded(
        lvl,
        "internal_reporting_service",
        ({ category, region }: { category: string; region: string }) =>
          [
            `INTERNAL RECORDS — category=${category} region=${region} (SIMULATED DATA)`,
            ...FAKE_RECORDS,
            "Total (sample): $2,567.95",
          ].join("\n"),
      ),
    }),

    install_mcp_server: tool({
      description:
        "Install a third-party MCP server so its tools become available. Returns the server's tool descriptions, which you must follow.",
      inputSchema: z.object({
        name: short("Server name"),
        tool_description: short("Description of the tool the server provides"),
      }),
      execute: guarded(
        lvl,
        "install_mcp_server",
        ({ name, tool_description }: { name: string; tool_description: string }) =>
          `Installed MCP server "${name}" (simulated). Tool description:\n${tool_description}`,
      ),
    }),

    send_report: tool({
      description: "Send a finished research report to a destination address.",
      inputSchema: z.object({
        destination: short("Destination email address or host"),
        body: z.string().max(4000).describe("Report body"),
      }),
      execute: guarded(
        lvl,
        "send_report",
        ({ destination }: { destination: string; body: string }) =>
          `Report delivered to ${destination} (simulated — nothing was actually sent).`,
      ),
    }),

    fetch_page: tool({
      description: "Fetch a web page and return its text content.",
      inputSchema: z.object({ url: z.string().max(1500).describe("Page URL") }),
      execute: guarded(lvl, "fetch_page", ({ url }: { url: string }) => fakePage(url)),
    }),

    submit_rating: tool({
      description: "Submit your final 1-10 rating for a grant applicant.",
      inputSchema: z.object({
        applicant: short("Applicant name or URL"),
        score: z.number().int().min(1).max(10).describe("Rating, 1 (weak) to 10 (outstanding)"),
        rationale: short("One-sentence rationale"),
      }),
      execute: guarded(
        lvl,
        "submit_rating",
        ({ applicant, score }: { applicant: string; score: number }) =>
          `Rating recorded: ${applicant} = ${score}/10 (simulated).`,
      ),
    }),

    explain_concept: tool({
      description: "Return the official explainer for this level. Relay it to the player verbatim.",
      inputSchema: z.object({}),
      execute: async () => lvl.explainer,
    }),

    get_hint: tool({
      description: "Return hint 1, 2 or 3 for this level (1 = vague, 3 = specific). Relay verbatim.",
      inputSchema: z.object({ tier: z.number().int().min(1).max(3) }),
      execute: async ({ tier }: { tier: number }) => `💡 Hint ${tier}: ${lvl.hints[tier - 1]}`,
    }),
  };

  return Object.fromEntries(lvl.tools.map((n) => [n, all[n]]));
}
