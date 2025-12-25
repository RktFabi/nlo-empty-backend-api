import { SetMetadata } from '@nestjs/common';

export const SYSTEM_ROLES_KEY = 'system_roles';
export const SystemRoles = (...roles: string[]) => SetMetadata(SYSTEM_ROLES_KEY, roles);
