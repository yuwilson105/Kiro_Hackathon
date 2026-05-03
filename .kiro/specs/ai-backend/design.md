# Design Document: AI Backend

## Overview

A standalone Node.js/TypeScript Express HTTP service that replaces the SecondChance app's static mock layer with AI-powered endpoints. The service is stateless (no database), privacy-first (no raw Profile data forwarded to the LLM), and exposes six endpoints that map directly to the existing frontend data contracts defined in `types/`.

---

## Architecture

```
React Native App (Expo)
        │
        │  HTTP/HTTPS  (JSON)
        ▼
┌─────────────────────────────────────────────────────┐
│                  Express Server                      │
│                                                      │
│  ┌──────────────┐   ┌──────────────────────────┐    │
│  │  Middleware  │   │       Route Handlers      │    │
│  │  - CORS      │   │  POST /plan/generate      │    │
│  │  - JSON body │   │  POST /jobs/recommend     │    │
│  │  - 64 KB cap │   │  POST /feed/generate      │    │
│  │  - Error log │   │  POST /resources/find     │    │
│  └──────────────┘   │  POST /companion/respond  │    │
│                     │  GET  /health             │    │
│                     └──────────────┬────────────┘    │
│                                    │                  │
│                     ┌──────────────▼────────────┐    │
│                     │     Prompt Builders        │    │
│                     │  (Profile → safe context) │    │
│                     └──────────────┬────────────┘    │
│                                    │                  │
│                     ┌──────────────▼────────────┐    │
│                     │     OpenAI Client          │    │
│                     │  (GPT-4o, JSON mode)       │    │
│                     └───────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Stateless** — no database, no session storage. Every request is self-contained.
2. **Privacy-first prompt building** — a dedicated `buildPromptContext()` function transforms a `Profile` into an anonymized context object before any LLM call. `firstName` and raw `conviction` strings are never included in prompt text.
3. **Structured JSON output** — all LLM calls use `response_format: { type: "json_object" }` with an explicit JSON schema in the system prompt, eliminating fragile string parsing.
4. **Graceful degradation** — if the LLM call fails, endpoints return a minimal valid fallback response rather than a 5xx error (where a fallback is configured).
5. **Single-file type sharing** — the server re-declares the TypeScript types from `types/` verbatim in a `src/types/` directory so the backend is a self-contained package with no dependency on the Expo project.

---

## Directory Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── routes/
│   │   ├── plan.ts           # POST /plan/generate
│   │   ├── jobs.ts           # POST /jobs/recommend
│   │   ├── feed.ts           # POST /feed/generate
│   │   ├── resources.ts      # POST /resources/find
│   │   ├── companion.ts      # POST /companion/respond
│   │   └── health.ts         # GET /health
│   ├── services/
│   │   ├── openai.ts         # OpenAI client wrapper + retry logic
│   │   ├── promptBuilder.ts  # Profile → anonymized prompt context
│   │   └── crisisDetector.ts # Crisis phrase detection (mirrors frontend logic)
│   ├── middleware/
│   │   ├── errorHandler.ts   # Unified error response formatter
│   │   └── requestLogger.ts  # Logs 4xx/5xx without Profile fields
│   ├── types/
│   │   ├── profile.ts        # Mirrors types/profile.ts
│   │   ├── plan.ts           # Mirrors types/plan.ts
│   │   ├── feed.ts           # Mirrors types/feed.ts
│   │   ├── resource.ts       # Mirrors types/resource.ts
│   │   └── api.ts            # JobListing, CompanionMessage, error shapes
│   └── validation/
│       └── schemas.ts        # Zod schemas for all request bodies
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Data Models

### Shared Types (mirrored from `types/`)

These are copied verbatim from the frontend `types/` directory so the backend is self-contained.

```typescript
// src/types/profile.ts — identical to frontend types/profile.ts
export type ConvictionType = 'non-violent' | 'drug-related' | 'violent' | 'rather-not-say';
export type WorkType = 'manual-labor' | 'warehouse' | 'food-service' | 'retail' |
  'construction' | 'office' | 'driving' | 'healthcare' | 'other';
export type HousingStatus = 'halfway-house' | 'family-friends' | 'own-place' | 'no-housing';
export type IdStatus = 'yes' | 'no' | 'expired';
export type PriorityKey = 'finding-job' | 'getting-id' | 'finding-housing' |
  'reconnecting-family' | 'mental-health' | 'building-finances' |
  'learning-missed' | 'staying-out';
export type InterestKey = 'lgbtq' | 'tech' | 'politics' | 'finance' |
  'social-media' | 'music-entertainment' | 'mental-health-awareness' |
  'criminal-justice' | 'womens-rights' | 'immigration' | 'climate' | 'sports';
export type City = { city: string; state: string };
export type Profile = {
  firstName: string;
  gapStart: string | null;
  gapEnd: string | null;
  city: City | null;
  conviction: ConvictionType | null;
  education: string | null;
  workHistory: WorkType[];
  housing: HousingStatus | null;
  idStatus: IdStatus | null;
  priorities: PriorityKey[];
  interests: InterestKey[];
};
```

### Backend-only Types

```typescript
// src/types/api.ts

export type JobListing = {
  id: string;
  title: string;
  employer: string;
  location: string;
  description: string;
  matchScore: number;       // 0.0 – 1.0
  applyUrl?: string;
  felonFriendly: boolean;
  workTypes: WorkType[];
};

export type CompanionTone =
  | 'grounding' | 'celebrating' | 'normalizing'
  | 'rebuilding' | 'inviting' | 'crisis';

export type CompanionMessage = {
  text: string;
  tone: CompanionTone;
  isCrisis: boolean;
};

export type ErrorResponse = {
  error: string;
  code: string;
  retryAfter?: number;      // seconds, present on 503
};
```

---

## Component Design

### 1. Prompt Builder (`src/services/promptBuilder.ts`)

The central privacy layer. Converts a `Profile` into a safe context object before any LLM call.

```typescript
export type SafePromptContext = {
  city: string | null;           // "Oakland, CA"
  gapYears: number | null;       // derived from gapStart/gapEnd
  gapStartYear: number | null;   // year only, not full date
  gapEndYear: number | null;     // year only, not full date
  housingStatus: HousingStatus | null;
  idStatus: IdStatus | null;
  educationLevel: string | null;
  workCategories: WorkType[];
  priorities: PriorityKey[];
  interests: InterestKey[];
  hasConviction: boolean;        // boolean only — type never forwarded
  convictionCategory: 'non-violent' | 'drug-related' | 'violent' | 'unspecified';
  // firstName is intentionally OMITTED
};

export function buildPromptContext(profile: Profile): SafePromptContext {
  const gapYears = profile.gapStart && profile.gapEnd
    ? Math.round(
        (new Date(profile.gapEnd).getTime() - new Date(profile.gapStart).getTime())
        / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return {
    city: profile.city ? `${profile.city.city}, ${profile.city.state}` : null,
    gapYears,
    gapStartYear: profile.gapStart ? new Date(profile.gapStart).getFullYear() : null,
    gapEndYear: profile.gapEnd ? new Date(profile.gapEnd).getFullYear() : null,
    housingStatus: profile.housing,
    idStatus: profile.idStatus,
    educationLevel: profile.education,
    workCategories: profile.workHistory,
    priorities: profile.priorities,
    interests: profile.interests,
    hasConviction: profile.conviction !== null,
    convictionCategory: profile.conviction === 'rather-not-say'
      ? 'unspecified'
      : (profile.conviction ?? 'unspecified'),
  };
}
```

**Privacy guarantees:**
- `firstName` is never included in any prompt context.
- `conviction` is abstracted to a category string; the raw value is never forwarded.
- Full ISO dates are reduced to year-only integers.

---

### 2. OpenAI Client (`src/services/openai.ts`)

Wraps the OpenAI SDK with retry logic and timeout enforcement.

```typescript
export type LLMCallOptions = {
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
  schema: string;           // JSON schema description embedded in system prompt
};

export async function callLLM<T>(options: LLMCallOptions): Promise<T> {
  // Uses openai.chat.completions.create with:
  //   model: "gpt-4o"
  //   response_format: { type: "json_object" }
  //   max_tokens: 4096
  // Throws LLMError on timeout or API error
}
```

**Error handling:**
- Timeout enforced via `AbortSignal.timeout(options.timeoutMs)`.
- On OpenAI API error → throws `LLMError` with `retryAfter` hint.
- Callers catch `LLMError` and return fallback responses.

---

### 3. Crisis Detector (`src/services/crisisDetector.ts`)

Mirrors the frontend `lib/companion-voice.ts` crisis detection logic server-side, so crisis detection happens before any LLM call.

```typescript
const CRISIS_PHRASES = [
  'end it', 'end my life', 'kill myself', 'want to die',
  'no point', "can't go on", 'cant go on', 'harm myself',
  'give up on life', 'suicidal', 'suicide',
];

export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_PHRASES.some(phrase => lower.includes(phrase));
}
```

Crisis detection is a pure string scan — no LLM call needed. If `detectCrisis` returns `true`, the companion endpoint returns a hardcoded crisis response immediately without calling the LLM.

---

### 4. Request Validation (`src/validation/schemas.ts`)

Zod schemas validate all incoming request bodies before they reach route handlers.

```typescript
import { z } from 'zod';

const CitySchema = z.object({ city: z.string(), state: z.string() });

export const ProfileSchema = z.object({
  firstName: z.string().min(1),
  gapStart: z.string().nullable(),
  gapEnd: z.string().nullable(),
  city: CitySchema.nullable(),
  conviction: z.enum(['non-violent','drug-related','violent','rather-not-say']).nullable(),
  education: z.string().nullable(),
  workHistory: z.array(z.enum([/* WorkType values */])),
  housing: z.enum([/* HousingStatus values */]).nullable(),
  idStatus: z.enum(['yes','no','expired']).nullable(),
  priorities: z.array(z.enum([/* PriorityKey values */])),
  interests: z.array(z.enum([/* InterestKey values */])),
});

export const CompanionRequestSchema = z.object({
  message: z.string().min(1, 'message is required'),
  profile: ProfileSchema,
});
```

Validation failures return HTTP 400 with a descriptive `error` string.

---

## Endpoint Specifications

### POST /plan/generate

**Request body:** `Profile`

**Response:** `Plan` (matches `types/plan.ts`)

**Prompt strategy:**

```
System: You are a reentry planning assistant. Generate a personalized weekly reentry
plan as a JSON object matching this schema: { weeks: PlanWeek[], totalSteps: number,
generatedAt: string }. Each PlanWeek has { index, steps: PlanStep[], estimatedHours }.
Each PlanStep has { id, title, description, category, urgency, estimatedHours,
prerequisites, unlocks, whyNow, resourceName?, resourceAddress?, resourcePhone?,
learnCard? }. Rules:
- estimatedHours per week must not exceed 12
- urgent steps appear in earlier weeks than this-month steps
- prerequisites must appear in earlier weeks than the steps that depend on them
- include location-specific resources for city: {ctx.city}
- do not include steps inappropriate for conviction category: {ctx.convictionCategory}
- cover all priorities: {ctx.priorities}

User: Generate a reentry plan for someone with these characteristics:
{JSON.stringify(ctx)}
```

**Fallback:** Returns `{ weeks: [], totalSteps: 0, generatedAt: new Date().toISOString() }` on LLM failure.

**Timeout:** 30 seconds.

---

### POST /jobs/recommend

**Request body:** `Profile`

**Response:** `JobListing[]`

**Validation:** `city` must be non-null (400 if missing).

**Prompt strategy:**

```
System: You are a job matching assistant for people returning from incarceration.
Return a JSON array of 5–20 job listings matching this schema: JobListing[].
Each JobListing: { id, title, employer, location, description, matchScore (0.0-1.0),
applyUrl?, felonFriendly, workTypes }. Prioritize felonFriendly: true listings.
Match jobs to work categories and location.

User: Find jobs for someone in {ctx.city} with work experience in {ctx.workCategories}.
Conviction category: {ctx.convictionCategory}. Prioritize felon-friendly employers.
```

**Fallback:** Returns `[]` on LLM failure.

**Timeout:** 20 seconds.

---

### POST /feed/generate

**Request body:** `Profile`

**Response:** `FeedCard[]`

**Validation:** `gapStart` and `gapEnd` must be non-null; `interests` must be non-empty.

**Prompt strategy:**

```
System: You are a catch-up news curator. Return a JSON array of at least 10 FeedCard
objects matching this schema: { id, category, title, teaser, body, readMinutes (1-10),
yearsAgo }. The yearsAgo field must be within the incarceration period
({ctx.gapStartYear}–{ctx.gapEndYear}). Cover all interest categories provided.
Each body should be 3–5 paragraphs of factual, plain-language catch-up content.

User: Generate catch-up content for someone who was away from {ctx.gapStartYear}
to {ctx.gapEndYear} ({ctx.gapYears} years). Interests: {ctx.interests}.
```

**Fallback:** Returns `[]` on LLM failure.

**Timeout:** 20 seconds.

---

### POST /resources/find

**Request body:** `Profile`

**Response:** `Resource[]`

**Validation:** `city` must be non-null.

**Prompt strategy:**

```
System: You are a local resource finder for people returning from incarceration.
Return a JSON array of 5–30 Resource objects matching this schema:
{ id, name, category, address, city, state, phone, hours?, felonFriendly?,
slidingScale?, description }. Prioritize felonFriendly: true resources.
Cover at least two distinct resource categories from the user's priorities.

User: Find local support resources in {ctx.city} for someone with priorities:
{ctx.priorities}. Conviction category: {ctx.convictionCategory}.
Prioritize felon-friendly organizations.
```

**Fallback:** Returns `[]` on LLM failure.

**Timeout:** 20 seconds.

---

### POST /companion/respond

**Request body:** `{ message: string, profile: Profile }`

**Response:** `CompanionMessage`

**Crisis path (no LLM call):**

```typescript
if (detectCrisis(message)) {
  return {
    text: "I'm really glad you told me. What you're carrying is real, and it doesn't have to be carried alone. The 988 Lifeline is open right now — free and confidential. They're trained for exactly this. Tap the call button when you're ready.",
    tone: 'crisis',
    isCrisis: true,
  };
}
```

**Normal path prompt strategy:**

```
System: You are a supportive companion for people returning home from incarceration.
Respond with empathy, warmth, and practical grounding. Return a JSON object:
{ text: string, tone: one of [grounding|celebrating|normalizing|rebuilding|inviting] }.
The user's housing status is {ctx.housingStatus}. Their priorities are {ctx.priorities}.
Keep responses to 2–4 sentences. Never mention conviction type or incarceration dates.

User: {message}
```

**Fallback:** Returns `{ text: "I hear you. I'm here.", tone: 'inviting', isCrisis: false }` on LLM failure.

**Timeout:** 10 seconds.

---

### GET /health

**Response:**

```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

No authentication required. Always returns 200.

---

## Middleware

### Error Handler (`src/middleware/errorHandler.ts`)

Catches all unhandled errors and formats them as `ErrorResponse`:

```typescript
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  const body: ErrorResponse = {
    error: err.message ?? 'Internal server error',
    code: err.code ?? 'INTERNAL_ERROR',
    ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}),
  };
  // Log path, status, timestamp — no Profile fields
  logger.error({ path: req.path, status, timestamp: new Date().toISOString() });
  res.status(status).json(body);
});
```

### Request Size Limit

```typescript
app.use(express.json({ limit: '64kb' }));
```

Requests exceeding 64 KB are rejected with HTTP 413 before reaching any route handler.

### CORS

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? '*',  // restricted in production
  methods: ['GET', 'POST'],
}));
```

---

## Environment Variables

```
OPENAI_API_KEY=          # required
PORT=3000                # default 3000
ALLOWED_ORIGIN=          # Expo app origin for CORS (production)
NODE_ENV=development     # or production
```

---

## Error Response Shapes

| Scenario | HTTP Status | `code` |
|---|---|---|
| Missing required Profile fields | 400 | `VALIDATION_ERROR` |
| Request body > 64 KB | 413 | `PAYLOAD_TOO_LARGE` |
| LLM provider error / timeout | 503 | `LLM_UNAVAILABLE` |
| Unhandled server error | 500 | `INTERNAL_ERROR` |

All error responses include `{ error: string, code: string }`. 503 responses additionally include `retryAfter: number` (seconds).

---

## Correctness Properties

The following universal properties hold for all valid inputs and are suitable for property-based testing.

**Property 1: Plan week hours never exceed 12**
For any valid `Profile` input, every `PlanWeek` in the returned `Plan` has `estimatedHours ≤ 12`.

**Property 2: Plan prerequisite ordering**
For any valid `Profile` input, no `PlanStep` appears in a week whose index is less than or equal to the week index of any of its prerequisites.

**Property 3: Feed card yearsAgo within gap**
For any `Profile` with non-null `gapStart` and `gapEnd`, every `FeedCard` in the response has `yearsAgo` between `1` and `gapYears` (inclusive).

**Property 4: Feed card readMinutes in range**
For any valid feed response, every `FeedCard` has `readMinutes` between `1` and `10` (inclusive).

**Property 5: Job listing matchScore in range**
For any valid jobs response, every `JobListing` has `matchScore` between `0.0` and `1.0` (inclusive).

**Property 6: Job listing count in range**
For any valid `Profile` with non-null `city`, the jobs response contains between `5` and `20` `JobListing` objects.

**Property 7: Resource count in range**
For any valid `Profile` with non-null `city`, the resources response contains between `5` and `30` `Resource` objects.

**Property 8: Crisis detection is deterministic**
For any input string, `detectCrisis(message)` returns the same boolean on repeated calls (pure function, no side effects).

**Property 9: Prompt context omits firstName**
For any `Profile`, `buildPromptContext(profile)` returns an object that does not contain the `firstName` field or its value.

**Property 10: SafePromptContext gapYears is non-negative**
For any `Profile` where `gapEnd >= gapStart`, `buildPromptContext(profile).gapYears` is `≥ 0`.
