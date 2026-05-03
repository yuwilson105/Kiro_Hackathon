import { NextFunction, Request, Response, Router } from 'express';
import { callLLM, LLMError } from '../services/openai';
import { buildPromptContext } from '../services/promptBuilder';
import type { JobListing } from '../types/api';
import type { Profile } from '../types/profile';
import { ProfileSchema, validate } from '../validation/schemas';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const profile = validate<Profile>(ProfileSchema, req.body);

    // City is required for job recommendations (Requirement 2.8)
    if (profile.city === null) {
      const error: any = new Error('Location is required for job recommendations');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Build anonymized prompt context (firstName omitted, conviction abstracted)
    const ctx = buildPromptContext(profile);

    // System prompt specifying JobListing[] schema, count range, matchScore range,
    // felon-friendly prioritization, and work category matching
    const systemPrompt = `You are a job matching assistant for people returning from incarceration.
Return a JSON object with a "jobs" key containing an array of 5–20 job listings matching this schema: JobListing[].
Each JobListing: { id (string), title (string), employer (string), location (string), description (string), matchScore (number 0.0-1.0), applyUrl (optional string), felonFriendly (boolean), workTypes (string[]) }.
Prioritize felonFriendly: true listings.
Match jobs to work categories and location.`;

    const userPrompt = `Find jobs for someone in ${ctx.city} with work experience in ${JSON.stringify(ctx.workCategories)}.
Conviction category: ${ctx.convictionCategory}. Prioritize felon-friendly employers.`;

    // Call LLM with 20-second timeout (Requirement 2.9)
    const result = await callLLM<{ jobs: JobListing[] }>({
      systemPrompt,
      userPrompt,
      timeoutMs: 20_000,
      schema: 'JobListing[]',
    });

    res.json(result.jobs);
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
