import { z } from "zod";

import { APP_NAME } from "../constants/platform";
import { optionalString, optionalUrl } from "./shared";

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default(APP_NAME),
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_MARKETING_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalUrl,
  NEXT_PUBLIC_SENTRY_DSN: optionalString
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function getPublicRawEnv(): Record<keyof PublicEnv, string | undefined> {
  return {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
  };
}

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse(getPublicRawEnv());
}
