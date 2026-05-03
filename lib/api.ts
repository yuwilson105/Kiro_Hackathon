import type { FeedCard } from '@/types/feed';
import type { Plan } from '@/types/plan';
import type { Profile } from '@/types/profile';
import type { Resource } from '@/types/resource';

export type CompanionTone =
  | 'grounding'
  | 'celebrating'
  | 'normalizing'
  | 'rebuilding'
  | 'inviting'
  | 'crisis';

export type CompanionMessage = {
  text: string;
  tone: CompanionTone;
  isCrisis: boolean;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function generatePlanFromAPI(profile: Profile): Promise<Plan> {
  try {
    return await post<Plan>('/plan/generate', profile);
  } catch {
    return { weeks: [], totalSteps: 0, generatedAt: new Date().toISOString() };
  }
}

export async function generateFeedFromAPI(profile: Profile): Promise<FeedCard[]> {
  try {
    return await post<FeedCard[]>('/feed/generate', profile);
  } catch {
    return [];
  }
}

export async function findResourcesFromAPI(profile: Profile): Promise<Resource[]> {
  try {
    return await post<Resource[]>('/resources/find', profile);
  } catch {
    return [];
  }
}

export async function sendCompanionMessageToAPI(
  message: string,
  profile: Profile,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<CompanionMessage> {
  try {
    return await post<CompanionMessage>('/companion/respond', { message, profile, history });
  } catch (err) {
    console.error('[api] sendCompanionMessageToAPI failed:', err);
    return { text: "I hear you. I'm here.", tone: 'inviting', isCrisis: false };
  }
}
