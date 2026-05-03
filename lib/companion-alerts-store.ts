import { create } from 'zustand';

export type AlertReason = 'struggling-mood' | 'manual';

type AlertState = {
  alert: { reason: AlertReason; timestamp: string } | null;
  setAlert: (reason: AlertReason) => void;
  clearAlert: () => void;
};

export const useCompanionAlertStore = create<AlertState>((set) => ({
  alert: null,
  setAlert: (reason) =>
    set({ alert: { reason, timestamp: new Date().toISOString() } }),
  clearAlert: () => set({ alert: null }),
}));
