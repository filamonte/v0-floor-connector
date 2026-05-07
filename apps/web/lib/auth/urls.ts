import { getPublicEnv } from "@floorconnector/config";

import {
  authCallbackPath,
  getSafeInternalRedirectPath
} from "./paths";

export function getAppOrigin() {
  return getPublicEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getRequestOrigin(requestHeaders?: Headers) {
  const forwardedProto = requestHeaders?.get("x-forwarded-proto");
  const forwardedHost = requestHeaders?.get("x-forwarded-host");
  const host = requestHeaders?.get("host");
  const origin = requestHeaders?.get("origin");

  if (origin) {
    return origin;
  }

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (host) {
    return `http://${host}`;
  }

  return getAppOrigin();
}

export function getAuthCallbackUrl(
  next?: string | null,
  origin = getAppOrigin()
) {
  const safeNext = getSafeInternalRedirectPath(next);
  const callbackUrl = new URL(authCallbackPath, origin);

  if (safeNext) {
    callbackUrl.searchParams.set("next", safeNext);
  }

  return callbackUrl.toString();
}
