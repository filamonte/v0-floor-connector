import { APP_NAME } from "./constants/platform";

export {
  APP_NAME,
  APP_NAMES,
  FEATURE_FLAG_KEYS,
  MODULE_KEYS,
  PLATFORM_SURFACES,
  PLATFORM_SURFACE_SEGMENTS,
  ROUTE_GROUPS,
  STORAGE_BUCKET_NAMES
} from "./constants/platform";
export {
  getPublicEnv as getClientEnv,
  getPublicEnv,
  getServerEnv,
  getSupabasePublicConfig,
  getSupabasePublicEnv,
  getSupabaseServiceRoleKey,
  isSupabasePublicConfigReady,
  isSupabasePublicEnvReady,
  publicEnvSchema,
  serverEnvSchema
} from "./env";
export type { PublicEnv, ServerEnv } from "./env";
export {
  accountLifecycleStateSchema,
  conversationTypeSchema,
  documentFileClassSchema,
  featureFlagKeySchema,
  moduleKeySchema,
  platformSurfaceSchema,
  subscriptionStateSchema,
  tenantStatusSchema
} from "./types/platform";
export type {
  AccountLifecycleState,
  ConversationType,
  DocumentFileClass,
  FeatureFlagKey,
  ModuleKey,
  PlatformSurface,
  SubscriptionState,
  TenantStatus
} from "./types/platform";

export const appConfig = {
  name: APP_NAME
} as const;
