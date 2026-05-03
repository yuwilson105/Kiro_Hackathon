import { z } from 'zod';

// --- Enum schemas matching types/profile.ts exactly ---

const ConvictionTypeSchema = z.enum([
  'non-violent',
  'drug-related',
  'violent',
  'other',
  'rather-not-say',
]);

const EducationLevelSchema = z.enum([
  'less-than-high-school',
  'some-high-school',
  'high-school-diploma',
  'some-college',
  'college-degree',
  'other',
]);

const WorkTypeSchema = z.enum([
  'manual-labor',
  'warehouse',
  'food-service',
  'retail',
  'construction',
  'office',
  'driving',
  'healthcare',
  'other',
]);

const HousingStatusSchema = z.enum([
  'halfway-house',
  'family-friends',
  'own-place',
  'no-housing',
  'other',
]);

const IdStatusSchema = z.enum(['yes', 'no', 'expired']);

const PriorityKeySchema = z.enum([
  'finding-job',
  'getting-id',
  'finding-housing',
  'reconnecting-family',
  'mental-health',
  'building-finances',
  'learning-missed',
  'staying-out',
]);

const InterestKeySchema = z.enum([
  'lgbtq',
  'tech',
  'ai',
  'phones',
  'politics',
  'voting',
  'finance',
  'social-media',
  'music-entertainment',
  'mental-health-awareness',
  'healthcare',
  'criminal-justice',
  'womens-rights',
  'immigration',
  'housing',
  'jobs',
  'climate',
  'sports',
]);

const CitySchema = z.object({
  city: z.string(),
  state: z.string(),
});

// --- Exported request body schemas ---

export const ProfileSchema = z.object({
  firstName: z.string(),
  gapStart: z.string().nullable(),
  gapEnd: z.string().nullable(),
  city: CitySchema.nullable(),
  conviction: ConvictionTypeSchema.nullable(),
  convictionDetails: z.string().optional(),
  education: EducationLevelSchema.nullable(),
  educationOther: z.string().optional(),
  workHistory: z.array(WorkTypeSchema),
  workOther: z.string().optional(),
  housing: HousingStatusSchema.nullable(),
  housingOther: z.string().optional(),
  idStatus: IdStatusSchema.nullable(),
  priorities: z.array(PriorityKeySchema),
  interests: z.array(InterestKeySchema),
}).passthrough();

export const CompanionRequestSchema = z.object({
  message: z.string().min(1, 'message is required'),
  profile: ProfileSchema,
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ).optional(),
});

// --- Validation helper ---

/**
 * Validates unknown data against a Zod schema.
 * Returns the parsed, typed result on success.
 * Throws an error with `status: 400` and a descriptive message on failure.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const message = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  const error: any = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  throw error;
}
