export type ResourceCategory =
  | 'housing'
  | 'food'
  | 'jobs'
  | 'legal'
  | 'mental-health'
  | 'healthcare'
  | 'documents'
  | 'financial';

export type Resource = {
  id: string;
  name: string;
  category: ResourceCategory;
  address: string;
  city: string;
  state: string;
  phone: string;
  hours?: string;
  felonFriendly?: boolean;
  slidingScale?: boolean;
  description: string;
};
