import type { InterestKey } from '@/types/profile';

export type Video = {
  id: string;
  category: InterestKey;
  title: string;
  durationSec: number;
  yearsAgo: number;
  /** Real Unsplash thumbnail URL — replace with the YouTube hqdefault later. */
  thumbnailUrl: string;
  /** Used to build a YouTube search URL when tapped. */
  searchQuery: string;
};

export const videos: Video[] = [
  {
    id: 'v-tech-smartphones',
    category: 'tech',
    title: 'Setting up your first smartphone in 2026: 5 must-do steps',
    durationSec: 372,
    yearsAgo: 0,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'how to set up new iPhone 2024 step by step beginner',
  },
  {
    id: 'v-finance-credit',
    category: 'finance',
    title: 'Credit scores explained in plain English',
    durationSec: 248,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'credit score explained simple beginner',
  },
  {
    id: 'v-mental-988',
    category: 'mental-health-awareness',
    title: 'What 988 actually does: a real walkthrough',
    durationSec: 184,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80&auto=format&fit=crop',
    searchQuery: '988 suicide crisis lifeline how it works walkthrough',
  },
  {
    id: 'v-justice-expungement',
    category: 'criminal-justice',
    title: 'How expungement works in California, step by step',
    durationSec: 487,
    yearsAgo: 3,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'expungement California how to clear criminal record',
  },
  {
    id: 'v-tech-banking-apps',
    category: 'tech',
    title: 'Which banking app is right for you',
    durationSec: 312,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'best banking app for beginners 2024 comparison',
  },
  {
    id: 'v-finance-budgeting',
    category: 'finance',
    title: 'A budget that actually works on a low income',
    durationSec: 421,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'budgeting low income beginner step by step',
  },
];

export function formatVideoDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function buildYouTubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
