import * as path from 'path';

// Determine environment
const env = process.env.NLO_ENV || 'local';

// Validate environment
const VALID_ENVS = [
  'local',
  'dev',
  'development',
  'stg',
  'staging',
  'prod',
  'production',
  'infositedev',
];

if (!VALID_ENVS.includes(env)) {
  throw new Error(`Invalid NLO_ENV: ${env}`);
}

// Normalize env
const envName = {
  local: 'local',
  dev: 'dev',
  development: 'dev',
  stg: 'stg',
  staging: 'stg',
  prod: 'prod',
  production: 'prod',
  infositedev: 'infositedev',
}[env] as 'local' | 'dev' | 'stg' | 'prod' | 'infositedev';

// Env switch helper
export function envswitch<T>(vals: Record<typeof envName, T>): T {
  const val = vals[envName];
  if (val === undefined) {
    throw new Error(`No value specified for env '${envName}'`);
  }
  return val;
}

// Core configuration
export class Config {
  readonly ENV = envName;
  readonly IS_LOCAL = envName === 'local';

  /**
   * Firebase
   *
   * Cloud environments use Application Default Credentials (ADC).
   * Local may optionally use a service account file.
   */
  readonly LOCAL_SERVICE_ACCOUNT_PATH = envName === 'local'
    ? path.resolve(
      __dirname,
      '../../dev-needlist-firebase-adminsdk-y6w20-fc58a47ee8.json',
    )
    : undefined;

  get FIREBASE_PROJECT_ID(): string {
    return (
      process.env.GCLOUD_PROJECT
      || process.env.GOOGLE_CLOUD_PROJECT
      || ''
    );
  }

  /**
   * CORS
   */
  readonly CORS_ORIGINS = envswitch<string[]>({
    local: ['http://localhost:3000', 'http://localhost:8080'],
    dev: ['https://dev-needlist.web.app'],
    stg: ['https://staging-needlist.web.app'],
    prod: ['https://needlist.web.app'],
    infositedev: ['https://infosite-dev.web.app'],
  });

  /**
   * Stripe
   */
  readonly STRIPE_KEY_CA = envswitch<string>({
    local: process.env.STRIPE_SECRET_CA_TESTING || '',
    dev: process.env.STRIPE_SECRET_CA_TESTING || '',
    stg: process.env.STRIPE_SECRET_CA_TESTING || '',
    prod: process.env.STRIPE_SECRET_CA || '',
    infositedev: process.env.STRIPE_SECRET_CA_TESTING || '',
  });

  readonly STRIPE_KEY_US = envswitch<string>({
    local: process.env.STRIPE_SECRET_US_TESTING || '',
    dev: process.env.STRIPE_SECRET_US_TESTING || '',
    stg: process.env.STRIPE_SECRET_US_TESTING || '',
    prod: process.env.STRIPE_SECRET_US || '',
    infositedev: process.env.STRIPE_SECRET_US_TESTING || '',
  });

  readonly STRIPE_WEBHOOK_KEY_CA = envswitch<string>({
    local: process.env.STRIPE_WEBHOOK_SECRET_CA_TESTING || '',
    dev: process.env.STRIPE_WEBHOOK_SECRET_CA_TESTING || '',
    stg: process.env.STRIPE_WEBHOOK_SECRET_CA_TESTING || '',
    prod: process.env.STRIPE_WEBHOOK_SECRET_CA || '',
    infositedev: process.env.STRIPE_WEBHOOK_SECRET_CA_TESTING || '',
  });

  readonly STRIPE_WEBHOOK_KEY_US = envswitch<string>({
    local: process.env.STRIPE_WEBHOOK_SECRET_US_TESTING || '',
    dev: process.env.STRIPE_WEBHOOK_SECRET_US_TESTING || '',
    stg: process.env.STRIPE_WEBHOOK_SECRET_US_TESTING || '',
    prod: process.env.STRIPE_WEBHOOK_SECRET_US || '',
    infositedev: process.env.STRIPE_WEBHOOK_SECRET_US_TESTING || '',
  });
}

// Export singleton
export const appConfig = new Config();
