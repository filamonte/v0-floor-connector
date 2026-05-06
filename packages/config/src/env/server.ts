import { z } from "zod";

import { publicEnvSchema } from "./public";
import { optionalEnum, optionalString, optionalUrl } from "./shared";

const appEnvValues = [
  "local",
  "development",
  "staging",
  "production",
  "test"
] as const;
const quickbooksEnvironmentValues = ["sandbox", "production"] as const;

export const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: optionalEnum(appEnvValues),
  APP_SECRET: optionalString,
  SESSION_SECRET: optionalString,
  ENCRYPTION_KEY: optionalString,
  CRON_SECRET: optionalString,
  INTERNAL_API_TOKEN: optionalString,
  DATABASE_URL: optionalString,
  DIRECT_URL: optionalString,
  NEXT_PUBLIC_SUPABASE_URL_DEV: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV: optionalString,
  SUPABASE_SERVICE_ROLE_KEY_DEV: optionalString,
  SUPABASE_JWT_SECRET_DEV: optionalString,
  SUPABASE_DB_URL_DEV: optionalString,
  SUPABASE_DIRECT_URL_DEV: optionalString,
  NEXT_PUBLIC_SUPABASE_URL_PROD: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD: optionalString,
  SUPABASE_SERVICE_ROLE_KEY_PROD: optionalString,
  SUPABASE_JWT_SECRET_PROD: optionalString,
  SUPABASE_DB_URL_PROD: optionalString,
  SUPABASE_DIRECT_URL_PROD: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  STRIPE_CONNECT_WEBHOOK_SECRET: optionalString,
  STRIPE_PRICE_ID_BASE: optionalString,
  FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID: optionalString,
  POSTMARK_SERVER_TOKEN: optionalString,
  POSTMARK_MESSAGE_STREAM: optionalString,
  POSTMARK_BROADCAST_STREAM: optionalString,
  POSTMARK_FROM_EMAIL: optionalString,
  SIGNWELL_API_KEY: optionalString,
  SIGNWELL_WEBHOOK_SECRET: optionalString,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  QUICKBOOKS_CLIENT_ID: optionalString,
  QUICKBOOKS_CLIENT_SECRET: optionalString,
  QUICKBOOKS_REDIRECT_URI: optionalUrl,
  QUICKBOOKS_ENVIRONMENT: optionalEnum(quickbooksEnvironmentValues),
  PDF_BROWSER_EXECUTABLE_PATH: optionalString,
  COMPANYCAM_CLIENT_ID: optionalString,
  COMPANYCAM_CLIENT_SECRET: optionalString,
  COMPANYCAM_REDIRECT_URI: optionalUrl,
  COMPANYCAM_WEBHOOK_SECRET: optionalString,
  N8N_BASE_URL: optionalUrl,
  N8N_WEBHOOK_URL: optionalUrl,
  N8N_API_KEY: optionalString
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function getServerRawEnv(): Record<keyof ServerEnv, string | undefined> {
  return {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
    NEXT_PUBLIC_SUPPORT_URL: process.env.NEXT_PUBLIC_SUPPORT_URL,
    NEXT_PUBLIC_PRIVACY_POLICY_URL:
      process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL,
    NEXT_PUBLIC_TERMS_OF_SERVICE_URL:
      process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    APP_SECRET: process.env.APP_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    INTERNAL_API_TOKEN: process.env.INTERNAL_API_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL_DEV: process.env.NEXT_PUBLIC_SUPABASE_URL_DEV,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV,
    SUPABASE_SERVICE_ROLE_KEY_DEV: process.env.SUPABASE_SERVICE_ROLE_KEY_DEV,
    SUPABASE_JWT_SECRET_DEV: process.env.SUPABASE_JWT_SECRET_DEV,
    SUPABASE_DB_URL_DEV: process.env.SUPABASE_DB_URL_DEV,
    SUPABASE_DIRECT_URL_DEV: process.env.SUPABASE_DIRECT_URL_DEV,
    NEXT_PUBLIC_SUPABASE_URL_PROD: process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD,
    SUPABASE_SERVICE_ROLE_KEY_PROD: process.env.SUPABASE_SERVICE_ROLE_KEY_PROD,
    SUPABASE_JWT_SECRET_PROD: process.env.SUPABASE_JWT_SECRET_PROD,
    SUPABASE_DB_URL_PROD: process.env.SUPABASE_DB_URL_PROD,
    SUPABASE_DIRECT_URL_PROD: process.env.SUPABASE_DIRECT_URL_PROD,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_CONNECT_WEBHOOK_SECRET: process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
    STRIPE_PRICE_ID_BASE: process.env.STRIPE_PRICE_ID_BASE,
    FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID:
      process.env.FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID,
    POSTMARK_SERVER_TOKEN: process.env.POSTMARK_SERVER_TOKEN,
    POSTMARK_MESSAGE_STREAM: process.env.POSTMARK_MESSAGE_STREAM,
    POSTMARK_BROADCAST_STREAM: process.env.POSTMARK_BROADCAST_STREAM,
    POSTMARK_FROM_EMAIL: process.env.POSTMARK_FROM_EMAIL,
    SIGNWELL_API_KEY: process.env.SIGNWELL_API_KEY,
    SIGNWELL_WEBHOOK_SECRET: process.env.SIGNWELL_WEBHOOK_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID,
    QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET,
    QUICKBOOKS_REDIRECT_URI: process.env.QUICKBOOKS_REDIRECT_URI,
    QUICKBOOKS_ENVIRONMENT: process.env.QUICKBOOKS_ENVIRONMENT,
    PDF_BROWSER_EXECUTABLE_PATH: process.env.PDF_BROWSER_EXECUTABLE_PATH,
    COMPANYCAM_CLIENT_ID: process.env.COMPANYCAM_CLIENT_ID,
    COMPANYCAM_CLIENT_SECRET: process.env.COMPANYCAM_CLIENT_SECRET,
    COMPANYCAM_REDIRECT_URI: process.env.COMPANYCAM_REDIRECT_URI,
    COMPANYCAM_WEBHOOK_SECRET: process.env.COMPANYCAM_WEBHOOK_SECRET,
    N8N_BASE_URL: process.env.N8N_BASE_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    N8N_API_KEY: process.env.N8N_API_KEY
  };
}

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(getServerRawEnv());
}

export function getSupabasePublicEnv() {
  const env = getServerEnv();

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}

export function isSupabasePublicEnvReady() {
  const env = getSupabasePublicEnv();

  return Boolean(env.url && env.anonKey);
}

export function isSupabasePublicConfigReady() {
  return isSupabasePublicEnvReady();
}

export function getSupabasePublicConfig() {
  return getSupabasePublicEnv();
}

export function getSupabaseServiceRoleKey() {
  return getServerEnv().SUPABASE_SERVICE_ROLE_KEY;
}
