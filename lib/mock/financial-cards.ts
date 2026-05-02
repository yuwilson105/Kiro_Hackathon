/**
 * financial-cards.ts
 *
 * Re-exports the learnCard objects embedded in plan-graph.ts for the three
 * steps that carry inline financial-literacy content. Import this if you need
 * them by step id without loading the full graph.
 */

import type { LearnCard } from '@/types/plan';
import { PLAN_GRAPH } from '@/lib/mock/plan-graph';

function findLearnCard(id: string): LearnCard {
  const step = PLAN_GRAPH.find((s) => s.id === id);
  if (!step?.learnCard) throw new Error(`No learnCard for step "${id}"`);
  return step.learnCard;
}

export const financialCards: Record<string, LearnCard> = {
  'open-bank-account': findLearnCard('open-bank-account'),
  'apply-secured-credit-card': findLearnCard('apply-secured-credit-card'),
  'build-budget': findLearnCard('build-budget'),
};
