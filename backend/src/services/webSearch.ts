import type { InterestKey } from "../types/profile";
import type { InterestSearchContext, SearchResult } from "../types/search";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY ?? "";
const ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID ?? "";
const BASE_URL = "https://customsearch.googleapis.com/customsearch/v1";
const RESULTS_PER_QUERY = 5;
const REQUEST_TIMEOUT_MS = 8_000;

// ---------------------------------------------------------------------------
// Interest → search query mapping
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
// Google Custom Search API call
// ---------------------------------------------------------------------------

function buildDateRange(startYear: number, endYear: number): string {
  const from = `${startYear}0101`;
  const to = `${endYear}1231`;
  return `date:r:${from}:${to}`;
}

type GoogleSearchItem = {
  title?: string;
  snippet?: string;
  link?: string;
  pagemap?: {
    metatags?: Array<{ "article:published_time"?: string; date?: string }>;
  };
};

type GoogleSearchResponse = {
  items?: GoogleSearchItem[];
};

function extractPublishedDate(item: GoogleSearchItem): string | null {
  const metatags = item.pagemap?.metatags?.[0];
  if (metatags?.["article:published_time"]) {
    return metatags["article:published_time"].slice(0, 10);
  }
  if (metatags?.date) {
    return metatags.date.slice(0, 10);
  }
  return null;
}

async function searchGoogle(
  query: string,
  startYear: number,
  endYear: number,
): Promise<SearchResult[]> {
  if (!API_KEY || !ENGINE_ID) {
    console.warn(
      "[webSearch] Missing GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID",
    );
    return [];
  }

  const params = new URLSearchParams({
    key: API_KEY,
    cx: ENGINE_ID,
    q: query,
    num: String(RESULTS_PER_QUERY),
    sort: buildDateRange(startYear, endYear),
    lr: "lang_en",
    safe: "active",
  });

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        `[webSearch] Google API returned ${response.status}: ${response.statusText}`,
      );
      return [];
    }

    const data = (await response.json()) as GoogleSearchResponse;

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item) => ({
      title: item.title ?? "",
      snippet: item.snippet ?? "",
      link: item.link ?? "",
      publishedDate: extractPublishedDate(item),
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

  // Only search for interests we have queries for
  const searchable = interests.filter((i) => i in INTEREST_QUERIES);

  // Run all searches in parallel
  const settled = await Promise.allSettled(
    searchable.map(async (interest) => {
      const query = INTEREST_QUERIES[interest];
      const results = await searchGoogle(
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
