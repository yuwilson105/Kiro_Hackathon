import type { InterestKey } from './profile';

export type FeedCard = {
  id: string;
  category: InterestKey;
  title: string;
  teaser: string;
  body: string;
  readMinutes: number;
  yearsAgo: number;
};
