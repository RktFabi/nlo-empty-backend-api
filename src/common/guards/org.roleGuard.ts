import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MembershipService } from '../../membership/membership.service';

@Injectable()
export class OrgRoleGuard implements CanActivate {
  constructor(private membershipService: MembershipService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.email) return false;

    const orgId = request.params.orgId;
    if (!orgId) return false;

    // Query Roles collection -> (membership)
    const membership = await this.membershipService.findByOrgId(orgId);

    if (!membership?.users) return false;

    const entry = membership.users.find(u => u.email === user.email);
    if (!entry) return false;

    return entry.roles?.includes('Admin');
  }
}
