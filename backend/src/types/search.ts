import type { InterestKey } from "./profile";

export type SearchResult = {
  title: string;
  snippet: string;
  link: string;
  publishedDate: string | null;
};

export type InterestSearchContext = {
  interest: InterestKey;
  results: SearchResult[];
};
