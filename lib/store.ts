import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MoodEntry } from '@/types/check-in';
import type { Plan } from '@/types/plan';
import { emptyProfile, type Profile } from '@/types/profile';

type StreakState = {
  current: number;
  lastCheckinDate: string | null;
};

type State = {
  hasOnboarded: boolean;
  profile: Profile;
  plan: Plan | null;
  streak: StreakState;
  completedSteps: Record<string, string>;
  inProgressSteps: Record<string, true>;
  moodHistory: MoodEntry[];
  savedFeedIds: string[];
  readFeedIds: string[];
  lastCheckinShownDate: string | null;
  unlockedMilestoneId: string | null;
  setProfile: (patch: Partial<Profile>) => void;
  setPlan: (plan: Plan) => void;
  finishOnboarding: () => void;
  resetOnboarding: () => void;
  toggleStepInProgress: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  registerMood: (entry: MoodEntry) => void;
  markCheckinShown: (date: string) => void;
  toggleFeedSaved: (id: string) => void;
  markFeedRead: (id: string) => void;
  setMilestoneUnlocked: (id: string | null) => void;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const useStore = create<State>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      profile: emptyProfile,
      plan: null,
      streak: { current: 0, lastCheckinDate: null },
      completedSteps: {},
      inProgressSteps: {},
      moodHistory: [],
      savedFeedIds: [],
      readFeedIds: [],
      lastCheckinShownDate: null,
      unlockedMilestoneId: null,
      setProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      setPlan: (plan) => set({ plan }),
      finishOnboarding: () => set({ hasOnboarded: true }),
      resetOnboarding: () =>
        set({
          hasOnboarded: false,
          profile: emptyProfile,
          plan: null,
          streak: { current: 0, lastCheckinDate: null },
          completedSteps: {},
          inProgressSteps: {},
          moodHistory: [],
          savedFeedIds: [],
          readFeedIds: [],
          lastCheckinShownDate: null,
          unlockedMilestoneId: null,
        }),
      toggleStepInProgress: (stepId) =>
        set((s) => {
          const next = { ...s.inProgressSteps };
          if (next[stepId]) delete next[stepId];
          else next[stepId] = true;
          return { inProgressSteps: next };
        }),
      completeStep: (stepId) =>
        set((s) => {
          if (s.completedSteps[stepId]) return s;
          const completedSteps = { ...s.completedSteps, [stepId]: todayISO() };
          const inProgressSteps = { ...s.inProgressSteps };
          delete inProgressSteps[stepId];
          return { completedSteps, inProgressSteps };
        }),
      registerMood: (entry) =>
        set((s) => {
          const history = s.moodHistory.filter((m) => m.date !== entry.date);
          history.push(entry);
          history.sort((a, b) => a.date.localeCompare(b.date));
          const today = todayISO();
          let nextStreak = s.streak.current;
          if (s.streak.lastCheckinDate !== entry.date && entry.date === today) {
            const last = s.streak.lastCheckinDate;
            const gap = last
              ? Math.round((Date.now() - new Date(last).getTime()) / 86400000)
              : 1;
            nextStreak = gap === 1 ? s.streak.current + 1 : 1;
          }
          return {
            moodHistory: history,
            streak: { current: nextStreak, lastCheckinDate: entry.date },
          };
        }),
      markCheckinShown: (date) => set({ lastCheckinShownDate: date }),
      toggleFeedSaved: (id) =>
        set((s) => {
          const has = s.savedFeedIds.includes(id);
          return {
            savedFeedIds: has
              ? s.savedFeedIds.filter((x) => x !== id)
              : [...s.savedFeedIds, id],
          };
        }),
      markFeedRead: (id) =>
        set((s) =>
          s.readFeedIds.includes(id)
            ? s
            : { readFeedIds: [...s.readFeedIds, id] }
        ),
      setMilestoneUnlocked: (id) => set({ unlockedMilestoneId: id }),
    }),
    {
      name: 'second-chance-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
