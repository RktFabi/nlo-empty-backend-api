// src/firebase/firebase.providers.ts
import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { appConfig } from '../config/config';

export const firebaseProviders: Provider[] = [
  {
    provide: 'FIREBASE_ADMIN',
    useFactory: () => {
      if (!admin.apps.length) {
        if (appConfig.IS_LOCAL && appConfig.LOCAL_SERVICE_ACCOUNT_PATH) {
          // Local development only
          const serviceAccount = require(appConfig.LOCAL_SERVICE_ACCOUNT_PATH);

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });

          console.log('✅ Firebase initialized (local service account)');
        } else {
          // Cloud Run / Firebase Functions (ADC)
          admin.initializeApp();
          console.log('✅ Firebase initialized (ADC)');
        }
      }

      return admin;
    },
  },
  {
    provide: 'FIRESTORE',
    useFactory: (adminSDK: typeof admin) => adminSDK.firestore(),
    inject: ['FIREBASE_ADMIN'],
  },
  {
    provide: 'FIREBASE_AUTH',
    useFactory: (adminSDK: typeof admin) => adminSDK.auth(),
    inject: ['FIREBASE_ADMIN'],
  },
];
