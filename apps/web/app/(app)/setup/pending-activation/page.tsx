import Link from "next/link";

import { SetupEscapeBanner } from "@/components/setup-escape-banner";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

export default async function PendingActivationPage() {
  const user = await requireAuthenticatedUser("/setup/pending-activation");
  const organizationContext = await getActiveOrganizationContext(user.id);
  const tenantStatus = organizationContext?.organization.tenantStatus ?? "trialing";
  const lifecycleState = organizationContext?.organization.lifecycleState ?? "trial";
  const isActive = tenantStatus === "active" && lifecycleState === "active";

  return (
    <div className="-mx-5 min-h-[calc(100vh-140px)] bg-[#f7f5f1] px-5 py-8 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <SetupEscapeBanner />
        <section className="rounded-2xl border border-[#d8d1c9] bg-white p-6 shadow-[0_24px_70px_-64px_rgba(0,0,0,0.9)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c75f12]">
            Step 3 of 3
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#11100f]">
            You&apos;re in founder early access
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#625a52]">
            Your workspace is ready. You can enter the dashboard, create real records,
            and move through the contractor workflow while platform activation is pending.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Tenant status
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">{tenantStatus}</p>
            </div>
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Lifecycle
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">{lifecycleState}</p>
            </div>
            <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756c63]">
                Access
              </p>
              <p className="mt-2 text-sm font-semibold text-[#171412]">
                {isActive ? "Active" : "Pending activation"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#d8d1c9] bg-[#11100f] p-5 text-white">
            <p className="text-sm font-semibold">What you can do now</p>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-white/68 sm:grid-cols-2">
              <p>Create real projects and customers.</p>
              <p>Build real estimates from the same customer and project records.</p>
              <p>Generate and review contracts.</p>
              <p>Create invoices, jobs, and scheduling records for exploration.</p>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/50">
              External sends, customer-facing payment processing, and email delivery
              stay locked until activation.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p className="font-semibold">What happens next</p>
            <p className="mt-2 text-amber-900">
              A platform operator reviews your setup, billing readiness, and founder access notes before marking the tenant active. Activation unlocks guarded external production actions; it does not create a Stripe subscription or charge a card.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/setup/company"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8d1c9] bg-white px-5 text-sm font-semibold text-[#4e473f] transition hover:border-[#171412]"
            >
              Review company setup
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#11100f] px-5 text-sm font-semibold text-white transition hover:bg-[#2b241f]"
            >
              Enter Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
