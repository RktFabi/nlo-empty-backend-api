import { CanActivate, ExecutionContext } from '@nestjs/common';

export class MockAuthGuard implements CanActivate {
  constructor(private testUser: any) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = this.testUser; // Attach the test user to request
    return true;
  }
}