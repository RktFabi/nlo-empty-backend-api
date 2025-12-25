import { AuthService } from './auth.service';
import { UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as firebaseAdmin from 'firebase-admin';

jest.mock('axios');
jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockFirebaseAdmin: any;

  beforeEach(() => {
    mockUserService = {
      getUserProfile: jest.fn().mockResolvedValue({ user_type: ['public_user'] }),
    };

    mockFirebaseAdmin = {
      firestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      }),
    };

    service = new AuthService(mockUserService, mockFirebaseAdmin);
    jest.clearAllMocks();
  });


  // LOGIN TESTS

  describe('loginUser', () => {
    const email = 'test@example.com';
    const password = '123456';

    it('should return tokens on successful login', async () => {
      (axios.post as jest.Mock).mockResolvedValueOnce({
        data: { idToken: 'token123', refreshToken: 'refresh123', expiresIn: '3600' },
      });

      const result = await service.loginUser({ email, password });
      expect(result).toEqual({
        idToken: 'token123',
        refreshToken: 'refresh123',
        expiresIn: '3600',
      });
    });

    it('should throw UnauthorizedException for user not found', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { error: { message: 'EMAIL_NOT_FOUND' } } },
      });

      await expect(service.loginUser({ email, password })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { error: { message: 'INVALID_PASSWORD' } } },
      });

      await expect(service.loginUser({ email, password })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for missing password', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { error: { message: 'MISSING_PASSWORD' } } },
      });

      await expect(service.loginUser({ email, password })).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException for unknown error', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Something unexpected'));

      await expect(service.loginUser({ email, password })).rejects.toThrow(InternalServerErrorException);
    });
  });


  // VALIDATE REQUEST TESTS

  describe('validateRequest', () => {
    const mockVerifyIdToken = jest.fn();

    beforeEach(() => {
      (firebaseAdmin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });
    });

    it('should return false if authorization header missing', async () => {
      const req = { headers: {} };
      const result = await service.validateRequest(req);
      expect(result).toBe(false);
    });

    it('should return false if invalid Bearer format', async () => {
      const req = { headers: { authorization: 'Invalid token' } };
      const result = await service.validateRequest(req);
      expect(result).toBe(false);
    });

    it('should attach user and return true on valid token', async () => {
      const req: any = { headers: { authorization: 'Bearer validtoken' } };

      mockVerifyIdToken.mockResolvedValueOnce({
        uid: 'uid123',
        email: 'user@test.com',
        name: 'John',
        user_type: ['public_user'],
      });

      const result = await service.validateRequest(req);

      expect(result).toBe(true);
      expect(req.user).toEqual({
        uid: 'uid123',
        email: 'user@test.com',
        name: 'John',
        user_type: ['public_user'],
      });
    });

    it('should return false if token expired', async () => {
      const req = { headers: { authorization: 'Bearer expired' } };
      mockVerifyIdToken.mockRejectedValueOnce({ code: 'auth/id-token-expired' });

      const result = await service.validateRequest(req);
      expect(result).toBe(false);
    });

    it('should return false if token invalid', async () => {
      const req = { headers: { authorization: 'Bearer invalid' } };
      mockVerifyIdToken.mockRejectedValueOnce({ code: 'auth/invalid-id-token' });

      const result = await service.validateRequest(req);
      expect(result).toBe(false);
    });
  });
});
