import { z } from "zod";

import {
  FEATURE_FLAG_KEYS,
  MODULE_KEYS,
  PLATFORM_SURFACES
} from "../constants/platform";

export const platformSurfaceSchema = z.enum(PLATFORM_SURFACES);
export type PlatformSurface = z.infer<typeof platformSurfaceSchema>;

export const moduleKeySchema = z.enum(MODULE_KEYS);
export type ModuleKey = z.infer<typeof moduleKeySchema>;

export const subscriptionStateSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "paused",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired"
]);
export type SubscriptionState = z.infer<typeof subscriptionStateSchema>;

export const accountLifecycleStateSchema = z.enum([
  "trial",
  "active",
  "grace_period",
  "locked",
  "retained",
  "scheduled_for_deletion",
  "deleted",
  "restorable"
]);
export type AccountLifecycleState = z.infer<
  typeof accountLifecycleStateSchema
>;

export const tenantStatusSchema = z.enum([
  "trialing",
  "active",
  "suspended",
  "locked",
  "archived",
  "deleted"
]);
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

export const documentFileClassSchema = z.enum([
  "document",
  "attachment",
  "contract",
  "estimate",
  "invoice",
  "safety",
  "photo",
  "image",
  "video"
]);
export type DocumentFileClass = z.infer<typeof documentFileClassSchema>;

export const conversationTypeSchema = z.enum([
  "direct",
  "organization",
  "group",
  "customer",
  "project",
  "system"
]);
export type ConversationType = z.infer<typeof conversationTypeSchema>;

export const featureFlagKeySchema = z.enum(FEATURE_FLAG_KEYS);
export type FeatureFlagKey = z.infer<typeof featureFlagKeySchema>;
