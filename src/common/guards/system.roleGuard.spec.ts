import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SystemRolesGuard } from './system.roleGuard';
import { createExecutionContextMock, createReflectorMock } from '../../test/utils/test-helpers';
describe('SystemRoleGuard', () => {


  it('allows access when user has required system role', () => {
    const reflector = createReflectorMock(['nlo_staff']);
    const guard = new SystemRolesGuard(reflector);
    const ctx = createExecutionContextMock({ user_type: ['nlo_staff', 'public_user'] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies access when user does not have required system role', () => {
    const reflector = createReflectorMock(['admin']);
    const guard = new SystemRolesGuard(reflector);
    const ctx = createExecutionContextMock({ user_type: ['public_user'] });
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows when no required roles set', () => {
    const reflector = createReflectorMock(undefined);
    const guard = new SystemRolesGuard(reflector);
    const ctx = createExecutionContextMock({ user_type: ['public_user'] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies access when user has no system role', () => {
    const reflector = createReflectorMock(['nlo_staff']);
    const guard = new SystemRolesGuard(reflector);
    const ctx = createExecutionContextMock({ user_type: [] });
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies access when user is missing from request', () => {
    const reflector = createReflectorMock(['nlo_staff']);
    const guard = new SystemRolesGuard(reflector);
    const ctx = createExecutionContextMock(undefined);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('extracts required system role from metadata', () => {
    const reflector = createReflectorMock(['donor']);
    const guard = new SystemRolesGuard(reflector);
    const ctx = createExecutionContextMock({ user_type: ['donor'] });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
