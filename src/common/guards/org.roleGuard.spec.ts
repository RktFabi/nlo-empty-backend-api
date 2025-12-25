import { ExecutionContext } from "@nestjs/common";
import { OrgRoleGuard } from "./org.roleGuard";
import { MembershipService } from "../../membership/membership.service";

describe('OrgRoleGuard', () => {
  let guard: OrgRoleGuard;
  let membershipServiceMock: jest.Mocked<MembershipService>;

  beforeEach(() => {
    membershipServiceMock = {
      findByOrgId: jest.fn(),
    } as any;

    guard = new OrgRoleGuard(membershipServiceMock);
  });

  // Helper to create execution context with user and orgId
  const createContext = (user: any, orgId?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: { orgId },
        }),
      }),
      getHandler: () => null,
      getClass: () => null,
    } as any;
  };

  it('should allow access for org admin', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue({
      users: [{ email: 'admin@example.com', roles: ['Admin'] }],
    });

    const result = await guard.canActivate(
      createContext({ email: 'admin@example.com' }, 'org123'),
    );

    expect(result).toBe(true);
    expect(membershipServiceMock.findByOrgId).toHaveBeenCalledWith('org123');
  });

  it('should deny access for non-admin user', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue({
      users: [{ email: 'test@example.com', roles: ['org-staff'] }],
    });

    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }, 'org123'),
    );

    expect(result).toBe(false);
  });

  it('should deny access when user has no roles', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue({
      users: [{ email: 'test@example.com', roles: [] }],
    });

    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }, 'org123'),
    );

    expect(result).toBe(false);
  });

  it('should deny access when user is not in organization', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue({
      users: [{ email: 'other@example.com', roles: ['Admin'] }],
    });

    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }, 'org123'),
    );

    expect(result).toBe(false);
  });

  it('should deny access when user has no email', async () => {
    const result = await guard.canActivate(
      createContext({ uid: 'some-uid' }, 'org123'),
    );

    expect(result).toBe(false);
    expect(membershipServiceMock.findByOrgId).not.toHaveBeenCalled();
  });

  it('should deny access when orgId is missing', async () => {
    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }),
    );

    expect(result).toBe(false);
    expect(membershipServiceMock.findByOrgId).not.toHaveBeenCalled();
  });

  it('should deny access when membership is null', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue(null);

    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }, 'org123'),
    );

    expect(result).toBe(false);
  });

  it('should deny access when membership has no users', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue({});

    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }, 'org123'),
    );

    expect(result).toBe(false);
  });

  it('should allow access when user has Admin role among multiple roles', async () => {
    membershipServiceMock.findByOrgId.mockResolvedValue({
      users: [{ email: 'test@example.com', roles: ['org-staff', 'Admin', 'viewer'] }],
    });

    const result = await guard.canActivate(
      createContext({ email: 'test@example.com' }, 'org123'),
    );

    expect(result).toBe(true);
  });
});
