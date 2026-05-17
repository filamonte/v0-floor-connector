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
  headingLevel?: "h1" | "h2";
};

export function ProtectedSurfaceHeader({
  title,
  description,
  user,
  brandHref = "/dashboard",
  brandName = "FloorConnector",
  logoUrl,
  brandAccentColor,
  brandSupportingLabel,
  headingLevel = "h1"
}: ProtectedSurfaceHeaderProps) {
  const Heading = headingLevel;

  return (
    <header className="border-b border-[var(--border-warm)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <OrganizationBrandLink
            href={brandHref}
            organizationName={brandName}
            logoUrl={logoUrl}
            brandAccentColor={brandAccentColor}
            supportingLabel={brandSupportingLabel}
            className="mb-3"
          />
          <Heading className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </Heading>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="max-w-full rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-2 text-sm text-[var(--text-secondary)] [overflow-wrap:anywhere]">
            {user.email ?? "Authenticated user"}
          </div>
          <SignOutForm />
        </div>
      </div>
    </header>
  );
}
