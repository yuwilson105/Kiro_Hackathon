import { NextFunction, Request, Response, Router } from 'express';
import { callLLM, LLMError } from '../services/openai';
import { buildPromptContext } from '../services/promptBuilder';
import type { Plan } from '../types/plan';
import type { Profile } from '../types/profile';
import { ProfileSchema, validate } from '../validation/schemas';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body — returns 400 if firstName or priorities are missing
    const profile = validate<Profile>(ProfileSchema, req.body);

    // Build anonymized prompt context (firstName omitted, conviction abstracted)
    const ctx = buildPromptContext(profile);

    // System prompt specifying Plan JSON schema, constraints, and rules
    const systemPrompt = `You are a reentry planning assistant. Generate a personalized weekly reentry plan as a JSON object matching this schema: { weeks: PlanWeek[], totalSteps: number, generatedAt: string }. Each PlanWeek has { index, steps: PlanStep[], estimatedHours }. Each PlanStep has { id, title, description, category, urgency, estimatedHours, prerequisites, unlocks, whyNow, resourceName?, resourceAddress?, resourcePhone?, learnCard? }. Rules:
- estimatedHours per week must not exceed 12
- urgent steps appear in earlier weeks than this-month steps
- prerequisites must appear in earlier weeks than the steps that depend on them
- include location-specific resources for city: ${ctx.city}
- do not include steps inappropriate for conviction category: ${ctx.convictionCategory}
- cover all priorities: ${JSON.stringify(ctx.priorities)}`;

    const userPrompt = `Generate a reentry plan for someone with these characteristics:\n${JSON.stringify(ctx)}`;

    // Call LLM with 30-second timeout
    const plan = await callLLM<Plan>({
      systemPrompt,
      userPrompt,
      timeoutMs: 30_000,
      schema: 'Plan',
    });

    res.json(plan);
  } catch (error: unknown) {
    // On LLM failure, return fallback response instead of 5xx
    if (error instanceof LLMError) {
      res.json({
        weeks: [],
        totalSteps: 0,
        generatedAt: new Date().toISOString(),
      });
      return;
    }

    // Validation errors and other errors pass to the error handler middleware
    next(error);
  }
});

export default router;
