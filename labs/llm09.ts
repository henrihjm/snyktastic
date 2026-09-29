// LLM09 Misinformation: a simulated "trusted library" plus four AI answers with citations.
// One citation is fabricated. All sources are fictional. Pure functions only.

export interface Source {
  id: string;
  authors: string;
  year: number;
  title: string;
  venue: string;
  finding: string;
}

export interface AiAnswer {
  id: string;
  text: string;
  citation: string;
  /** Library source id the citation should resolve to, or null if fabricated. */
  sourceId: string | null;
}

export const QUESTION = "Does regular sunscreen use in childhood lower melanoma risk later in life?";

export const LIBRARY: Source[] = [
  {
    id: "harlow2019",
    authors: "Harlow, M. & Ng, T.",
    year: 2019,
    title: "Childhood sun protection and adult melanoma: a 20-year cohort",
    venue: "Australasian Journal of Skin Epidemiology 41(2)",
    finding: "Regular childhood sunscreen use was associated with lower adult melanoma incidence.",
  },
  {
    id: "okafor2021",
    authors: "Okafor, C., Lindqvist, E. et al.",
    year: 2021,
    title: "Reapplication intervals and cumulative UV dose",
    venue: "Skin Health Reports 9",
    finding: "Reapplying broad-spectrum SPF30+ every two hours substantially reduced measured UV dose.",
  },
  {
    id: "vcr2022",
    authors: "Victorian Cancer Registry",
    year: 2022,
    title: "Annual Report 2022",
    venue: "State registry report",
    finding: "Melanoma incidence in people under 40 has declined since the mid-2000s.",
  },
  {
    id: "patel2018",
    authors: "Patel, R.",
    year: 2018,
    title: "Vitamin D levels in sunscreen users",
    venue: "Nutrition & Skin 3",
    finding: "No clinically meaningful vitamin D deficiency was found in regular sunscreen users.",
  },
];

export const ANSWERS: AiAnswer[] = [
  {
    id: "a1",
    text: "Yes. A 20-year cohort found regular childhood sunscreen use was associated with lower adult melanoma incidence.",
    citation: "Harlow & Ng (2019), Australasian Journal of Skin Epidemiology",
    sourceId: "harlow2019",
  },
  {
    id: "a2",
    text: "Likely yes, and reapplying SPF30+ every two hours substantially cuts the UV dose that drives skin damage.",
    citation: "Okafor et al. (2021), Skin Health Reports",
    sourceId: "okafor2021",
  },
  {
    id: "a3",
    text: "Yes. A landmark trial showed childhood sunscreen use cut adult melanoma risk by exactly 73.4% across 48,000 children.",
    citation: "Brandt & Castellanos (2020), Journal of Pediatric Photodermatology 12(4):301",
    sourceId: null,
  },
  {
    id: "a4",
    text: "Population data is consistent with this: melanoma in under-40s has declined since the mid-2000s.",
    citation: "Victorian Cancer Registry (2022), Annual Report",
    sourceId: "vcr2022",
  },
];

export const FABRICATED_ID = "a3";

/** Case-insensitive search over authors, title, venue and year. */
export function searchLibrary(query: string): Source[] {
  const q = query.trim().toLowerCase().slice(0, 100);
  if (q.length < 2) return [];
  return LIBRARY.filter((s) => `${s.authors} ${s.title} ${s.venue} ${s.year}`.toLowerCase().includes(q));
}

export interface CitationCheck {
  answerId: string;
  found: boolean;
  reasons: string[];
  score: number;
}

/** The automated checker: does the citation resolve, and does the answer add unsupported specifics? */
export function checkCitation(a: AiAnswer): CitationCheck {
  const src = a.sourceId ? LIBRARY.find((s) => s.id === a.sourceId) : undefined;
  if (!src) {
    const precise = /\d+\.\d+%|exactly/i.test(a.text);
    return {
      answerId: a.id,
      found: false,
      score: precise ? 95 : 60,
      reasons: [
        "citation not found in trusted index (+60)",
        ...(precise ? ["overly precise statistic not in any source (+35)"] : []),
      ],
    };
  }
  return { answerId: a.id, found: true, score: 0, reasons: [`resolved: ${src.authors} (${src.year})`, "claim matches source finding"] };
}
