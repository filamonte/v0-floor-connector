export const defaultAuthenticatedPath = "/app";
export const signInPath = "/sign-in";
export const signUpPath = "/sign-up";
export const forgotPasswordPath = "/forgot-password";
export const updatePasswordPath = "/update-password";
export const authCallbackPath = "/auth/callback";

const protectedPrefixes = ["/app", "/portal", "/super-admin"] as const;

export function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function sanitizeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return defaultAuthenticatedPath;
  }

  return next;
}

export function toSafeNextPath(pathname: string, search = "") {
  return sanitizeRedirectPath(`${pathname}${search}`);
}
