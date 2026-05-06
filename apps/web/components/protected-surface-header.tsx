import type { User } from "@supabase/supabase-js";

import { OrganizationBrandLink } from "@/components/organization-brand-link";
import { SignOutForm } from "@/components/sign-out-form";

type ProtectedSurfaceHeaderProps = {
  title: string;
  description: string;
  user: User;
  brandHref?: string;
  brandName?: string;
  logoUrl?: string | null;
  brandAccentColor?: string | null;
  brandSupportingLabel?: string;
};

export function ProtectedSurfaceHeader({
  title,
  description,
  user,
  brandHref = "/dashboard",
  brandName = "FloorConnector",
  logoUrl,
  brandAccentColor,
  brandSupportingLabel
}: ProtectedSurfaceHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <OrganizationBrandLink
            href={brandHref}
            organizationName={brandName}
            logoUrl={logoUrl}
            brandAccentColor={brandAccentColor}
            supportingLabel={brandSupportingLabel}
            className="mb-3"
          />
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
