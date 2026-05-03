import { NextFunction, Request, Response, Router } from 'express';
import { callLLM, LLMError } from '../services/openai';
import { buildPromptContext } from '../services/promptBuilder';
import type { FeedCard } from '../types/feed';
import type { Profile } from '../types/profile';
import { ProfileSchema, validate } from '../validation/schemas';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const profile = validate<Profile>(ProfileSchema, req.body);

    // Incarceration dates are required for feed generation (Requirement 3.7)
    if (profile.gapStart === null || profile.gapEnd === null) {
      const error: any = new Error('Incarceration dates are required for feed generation');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // At least one interest is required (Requirement 3.8)
    if (profile.interests.length === 0) {
      const error: any = new Error('At least one interest is required');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Build anonymized prompt context (firstName omitted, conviction abstracted)
    const ctx = buildPromptContext(profile);

    // System prompt specifying FeedCard[] schema, minimum 10 cards, one card per interest,
    // yearsAgo within the gap period, and readMinutes 1–10
    const systemPrompt = `You are a catch-up news curator. Return a JSON object with a "cards" key containing an array of at least 10 FeedCard objects matching this schema: { id (string), category (InterestKey), title (string), teaser (string), body (string), readMinutes (number 1-10), yearsAgo (number) }. The yearsAgo field must be within the incarceration period (${ctx.gapStartYear}–${ctx.gapEndYear}). Cover all interest categories provided. Each body should be 3–5 paragraphs of factual, plain-language catch-up content.`;

    const userPrompt = `Generate catch-up content for someone who was away from ${ctx.gapStartYear} to ${ctx.gapEndYear} (${ctx.gapYears} years). Interests: ${JSON.stringify(ctx.interests)}.`;

    // Call LLM with 20-second timeout (Requirement 3.9)
    const result = await callLLM<{ cards: FeedCard[] }>({
      systemPrompt,
      userPrompt,
      timeoutMs: 20_000,
      schema: 'FeedCard[]',
    });

    res.json(result.cards);
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
