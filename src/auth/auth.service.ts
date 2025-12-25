import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as firebaseAdmin from 'firebase-admin';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    private firestore: admin.firestore.Firestore;
  
  constructor(private readonly userService: UserService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {
      this.firestore = this.firebaseAdmin.firestore();
  }

  async loginUser(payload: LoginDto) {
    const { email, password } = payload;
    try {
      const result = await this.signInWithEmailAndPassword(email, password);
      if (!result || !result.idToken) {
        throw new Error('Authentication failed');
      }
      await this.updateLastLogin(email);
      const { idToken, refreshToken, expiresIn } = result;
      return { idToken, refreshToken, expiresIn };
    } catch (error: any) {
      //  Firebase returns structured messages like "EMAIL_NOT_FOUND" or "INVALID_PASSWORD"
      const message = error.message || 'Unknown authentication error';
      if (message.includes('INVALID_LOGIN_CREDENTIALS') || message.includes('EMAIL_NOT_FOUND')) {
        throw new UnauthorizedException('User not found.');
      } else if (message.includes('INVALID_PASSWORD')) {
        throw new UnauthorizedException('Invalid password.');
      } else if (message.includes('MISSING_PASSWORD')) {
        throw new BadRequestException('Password is required.');
      } else if (message.includes('INVALID_EMAIL')) {
        throw new BadRequestException('Invalid email format.');
      } else {
        console.error('🔥 Unexpected login error:', error);
        throw new InternalServerErrorException('Login failed. Please try again later.');
      }
    }
  }
  private async signInWithEmailAndPassword(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.APIKEY}`;
    return await this.sendPostRequest(url, {
      email,
      password,
      returnSecureToken: true,
    });
  }
  private async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }
  async validateRequest(req): Promise<boolean> {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('Authorization header not provided.');
      return false;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      console.log('Invalid authorization format. Expected "Bearer <token>".');
      return false;
    }
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        if (!decodedToken.email) {
          console.error('Decoded token does not contain an email.');
          return false;
        }
        const userProfile = await this.userService.getUserProfile(decodedToken.email);
 if (!userProfile) {
    throw new UnauthorizedException("User profile not found");
  }
      try {
          req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          user_type: userProfile.user_type ?? [],
        };
      } catch (attachErr) {
        // If attaching fails for some reason, still allow if token valid
        req.user = { uid: decodedToken.uid };
      }
      console.log('Decoded Token:', decodedToken);
      return true;
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        console.error('Token has expired.');
      } else if (error.code === 'auth/invalid-id-token') {
        console.error('Invalid ID token provided.');
      } else {
        console.error('Error verifying token:', error);
      }
      return false;
    }
  }

  private async updateLastLogin(email: string) {
  const usersRef = this.firestore.collection('users');
  const snapshot = await usersRef.where('user_email', '==', email).limit(1).get();

  if (snapshot.empty) {
    console.warn(`⚠️ No Firestore user found for email: ${email}`);
    return;
  }
  const userDoc = snapshot.docs[0].ref;
  await userDoc.update({
    last_login: new Date().toISOString(),
  });
}
}