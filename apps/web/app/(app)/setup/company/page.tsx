import Link from "next/link";

import { SettingsFeedback } from "@/components/settings-feedback";
import { SetupEscapeBanner } from "@/components/setup-escape-banner";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getPrimaryOrganizationLocation } from "@/lib/onboarding/company-setup";
import { saveCompanySetupAction } from "@/lib/onboarding/actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function Field({
  label,
  name,
  defaultValue,
  required = false,
  type = "text",
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-[#2f2923]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full min-w-0 rounded-xl border border-[#d8d1c9] bg-white px-4 text-sm text-[#171412] outline-none transition focus:border-[#d8731f] focus:ring-4 focus:ring-[#f97316]/15"
      />
    </label>
  );
}

export default async function CompanySetupPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/setup/company");
  const location = await getPrimaryOrganizationLocation(scope.organizationId);

  return (
    <div className="min-w-0 overflow-x-hidden bg-[#f7f5f1] px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-5xl min-w-0">
        <SetupEscapeBanner />
        <SettingsFeedback
          error={resolvedSearchParams.error}
          message={resolvedSearchParams.message}
        />

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-2xl border border-[#d8d1c9] bg-white p-6 shadow-[0_24px_70px_-64px_rgba(0,0,0,0.9)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c75f12]">
              Step 1 of 3
            </p>
            <h1 className="mt-3 whitespace-normal break-words text-3xl font-semibold tracking-tight text-[#11100f] [overflow-wrap:anywhere]">
              Let&apos;s set up your company
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625a52]">
              Add the basics that will appear on estimates, contracts, invoices, and the customer portal. This starts your real contractor workspace, not a demo account.
            </p>

            <form action={saveCompanySetupAction} className="mt-8 min-w-0 space-y-6">
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Company legal name"
                  name="legalName"
                  defaultValue={scope.organization.legalName}
                  required
                />
                <Field
                  label="Company display name"
                  name="displayName"
                  defaultValue={scope.organization.displayName}
                  required
                />
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Logo URL or storage reference"
                  name="logoUrl"
                  type="url"
                  defaultValue={scope.organization.logoUrl}
                  placeholder="https://example.com/logo.png"
                />
                <Field
                  label="Brand accent color"
                  name="brandAccentColor"
                  defaultValue={scope.organization.brandAccentColor}
                  placeholder="#d8731f"
                />
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Company phone"
                  name="phone"
                  type="tel"
                  defaultValue={scope.organization.phone}
                  placeholder="(555) 010-1234"
                />
                <Field
                  label="Company email"
                  name="email"
                  type="email"
                  defaultValue={scope.organization.email}
                  placeholder="office@example.com"
                />
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Website"
                  name="websiteUrl"
                  type="url"
                  defaultValue={scope.organization.websiteUrl}
                  placeholder="https://example.com"
                />
                <Field
                  label="Primary trade / service type"
                  name="primaryTrade"
                  defaultValue={scope.organization.primaryTrade}
                  placeholder="Epoxy flooring"
                />
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Time zone"
                  name="timeZone"
                  defaultValue={scope.organization.timeZone}
                  placeholder="America/New_York"
                />
                <div className="min-w-0 rounded-xl border border-dashed border-[#d8d1c9] bg-[#fbfaf8] p-4 text-sm leading-6 text-[#625a52]">
                  Logo upload is planned. For now, use a hosted logo URL if you have one.
                </div>
              </div>

              <div className="min-w-0 rounded-xl border border-[#e4ded7] bg-[#fbfaf8] p-4">
                <p className="text-sm font-semibold text-[#171412]">Primary address</p>
                <div className="mt-4 grid min-w-0 gap-4">
                  <Field
                    label="Street"
                    name="addressLine1"
                    defaultValue={location?.addressLine1}
                    required
                  />
                  <Field
                    label="Street 2"
                    name="addressLine2"
                    defaultValue={location?.addressLine2}
                  />
                  <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_120px_160px]">
                    <Field label="City" name="city" defaultValue={location?.city} required />
                    <Field
                      label="State"
                      name="stateRegion"
                      defaultValue={location?.stateRegion}
                      required
                    />
                    <Field
                      label="Postal code"
                      name="postalCode"
                      defaultValue={location?.postalCode}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#e4ded7] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/setup/billing"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8d1c9] bg-white px-5 text-sm font-semibold text-[#4e473f] transition hover:border-[#171412]"
                >
                  Continue to billing
                </Link>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#11100f] px-5 text-sm font-semibold text-white transition hover:bg-[#2b241f]"
                >
                  Save and continue
                </button>
              </div>
            </form>
          </section>

          <aside className="min-w-0 rounded-2xl border border-[#d8d1c9] bg-[#11100f] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f7a35c]">
              Setup note
            </p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/68">
              <p>This updates your real company profile.</p>
              <p>You can enter the dashboard after setup and refine details later while platform activation is pending.</p>
              <p>External sends and customer payment processing stay locked until activation.</p>
              <p>Tax and financial defaults stay in settings.</p>
            </div>
            <Link
              href="/settings/financial"
              className="mt-6 inline-flex text-sm font-semibold text-[#f7a35c] transition hover:text-white"
            >
              Configure financial defaults later
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
