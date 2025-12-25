import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { requestWithUser, TestUsers } from '../test/utils/test-helpers';
import { MockAuthGuard } from './test/mocks/auth-guard.mock';
import { AuthGuard } from '../common/guards/auth.guard';

describe('UsersController (with auth)', () => {
  let app: INestApplication;
  let usersService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard) // Override the real AuthGuard
      .useValue(new MockAuthGuard(TestUsers.admin()))
      .compile();

    app = module.createNestApplication();
    await app.init();

    usersService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should return user profile for authenticated user', async () => {
      // Arrange
      const testUser = TestUsers.admin();
      const mockProfile = {
        UserProfile: {
          id: testUser.uid,
          user_email: testUser.user_email,
          email: testUser.user_email,
          user_type: (testUser as any).user_type || [],
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          emailDomain: (testUser.user_email || '').split('@')[1] || null,
          account_status: 'active',
        },
      };

      jest.spyOn(usersService, 'getUserProfile').mockResolvedValue(mockProfile.UserProfile);

      // Act & Assert - Using the helper
      await requestWithUser(app, testUser)
        .get('/users/me')
        .expect(200)
        .expect(mockProfile);
    });

    it('should return 404 if user profile not found', async () => {
      // Arrange
      const testUser = TestUsers.donor();
      jest.spyOn(usersService, 'getUserProfile').mockResolvedValue(null);

      // Act & Assert
      await requestWithUser(app, testUser)
        .get('/users/me')
        .expect(404);
    });
  });


});