// ── Crisis phrases — ported from lib/companion-voice.ts (substring scan only) ──

const CRISIS_PHRASES = [
  'end it',
  'end my life',
  'kill myself',
  'want to die',
  'no point',
  "can't go on",
  'cant go on',
  'harm myself',
  'give up on life',
  'suicidal',
  'suicide',
];

/**
 * Detects crisis language in a user message via substring scan.
 * Pure function — no side effects, no async, no external dependencies.
 */
export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_PHRASES.some(phrase => lower.includes(phrase));
}
