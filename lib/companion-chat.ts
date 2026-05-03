// Companion chat — local stub layer.
// Swap `sendCompanionMessage` for a real API call when ready; everything else
// (state shape, history serialization) is already in the form a chat API expects.

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
};

const STUB_REPLIES: string[] = [
  'Tell me a bit more about that.',
  'What part of it feels heaviest right now?',
  "How long has that been sitting with you?",
  'What would help most today — to be heard, or to think through a next step?',
  "I'm here. Take your time.",
  'Say more. I want to make sure I understand.',
  "Some of that takes a while to land. We don't have to rush it.",
];

let replyIndex = 0;

export async function sendCompanionMessage(
  _userText: string,
  _context: CompanionContext,
  _history: ChatMessage[],
): Promise<string> {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
  const reply = STUB_REPLIES[replyIndex % STUB_REPLIES.length];
  replyIndex += 1;
  return reply;
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
