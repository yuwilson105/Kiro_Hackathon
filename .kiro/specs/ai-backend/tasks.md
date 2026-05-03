# Implementation Plan: AI Backend

## Overview

Build a standalone Node.js/TypeScript Express server in a `backend/` directory at the repo root. The server exposes six endpoints that replace the frontend's static mock layer with AI-powered responses from OpenAI GPT-4o. The implementation is stateless, privacy-first, and preserves the existing TypeScript type contracts from `types/`.

## Tasks

- [x] 1. Scaffold the backend package
  - Create `backend/` directory with `package.json`, `tsconfig.json`, and `.env.example`
  - Install dependencies: `express`, `openai`, `zod`, `cors`, `dotenv` (pinned versions)
  - Install dev dependencies: `typescript`, `@types/express`, `@types/node`, `@types/cors`, `ts-node`, `tsx`
  - Create `backend/src/index.ts` as the Express app entry point with JSON body parsing (64 KB limit), CORS middleware, and route mounting stubs
  - _Requirements: 6.1, 6.5, 6.6, 7.3_

- [x] 2. Define shared types and validation schemas
  - [x] 2.1 Copy frontend types into `backend/src/types/`
    - Create `profile.ts`, `plan.ts`, `feed.ts`, `resource.ts` mirroring `types/` verbatim
    - Create `api.ts` with `JobListing`, `CompanionMessage`, `CompanionTone`, and `ErrorResponse` types
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

  - [x] 2.2 Implement Zod validation schemas in `backend/src/validation/schemas.ts`
    - Write `ProfileSchema` covering all Profile fields with correct enum values
    - Write `CompanionRequestSchema` requiring `message` (min length 1) and `profile`
    - Export a `validate<T>` helper that returns a typed result or throws a 400 error
    - _Requirements: 1.9, 2.8, 3.7, 3.8, 4.7, 5.5_

- [x] 3. Implement the prompt builder and privacy layer
  - [x] 3.1 Implement `buildPromptContext` in `backend/src/services/promptBuilder.ts`
    - Derive `gapYears`, `gapStartYear`, `gapEndYear` from ISO date strings
    - Map `conviction` to `convictionCategory` ('non-violent' | 'drug-related' | 'violent' | 'unspecified') — never forward the raw value
    - Omit `firstName` entirely from the returned `SafePromptContext` object
    - Format `city` as `"City, ST"` string or `null`
    - _Requirements: 5.7, 6.3, 6.4_

  - [ ]* 3.2 Write property test for `buildPromptContext`
    - **Property 9: Prompt context omits firstName** — for any Profile, the returned context must not contain `firstName` or its value
    - **Property 10: SafePromptContext gapYears is non-negative** — for any Profile where gapEnd >= gapStart, gapYears must be ≥ 0
    - **Validates: Requirements 6.3, 6.4**

- [x] 4. Implement the OpenAI client wrapper
  - [x] 4.1 Implement `callLLM` in `backend/src/services/openai.ts`
    - Initialize the OpenAI client from `OPENAI_API_KEY` env var
    - Call `chat.completions.create` with `model: "gpt-4o"`, `response_format: { type: "json_object" }`, and `max_tokens: 4096`
    - Enforce per-call timeout using `AbortSignal.timeout(timeoutMs)`
    - On API error or timeout, throw a typed `LLMError` with a `retryAfter` hint (default 30 seconds)
    - Parse and return the JSON response body as type `T`
    - _Requirements: 1.10, 2.9, 3.9, 4.8, 5.6, 7.1_

  - [ ]* 4.2 Write unit tests for `callLLM` error handling
    - Test that `LLMError` is thrown on API failure
    - Test that `LLMError` is thrown on timeout
    - Test that valid JSON responses are parsed and returned correctly
    - _Requirements: 7.1, 7.2_

- [x] 5. Implement crisis detection service
  - [x] 5.1 Implement `detectCrisis` in `backend/src/services/crisisDetector.ts`
    - Port the `CRISIS_PHRASES` substring scan from `lib/companion-voice.ts` exactly
    - Function must be pure (no side effects, no async)
    - _Requirements: 5.2_

  - [ ]* 5.2 Write property test for `detectCrisis`
    - **Property 8: Crisis detection is deterministic** — for any string, repeated calls return the same boolean
    - Test that all known crisis phrases trigger `true`
    - Test that neutral messages return `false`
    - **Validates: Requirements 5.2**

- [x] 6. Implement middleware
  - Create `backend/src/middleware/errorHandler.ts` — catches all errors, formats `ErrorResponse` JSON, logs `{ path, status, timestamp }` without any Profile field values
  - Create `backend/src/middleware/requestLogger.ts` — logs 4xx and 5xx responses with path, status code, and timestamp
  - Wire both middleware into `src/index.ts`
  - _Requirements: 6.6, 7.2, 7.5_

- [x] 7. Implement GET /health
  - Create `backend/src/routes/health.ts`
  - Return `{ status: "ok", timestamp: new Date().toISOString() }` with HTTP 200
  - Mount at `GET /health` in `src/index.ts`
  - _Requirements: 7.3_

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement POST /plan/generate
  - [x] 9.1 Create `backend/src/routes/plan.ts`
    - Validate request body with `ProfileSchema`; return 400 if `firstName` or `priorities` are missing
    - Call `buildPromptContext` to produce the safe context
    - Build a system prompt that specifies the `Plan` JSON schema, the 12-hour-per-week cap, urgency ordering rules, prerequisite ordering rules, and location-specific resource instruction
    - Call `callLLM` with a 30-second timeout
    - On `LLMError`, return the fallback `{ weeks: [], totalSteps: 0, generatedAt: ... }`
    - Return the parsed `Plan` object
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ]* 9.2 Write property test for plan generation response shape
    - **Property 1: Plan week hours never exceed 12** — for any valid Plan response, all PlanWeek.estimatedHours ≤ 12
    - **Property 2: Plan prerequisite ordering** — no PlanStep appears in a week with index ≤ the week index of any of its prerequisites
    - **Validates: Requirements 1.5, 1.6, 1.7**

- [x] 10. Implement POST /jobs/recommend
  - [x] 10.1 Create `backend/src/routes/jobs.ts`
    - Validate request body with `ProfileSchema`; return 400 if `city` is null
    - Call `buildPromptContext`
    - Build a system prompt specifying the `JobListing[]` schema, 5–20 count range, `matchScore` 0.0–1.0 range, felon-friendly prioritization, and work category matching
    - Call `callLLM` with a 20-second timeout
    - On `LLMError`, return fallback `[]`
    - Return the parsed `JobListing[]`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ]* 10.2 Write property tests for job recommendations
    - **Property 5: Job listing matchScore in range** — every JobListing.matchScore is between 0.0 and 1.0
    - **Property 6: Job listing count in range** — response contains between 5 and 20 items
    - **Validates: Requirements 2.5, 2.6**

- [x] 11. Implement POST /feed/generate
  - [x] 11.1 Create `backend/src/routes/feed.ts`
    - Validate request body with `ProfileSchema`; return 400 if `gapStart` or `gapEnd` are null, or if `interests` is empty
    - Call `buildPromptContext`
    - Build a system prompt specifying the `FeedCard[]` schema, minimum 10 cards, one card per interest, `yearsAgo` within the gap period, and `readMinutes` 1–10
    - Call `callLLM` with a 20-second timeout
    - On `LLMError`, return fallback `[]`
    - Return the parsed `FeedCard[]`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 11.2 Write property tests for feed generation
    - **Property 3: Feed card yearsAgo within gap** — every FeedCard.yearsAgo is between 1 and gapYears (inclusive)
    - **Property 4: Feed card readMinutes in range** — every FeedCard.readMinutes is between 1 and 10
    - **Validates: Requirements 3.3, 3.6**

- [x] 12. Implement POST /resources/find
  - [x] 12.1 Create `backend/src/routes/resources.ts`
    - Validate request body with `ProfileSchema`; return 400 if `city` is null
    - Call `buildPromptContext`
    - Build a system prompt specifying the `Resource[]` schema, 5–30 count range, city/state matching, priority-to-category mapping, and felon-friendly prioritization
    - Call `callLLM` with a 20-second timeout
    - On `LLMError`, return fallback `[]`
    - Return the parsed `Resource[]`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 12.2 Write property tests for resource discovery
    - **Property 7: Resource count in range** — response contains between 5 and 30 items
    - **Validates: Requirements 4.5**

- [x] 13. Implement POST /companion/respond
  - [x] 13.1 Create `backend/src/routes/companion.ts`
    - Validate request body with `CompanionRequestSchema`; return 400 if `message` is empty
    - Run `detectCrisis(message)` before any LLM call
    - If crisis detected: return hardcoded `CompanionMessage` with `isCrisis: true`, `tone: 'crisis'`, and 988 Lifeline text — no LLM call
    - Otherwise: call `buildPromptContext`, build a system prompt with `housingStatus` and `priorities` context (no `firstName`, no conviction type), call `callLLM` with a 10-second timeout
    - On `LLMError`, return fallback `{ text: "I hear you. I'm here.", tone: 'inviting', isCrisis: false }`
    - Return the parsed `CompanionMessage`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 13.2 Write unit tests for companion endpoint
    - Test that crisis messages return `isCrisis: true` without calling the LLM
    - Test that empty `message` returns HTTP 400
    - Test that the fallback response is returned on LLM failure
    - _Requirements: 5.2, 5.5_

- [x] 14. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Wire all routes and finalize the Express app
  - [x] 15.1 Mount all route handlers in `backend/src/index.ts`
    - Mount `GET /health`, `POST /plan/generate`, `POST /jobs/recommend`, `POST /feed/generate`, `POST /resources/find`, `POST /companion/respond`
    - Ensure error handler middleware is registered last
    - Verify 64 KB body size limit is applied globally
    - Verify CORS middleware reads `ALLOWED_ORIGIN` from env
    - _Requirements: 6.1, 6.5, 6.6, 7.3_

  - [ ]* 15.2 Write integration tests for error middleware
    - Test that a request body > 64 KB returns HTTP 413 with `code: "PAYLOAD_TOO_LARGE"`
    - Test that a malformed JSON body returns HTTP 400
    - Test that the `/health` endpoint returns `{ status: "ok" }`
    - _Requirements: 6.6, 7.2, 7.3_

- [x] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Frontend API client
  - Create `lib/api.ts` with a typed `apiClient` that reads `EXPO_PUBLIC_API_URL` from env
  - Implement `generatePlanFromAPI(profile)` → calls `POST /plan/generate`, returns `Plan`
  - Implement `generateFeedFromAPI(profile)` → calls `POST /feed/generate`, returns `FeedCard[]`
  - Implement `findResourcesFromAPI(profile)` → calls `POST /resources/find`, returns `Resource[]`
  - Implement `sendCompanionMessageToAPI(message, profile, history)` → calls `POST /companion/respond`, returns `CompanionMessage`
  - All functions must handle network errors gracefully and return typed fallbacks
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 18. Wire plan generation to backend
  - Update `app/(onboarding)/building.tsx` to call `generatePlanFromAPI` instead of local `generatePlan`
  - Keep the 2400ms animation timing — fire the API call immediately on mount, await it, then navigate when both the animation AND the API call are done (whichever is later)
  - Fall back to local `generatePlan` if the API call fails
  - _Requirements: 1.1, 1.10_

- [ ] 19. Wire catch-up feed to backend
  - Update `app/(tabs)/catchup.tsx` to fetch feed cards from `generateFeedFromAPI` on mount
  - Show a skeleton loading state while fetching (use `bg-surface` / `bg-surfaceDeep` shimmer, no spinner)
  - Fall back to `lib/mock/feed.ts` data if the API call fails
  - _Requirements: 3.1, 3.9_

- [ ] 20. Wire resources to backend
  - Update `app/(tabs)/help.tsx` to fetch resources from `findResourcesFromAPI` on mount
  - Show a skeleton loading state while fetching
  - Fall back to `lib/mock/resources.ts` data if the API call fails
  - _Requirements: 4.1, 4.8_

- [ ] 21. Wire companion chat to backend
  - Update `lib/companion-chat.ts` to call `sendCompanionMessageToAPI` instead of returning stub replies
  - Pass the full `profile` from the store alongside the message and history
  - Fall back to a static reply if the API call fails
  - _Requirements: 5.1, 5.6_

- [ ] 22. Environment configuration
  - Add `EXPO_PUBLIC_API_URL=http://localhost:3000` to `.env.example` at the repo root
  - Document how to run both the backend and the Expo app together in `README.md`

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `backend/` directory is a self-contained Node.js package — it does not import from the Expo project
- Property tests validate universal correctness properties (shapes, ranges, ordering)
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at logical milestones
