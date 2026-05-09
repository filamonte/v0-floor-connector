import { SettingsSectionCard } from "@/components/settings-section-card";
import { SuperAdminTopTabs } from "@/components/super-admin-console";
import { getPlatformPackageGovernance } from "@/lib/platform-admin/data";
import { buildPlatformPackageDefinitionPlanningModel } from "@/lib/platform-admin/package-definition-planning-core";
import type { PlatformPackagePlanningConcept } from "@/lib/platform-admin/package-definition-planning-core";
import type {
  PlatformPackageGovernanceBucket,
  PlatformPackageGovernanceSummaryCard,
  PlatformPackageGovernanceTenantRow,
  PlatformPackageGovernanceTone
} from "@/lib/platform-admin/package-governance-core";

const toneClasses: Record<PlatformPackageGovernanceTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-800"
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function SummaryCard({ card }: { card: PlatformPackageGovernanceSummaryCard }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{card.label}</p>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses[card.tone]}`}
        >
          {card.tone}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {card.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{card.description}</p>
    </div>
  );
}

function BucketGrid({ buckets }: { buckets: PlatformPackageGovernanceBucket[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {buckets.map((bucket) => (
        <div
          key={bucket.key}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">{bucket.label}</p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {bucket.count}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {bucket.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlanningConceptGrid({
  concepts
}: {
  concepts: PlatformPackagePlanningConcept[];
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {concepts.map((concept) => (
        <div
          key={concept.id}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">
              {concept.label}
            </p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {concept.classification.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {concept.futurePurpose}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {concept.currentBoundary}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlanningList({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TenantRow({ row }: { row: PlatformPackageGovernanceTenantRow }) {
  return (
    <li className="grid gap-3 border-t border-slate-200 px-4 py-4 xl:grid-cols-[minmax(180px,0.9fr)_minmax(170px,0.8fr)_minmax(170px,0.8fr)_minmax(220px,1fr)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          {row.organizationLabel}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.tenantStatus} / {row.lifecycleState}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Package
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.planLabel}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Billing
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.billingSetupLabel}</p>
        <p className="mt-1 text-xs text-slate-500">
          {row.subscriptionStatusLabel}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Activation
        </p>
        <p className="mt-2 text-sm text-slate-800">{row.earlyAccessLabel}</p>
        {row.caveats.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
            {row.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export default async function SuperAdminPackagesPage() {
  const governance = await getPlatformPackageGovernance();
  const packageDefinitionPlanning = buildPlatformPackageDefinitionPlanningModel();

  return (
    <div className="space-y-6" data-testid="platform-package-governance-page">
      <SuperAdminTopTabs
        tabs={[
          {
            href: "#package-billing-overview",
            label: "Overview",
            description: "Read-only package and billing counts"
          },
          {
            href: "#contractor-plan-state",
            label: "Plan state",
            description: "Existing subscription-plan records"
          },
          {
            href: "#billing-setup-readiness",
            label: "Billing",
            description: "Safe setup-readiness references"
          },
          {
            href: "#future-package-controls",
            label: "Future controls",
            description: "Not implemented here"
          },
          {
            href: "#future-package-definition-model",
            label: "Definition model",
            description: "Planning only, no enforcement"
          }
        ]}
      />

      <SettingsSectionCard
        id="package-billing-overview"
        eyebrow="Read-only governance"
        title="Package / Billing Overview"
        description="This Super Admin package governance foundation reads existing tenant, subscription-plan, and billing setup references only. It does not change billing, call Stripe, create charges or subscriptions, enforce entitlements, gate modules, change contractor permissions, or affect runtime behavior."
        tone="neutral"
      >
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
          data-testid="platform-package-read-only-copy"
        >
          Read-only view generated {formatDateTime(governance.generatedAt)}. No
          package, billing, Stripe, entitlement, module, permission, or runtime
          controls are available from this page.
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {governance.summaryCards.map((card) => (
            <SummaryCard key={card.id} card={card} />
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="contractor-plan-state"
        eyebrow="Existing records"
        title="Contractor Plan State"
        description="Plan state is inferred from current company subscription rows and their linked subscription plan names when those records exist."
        tone="neutral"
      >
        <BucketGrid buckets={governance.planBuckets} />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Tenant status
            </p>
            <div className="mt-3">
              <BucketGrid buckets={governance.tenantStatusBuckets} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Lifecycle state
            </p>
            <div className="mt-3">
              <BucketGrid buckets={governance.lifecycleBuckets} />
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="billing-setup-readiness"
        eyebrow="Billing setup readiness"
        title="Billing Setup Readiness"
        description="Billing setup readiness uses safe stored company references and safe configuration-presence checks only. This page does not inspect secret values and does not call Stripe."
        tone="neutral"
      >
        <BucketGrid buckets={governance.billingReadinessBuckets} />
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            Stripe setup notes
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {governance.stripeReadinessNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="early-access-activation-status"
        eyebrow="Activation status"
        title="Early-Access / Activation Status"
        description="Activation grouping is derived from existing company tenant status and lifecycle state fields."
        tone="neutral"
      >
        <BucketGrid buckets={governance.earlyAccessBuckets} />
        <ol className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {governance.tenantRows.map((row) => (
            <TenantRow key={row.id} row={row} />
          ))}
        </ol>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="future-package-controls"
        eyebrow="Not yet governed"
        title="Not Yet Governed / Future Package Controls"
        description="These are explicit boundaries for future package, billing, plan, entitlement, and module-control work. They are not implemented as controls on this page."
        tone="neutral"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Operator guidance
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {governance.operatorGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Current caveats
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {governance.caveats.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Future controls
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {governance.futureControls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        id="future-package-definition-model"
        eyebrow="Planning model"
        title="Future Package Definition Model"
        description="This static planning model separates future package definitions, billing plans, module visibility, limits, entitlements, onboarding defaults, segmentation, provider mapping, trials, and custom contracts before any real package schema or enforcement exists."
        tone="neutral"
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Read-only planning output only. Package definitions are not implemented
          yet, billing enforcement is not implemented yet, entitlements and
          module gates are not implemented yet, Stripe-backed subscription
          operations are not implemented yet, and this page does not change
          package, billing, permission, module, entitlement, activation, or
          runtime behavior.
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Read-only
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {packageDefinitionPlanning.readOnly ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Runtime enforcement
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {packageDefinitionPlanning.runtimeEnforcement ? "Enabled" : "Not implemented"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Mutation controls
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {packageDefinitionPlanning.mutationControlsAvailable
                ? "Available"
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <PlanningConceptGrid concepts={packageDefinitionPlanning.proposedDimensions} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">
              Future lifecycle states
            </p>
            <div className="mt-3 space-y-3">
              {packageDefinitionPlanning.futureLifecycleStates.map((item) => (
                <div key={item.state}>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.state}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <PlanningList
            title="Future required approvals"
            items={packageDefinitionPlanning.futureRequiredApprovals}
          />
          <PlanningList
            title="Future data dependencies"
            items={packageDefinitionPlanning.futureDataDependencies}
          />
          <PlanningList
            title="Future enforcement boundaries"
            items={packageDefinitionPlanning.futureEnforcementBoundaries}
          />
        </div>

        <div className="mt-5">
          <PlanningList
            title="Risks and caveats"
            items={packageDefinitionPlanning.risksAndCaveats}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
