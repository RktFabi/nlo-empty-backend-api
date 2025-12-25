import request from 'supertest';
import { INestApplication } from '@nestjs/common';


export function requestWithUser(app: INestApplication, user: any) {
  const agent = request(app.getHttpServer());
  // Return a wrapped function that chains as usual
  return {
    get: (url: string) =>
      agent
        .get(url)
        .set('Authorization', 'Bearer faketoken')
        .set('X-Test-User', JSON.stringify(user)),
    post: (url: string) =>
      agent
        .post(url)
        .set('Authorization', 'Bearer faketoken')
        .set('X-Test-User', JSON.stringify(user)),
    
  };
}
export const TestUsers = {
  admin: () => ({ uid: 'admin-uid', user_email: 'admin@test.com', user_type: ['nlo_staff', 'org_user'] }),
  donor: () => ({ uid: 'donor-uid', user_email: 'donor@test.com', user_type: ['public_user'] }),
};

// Unit test helpers for guards
export function createExecutionContextMock(user: any) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => null,
    getClass: () => null,
  } as any;
}

export function createReflectorMock(returnVal: string[] | undefined) {
  return {
    getAllAndOverride: jest.fn().mockReturnValue(returnVal),
  } as any;
}

