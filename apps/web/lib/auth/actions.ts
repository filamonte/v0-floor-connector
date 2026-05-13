"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  defaultAuthenticatedPath,
  forgotPasswordPath,
  buildInternalRedirectPath,
  getSafeInternalRedirectPath,
  isPortalAuthPath,
  signInPath,
  signUpPath,
  updatePasswordPath
} from "./paths";
import { ensureAuthenticatedUserBootstrap } from "./bootstrap";
import { resolvePostLoginRedirect } from "./post-login";
import { getAuthCallbackUrl, getRequestOrigin } from "./urls";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  return buildInternalRedirectPath(pathname, params);
}

export async function signInWithPasswordAction(formData: FormData) {
  const email = getFieldValue(formData, "email");
  const password = getFieldValue(formData, "password");
  const requestedNext = getSafeInternalRedirectPath(getFieldValue(formData, "next"));

  if (!email || !password) {
    redirect(
      buildRedirect(signInPath, {
        error: "Email and password are required.",
        email,
        next: requestedNext ?? undefined
      })
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(
      buildRedirect(signInPath, {
        error: error.message,
        email,
        next: requestedNext ?? undefined
      })
    );
  }

  const portalNext = isPortalAuthPath(requestedNext) ? requestedNext : null;
  const destination = portalNext
    ? portalNext
    : await (async () => {
        const bootstrap = await ensureAuthenticatedUserBootstrap(supabase);

        return resolvePostLoginRedirect({
          userId: bootstrap.user_id,
          requestedNext
        });
      })();

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signInWithGoogleAction(formData: FormData) {
  const requestedNext = getSafeInternalRedirectPath(getFieldValue(formData, "next"));
  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(requestedNext, origin)
    }
  });

  if (error || !data.url) {
    redirect(
      buildRedirect(signInPath, {
        error: error?.message ?? "Unable to start Google sign-in.",
        next: requestedNext ?? undefined
      })
    );
  }

  redirect(data.url);
}

export async function signUpAction(formData: FormData) {
  const email = getFieldValue(formData, "email");
  const password = getFieldValue(formData, "password");
  const requestedNext = getSafeInternalRedirectPath(getFieldValue(formData, "next"));
  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);

  if (!email || !password) {
    redirect(
      buildRedirect(signUpPath, {
        error: "Email and password are required.",
        email,
        next: requestedNext ?? undefined
      })
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(requestedNext, origin)
    }
  });

  if (error) {
    redirect(
      buildRedirect(signUpPath, {
        error: error.message,
        email,
        next: requestedNext ?? undefined
      })
    );
  }

  revalidatePath("/", "layout");

  if (data.session) {
    const portalNext = isPortalAuthPath(requestedNext) ? requestedNext : null;
    const destination = portalNext
      ? portalNext
      : await (async () => {
          const bootstrap = await ensureAuthenticatedUserBootstrap(supabase);

          return resolvePostLoginRedirect({
            userId: bootstrap.user_id,
            requestedNext
          });
        })();

    redirect(destination);
  }

  redirect(
    buildRedirect(signInPath, {
      message: "Check your email to confirm your account before signing in.",
      email,
      next: requestedNext ?? undefined
    })
  );
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = getFieldValue(formData, "email");
  const requestedNext = getSafeInternalRedirectPath(getFieldValue(formData, "next"));
  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);

  if (!email) {
    redirect(
      buildRedirect(forgotPasswordPath, {
        error: "Email is required.",
        next: requestedNext ?? undefined
      })
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl(
      requestedNext
        ? buildRedirect(updatePasswordPath, { next: requestedNext })
        : updatePasswordPath,
      origin
    )
  });

  if (error) {
    redirect(
      buildRedirect(forgotPasswordPath, {
        error: error.message,
        email,
        next: requestedNext ?? undefined
      })
    );
  }

  redirect(
    buildRedirect(forgotPasswordPath, {
      message: "If an account exists for that email, a reset link has been sent.",
      email,
      next: requestedNext ?? undefined
    })
  );
}

export async function updatePasswordAction(formData: FormData) {
  const password = getFieldValue(formData, "password");
  const requestedNext = getSafeInternalRedirectPath(getFieldValue(formData, "next"));

  if (!password) {
    redirect(
      buildRedirect(updatePasswordPath, {
        error: "A new password is required.",
        next: requestedNext ?? undefined
      })
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    redirect(
      buildRedirect(updatePasswordPath, {
        error: error.message,
        next: requestedNext ?? undefined
      })
    );
  }

  redirect(
    buildRedirect(requestedNext ?? defaultAuthenticatedPath, {
      message: "Your password has been updated."
    })
  );
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(
    buildRedirect(signInPath, {
      message: "You have been signed out."
    })
  );
}
