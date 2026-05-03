import {
  Banknote,
  BookMarked,
  Briefcase,
  Coffee,
  FolderOpen,
  KeyRound,
  Soup,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react-native';

import type { Resource, ResourceCategory } from '@/types/resource';

export type ResourceVisual = {
  primary: LucideIcon;
  primaryColor: string;
  /** Fallback bg shown if the photo fails to load. Tones are tuned to keep the
   *  card on-register even when all images are missing. */
  gradientFrom: string;
};

export const RESOURCE_CATEGORY_VISUAL: Record<ResourceCategory, ResourceVisual> = {
  housing: { primary: KeyRound, primaryColor: '#9C6B3F', gradientFrom: '#F4EADD' },
  food: { primary: Soup, primaryColor: '#B45309', gradientFrom: '#FBF1E2' },
  jobs: { primary: Briefcase, primaryColor: '#1E293B', gradientFrom: '#F1ECE3' },
  legal: { primary: BookMarked, primaryColor: '#3F2C1B', gradientFrom: '#EFE8DC' },
  'mental-health': { primary: Coffee, primaryColor: '#7C5E3C', gradientFrom: '#F2EBE0' },
  healthcare: { primary: Stethoscope, primaryColor: '#0F766E', gradientFrom: '#E8F1EE' },
  documents: { primary: FolderOpen, primaryColor: '#475569', gradientFrom: '#F1EDE6' },
  financial: { primary: Banknote, primaryColor: '#0F5132', gradientFrom: '#ECEFE7' },
};

const PICSUM_W = 800;
const PICSUM_H = 450; // 16:9, matches the header aspectRatio

/**
 * Stable, unique photo per resource. Picsum's seeded endpoint guarantees:
 * uniqueness per id, no 404s, deterministic across devices.
 *
 * Photos are not category-themed (Picsum is a general pool); the category
 * icon chip overlay carries category meaning.
 */
export function imageUrlFor(resource: Pick<Resource, 'id' | 'category'>): string {
  const seed = resource.id?.trim() || `category-${resource.category}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${PICSUM_W}/${PICSUM_H}`;
}
