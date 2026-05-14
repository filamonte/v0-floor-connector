export const defaultAuthenticatedPath = "/dashboard";
export const signInPath = "/login";
export const signUpPath = "/signup";
export const legacySignInPath = "/sign-in";
export const legacySignUpPath = "/sign-up";
export const forgotPasswordPath = "/forgot-password";
export const updatePasswordPath = "/update-password";
export const authCallbackPath = "/auth/callback";

const protectedPrefixes = [
  "/app",
  "/dashboard",
  "/portal",
  "/setup",
  "/super-admin"
] as const;

export type AuthSurfaceContext = {
  surfaceKey: "contractor" | "portal" | "superAdmin";
  shellEyebrow: string;
  shellTitle: string;
  shellDescription: string;
  nextStepTitle: string;
  nextStepDescription: string;
  continuityTitle: string;
  continuityDescription: string;
  returnLabel: string;
};

export function isProtectedPath(pathname: string) {
  if (pathname === "/portal/invite" || pathname.startsWith("/portal/invite/")) {
    return false;
  }

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isPortalAuthPath(pathname: string | null | undefined) {
  if (!pathname) {
    return false;
  }

  return pathname === "/portal" || pathname.startsWith("/portal/");
}

export function sanitizeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return defaultAuthenticatedPath;
  }

  return next;
}

export function getSafeInternalRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}

export function buildInternalRedirectPath(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const destination = new URL(pathname, "http://floorconnector.local");

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      destination.searchParams.set(key, value);
    }
  }

  return `${destination.pathname}${destination.search}`;
}

export function toSafeNextPath(pathname: string, search = "") {
  return sanitizeRedirectPath(`${pathname}${search}`);
}

export function getAuthSurfaceContext(next: string): AuthSurfaceContext {
  if (next === "/portal" || next.startsWith("/portal/")) {
    return {
      surfaceKey: "portal",
      shellEyebrow: "Customer portal access",
      shellTitle: "Continue to your shared project records",
      shellDescription:
        "Your contractor has shared records through one connected system. Sign in to review the same projects, contracts, and invoices they manage internally.",
      nextStepTitle: "Next stop",
      nextStepDescription:
        "After sign-in, you will return to the customer portal and continue from the same shared project record.",
      continuityTitle: "Why this feels connected",
      continuityDescription:
        "The portal does not use copied records. Customers review and act on the same shared contracts and invoices the contractor already manages.",
      returnLabel: "Return to customer portal"
    };
  }

  if (next === "/super-admin" || next.startsWith("/super-admin/")) {
    return {
      surfaceKey: "superAdmin",
      shellEyebrow: "Platform admin access",
      shellTitle: "Continue to the platform administration area",
      shellDescription:
        "Sign in to continue into the protected platform administration surface with the same shared identity and authorization model used across FloorConnector.",
      nextStepTitle: "Next stop",
      nextStepDescription:
        "After sign-in, you will return to the protected admin area you were trying to open.",
      continuityTitle: "Shared identity layer",
      continuityDescription:
        "Platform admin uses the same account foundation as the contractor app and portal, with role-based access deciding which surfaces you can reach.",
      returnLabel: "Return to admin area"
    };
  }

  return {
    surfaceKey: "contractor",
    shellEyebrow: "Contractor workspace access",
    shellTitle: "Continue to the contractor workspace",
    shellDescription:
      "FloorConnector keeps sales, contracts, billing, workforce, and execution in one operating system. Sign in to continue inside your protected organization workspace.",
    nextStepTitle: "Next stop",
    nextStepDescription:
        "After sign-in, you will return to the workspace page you were trying to open and continue from the same shared records.",
    continuityTitle: "Why this feels connected",
    continuityDescription:
      "The contractor app is the system of record. Projects, contracts, invoices, payments, and execution stay on one shared model instead of being split across separate tools.",
    returnLabel: "Return to contractor workspace"
  };
}
