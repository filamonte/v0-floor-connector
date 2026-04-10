import type { User } from "@supabase/supabase-js";

import { SignOutForm } from "@/components/sign-out-form";

type ProtectedSurfaceHeaderProps = {
  title: string;
  description: string;
  user: User;
};

export function ProtectedSurfaceHeader({
  title,
  description,
  user
}: ProtectedSurfaceHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Authenticated Surface
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            {user.email ?? "Authenticated user"}
          </div>
          <SignOutForm />
        </div>
      </div>
    </header>
  );
}
