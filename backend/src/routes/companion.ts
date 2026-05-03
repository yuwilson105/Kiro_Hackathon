import { NextFunction, Request, Response, Router } from 'express';
import OpenAI from 'openai';
import { detectCrisis } from '../services/crisisDetector';
import { LLMError } from '../services/openai';
import { buildPromptContext } from '../services/promptBuilder';
import type { CompanionMessage, CompanionTone } from '../types/api';
import type { Profile } from '../types/profile';
import { CompanionRequestSchema, validate } from '../validation/schemas';

const router = Router();

const CRISIS_TEXT =
  "I'm really glad you told me. What you're carrying is real, and it doesn't have to be carried alone. The 988 Lifeline is open right now — free and confidential. They're trained for exactly this. Tap the call button when you're ready.";

type HistoryTurn = { role: 'user' | 'assistant'; content: string };

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? '',
  baseURL: 'https://api.groq.com/openai/v1',
});

// Companion uses plain text mode — no JSON wrapping, more natural responses
async function callCompanionLLM(
  systemPrompt: string,
  message: string,
  history: HistoryTurn[],
  timeoutMs: number,
): Promise<{ text: string; tone: CompanionTone }> {
  const response = await client.chat.completions.create(
    {
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ],
    },
    { signal: AbortSignal.timeout(timeoutMs) },
  );

  const text = response.choices[0]?.message?.content?.trim() ?? '';

  // Infer tone from content keywords — simple heuristic
  let tone: CompanionTone = 'inviting';
  const lower = text.toLowerCase();
  if (lower.includes('proud') || lower.includes('great') || lower.includes('amazing') || lower.includes('well done')) {
    tone = 'celebrating';
  } else if (lower.includes('normal') || lower.includes('common') || lower.includes('many people') || lower.includes('not alone')) {
    tone = 'normalizing';
  } else if (lower.includes('breath') || lower.includes('ground') || lower.includes('right now') || lower.includes('this moment')) {
    tone = 'grounding';
  } else if (lower.includes('step') || lower.includes('next') || lower.includes('plan') || lower.includes('move forward')) {
    tone = 'rebuilding';
  }

  return { text, tone };
}

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, profile, history } = validate<{
      message: string;
      profile: Profile;
      history?: HistoryTurn[];
    }>(CompanionRequestSchema, req.body);

    // Crisis check — always before any LLM call
    if (detectCrisis(message)) {
      const crisisResponse: CompanionMessage = {
        text: CRISIS_TEXT,
        tone: 'crisis',
        isCrisis: true,
      };
      res.json(crisisResponse);
      return;
    }

    const ctx = buildPromptContext(profile);

    const systemPrompt = `You are a warm, grounded companion for someone who recently came home after years of incarceration. You speak like a trusted friend who has been through hard things — honest, specific, never preachy. You know their situation: housing is ${ctx.housingStatus ?? 'uncertain'}, their main priorities are ${ctx.priorities.join(', ') || 'getting back on their feet'}.

Rules:
- Respond in 2–4 sentences maximum. Be direct and human.
- Never use therapy-speak, corporate wellness language, or clichés like "journey", "empower", "reach out".
- Ask one follow-up question when it feels natural — not every time.
- If they share something hard, acknowledge it first before offering anything practical.
- Never mention incarceration dates, conviction type, or legal history.
- Speak in plain, everyday language. Short sentences. Real words.`;

    const trimmedHistory = (history ?? []).slice(-10);

    const { text, tone } = await callCompanionLLM(
      systemPrompt,
      message,
      trimmedHistory,
      20_000,
    );

    if (!text) {
      throw new LLMError('Empty response from companion LLM');
    }

    res.json({ text, tone, isCrisis: false } satisfies CompanionMessage);
  } catch (error: unknown) {
    if (error instanceof LLMError) {
      res.json({
        text: "I hear you. I'm here.",
        tone: 'inviting',
        isCrisis: false,
      } satisfies CompanionMessage);
      return;
    }
    next(error);
  }
});

export default router;
