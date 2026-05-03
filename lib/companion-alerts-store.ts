import { create } from 'zustand';

import type { Mood } from '@/types/check-in';

export type AlertReason = 'negative-mood' | 'manual';

type AlertState = {
  alert: { reason: AlertReason; mood?: Mood; timestamp: string } | null;
  setAlert: (reason: AlertReason, mood?: Mood) => void;
  clearAlert: () => void;
};

export const useCompanionAlertStore = create<AlertState>((set) => ({
  alert: null,
  setAlert: (reason, mood) =>
    set({ alert: { reason, mood, timestamp: new Date().toISOString() } }),
  clearAlert: () => set({ alert: null }),
}));
