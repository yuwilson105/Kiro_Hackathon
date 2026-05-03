import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LLMCallOptions = {
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
  schema: string; // JSON schema description embedded in system prompt
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
// OpenAI client — initialized once at module level
// ---------------------------------------------------------------------------

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------------------------------------------------------
// callLLM — generic wrapper around chat completions
// ---------------------------------------------------------------------------

export async function callLLM<T>(options: LLMCallOptions): Promise<T> {
  try {
    const response = await client.chat.completions.create(
      {
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        messages: [
          { role: 'system', content: options.systemPrompt },
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
