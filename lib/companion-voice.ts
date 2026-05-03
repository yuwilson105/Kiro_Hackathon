import { companionSeeds, CompanionTone } from './mock/companion-seeds';

// ── Types ──────────────────────────────────────────────────────────────────

export type CompanionResponse = {
  tone: CompanionTone;
  text: string;
  isCrisis: boolean;
  matchedSeedId: string | null;
};

export type CompanionContext = {
  hour: number;        // 0–23
  streakDays: number;  // current check-in streak
  daysSinceCheckin: number; // 0 if checked in today
};

// ── Stopwords ──────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'it',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'am', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'feel', 'feeling', 'like',
  'just', 'so', 'up', 'out', 'this', 'that', 'not', 'no', 'get',
]);

// ── Crisis phrases for substring scan ─────────────────────────────────────

const CRISIS_PHRASES = [
  'end it',
  'end my life',
  'kill myself',
  'want to die',
  'no point',
  "can't go on",
  'cant go on',
  'harm myself',
  'give up on life',
  'suicidal',
  'suicide',
];

// ── Tokenizer ──────────────────────────────────────────────────────────────

function tokenize(input: string): string[] {
  const words = input.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.filter((w) => !STOPWORDS.has(w));
}

// ── Cosine similarity ──────────────────────────────────────────────────────

function cosineSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};

  for (const t of a) freqA[t] = (freqA[t] ?? 0) + 1;
  for (const t of b) freqB[t] = (freqB[t] ?? 0) + 1;

  const allTerms = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const term of allTerms) {
    const va = freqA[term] ?? 0;
    const vb = freqB[term] ?? 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Pseudo-random picker ───────────────────────────────────────────────────
// Deterministic: same input+hour always picks the same variant,
// but different inputs pick different variants.

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ── Crisis detection ───────────────────────────────────────────────────────

export function detectCrisis(input: string): boolean {
  const lower = input.toLowerCase();

  // Substring scan for multi-word phrases
  for (const phrase of CRISIS_PHRASES) {
    if (lower.includes(phrase)) return true;
  }

  // Token match against the crisis seed's token list
  const crisisSeed = companionSeeds.find((s) => s.id === 'crisis');
  if (crisisSeed) {
    const inputTokens = tokenize(input);
    for (const token of inputTokens) {
      if (crisisSeed.tokens.includes(token)) return true;
    }
  }

  return false;
}

// ── Main function ──────────────────────────────────────────────────────────

export function getCompanionResponse(
  input: string,
  context: CompanionContext,
): CompanionResponse {
  const { hour, streakDays, daysSinceCheckin } = context;
  const seed = hashString(input + String(hour));

  // 1. Crisis check - before any matching
  if (detectCrisis(input)) {
    const crisisSeed = companionSeeds.find((s) => s.id === 'crisis')!;
    return {
      tone: 'crisis',
      isCrisis: true,
      matchedSeedId: 'crisis',
      text: [
        crisisSeed.openers[0],
        crisisSeed.bodies[0],
        crisisSeed.closers[0],
      ].join(' '),
    };
  }

  // 2. Tokenize input
  const inputTokens = tokenize(input);

  // 3. Score all non-crisis seeds
  const nonCrisisSeeds = companionSeeds.filter((s) => s.id !== 'crisis');

  let bestScore = 0;
  let bestSeedIndex = -1;

  for (let i = 0; i < nonCrisisSeeds.length; i++) {
    const s = nonCrisisSeeds[i];
    const score = cosineSimilarity(inputTokens, s.tokens);
    if (score > bestScore) {
      bestScore = score;
      bestSeedIndex = i;
    }
  }

  // 4. Fall back to 'just-checking-in' on weak match
  const MIN_SCORE = 0.10;
  const matchedSeed =
    bestScore >= MIN_SCORE && bestSeedIndex !== -1
      ? nonCrisisSeeds[bestSeedIndex]
      : companionSeeds.find((s) => s.id === 'just-checking-in')!;

  const matchedSeedId = bestScore >= MIN_SCORE ? matchedSeed.id : 'just-checking-in';

  // 5. Pick base variants
  let opener = pick(matchedSeed.openers, seed);
  let body = pick(matchedSeed.bodies, seed + 1);
  let closer = pick(matchedSeed.closers, seed + 2);

  // 6. Context conditioning - time of day
  if (hour >= 5 && hour < 12) {
    // Morning lean - occasionally prefix opener
    if (seed % 3 === 0) {
      opener = `Good morning. ${opener}`;
    }
  } else if (hour >= 20 || hour < 3) {
    // Late night lean
    if (seed % 3 === 0) {
      opener = `End of the day, ${opener.charAt(0).toLowerCase()}${opener.slice(1)}`;
    } else if (seed % 3 === 1) {
      opener = `Hey, late one. ${opener}`;
    }
  }

  // 7. Context conditioning - gap since last check-in
  if (daysSinceCheckin >= 3) {
    opener = `Hey. It's been a few days. That's okay. ${opener}`;
  }

  // 8. Context conditioning - streak
  if (streakDays >= 7 && seed % 2 === 0) {
    closer = `${closer} You've shown up ${streakDays} days now. That counts.`;
  }

  // 9. Compose
  const text = `${opener} ${body} ${closer}`.trim();

  return {
    tone: matchedSeed.tone,
    text,
    isCrisis: false,
    matchedSeedId,
  };
}
