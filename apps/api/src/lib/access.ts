import { Role } from '@prisma/client';
import { httpError } from './errors';
import { prisma } from './prisma';

export const getMembership = async (userId: string, clientId: string) =>
  prisma.workspaceMember.findUnique({
    where: {
      userId_clientId: {
        userId,
        clientId,
      },
    },
  });

export const requireClientMember = async (userId: string, clientId: string) => {
  const membership = await getMembership(userId, clientId);
  if (!membership) {
    throw httpError(403, 'FORBIDDEN', 'User is not a member of this client');
  }
  return membership;
};

export const requireWriteRole = (role: Role) => {
  if (role === 'VIEWER') {
    throw httpError(403, 'FORBIDDEN', 'Role does not allow write access');
  }
};

export const requireOwnerRole = (role: Role) => {
  if (role !== 'OWNER') {
    throw httpError(403, 'FORBIDDEN', 'Only owners can manage members');
  }
};
