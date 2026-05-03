export type ConvictionType = 'non-violent' | 'drug-related' | 'violent' | 'rather-not-say';

export type EducationLevel =
  | 'some-high-school'
  | 'high-school-diploma'
  | 'some-college'
  | 'college-degree';

export type WorkType =
  | 'manual-labor'
  | 'warehouse'
  | 'food-service'
  | 'retail'
  | 'construction'
  | 'office'
  | 'driving'
  | 'healthcare'
  | 'other';

export type HousingStatus = 'halfway-house' | 'family-friends' | 'own-place' | 'no-housing';

export type IdStatus = 'yes' | 'no' | 'expired';

export type PriorityKey =
  | 'finding-job'
  | 'getting-id'
  | 'finding-housing'
  | 'reconnecting-family'
  | 'mental-health'
  | 'building-finances'
  | 'learning-missed'
  | 'staying-out';

export type InterestKey =
  | 'lgbtq'
  | 'tech'
  | 'politics'
  | 'finance'
  | 'social-media'
  | 'music-entertainment'
  | 'mental-health-awareness'
  | 'criminal-justice'
  | 'womens-rights'
  | 'immigration'
  | 'climate'
  | 'sports';

export type City = {
  city: string;
  state: string;
};

export type Profile = {
  firstName: string;
  gapStart: string | null;
  gapEnd: string | null;
  city: City | null;
  conviction: ConvictionType | null;
  education: EducationLevel | null;
  workHistory: WorkType[];
  housing: HousingStatus | null;
  idStatus: IdStatus | null;
  priorities: PriorityKey[];
  interests: InterestKey[];
};

export const emptyProfile: Profile = {
  firstName: '',
  gapStart: null,
  gapEnd: null,
  city: null,
  conviction: null,
  education: null,
  workHistory: [],
  housing: null,
  idStatus: null,
  priorities: [],
  interests: [],
};
