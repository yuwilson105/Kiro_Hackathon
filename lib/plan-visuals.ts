import {
  BookOpen,
  Briefcase,
  FileText,
  Gavel,
  GraduationCap,
  HardHat,
  HeartPulse,
  Home,
  KeyRound,
  MessageCircle,
  Scale,
  Sparkle,
  Stamp,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import type { StepCategory } from '@/types/plan';

export type CategoryVisual = {
  primary: LucideIcon;
  secondary: LucideIcon;
  primaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  /** Unsplash photo URL — fills the step card header. Falls back to gradientFrom
   * as the View backgroundColor if the image fails to load. */
  imageUrl: string;
};

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

// Per-step image registry. Each step gets its own unique photo so two cards
// in the same category never share a hero image. Falls back to the category's
// default `imageUrl` for any step not listed here.
export const STEP_IMAGE: Record<string, string> = {
  // Documents / ID
  'visit-211-resource-center': UNSPLASH('1527689368864-3a821dbccc34'),
  'get-birth-certificate': UNSPLASH('1562564055-71e051d33c19'),
  'get-social-security-card': UNSPLASH('1521791055366-0d553872125f'),
  'get-state-id': UNSPLASH('1614680376593-902f74cf0d41'),
  'get-driver-license': UNSPLASH('1568642537847-2bbed64b9269'),

  // Housing
  'find-temporary-housing': UNSPLASH('1505691938895-1758d7feb511'),
  'contact-halfway-house-counselor': UNSPLASH('1554995207-c18c203602cb'),
  'find-stable-housing': UNSPLASH('1502672023488-70e25813eb80'),

  // Employment
  'update-resume': UNSPLASH('1586281380349-632531db7ed4'),
  'attend-job-readiness-workshop': UNSPLASH('1573164574001-518958d9baa2'),
  'get-osha-10-certification': UNSPLASH('1581094794329-c8112a89af12'),
  'apply-first-jobs': UNSPLASH('1486312338219-ce68d2c6f44d'),
  'first-job': UNSPLASH('1556761175-5973dc0f32e7'),
  'enroll-in-job-training-program': UNSPLASH('1517048676732-d65bc937f952'),

  // Finance
  'open-bank-account': UNSPLASH('1556742111-a301076d9d18'),
  'build-budget': UNSPLASH('1554224154-26032ffc0d07'),
  'apply-secured-credit-card': UNSPLASH('1556742031-c6961e8560b0'),
  'open-savings-account': UNSPLASH('1567427017947-545c5f8d16ad'),
  'enroll-snap-benefits': UNSPLASH('1542838132-92c53300491e'),
  'file-taxes': UNSPLASH('1554224155-1696413565d3'),

  // Health
  'apply-medicaid': UNSPLASH('1631815589968-fdb09a223b1e'),
  'attend-aa-na-meeting': UNSPLASH('1593008369280-e02a0aab02c8'),
  'mental-health-intake-appointment': UNSPLASH('1499209974431-9dddcece7f88'),

  // Family
  'reach-out-to-family': UNSPLASH('1511895426328-dc8714191300'),
  'reconnect-family': UNSPLASH('1469571486292-0ba58a3f068b'),

  // Education
  'enroll-in-ged-program': UNSPLASH('1456513080510-7bf3a84b82f8'),

  // Legal
  'legal-record-expungement-consult': UNSPLASH('1589994965851-a8f479c573a9'),
};

export const CATEGORY_VISUAL: Record<StepCategory, CategoryVisual> = {
  documents: {
    primary: FileText,
    secondary: Stamp,
    primaryColor: '#475569',
    gradientFrom: '#F8FAFC',
    gradientTo: '#E2E8F0',
    imageUrl: UNSPLASH('1554224155-8d04cb21cd6c'),
  },
  housing: {
    primary: KeyRound,
    secondary: Home,
    primaryColor: '#6FA8DC',
    gradientFrom: '#EFF6FB',
    gradientTo: '#DCEAF5',
    imageUrl: UNSPLASH('1560518883-ce09059eeffa'),
  },
  employment: {
    primary: Briefcase,
    secondary: HardHat,
    primaryColor: '#1E293B',
    gradientFrom: '#FFF8F1',
    gradientTo: '#FAE5CE',
    imageUrl: UNSPLASH('1521737711867-e3b97375f902'),
  },
  finance: {
    primary: Wallet,
    secondary: TrendingUp,
    primaryColor: '#0F766E',
    gradientFrom: '#F0FDFA',
    gradientTo: '#CCFBF1',
    imageUrl: UNSPLASH('1554224155-6726b3ff858f'),
  },
  health: {
    primary: HeartPulse,
    secondary: Stethoscope,
    primaryColor: '#BE185D',
    gradientFrom: '#FFF1F2',
    gradientTo: '#FFE4E6',
    imageUrl: UNSPLASH('1576091160550-2173dba999ef'),
  },
  family: {
    primary: Users,
    secondary: MessageCircle,
    primaryColor: '#92400E',
    gradientFrom: '#FEF3C7',
    gradientTo: '#FDE68A',
    imageUrl: UNSPLASH('1511895426328-dc8714191300'),
  },
  legal: {
    primary: Scale,
    secondary: Gavel,
    primaryColor: '#1E293B',
    gradientFrom: '#F1F5F9',
    gradientTo: '#CBD5E1',
    imageUrl: UNSPLASH('1589994965851-a8f479c573a9'),
  },
  education: {
    primary: BookOpen,
    secondary: GraduationCap,
    primaryColor: '#5B21B6',
    gradientFrom: '#FAF5FF',
    gradientTo: '#EDE9FE',
    imageUrl: UNSPLASH('1456513080510-7bf3a84b82f8'),
  },
};

export const MILESTONE_GHOST_ICON = Sparkle;
export const MILESTONE_ACCENT = '#F0B27A';
