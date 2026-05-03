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
│                     │     Groq Client            │    │
│                     │  (OpenAI-compatible API)   │    │
│                     └───────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Stateless** — no database, no session storage. Every request is self-contained.
2. **Privacy-first prompt building** — a dedicated `buildPromptContext()` function transforms a `Profile` into an anonymized context object before any LLM call. `firstName` and raw `conviction` strings are never included in prompt text.
3. **Structured JSON output** — all LLM calls use `response_format: { type: "json_object" }` with an explicit JSON schema in the system prompt, eliminating fragile string parsing. Groq's API is OpenAI-compatible, so the same SDK and patterns apply.
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
│   │   ├── groq.ts           # Groq client wrapper (OpenAI-compatible) + retry logic
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
export type ConvictionType =
  | "non-violent"
  | "drug-related"
  | "violent"
  | "other"
  | "rather-not-say";
export type EducationLevel =
  | "less-than-high-school"
  | "some-high-school"
  | "high-school-diploma"
  | "some-college"
  | "college-degree"
  | "other";
export type WorkType =
  | "manual-labor"
  | "warehouse"
  | "food-service"
  | "retail"
  | "construction"
  | "office"
  | "driving"
  | "healthcare"
  | "other";
export type HousingStatus =
  | "halfway-house"
  | "family-friends"
  | "own-place"
  | "no-housing"
  | "other";
export type IdStatus = "yes" | "no" | "expired";
export type PriorityKey =
  | "finding-job"
  | "getting-id"
  | "finding-housing"
  | "reconnecting-family"
  | "mental-health"
  | "building-finances"
  | "learning-missed"
  | "staying-out";
export type InterestKey =
  | "lgbtq"
  | "tech"
  | "ai"
  | "phones"
  | "politics"
  | "voting"
  | "finance"
  | "social-media"
  | "music-entertainment"
  | "mental-health-awareness"
  | "healthcare"
  | "criminal-justice"
  | "womens-rights"
  | "immigration"
  | "housing"
  | "jobs"
  | "climate"
  | "sports";
export type City = { city: string; state: string };
export type Profile = {
  firstName: string;
  gapStart: string | null;
  gapEnd: string | null;
  city: City | null;
  conviction: ConvictionType | null;
  convictionDetails: string;
  education: EducationLevel | null;
  educationOther: string;
  workHistory: WorkType[];
  workOther: string;
  housing: HousingStatus | null;
  housingOther: string;
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
  matchScore: number; // 0.0 – 1.0
  applyUrl?: string;
  felonFriendly: boolean;
  workTypes: WorkType[];
};

export type CompanionTone =
  | "grounding"
  | "celebrating"
  | "normalizing"
  | "rebuilding"
  | "inviting"
  | "crisis";

export type CompanionMessage = {
  text: string;
  tone: CompanionTone;
  isCrisis: boolean;
};

export type ErrorResponse = {
  error: string;
  code: string;
  retryAfter?: number; // seconds, present on 503
};
```

---

## Component Design

### 1. Prompt Builder (`src/services/promptBuilder.ts`)

The central privacy layer. Converts a `Profile` into a safe context object before any LLM call.

```typescript
export type SafePromptContext = {
  city: string | null;
  gapYears: number | null;
  gapStartYear: number | null;
  gapEndYear: number | null;
  housingStatus: HousingStatus | null;
  idStatus: IdStatus | null;
  educationLevel: string | null;
  workCategories: WorkType[];
  priorities: PriorityKey[];
  interests: InterestKey[];
  hasConviction: boolean;
  convictionCategory:
    | "non-violent"
    | "drug-related"
    | "violent"
    | "unspecified";
  // firstName is intentionally OMITTED
};

export function buildPromptContext(profile: Profile): SafePromptContext {
  const gapYears =
    profile.gapStart && profile.gapEnd
      ? Math.round(
          (new Date(profile.gapEnd).getTime() -
            new Date(profile.gapStart).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25),
        )
      : null;

  return {
    city: profile.city ? `${profile.city.city}, ${profile.city.state}` : null,
    gapYears,
    gapStartYear: profile.gapStart
      ? new Date(profile.gapStart).getFullYear()
      : null,
    gapEndYear: profile.gapEnd ? new Date(profile.gapEnd).getFullYear() : null,
    housingStatus: profile.housing,
    idStatus: profile.idStatus,
    educationLevel: profile.education,
    workCategories: profile.workHistory,
    priorities: profile.priorities,
    interests: profile.interests,
    hasConviction: profile.conviction !== null,
    convictionCategory:
      profile.conviction === "rather-not-say"
        ? "unspecified"
        : (profile.conviction ?? "unspecified"),
  };
}
```

**Privacy guarantees:**

- `firstName` is never included in any prompt context.
- `conviction` is abstracted to a category string; the raw value is never forwarded.
- Full ISO dates are reduced to year-only integers.

---

### 2. Groq Client (`src/services/groq.ts`)

Wraps the OpenAI SDK (Groq is OpenAI-compatible) with retry logic and timeout enforcement.

```typescript
export type LLMCallOptions = {
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
  schema: string;
};

export async function callLLM<T>(options: LLMCallOptions): Promise<T> {
  // Uses OpenAI SDK pointed at Groq's base URL:
  //   baseURL: "https://api.groq.com/openai/v1"
  //   apiKey: process.env.GROQ_API_KEY
  //   model: "llama-3.3-70b-versatile" (or similar)
  //   response_format: { type: "json_object" }
  //   max_tokens: 4096
  // Throws LLMError on timeout or API error
}
```

**Error handling:**

- Timeout enforced via `AbortSignal.timeout(options.timeoutMs)`.
- On Groq API error → throws `LLMError` with `retryAfter` hint.
- Callers catch `LLMError` and return fallback responses.

---

### 3. Crisis Detector (`src/services/crisisDetector.ts`)

Mirrors the frontend crisis detection logic server-side, so crisis detection happens before any LLM call.

```typescript
const CRISIS_PHRASES = [
  "end it",
  "end my life",
  "kill myself",
  "want to die",
  "no point",
  "can't go on",
  "cant go on",
  "harm myself",
  "give up on life",
  "suicidal",
  "suicide",
];

export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_PHRASES.some((phrase) => lower.includes(phrase));
}
```

Crisis detection is a pure string scan — no LLM call needed.

---

### 4. Request Validation (`src/validation/schemas.ts`)

Zod schemas validate all incoming request bodies before they reach route handlers.

---

## Endpoint Specifications

### POST /plan/generate

- **Request:** `Profile`
- **Response:** `Plan`
- **Timeout:** 30 seconds
- **Fallback:** `{ weeks: [], totalSteps: 0, generatedAt: ... }`

### POST /jobs/recommend

- **Request:** `Profile` (city required)
- **Response:** `JobListing[]`
- **Timeout:** 20 seconds
- **Fallback:** `[]`

### POST /feed/generate

- **Request:** `Profile` (gapStart, gapEnd, interests required)
- **Response:** `FeedCard[]`
- **Timeout:** 20 seconds
- **Fallback:** `[]`

### POST /resources/find

- **Request:** `Profile` (city required)
- **Response:** `Resource[]`
- **Timeout:** 20 seconds
- **Fallback:** `[]`

### POST /companion/respond

- **Request:** `{ message: string, profile: Profile }`
- **Response:** `CompanionMessage`
- **Crisis path:** returns hardcoded 988 response without LLM call
- **Timeout:** 10 seconds
- **Fallback:** `{ text: "I hear you. I'm here.", tone: 'inviting', isCrisis: false }`

### GET /health

- **Response:** `{ status: "ok", timestamp: "..." }`
- Always returns 200

---

## Middleware

### Error Handler

Catches all errors, formats `ErrorResponse` JSON, logs `{ path, status, timestamp }` without Profile fields.

### Request Size Limit

`express.json({ limit: '64kb' })` — rejects > 64 KB with HTTP 413.

### CORS

`cors({ origin: process.env.ALLOWED_ORIGIN ?? '*', methods: ['GET', 'POST'] })`

---

## Environment Variables

```
GROQ_API_KEY=            # required
PORT=3000                # default 3000
ALLOWED_ORIGIN=          # Expo app origin for CORS (production)
NODE_ENV=development     # or production
```

---

## Correctness Properties

1. **Plan week hours never exceed 12** — every `PlanWeek.estimatedHours ≤ 12`
2. **Plan prerequisite ordering** — no step appears before its prerequisites
3. **Feed card yearsAgo within gap** — every `FeedCard.yearsAgo` between 1 and gapYears
4. **Feed card readMinutes in range** — every `FeedCard.readMinutes` between 1 and 10
5. **Job listing matchScore in range** — every `JobListing.matchScore` between 0.0 and 1.0
6. **Job listing count in range** — 5 to 20 items
7. **Resource count in range** — 5 to 30 items
8. **Crisis detection is deterministic** — pure function, same input → same output
9. **Prompt context omits firstName** — `buildPromptContext` never includes firstName
10. **SafePromptContext gapYears is non-negative** — when gapEnd >= gapStart
