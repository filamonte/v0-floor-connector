"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  defaultAuthenticatedPath,
  forgotPasswordPath,
  sanitizeRedirectPath,
  signInPath,
  signUpPath,
  updatePasswordPath
} from "./paths";
import { getAuthCallbackUrl } from "./urls";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export async function signInWithPasswordAction(formData: FormData) {
  const email = getFieldValue(formData, "email");
  const password = getFieldValue(formData, "password");
  const next = sanitizeRedirectPath(getFieldValue(formData, "next"));

  if (!email || !password) {
    redirect(
      buildRedirect(signInPath, {
        error: "Email and password are required.",
        next
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
        next
      })
    );
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = sanitizeRedirectPath(getFieldValue(formData, "next"));
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(next)
    }
  });

  if (error || !data.url) {
    redirect(
      buildRedirect(signInPath, {
        error: error?.message ?? "Unable to start Google sign-in.",
        next
      })
    );
  }

  redirect(data.url);
}

export async function signUpAction(formData: FormData) {
  const email = getFieldValue(formData, "email");
  const password = getFieldValue(formData, "password");
  const next = sanitizeRedirectPath(getFieldValue(formData, "next"));

  if (!email || !password) {
    redirect(
      buildRedirect(signUpPath, {
        error: "Email and password are required.",
        next
      })
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(next)
    }
  });

  if (error) {
    redirect(
      buildRedirect(signUpPath, {
        error: error.message,
        next
      })
    );
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(next);
  }

  redirect(
    buildRedirect(signInPath, {
      message: "Check your email to confirm your account before signing in.",
      next
    })
  );
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = getFieldValue(formData, "email");

  if (!email) {
    redirect(
      buildRedirect(forgotPasswordPath, {
        error: "Email is required."
      })
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl(updatePasswordPath)
  });

  if (error) {
    redirect(
      buildRedirect(forgotPasswordPath, {
        error: error.message
      })
    );
  }

  redirect(
    buildRedirect(forgotPasswordPath, {
      message: "If an account exists for that email, a reset link has been sent."
    })
  );
}

export async function updatePasswordAction(formData: FormData) {
  const password = getFieldValue(formData, "password");

  if (!password) {
    redirect(
      buildRedirect(updatePasswordPath, {
        error: "A new password is required."
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
        error: error.message
      })
    );
  }

  redirect(
    buildRedirect(defaultAuthenticatedPath, {
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
