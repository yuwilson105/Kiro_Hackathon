import type { ConvictionType, PriorityKey } from './profile';

export type StepCategory =
  | 'documents'
  | 'housing'
  | 'employment'
  | 'finance'
  | 'health'
  | 'family'
  | 'legal'
  | 'education';

export type StepUrgency = 'morning' | 'this-week' | 'this-month' | 'urgent';

export type LearnCard = {
  title: string;
  sections: { heading: string; body: string }[];
};

export type PlanStep = {
  id: string;
  title: string;
  description: string;
  category: StepCategory;
  urgency: StepUrgency;
  estimatedHours: number;
  prerequisites: string[];
  unlocks: string[];
  whyNow: string;
  resourceName?: string;
  resourceAddress?: string;
  resourcePhone?: string;
  appliesIfPriority?: PriorityKey[];
  excludeIfConviction?: ConvictionType[];
  learnCard?: LearnCard;
  isMilestone?: boolean;
};

export type PlanWeek = {
  index: number;
  steps: PlanStep[];
  estimatedHours: number;
};

export type Plan = {
  weeks: PlanWeek[];
  totalSteps: number;
  generatedAt: string;
};

export type StepStatus = 'locked' | 'pending' | 'in-progress' | 'complete';
