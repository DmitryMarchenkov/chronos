import { Role } from '@prisma/client';
import { HttpError } from './errors';
import { prisma } from './prisma';
import { requireClientMember, requireOwnerRole, requireWriteRole } from './access';

jest.mock('./prisma', () => ({
  prisma: {
    workspaceMember: {
      findUnique: jest.fn(),
    },
  },
}));

describe('access guards', () => {
  const prismaMock = prisma as unknown as {
    workspaceMember: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock.workspaceMember.findUnique.mockReset();
  });

  it('returns membership when user belongs to client', async () => {
    prismaMock.workspaceMember.findUnique.mockResolvedValue({
      id: 'member-1',
      userId: 'user-1',
      clientId: 'client-1',
      role: Role.CONSULTANT,
    });

    await expect(requireClientMember('user-1', 'client-1')).resolves.toMatchObject({
      role: Role.CONSULTANT,
    });
  });

  it('throws FORBIDDEN when user is not a member', async () => {
    prismaMock.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(requireClientMember('user-1', 'client-1')).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'User is not a member of this client',
    } satisfies Partial<HttpError>);
  });

  it('blocks write actions for VIEWER', () => {
    expect(() => requireWriteRole(Role.VIEWER)).toThrow(HttpError);
    expect(() => requireWriteRole(Role.OWNER)).not.toThrow();
    expect(() => requireWriteRole(Role.CONSULTANT)).not.toThrow();
  });

  it('allows member management only for OWNER', () => {
    expect(() => requireOwnerRole(Role.CONSULTANT)).toThrow(HttpError);
    expect(() => requireOwnerRole(Role.VIEWER)).toThrow(HttpError);
    expect(() => requireOwnerRole(Role.OWNER)).not.toThrow();
  });
});
