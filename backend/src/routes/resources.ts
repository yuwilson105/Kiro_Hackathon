import { NextFunction, Request, Response, Router } from 'express';
import { callLLM, LLMError } from '../services/openai';
import { buildPromptContext } from '../services/promptBuilder';
import type { Profile } from '../types/profile';
import type { Resource } from '../types/resource';
import { ProfileSchema, validate } from '../validation/schemas';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const profile = validate<Profile>(ProfileSchema, req.body);

    // City is required for resource discovery (Requirement 4.7)
    if (profile.city === null) {
      const error: any = new Error('Location is required for resource discovery');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Build anonymized prompt context (firstName omitted, conviction abstracted)
    const ctx = buildPromptContext(profile);

    // System prompt specifying Resource[] schema, 5–30 count range,
    // city/state matching, priority-to-category mapping, and felon-friendly prioritization
    const systemPrompt = `You are a local resource finder for people returning from incarceration.
Return a JSON object with a "resources" key containing an array of 5–30 Resource objects matching this schema:
{ id (string), name (string), category (one of: "housing", "food", "jobs", "legal", "mental-health", "healthcare", "documents", "financial"), address (string), city (string), state (string), phone (string), hours (optional string), felonFriendly (optional boolean), slidingScale (optional boolean), description (string) }.
Prioritize felonFriendly: true resources.
Cover at least two distinct resource categories from the user's priorities.
Map priorities to categories: finding-job → jobs, finding-housing → housing, mental-health → mental-health, getting-id → documents, building-finances → financial, reconnecting-family → legal, learning-missed → jobs, staying-out → legal.
All resources must have city and state matching or near the user's location.`;

    const userPrompt = `Find local support resources in ${ctx.city} for someone with priorities: ${JSON.stringify(ctx.priorities)}. Conviction category: ${ctx.convictionCategory}. Prioritize felon-friendly organizations.`;

    // Call LLM with 20-second timeout (Requirement 4.8)
    const result = await callLLM<{ resources: Resource[] }>({
      systemPrompt,
      userPrompt,
      timeoutMs: 20_000,
      schema: 'Resource[]',
    });

    res.json(result.resources);
  } catch (error: unknown) {
    // On LLM failure, return fallback empty array (Requirement 7.4)
    if (error instanceof LLMError) {
      res.json([]);
      return;
    }

    // Validation errors and other errors pass to the error handler middleware
    next(error);
  }
});

export default router;
