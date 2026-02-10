import { Role } from '@chronos/shared-types';
import { canManageMembers, canWrite, hasAtLeastRole } from './shared-rbac';

describe('shared-rbac', () => {
  it('evaluates write permissions correctly', () => {
    expect(canWrite(Role.OWNER)).toBe(true);
    expect(canWrite(Role.CONSULTANT)).toBe(true);
    expect(canWrite(Role.VIEWER)).toBe(false);
  });

  it('evaluates member management correctly', () => {
    expect(canManageMembers(Role.OWNER)).toBe(true);
    expect(canManageMembers(Role.CONSULTANT)).toBe(false);
  });

  it('evaluates minimum role hierarchy correctly', () => {
    expect(hasAtLeastRole(Role.OWNER, Role.CONSULTANT)).toBe(true);
    expect(hasAtLeastRole(Role.CONSULTANT, Role.OWNER)).toBe(false);
  });
});
