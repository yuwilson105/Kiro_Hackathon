import type { WorkType } from './profile';

export type JobListing = {
  id: string;
  title: string;
  employer: string;
  location: string;
  description: string;
  matchScore: number;       // 0.0 – 1.0
  applyUrl?: string;
  felonFriendly: boolean;
  workTypes: WorkType[];
};

export type CompanionTone =
  | 'grounding' | 'celebrating' | 'normalizing'
  | 'rebuilding' | 'inviting' | 'crisis';

export type CompanionMessage = {
  text: string;
  tone: CompanionTone;
  isCrisis: boolean;
};

export type ErrorResponse = {
  error: string;
  code: string;
  retryAfter?: number;      // seconds, present on 503
};
