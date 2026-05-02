/**
 * plan-generator.ts
 *
 * Pure functions that turn a Profile into a Plan.
 *
 * Algorithm overview:
 *  1. Filter PLAN_GRAPH by profile (conviction exclusions, priority inclusions).
 *  2. Topological sort the filtered set.
 *     - If a step's prerequisite was removed during filtering, treat that
 *       dependency as satisfied (the step keeps a relaxed prereq list).
 *  3. Pack topo-sorted steps into weeks (≤ 12 estimated hours per week).
 *  4. Return the assembled Plan.
 */

import type { Profile } from '@/types/profile';
import type { Plan, PlanStep, PlanWeek, StepStatus } from '@/types/plan';
import { PLAN_GRAPH } from '@/lib/mock/plan-graph';

const MAX_HOURS_PER_WEEK = 12;

// ─── Filtering ────────────────────────────────────────────────────────────────

function filterSteps(profile: Profile): PlanStep[] {
  const filtered = PLAN_GRAPH.filter((step) => {
    // Drop steps excluded by the user's conviction type.
    if (
      step.excludeIfConviction &&
      profile.conviction &&
      step.excludeIfConviction.includes(profile.conviction)
    ) {
      return false;
    }

    // Keep steps with no priority filter, or where at least one of the
    // user's selected priorities matches.
    if (step.appliesIfPriority) {
      if (profile.priorities.length === 0) return false;
      const matches = step.appliesIfPriority.some((p) =>
        profile.priorities.includes(p),
      );
      if (!matches) return false;
    }

    return true;
  });

  // Build the set of IDs that survived filtering.
  const keptIds = new Set(filtered.map((s) => s.id));

  // Relax prerequisites: remove prereqs that were filtered out.
  return filtered.map((step) => ({
    ...step,
    prerequisites: step.prerequisites.filter((prereq) => keptIds.has(prereq)),
    unlocks: step.unlocks.filter((u) => keptIds.has(u)),
  }));
}

// ─── Topological sort (Kahn's algorithm) ─────────────────────────────────────

function topoSort(steps: PlanStep[]): PlanStep[] {
  const stepMap = new Map<string, PlanStep>(steps.map((s) => [s.id, s]));
  const inDegree = new Map<string, number>(steps.map((s) => [s.id, 0]));

  for (const step of steps) {
    for (const prereq of step.prerequisites) {
      if (stepMap.has(prereq)) {
        inDegree.set(step.id, (inDegree.get(step.id) ?? 0) + 1);
      }
    }
  }

  // Queue: start with all steps that have no remaining prerequisites.
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: PlanStep[] = [];

  while (queue.length > 0) {
    // Stable sort within the queue: prefer urgent steps, then shorter ones.
    queue.sort((a, b) => {
      const sa = stepMap.get(a)!;
      const sb = stepMap.get(b)!;
      const urgencyOrder: Record<string, number> = {
        urgent: 0,
        'this-week': 1,
        'this-month': 2,
        morning: 3,
      };
      const urgencyDiff =
        (urgencyOrder[sa.urgency] ?? 99) - (urgencyOrder[sb.urgency] ?? 99);
      if (urgencyDiff !== 0) return urgencyDiff;
      return sa.estimatedHours - sb.estimatedHours;
    });

    const currentId = queue.shift()!;
    const current = stepMap.get(currentId)!;
    sorted.push(current);

    // Decrement in-degree for every step that depends on current.
    for (const step of steps) {
      if (step.prerequisites.includes(currentId)) {
        const newDegree = (inDegree.get(step.id) ?? 1) - 1;
        inDegree.set(step.id, newDegree);
        if (newDegree === 0) {
          queue.push(step.id);
        }
      }
    }
  }

  // If some steps were not reached (cycle guard), append them at the end.
  const sortedIds = new Set(sorted.map((s) => s.id));
  for (const step of steps) {
    if (!sortedIds.has(step.id)) {
      sorted.push(step);
    }
  }

  return sorted;
}

// ─── Week packing ─────────────────────────────────────────────────────────────

function packIntoWeeks(steps: PlanStep[]): PlanWeek[] {
  const weeks: PlanWeek[] = [];
  let currentWeek: PlanStep[] = [];
  let currentHours = 0;

  for (const step of steps) {
    if (currentWeek.length > 0 && currentHours + step.estimatedHours > MAX_HOURS_PER_WEEK) {
      weeks.push({
        index: weeks.length,
        steps: currentWeek,
        estimatedHours: currentHours,
      });
      currentWeek = [];
      currentHours = 0;
    }
    currentWeek.push(step);
    currentHours += step.estimatedHours;
  }

  if (currentWeek.length > 0) {
    weeks.push({
      index: weeks.length,
      steps: currentWeek,
      estimatedHours: currentHours,
    });
  }

  return weeks;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a full Plan from a Profile.
 * Returns an empty Plan if the profile is empty / null.
 */
export function generatePlan(profile: Profile): Plan {
  if (!profile || !profile.firstName) {
    return { weeks: [], totalSteps: 0, generatedAt: new Date().toISOString() };
  }

  const filtered = filterSteps(profile);
  if (filtered.length === 0) {
    return { weeks: [], totalSteps: 0, generatedAt: new Date().toISOString() };
  }

  const sorted = topoSort(filtered);
  const weeks = packIntoWeeks(sorted);

  return {
    weeks,
    totalSteps: sorted.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Re-run planning from a specific step, skipping already-completed steps.
 * Useful after a setback: the user marks where they fell off and we rebuild
 * the remainder of their roadmap.
 *
 * @param profile         The user's profile.
 * @param fromStepId      The step id to restart from.
 * @param completedSteps  Record of { stepId → completedAt ISO string }.
 */
export function regeneratePlanFromStep(
  profile: Profile,
  fromStepId: string,
  completedSteps: Record<string, string> = {},
): Plan {
  if (!profile || !profile.firstName) {
    return { weeks: [], totalSteps: 0, generatedAt: new Date().toISOString() };
  }

  const filtered = filterSteps(profile);
  const sorted = topoSort(filtered);

  // Find the index of fromStepId in the topo order.
  const fromIndex = sorted.findIndex((s) => s.id === fromStepId);

  // Keep only steps from fromStepId onward that are not already complete.
  const remaining = sorted
    .slice(fromIndex === -1 ? 0 : fromIndex)
    .filter((s) => !(s.id in completedSteps));

  if (remaining.length === 0) {
    return { weeks: [], totalSteps: 0, generatedAt: new Date().toISOString() };
  }

  const weeks = packIntoWeeks(remaining);

  return {
    weeks,
    totalSteps: remaining.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Compute the display status of a single step.
 *
 * - 'locked'      — at least one prerequisite is not yet complete.
 * - 'in-progress' — the step is in the inProgressSteps set.
 * - 'complete'    — the step id exists in completedSteps.
 * - 'pending'     — all prereqs done, not started, not complete.
 */
export function computeStepStatus(
  stepId: string,
  completedSteps: Record<string, string>,
  inProgressSteps: Record<string, true>,
  plan: Plan,
): StepStatus {
  if (stepId in completedSteps) return 'complete';
  if (stepId in inProgressSteps) return 'in-progress';

  // Find the step in the plan to check prerequisites.
  let step: PlanStep | undefined;
  for (const week of plan.weeks) {
    for (const s of week.steps) {
      if (s.id === stepId) {
        step = s;
        break;
      }
    }
    if (step) break;
  }

  if (!step) return 'locked';

  const prereqsMet = step.prerequisites.every((prereq) => prereq in completedSteps);
  return prereqsMet ? 'pending' : 'locked';
}
