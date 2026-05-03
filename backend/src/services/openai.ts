import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LLMCallOptions = {
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
  schema: string; // JSON schema description embedded in system prompt
  history?: Array<{ role: 'user' | 'assistant'; content: string }>; // prior turns
};

export class LLMError extends Error {
  status: number;
  code: string;
  retryAfter: number;

  constructor(message: string, retryAfter = 30) {
    super(message);
    this.name = 'LLMError';
    this.status = 503;
    this.code = 'LLM_UNAVAILABLE';
    this.retryAfter = retryAfter;
  }
}

// ---------------------------------------------------------------------------
// Groq client (OpenAI-compatible) — initialized once at module level
// ---------------------------------------------------------------------------

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? (() => { throw new Error('GROQ_API_KEY environment variable is missing or empty'); })(),
  baseURL: 'https://api.groq.com/openai/v1',
});

// ---------------------------------------------------------------------------
// callLLM — generic wrapper around chat completions
// ---------------------------------------------------------------------------

export async function callLLM<T>(options: LLMCallOptions): Promise<T> {
  try {
    const response = await client.chat.completions.create(
      {
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        messages: [
          { role: 'system', content: options.systemPrompt },
          ...(options.history ?? []),
          { role: 'user', content: options.userPrompt },
        ],
      },
      {
        signal: AbortSignal.timeout(options.timeoutMs),
      },
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new LLMError('LLM returned an empty response');
    }

    const parsed: T = JSON.parse(content);
    return parsed;
  } catch (error: unknown) {
    // Already an LLMError — re-throw as-is
    if (error instanceof LLMError) {
      throw error;
    }

    // Timeout (AbortSignal.timeout throws a DOMException with name "TimeoutError")
    if (
      error instanceof DOMException &&
      error.name === 'TimeoutError'
    ) {
      throw new LLMError(
        `LLM call timed out after ${options.timeoutMs}ms`,
      );
    }

    // OpenAI SDK API errors
    if (error instanceof OpenAI.APIError) {
      const retryAfter =
        typeof error.headers?.['retry-after'] === 'string'
          ? parseInt(error.headers['retry-after'], 10)
          : 30;

      throw new LLMError(
        `OpenAI API error: ${error.message}`,
        Number.isFinite(retryAfter) ? retryAfter : 30,
      );
    }

    // JSON parse errors or any other unexpected error
    const message =
      error instanceof Error ? error.message : 'Unknown LLM error';
    throw new LLMError(message);
  }
}
