import { create } from 'zustand';

// Separate from the main lib/store.ts so this can ship without touching that
// file while it's under active iteration. If/when the main store stabilizes,
// fold this in there alongside savedFeedIds.

type SavedVideosState = {
  savedVideoIds: string[];
  toggleVideoSaved: (id: string) => void;
};

export const useSavedVideosStore = create<SavedVideosState>((set) => ({
  savedVideoIds: [],
  toggleVideoSaved: (id) =>
    set((s) => ({
      savedVideoIds: s.savedVideoIds.includes(id)
        ? s.savedVideoIds.filter((x) => x !== id)
        : [...s.savedVideoIds, id],
    })),
}));
