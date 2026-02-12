import {
  addMemberSchema,
  createAssessmentSchema,
  createClientSchema,
  createLeadSchema,
  loginSchema,
  paginationSchema,
  registerSchema,
  updateLeadStatusSchema,
  updateScoresSchema,
} from './shared-validation';
import { AssessmentDomain, AssessmentType, LeadStatus, Role } from '@chronos/shared-types';

describe('shared-validation', () => {
  it('accepts valid auth payloads', () => {
    expect(loginSchema.parse({ email: 'user@example.com', password: 'password123' })).toEqual({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(registerSchema.parse({ email: 'user@example.com', password: 'password123' })).toEqual({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('enforces score bounds and domains', () => {
    const valid = updateScoresSchema.parse({
      scores: [{ domain: AssessmentDomain.SECURITY, score: 5, notes: 'ok' }],
    });
    expect(valid.scores).toHaveLength(1);
    expect(() =>
      updateScoresSchema.parse({
        scores: [{ domain: AssessmentDomain.SECURITY, score: 99 }],
      })
    ).toThrow();
  });

  it('parses client, lead, assessment, member, and pagination inputs', () => {
    expect(createClientSchema.parse({ name: 'Acme' }).name).toBe('Acme');
    expect(
      createLeadSchema.parse({ name: 'Acme Lead', contact: 'owner@acme.com', source: 'Inbound' }).name
    ).toBe('Acme Lead');
    expect(updateLeadStatusSchema.parse({ status: LeadStatus.PROSPECTING }).status).toBe(
      LeadStatus.PROSPECTING
    );
    expect(createAssessmentSchema.parse({ type: AssessmentType.AI_ADOPTION }).type).toBe(
      AssessmentType.AI_ADOPTION
    );
    expect(addMemberSchema.parse({ email: 'member@example.com', role: Role.CONSULTANT }).role).toBe(
      Role.CONSULTANT
    );
    expect(paginationSchema.parse({ page: '2', pageSize: '10' })).toEqual({ page: 2, pageSize: 10 });
  });
});
