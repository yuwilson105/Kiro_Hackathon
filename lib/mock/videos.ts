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
  {
    id: 'v-ai-chatgpt-basics',
    category: 'ai',
    title: 'ChatGPT in 6 minutes: what it is and what to ask it',
    durationSec: 366,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'ChatGPT explained beginners 2024',
  },
  {
    id: 'v-ai-deepfake-spotting',
    category: 'ai',
    title: 'How to spot a deepfake call or video',
    durationSec: 298,
    yearsAgo: 0,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'deepfake detection AI scam call how to spot',
  },
  {
    id: 'v-ai-jobs-impact',
    category: 'ai',
    title: 'Which jobs AI is actually changing in 2026',
    durationSec: 412,
    yearsAgo: 0,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'AI impact on jobs 2024 industries changing',
  },
  {
    id: 'v-phones-2fa',
    category: 'phones',
    title: 'Two-factor authentication, explained without the jargon',
    durationSec: 247,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'two factor authentication 2FA explained simple',
  },
  {
    id: 'v-phones-qr-codes',
    category: 'phones',
    title: 'QR codes 101: every place you will see them now',
    durationSec: 192,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'QR code how to scan phone restaurant menu',
  },
  {
    id: 'v-voting-rights-restoration',
    category: 'voting',
    title: "Restoring your right to vote after a felony, by state",
    durationSec: 503,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1546514714-bfa9c12c2e6e?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'voting rights restoration felony by state guide',
  },
  {
    id: 'v-voting-mail-in',
    category: 'voting',
    title: 'How mail-in voting actually works',
    durationSec: 268,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'mail in voting process explained absentee ballot',
  },
  {
    id: 'v-politics-decade-recap',
    category: 'politics',
    title: 'A short recap of the last decade in American politics',
    durationSec: 612,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'last decade American politics recap 2010s 2020s',
  },
  {
    id: 'v-social-tiktok-101',
    category: 'social-media',
    title: 'TikTok in plain English: what it is, who is on it',
    durationSec: 304,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'what is TikTok explained beginners',
  },
  {
    id: 'v-social-facebook-changes',
    category: 'social-media',
    title: 'How Facebook changed while you were away',
    durationSec: 358,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'Facebook changes meta last 10 years overview',
  },
  {
    id: 'v-music-streaming-guide',
    category: 'music-entertainment',
    title: 'Spotify, Apple Music, YouTube: which streaming pick',
    durationSec: 287,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'Spotify vs Apple Music vs YouTube Music comparison',
  },
  {
    id: 'v-music-decade-shift',
    category: 'music-entertainment',
    title: 'How music distribution changed: no more albums, just drops',
    durationSec: 391,
    yearsAgo: 3,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'music industry changes streaming albums singles drops',
  },
  {
    id: 'v-mental-therapy-app',
    category: 'mental-health-awareness',
    title: 'Therapy apps vs. real therapy: a fair comparison',
    durationSec: 422,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518339530488-e2bff97a3e0d?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'therapy apps vs real therapy comparison BetterHelp',
  },
  {
    id: 'v-health-aca-medicaid',
    category: 'healthcare',
    title: 'Medicaid expansion since 2014: how to actually qualify',
    durationSec: 451,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'Medicaid expansion ACA how to apply qualify',
  },
  {
    id: 'v-health-telehealth',
    category: 'healthcare',
    title: 'Telehealth visits: what they are good for, and what they are not',
    durationSec: 278,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'telehealth virtual doctor visit how it works',
  },
  {
    id: 'v-justice-firststep-act',
    category: 'criminal-justice',
    title: 'The First Step Act, explained for the people it affects',
    durationSec: 533,
    yearsAgo: 4,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'First Step Act 2018 explained federal prison reform',
  },
  {
    id: 'v-lgbtq-decade',
    category: 'lgbtq',
    title: 'Marriage equality and what came next',
    durationSec: 396,
    yearsAgo: 3,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'marriage equality after Obergefell timeline US',
  },
  {
    id: 'v-womens-roe-overview',
    category: 'womens-rights',
    title: "Where reproductive rights stand right now, state by state",
    durationSec: 487,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'reproductive rights state by state map current law',
  },
  {
    id: 'v-immigration-current',
    category: 'immigration',
    title: 'A short tour of the immigration system in 2026',
    durationSec: 612,
    yearsAgo: 0,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'US immigration system overview 2024',
  },
  {
    id: 'v-housing-renting',
    category: 'housing',
    title: "Renting with a record: what landlords can and can't do",
    durationSec: 412,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'renting apartment with criminal record fair chance housing',
  },
  {
    id: 'v-housing-section8',
    category: 'housing',
    title: 'Section 8 housing: who qualifies, how the waitlist works',
    durationSec: 358,
    yearsAgo: 3,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'Section 8 housing voucher how to apply waitlist',
  },
  {
    id: 'v-jobs-ban-the-box',
    category: 'jobs',
    title: 'Ban-the-box laws and how to use them in an interview',
    durationSec: 322,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'ban the box laws job application interview answer',
  },
  {
    id: 'v-jobs-resume-2026',
    category: 'jobs',
    title: 'Writing a resume that survives ATS scanners',
    durationSec: 401,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'resume tips ATS applicant tracking system 2024',
  },
  {
    id: 'v-jobs-gig-economy',
    category: 'jobs',
    title: "Driving for Uber, DoorDash, Instacart: a real comparison",
    durationSec: 467,
    yearsAgo: 1,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'Uber DoorDash Instacart driver pay comparison gig work',
  },
  {
    id: 'v-climate-everyday',
    category: 'climate',
    title: 'Climate change in everyday life: what is actually different',
    durationSec: 524,
    yearsAgo: 2,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'climate change everyday impact heat weather change',
  },
  {
    id: 'v-sports-decade-recap',
    category: 'sports',
    title: 'Five championship moments you missed',
    durationSec: 588,
    yearsAgo: 0,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&auto=format&fit=crop',
    searchQuery: 'biggest sports moments last decade highlights',
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
