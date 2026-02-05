import { Role } from '@chronos/shared-types';

const roleRank: Record<Role, number> = {
  [Role.OWNER]: 3,
  [Role.CONSULTANT]: 2,
  [Role.VIEWER]: 1,
};

export const canWrite = (role: Role) => roleRank[role] >= roleRank[Role.CONSULTANT];

export const canManageMembers = (role: Role) => role === Role.OWNER;

export const hasAtLeastRole = (role: Role, minimum: Role) =>
  roleRank[role] >= roleRank[minimum];
