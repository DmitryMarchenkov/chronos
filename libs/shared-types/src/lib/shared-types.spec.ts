import { AssessmentDomain, AssessmentType, LeadStatus, Role } from './shared-types';

describe('shared-types', () => {
  it('exposes role enum values', () => {
    expect(Role.OWNER).toBe('OWNER');
    expect(Role.CONSULTANT).toBe('CONSULTANT');
    expect(Role.VIEWER).toBe('VIEWER');
  });

  it('exposes assessment types and domains', () => {
    expect(AssessmentType.AI_ADOPTION).toBe('AI_ADOPTION');
    expect(AssessmentType.DIGITAL_TRANSFORMATION).toBe('DIGITAL_TRANSFORMATION');
    expect(Object.values(AssessmentDomain)).toContain('SECURITY');
  });

  it('exposes lead statuses', () => {
    expect(LeadStatus.NEW).toBe('NEW');
    expect(LeadStatus.PROSPECTING).toBe('PROSPECTING');
    expect(LeadStatus.CONVERTED).toBe('CONVERTED');
  });
});
