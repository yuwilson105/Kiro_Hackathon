import { NextFunction, Request, Response, Router } from "express";
import { callLLM, LLMError } from "../services/openai";
import { buildPromptContext } from "../services/promptBuilder";
import {
  formatSearchContextForPrompt,
  searchForInterests,
} from "../services/webSearch";
import type { FeedCard } from "../types/feed";
import type { Profile } from "../types/profile";
import { ProfileSchema, validate } from "../validation/schemas";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = validate<Profile>(ProfileSchema, req.body);

    if (profile.gapStart === null || profile.gapEnd === null) {
      const error: { message: string; status: number; code: string } & Error =
        Object.assign(
          new Error("Incarceration dates are required for feed generation"),
          {
            status: 400,
            code: "VALIDATION_ERROR",
          },
        );
      throw error;
    }

    if (profile.interests.length === 0) {
      const error: { message: string; status: number; code: string } & Error =
        Object.assign(new Error("At least one interest is required"), {
          status: 400,
          code: "VALIDATION_ERROR",
        });
      throw error;
    }

    const ctx = buildPromptContext(profile);
    const startYear = ctx.gapStartYear as number;
    const endYear = ctx.gapEndYear as number;

    // Fetch real search results to ground the LLM
    const searchContexts = await searchForInterests(
      ctx.interests,
      startYear,
      endYear,
    );
    const searchBlock = formatSearchContextForPrompt(searchContexts);

    const hasSearchResults = searchBlock.length > 0;

    const systemPrompt = buildSystemPrompt(
      startYear,
      endYear,
      hasSearchResults,
    );
    const userPrompt = buildUserPrompt(
      ctx.interests,
      startYear,
      endYear,
      ctx.gapYears as number,
      searchBlock,
    );

    const result = await callLLM<{ cards: FeedCard[] }>({
      systemPrompt,
      userPrompt,
      timeoutMs: 25_000,
      schema: "FeedCard[]",
    });

    res.json(result.cards);
  } catch (error: unknown) {
    if (error instanceof LLMError) {
      res.json([]);
      return;
    }

    next(error);
  }
});

function buildSystemPrompt(
  startYear: number,
  endYear: number,
  hasSearchResults: boolean,
): string {
  const grounding = hasSearchResults
    ? `You will receive real search results as source material. Base your cards on these results. Do not invent events that are not supported by the provided sources. You may combine and summarize information from multiple results into a single card. Write each card body in plain language at a 7th-grade reading level.`
    : `Generate factual catch-up content based on your knowledge. Be accurate and specific about real events, dates, and outcomes.`;

  return [
    "You are a catch-up news curator for someone who was incarcerated and missed years of current events.",
    grounding,
    "",
    'Return a JSON object with a "cards" key containing an array of FeedCard objects.',
    "Each FeedCard has this shape:",
    "  { id: string, category: InterestKey, title: string, teaser: string, body: string, readMinutes: number, yearsAgo: number }",
    "",
    "Rules:",
    `- yearsAgo must be calculated from the current year (${new Date().getFullYear()}) to the year the event happened`,
    `- Events must fall within ${startYear}–${endYear}`,
    "- Generate at least 2 cards per interest category provided",
    "- readMinutes must be between 1 and 10",
    "- Each body should be 3–5 paragraphs of factual, plain-language content",
    '- id should be a kebab-case slug like "politics-2020-election"',
    "- title should be a clear, specific headline — not clickbait",
    "- teaser is one sentence summarizing the card",
    "- Write like a knowledgeable friend explaining what happened, not a news anchor",
  ].join("\n");
}

function buildUserPrompt(
  interests: string[],
  startYear: number,
  endYear: number,
  gapYears: number,
  searchBlock: string,
): string {
  const lines = [
    `Generate catch-up content for someone who was away from ${startYear} to ${endYear} (${gapYears} years).`,
    `Interests: ${JSON.stringify(interests)}.`,
  ];

  if (searchBlock) {
    lines.push(
      "",
      "Here are real search results to use as source material:",
      "",
      searchBlock,
    );
  }

  return lines.join("\n");
}

export default router;
