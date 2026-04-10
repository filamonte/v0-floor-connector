import { getPublicEnv } from "@floorconnector/config";

import {
  authCallbackPath,
  defaultAuthenticatedPath,
  sanitizeRedirectPath
} from "./paths";

export function getAppOrigin() {
  return getPublicEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getAuthCallbackUrl(next?: string | null) {
  const safeNext = sanitizeRedirectPath(next ?? defaultAuthenticatedPath);
  const callbackUrl = new URL(authCallbackPath, getAppOrigin());

  callbackUrl.searchParams.set("next", safeNext);

  return callbackUrl.toString();
}
