// src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { appConfig } from './config';

@Injectable()
export class CustomConfigService {
  get<K extends keyof typeof appConfig>(key: K): (typeof appConfig)[K] {
    return appConfig[key];
  }

  getSecret(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * Firebase helpers
   * Only expose non-sensitive, cloud-safe values
   */
  getFirebaseProjectId(): string {
    return appConfig.FIREBASE_PROJECT_ID;
  }
}
