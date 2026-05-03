export type ConvictionType = 'non-violent' | 'drug-related' | 'violent' | 'other' | 'rather-not-say';

export type EducationLevel =
  | 'less-than-high-school'
  | 'some-high-school'
  | 'high-school-diploma'
  | 'some-college'
  | 'college-degree'
  | 'other';

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

export type HousingStatus = 'halfway-house' | 'family-friends' | 'own-place' | 'no-housing' | 'other';

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
  convictionDetails: string;
  education: EducationLevel | null;
  educationOther: string;
  workHistory: WorkType[];
  workOther: string;
  housing: HousingStatus | null;
  housingOther: string;
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
  convictionDetails: '',
  education: null,
  educationOther: '',
  workHistory: [],
  workOther: '',
  housing: null,
  housingOther: '',
  idStatus: null,
  priorities: [],
  interests: [],
};
