import { Injectable, Inject, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { RegisterUserDto } from './dto';
import * as firebaseAdmin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { Users } from './model';
import { CreateUserDto } from './dto/create.user.dto';
import e from 'express';

@Injectable()
export class UserService {
  private firestore: admin.firestore.Firestore;
  private readonly collectionName = 'users';
  private readonly logger = new Logger(UserService.name);

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App) {
    this.firestore = this.firebaseAdmin.firestore();
  }
  //
  sanitizeFirestoreData = (obj: any): any => {
    if (!obj) return obj;

    // Firestore Timestamp -> ISO string
    if (obj._seconds) {
      return new Date(obj._seconds * 1000 + (obj._nanoseconds || 0) / 1_000_000).toISOString();
    }

    // DocumentReference -> path
    if (obj.path) {
      return obj.path;
    }

    // Emulator path
    if (obj._path?.segments) {
      return obj._path.segments.join('/');
    }

    // Recursive handle for nested objects / arrays
    if (Array.isArray(obj)) {
      return obj.map((v) => this.sanitizeFirestoreData(v));
    }

    if (typeof obj === 'object') {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = this.sanitizeFirestoreData(v);
      }
      return out;
    }

    return obj;
  };

  async getUserProfile(email: string) {
    const emailSnapshot = await this.firestore
      .collection('users')
      .where('user_email', '==', email)
      .limit(1)
      .get();

    if (!emailSnapshot.empty) {
      const userDoc = emailSnapshot.docs[0];
      const data = userDoc.data();
      return {
        id: userDoc.id,
        user_email: data.user_email,
        user_type: data.user_type,
        created_at: data.created_at,
        last_login: data.last_login,
        emailDomain: data.emailDomain,
        account_status: data.account_status,
      };
    }
    return null;
  }

  async registerUser(registerUser: RegisterUserDto) {
    console.log(registerUser);
    try {
      const userRecord = await firebaseAdmin.auth().createUser({
        email: registerUser.user_email,
        password: registerUser.password,
      });
      console.log('User Record:', userRecord);

      const userForFirestore: CreateUserDto = {
        user_email: registerUser.user_email,
        account_status: "New_user",
        emailDomain: registerUser.user_email.split('@')[1],
        roles: ["staff", "donor"],
        user_type: ["public_user"],
        created_at: firestore.FieldValue.serverTimestamp(),
        last_login: null,
      };
      const docRef = await this.firestore.collection(this.collectionName).add(userForFirestore);
      const docSnap = await docRef.get();
      return {
        id: docSnap.id,
        ...docSnap.data() as Users,
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('This email is already registered.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new BadRequestException('The provided email address is not valid.');
      }
      if (error.code === 'auth/invalid-password') {
        throw new BadRequestException('The provided password is invalid. It must be at least 6 characters.');
      }
      // Fallback generic message
      throw new InternalServerErrorException('User registration failed due to an unexpected error.');
    }
  }





}