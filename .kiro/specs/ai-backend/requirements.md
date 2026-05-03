# Requirements Document

## Introduction

SecondChance is a mobile companion app for people returning home from incarceration. The frontend (Expo/React Native) is feature-complete with static/mock data. This feature replaces that static layer with an AI-powered HTTP backend that personalizes the reentry experience: generating smarter reentry plans, surfacing real job opportunities, curating a catch-up news feed, finding local resources, and powering a conversational companion — all driven by the user's Profile data.

The backend is a standalone HTTP service (REST API) callable from the React Native app. It must preserve the existing `Profile`, `Plan`, `FeedCard`, and `Resource` TypeScript shapes as the API contract, so the frontend requires minimal changes.

---

## Glossary

- **API_Server**: The backend HTTP service that exposes all AI-powered endpoints.
- **Profile**: The user's personal data object as defined in `types/profile.ts` — includes `firstName`, `gapStart`, `gapEnd`, `city` (city + state), `conviction`, `education`, `workHistory`, `housing`, `idStatus`, `priorities`, and `interests`.
- **Plan**: A reentry roadmap structured as `PlanWeek[]`, matching `types/plan.ts`. Each week contains `PlanStep` objects with category, urgency, prerequisites/unlocks DAG, resource info, and optional `LearnCard`.
- **FeedCard**: A catch-up news/content card matching `types/feed.ts` — `id`, `category` (InterestKey), `title`, `teaser`, `body`, `readMinutes`, `yearsAgo`.
- **Resource**: A local support organization matching `types/resource.ts` — `id`, `name`, `category`, `address`, `city`, `state`, `phone`, `hours`, `felonFriendly`, `slidingScale`, `description`.
- **JobListing**: An AI-generated or AI-sourced job opportunity object containing `id`, `title`, `employer`, `location`, `description`, `matchScore`, `applyUrl` (optional), `felonFriendly` (boolean), `workTypes` (WorkType[]).
- **CompanionMessage**: A conversational response from the AI companion containing `text` (string), `tone` (CompanionTone), and `isCrisis` (boolean).
- **LLM_Provider**: The third-party large language model service used by the API_Server (Groq, using the OpenAI-compatible API).
- **Gap_Duration**: The number of years between `gapStart` and `gapEnd` in the user's Profile, representing how long the user was incarcerated.
- **PriorityKey**: One of the eight reentry priority values defined in `types/profile.ts`.
- **InterestKey**: One of the twelve interest category values defined in `types/profile.ts`.
- **WorkType**: One of the nine work experience categories defined in `types/profile.ts`.
- **StepCategory**: One of the eight plan step categories defined in `types/plan.ts` — `documents`, `housing`, `employment`, `finance`, `health`, `family`, `legal`, `education`.
- **ResourceCategory**: One of the eight resource categories defined in `types/resource.ts`.
- **ConvictionType**: One of the five conviction type values defined in `types/profile.ts` — `non-violent`, `drug-related`, `violent`, `other`, `rather-not-say`.

---

## Requirements

### Requirement 1: Personalized Reentry Plan Generation

**User Story:** As a returning citizen, I want the app to generate a personalized weekly reentry roadmap based on my specific situation, so that I have a realistic, actionable plan tailored to my priorities, conviction type, work history, and housing status.

#### Acceptance Criteria

1. WHEN the API_Server receives a POST request to `/plan/generate` with a valid Profile body, THE API_Server SHALL return a Plan object whose structure matches the `Plan` type from `types/plan.ts`.
2. WHEN generating a Plan, THE API_Server SHALL use the LLM_Provider to produce `PlanStep` objects that reflect the user's `priorities`, `conviction`, `housing`, `idStatus`, `education`, and `workHistory` fields.
3. WHEN a Profile contains a `conviction` value of `violent`, THE API_Server SHALL exclude `PlanStep` objects that are inappropriate for that conviction type, consistent with the `excludeIfConviction` field semantics.
4. WHEN a Profile contains a non-empty `priorities` array, THE API_Server SHALL include at least one `PlanStep` per `PriorityKey` present in the array, provided a relevant step exists.
5. WHEN generating a Plan, THE API_Server SHALL order `PlanStep` objects such that steps with `urgency` of `urgent` appear in earlier weeks than steps with `urgency` of `this-month`.
6. WHEN generating a Plan, THE API_Server SHALL respect prerequisite ordering — no `PlanStep` SHALL appear in a week before all of its `prerequisites` have appeared in earlier weeks.
7. WHEN generating a Plan, THE API_Server SHALL assign each `PlanWeek` an `estimatedHours` value that does not exceed 12 hours.
8. WHEN the Profile `city` field is non-null, THE API_Server SHALL populate `resourceName`, `resourceAddress`, and `resourcePhone` fields on relevant `PlanStep` objects with location-specific information for that city and state.
9. IF the Profile body is missing required fields (`firstName`, `priorities`), THEN THE API_Server SHALL return an HTTP 400 response with a descriptive error message.
10. WHEN generating a Plan, THE API_Server SHALL respond within 30 seconds under normal operating conditions.

---

### Requirement 2: Job Opportunity Recommendations

**User Story:** As a returning citizen looking for work, I want the app to surface job opportunities matched to my work history, location, and situation, so that I can find employment that is realistic and accessible given my background.

#### Acceptance Criteria

1. WHEN the API_Server receives a POST request to `/jobs/recommend` with a valid Profile body, THE API_Server SHALL return an array of `JobListing` objects.
2. WHEN generating job recommendations, THE API_Server SHALL use the Profile `workHistory` array to match jobs to the user's prior experience categories (WorkType values).
3. WHEN generating job recommendations, THE API_Server SHALL use the Profile `city` field to filter or prioritize jobs geographically near the user's city and state.
4. WHEN the Profile `conviction` field is non-null, THE API_Server SHALL include a `felonFriendly` boolean on each `JobListing` and SHALL prioritize listings where `felonFriendly` is `true`.
5. WHEN generating job recommendations, THE API_Server SHALL return between 5 and 20 `JobListing` objects per request.
6. WHEN generating job recommendations, THE API_Server SHALL assign each `JobListing` a `matchScore` between 0.0 and 1.0 representing relevance to the user's Profile.
7. WHEN the Profile `workHistory` array is empty, THE API_Server SHALL return job listings appropriate for entry-level positions across multiple WorkType categories.
8. IF the Profile `city` field is null, THEN THE API_Server SHALL return an HTTP 400 response indicating that location is required for job recommendations.
9. WHEN generating job recommendations, THE API_Server SHALL respond within 20 seconds under normal operating conditions.

---

### Requirement 3: Personalized Catch-Up Feed

**User Story:** As a returning citizen who has been away for years, I want a curated feed of content about what I missed, so that I can catch up on the topics I care about at my own pace.

#### Acceptance Criteria

1. WHEN the API_Server receives a POST request to `/feed/generate` with a valid Profile body, THE API_Server SHALL return an array of `FeedCard` objects whose structure matches the `FeedCard` type from `types/feed.ts`.
2. WHEN generating feed content, THE API_Server SHALL use the Profile `interests` array to select or generate `FeedCard` objects whose `category` field matches one of the user's `InterestKey` values.
3. WHEN generating feed content, THE API_Server SHALL use the Gap_Duration derived from `gapStart` and `gapEnd` to set the `yearsAgo` field on each `FeedCard` to a value within the user's incarceration period.
4. WHEN generating feed content, THE API_Server SHALL return at least 10 `FeedCard` objects per request.
5. WHEN the Profile `interests` array contains multiple values, THE API_Server SHALL return at least one `FeedCard` per `InterestKey` present in the array.
6. WHEN generating feed content, THE API_Server SHALL set the `readMinutes` field on each `FeedCard` to a value between 1 and 10.
7. IF the Profile `gapStart` or `gapEnd` fields are null, THEN THE API_Server SHALL return an HTTP 400 response indicating that incarceration dates are required for feed generation.
8. IF the Profile `interests` array is empty, THEN THE API_Server SHALL return an HTTP 400 response indicating that at least one interest is required.
9. WHEN generating feed content, THE API_Server SHALL respond within 20 seconds under normal operating conditions.

---

### Requirement 4: Local Resource Discovery

**User Story:** As a returning citizen, I want to find local support organizations near me — for housing, jobs, legal aid, mental health, and more — so that I can get real help in my area rather than generic national listings.

#### Acceptance Criteria

1. WHEN the API_Server receives a POST request to `/resources/find` with a valid Profile body, THE API_Server SHALL return an array of `Resource` objects whose structure matches the `Resource` type from `types/resource.ts`.
2. WHEN finding resources, THE API_Server SHALL use the Profile `city` field to return `Resource` objects whose `city` and `state` fields match or are near the user's location.
3. WHEN finding resources, THE API_Server SHALL use the Profile `priorities` array to select `Resource` objects whose `category` field maps to the user's stated priorities (e.g., `finding-job` maps to `jobs`, `finding-housing` maps to `housing`).
4. WHEN the Profile `conviction` field is non-null, THE API_Server SHALL set the `felonFriendly` field on each returned `Resource` and SHALL prioritize resources where `felonFriendly` is `true`.
5. WHEN finding resources, THE API_Server SHALL return between 5 and 30 `Resource` objects per request.
6. WHEN finding resources, THE API_Server SHALL cover at least two distinct `ResourceCategory` values in the returned results, provided the user's priorities map to at least two categories.
7. IF the Profile `city` field is null, THEN THE API_Server SHALL return an HTTP 400 response indicating that location is required for resource discovery.
8. WHEN finding resources, THE API_Server SHALL respond within 20 seconds under normal operating conditions.

---

### Requirement 5: AI Companion Responses

**User Story:** As a returning citizen, I want to talk to a supportive AI companion that understands my situation and responds with empathy and relevant guidance, so that I feel less alone during a difficult transition.

#### Acceptance Criteria

1. WHEN the API_Server receives a POST request to `/companion/respond` with a `message` string and a `profile` Profile object, THE API_Server SHALL return a `CompanionMessage` object containing `text`, `tone`, and `isCrisis` fields.
2. WHEN the input `message` contains crisis language (phrases indicating suicidal ideation or self-harm), THE API_Server SHALL set `isCrisis` to `true` and SHALL include crisis resource information (988 Suicide and Crisis Lifeline) in the `text` field.
3. WHEN generating a companion response, THE API_Server SHALL use the LLM_Provider with a system prompt that incorporates the user's `firstName`, `priorities`, and `housing` status to produce contextually relevant responses.
4. WHEN generating a companion response, THE API_Server SHALL set the `tone` field to one of the valid `CompanionTone` values defined in the frontend codebase.
5. WHEN the input `message` is an empty string, THE API_Server SHALL return an HTTP 400 response with a descriptive error message.
6. WHEN generating a companion response, THE API_Server SHALL respond within 10 seconds under normal operating conditions.
7. THE API_Server SHALL NOT include the user's `conviction` type or other sensitive Profile fields verbatim in any LLM prompt that is logged or stored externally.

---

### Requirement 6: API Security and Privacy

**User Story:** As a returning citizen, I want my sensitive personal data — including my conviction type, housing status, and incarceration dates — to be handled with care, so that my information is not exposed or misused.

#### Acceptance Criteria

1. THE API_Server SHALL accept requests only over HTTPS in production deployments.
2. THE API_Server SHALL NOT persist any Profile data to a database or external storage between requests.
3. THE API_Server SHALL NOT forward raw Profile data to the LLM_Provider verbatim — THE API_Server SHALL transform Profile fields into anonymized or abstracted prompt context before sending to the LLM_Provider.
4. WHEN the API_Server constructs LLM prompts, THE API_Server SHALL omit the `firstName` field from any prompt text sent to the LLM_Provider.
5. THE API_Server SHALL include CORS headers that restrict cross-origin requests to the registered Expo app origin in production.
6. IF a request body exceeds 64 KB, THEN THE API_Server SHALL return an HTTP 413 response and SHALL NOT process the request.

---

### Requirement 7: API Reliability and Error Handling

**User Story:** As a developer integrating the frontend with the backend, I want the API to behave predictably under failure conditions, so that the app degrades gracefully when the AI service is unavailable.

#### Acceptance Criteria

1. IF the LLM_Provider returns an error or times out, THEN THE API_Server SHALL return an HTTP 503 response with a `retryAfter` field indicating when the client should retry.
2. WHEN the API_Server returns any error response, THE API_Server SHALL include a JSON body with at least an `error` string field and a `code` string field.
3. THE API_Server SHALL respond to a GET request on `/health` with an HTTP 200 response and a JSON body containing a `status` field set to `"ok"`.
4. WHEN the LLM_Provider is unavailable, THE API_Server SHALL fall back to returning a minimal valid response (empty arrays for list endpoints, a static message for companion) rather than returning a 5xx error, WHERE a fallback is configured.
5. THE API_Server SHALL log all 4xx and 5xx responses with the request path, HTTP status code, and a timestamp, without logging any Profile field values.
