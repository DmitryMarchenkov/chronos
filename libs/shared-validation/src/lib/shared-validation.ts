import { z } from 'zod';
import {
  AssessmentDomain,
  AssessmentType,
  LeadStatus,
  Role,
} from '@chronos/shared-types';

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const createClientSchema = z.object({
  name: z.string().min(2).max(120),
});

export const createLeadSchema = z.object({
  name: z.string().min(2).max(120),
  contact: z.string().min(2).max(120),
  source: z.string().min(2).max(80),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(LeadStatus),
});

export const createAssessmentSchema = z.object({
  type: z.nativeEnum(AssessmentType),
});

export const domainScoreSchema = z.object({
  domain: z.nativeEnum(AssessmentDomain),
  score: z.number().int().min(0).max(5),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateScoresSchema = z.object({
  scores: z.array(domainScoreSchema).min(1),
});

export const addMemberSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(Role),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateScoresInput = z.infer<typeof updateScoresSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
