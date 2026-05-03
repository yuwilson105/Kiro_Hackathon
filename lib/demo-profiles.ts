// Demo profile loaders for the dev menu.
//
// `loadMarcusDemoProfile` populates a 6-week lived-in state — streak, completed
// steps, mood history, saved articles, unlocked milestone — so every screen
// has a story to tell during the hackathon video.
//
// `loadGenericDemoProfile` populates a minimum-viable post-onboarding state
// (random name, sensible defaults, zero progression) so the founder can demo
// the empty/early experience too.

import { router } from 'expo-router';

import { feedCards } from '@/lib/mock/feed';
import { generatePlan } from '@/lib/plan-generator';
import { useStore } from '@/lib/store';
import type { MoodEntry } from '@/types/check-in';
import type { Profile } from '@/types/profile';

const MARCUS_PROFILE: Profile = {
  firstName: 'Marcus',
  gapStart: '2018-03-01',
  gapEnd: '2026-04-01',
  city: { city: 'San Francisco', state: 'CA' },
  conviction: 'non-violent',
  convictionDetails: '',
  education: 'high-school-diploma',
  educationOther: '',
  workHistory: ['warehouse', 'construction'],
  workOther: '',
  housing: 'halfway-house',
  housingOther: '',
  idStatus: 'no',
  priorities: ['getting-id', 'finding-job', 'finding-housing'],
  interests: ['tech', 'finance', 'criminal-justice', 'mental-health-awareness'],
};

const MARCUS_COMPLETED: Record<string, string> = {
  'visit-211-resource-center': '2026-04-02',
  'contact-halfway-house-counselor': '2026-04-03',
  'reach-out-to-family': '2026-04-05',
  'get-birth-certificate': '2026-04-08',
  'get-social-security-card': '2026-04-13',
  'attend-aa-na-meeting': '2026-04-15',
  'get-state-id': '2026-04-20',
  'apply-medicaid': '2026-04-23',
  'enroll-snap-benefits': '2026-04-27',
  'update-resume': '2026-04-30',
};

const MARCUS_IN_PROGRESS: Record<string, true> = {
  'mental-health-intake-appointment': true,
  'attend-job-readiness-workshop': true,
  'apply-first-jobs': true,
};

const MARCUS_MOOD: MoodEntry[] = [
  { date: '2026-04-02', mood: 'struggling', note: "First night out, can't sleep" },
  { date: '2026-04-04', mood: 'need-talk' },
  { date: '2026-04-07', mood: 'struggling', note: 'Overwhelmed at DMV' },
  { date: '2026-04-10', mood: 'okay', note: 'Better today' },
  { date: '2026-04-13', mood: 'okay' },
  { date: '2026-04-16', mood: 'good', note: 'Sponsor called' },
  { date: '2026-04-20', mood: 'good', note: 'Got my ID!!' },
  { date: '2026-04-22', mood: 'good' },
  { date: '2026-04-24', mood: 'okay' },
  { date: '2026-04-27', mood: 'struggling', note: 'Job rejection email' },
  { date: '2026-04-29', mood: 'okay' },
  { date: '2026-05-01', mood: 'good' },
  { date: '2026-05-02', mood: 'good', note: 'Six weeks clean' },
];

export function loadMarcusDemoProfile(): void {
  const plan = generatePlan(MARCUS_PROFILE);

  // Saved: 2 articles per interest he selected.
  const savedSet = new Set<string>();
  for (const interest of MARCUS_PROFILE.interests) {
    const matches = feedCards.filter((c) => c.category === interest).slice(0, 2);
    for (const c of matches) savedSet.add(c.id);
  }

  // Read: all articles except the 5 newest (smallest `yearsAgo`).
  const sortedAsc = [...feedCards].sort((a, b) => a.yearsAgo - b.yearsAgo);
  const stillUnread = new Set(sortedAsc.slice(0, 5).map((c) => c.id));
  const readFeedIds = feedCards.filter((c) => !stillUnread.has(c.id)).map((c) => c.id);

  useStore.setState({
    profile: MARCUS_PROFILE,
    plan,
    hasOnboarded: true,
    streak: { current: 12, lastCheckinDate: '2026-05-02' },
    completedSteps: MARCUS_COMPLETED,
    inProgressSteps: MARCUS_IN_PROGRESS,
    moodHistory: MARCUS_MOOD,
    savedFeedIds: Array.from(savedSet),
    readFeedIds,
    unlockedMilestoneId: 'get-state-id',
    lastCheckinShownDate: '2026-05-02',
  });

  router.replace('/(tabs)');
}

const GENERIC_PROFILE: Profile = {
  firstName: 'Alex',
  gapStart: '2020-06-01',
  gapEnd: '2026-04-15',
  city: { city: 'Oakland', state: 'CA' },
  conviction: 'rather-not-say',
  convictionDetails: '',
  education: 'some-college',
  educationOther: '',
  workHistory: ['retail'],
  workOther: '',
  housing: 'family-friends',
  housingOther: '',
  idStatus: 'no',
  priorities: ['getting-id', 'finding-job'],
  interests: ['tech', 'finance'],
};

export function loadGenericDemoProfile(): void {
  const plan = generatePlan(GENERIC_PROFILE);

  useStore.setState({
    profile: GENERIC_PROFILE,
    plan,
    hasOnboarded: true,
    streak: { current: 0, lastCheckinDate: null },
    completedSteps: {},
    inProgressSteps: {},
    moodHistory: [],
    savedFeedIds: [],
    readFeedIds: [],
    unlockedMilestoneId: null,
    lastCheckinShownDate: null,
  });

  router.replace('/(tabs)');
}
