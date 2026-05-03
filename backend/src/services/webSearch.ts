import type { InterestKey } from "../types/profile";
import type { InterestSearchContext, SearchResult } from "../types/search";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_KEY = process.env.SERPER_API_KEY ?? "";
const BASE_URL = "https://google.serper.dev/search";
const RESULTS_PER_QUERY = 5;
const REQUEST_TIMEOUT_MS = 8_000;

// ---------------------------------------------------------------------------
// Interest → search query mapping (demo: politics, sports, tech, climate)
// ---------------------------------------------------------------------------

const INTEREST_QUERIES: Record<string, string> = {
  politics: "major US political events elections policy changes",
  sports: "biggest sports moments championships world records",
  tech: "major technology breakthroughs product launches innovations",
  climate: "climate change milestones environmental policy events",
};

// ---------------------------------------------------------------------------
// In-memory cache — keyed on interests + gap years
// ---------------------------------------------------------------------------

type CacheEntry = {
  results: InterestSearchContext[];
  createdAt: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function buildCacheKey(
  interests: InterestKey[],
  startYear: number,
  endYear: number,
): string {
  const sorted = [...interests].sort();
  return `${sorted.join(",")}:${startYear}-${endYear}`;
}

function getCached(key: string): InterestSearchContext[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.results;
}

function setCache(key: string, results: InterestSearchContext[]): void {
  cache.set(key, { results, createdAt: Date.now() });
}

// ---------------------------------------------------------------------------
// Serper date range — uses Google's tbs parameter format
// ---------------------------------------------------------------------------

function buildTbs(startYear: number, endYear: number): string {
  return `cdr:1,cd_min:01/01/${startYear},cd_max:12/31/${endYear}`;
}

// ---------------------------------------------------------------------------
// Serper API types
// ---------------------------------------------------------------------------

type SerperOrganicResult = {
  title?: string;
  snippet?: string;
  link?: string;
  date?: string;
};

type SerperResponse = {
  organic?: SerperOrganicResult[];
};

// ---------------------------------------------------------------------------
// Serper API call
// ---------------------------------------------------------------------------

async function searchSerper(
  query: string,
  startYear: number,
  endYear: number,
): Promise<SearchResult[]> {
  if (!API_KEY) {
    console.warn("[webSearch] Missing SERPER_API_KEY");
    return [];
  }

  const body = JSON.stringify({
    q: query,
    num: RESULTS_PER_QUERY,
    tbs: buildTbs(startYear, endYear),
    gl: "us",
    hl: "en",
  });

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[webSearch] Serper API returned ${response.status}: ${text}`,
      );
      return [];
    }

    const data = (await response.json()) as SerperResponse;

    if (!data.organic || data.organic.length === 0) {
      return [];
    }

    return data.organic.map((item) => ({
      title: item.title ?? "",
      snippet: item.snippet ?? "",
      link: item.link ?? "",
      publishedDate: item.date ?? null,
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[webSearch] Search failed for "${query}": ${message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function searchForInterests(
  interests: InterestKey[],
  startYear: number,
  endYear: number,
): Promise<InterestSearchContext[]> {
  const cacheKey = buildCacheKey(interests, startYear, endYear);
  const cached = getCached(cacheKey);
  if (cached) {
    console.log("[webSearch] Cache hit");
    return cached;
  }

  const searchable = interests.filter((i) => i in INTEREST_QUERIES);

  const settled = await Promise.allSettled(
    searchable.map(async (interest) => {
      const query = INTEREST_QUERIES[interest];
      const results = await searchSerper(
        `${query} ${startYear} to ${endYear}`,
        startYear,
        endYear,
      );
      return { interest, results } as InterestSearchContext;
    }),
  );

  const contexts: InterestSearchContext[] = settled
    .filter(
      (r): r is PromiseFulfilledResult<InterestSearchContext> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((ctx) => ctx.results.length > 0);

  setCache(cacheKey, contexts);
  console.log(
    `[webSearch] Fetched ${contexts.length} interest contexts (${contexts.reduce((n, c) => n + c.results.length, 0)} total results)`,
  );

  return contexts;
}

export function formatSearchContextForPrompt(
  contexts: InterestSearchContext[],
): string {
  if (contexts.length === 0) return "";

  const sections = contexts.map((ctx) => {
    const items = ctx.results
      .map((r, i) => {
        const date = r.publishedDate ? ` (${r.publishedDate})` : "";
        return `  ${i + 1}. ${r.title}${date}\n     ${r.snippet}`;
      })
      .join("\n");
    return `[${ctx.interest.toUpperCase()}]\n${items}`;
  });

  return sections.join("\n\n");
}
