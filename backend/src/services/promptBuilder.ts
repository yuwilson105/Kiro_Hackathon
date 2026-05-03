import type { HousingStatus, IdStatus, InterestKey, PriorityKey, Profile, WorkType } from '../types/profile';

export type SafePromptContext = {
  city: string | null;           // "Oakland, CA"
  gapYears: number | null;       // derived from gapStart/gapEnd
  gapStartYear: number | null;   // year only, not full date
  gapEndYear: number | null;     // year only, not full date
  housingStatus: HousingStatus | null;
  idStatus: IdStatus | null;
  educationLevel: string | null;
  workCategories: WorkType[];
  priorities: PriorityKey[];
  interests: InterestKey[];
  hasConviction: boolean;        // boolean only — type never forwarded
  convictionCategory: 'non-violent' | 'drug-related' | 'violent' | 'unspecified';
  // firstName is intentionally OMITTED
};

export function buildPromptContext(profile: Profile): SafePromptContext {
  const gapYears = profile.gapStart && profile.gapEnd
    ? Math.round(
        (new Date(profile.gapEnd).getTime() - new Date(profile.gapStart).getTime())
        / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return {
    city: profile.city ? `${profile.city.city}, ${profile.city.state}` : null,
    gapYears,
    gapStartYear: profile.gapStart ? new Date(profile.gapStart).getFullYear() : null,
    gapEndYear: profile.gapEnd ? new Date(profile.gapEnd).getFullYear() : null,
    housingStatus: profile.housing,
    idStatus: profile.idStatus,
    educationLevel: profile.education,
    workCategories: profile.workHistory,
    priorities: profile.priorities,
    interests: profile.interests,
    hasConviction: profile.conviction !== null,
    convictionCategory: (profile.conviction === 'rather-not-say' || profile.conviction === 'other')
      ? 'unspecified'
      : (profile.conviction ?? 'unspecified'),
  };
}
