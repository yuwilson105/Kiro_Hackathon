import { sendCompanionMessageToAPI } from '@/lib/api';
import type { Profile } from '@/types/profile';

export type ChatRole = 'user' | 'companion';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

export type CompanionContext = {
  firstName: string;
  streakCurrent: number;
  profile: Profile;
};

export async function sendCompanionMessage(
  userText: string,
  context: CompanionContext,
  history: ChatMessage[],
): Promise<string> {
  try {
    // Convert chat history to the role/content format the API expects.
    // Exclude the seed greeting (id: 'seed-greeting') — it's a UI artifact, not a real turn.
    // Map 'companion' → 'assistant' to match the OpenAI message role convention.
    const apiHistory = history
      .filter((m) => m.id !== 'seed-greeting')
      .map((m) => ({
        role: m.role === 'companion' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

    const companionMessage = await sendCompanionMessageToAPI(
      userText,
      context.profile,
      apiHistory,
    );
    return companionMessage.text;
  } catch (err) {
    console.error('[companion] API call failed:', err);
    return "I hear you. I'm here.";
  }
}

export function makeSeedMessage(context: CompanionContext): ChatMessage {
  const name = context.firstName?.trim();
  const opener = name
    ? `Hey ${name}. I'm here whenever you want to talk.`
    : "Hey. I'm here whenever you want to talk.";
  return {
    id: 'seed-greeting',
    role: 'companion',
    content: opener,
    timestamp: Date.now(),
  };
}
