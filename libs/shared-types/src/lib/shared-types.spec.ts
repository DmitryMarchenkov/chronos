import { AssessmentDomain, AssessmentType, Role } from './shared-types';

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
});
