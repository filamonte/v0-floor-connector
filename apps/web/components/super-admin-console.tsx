import Link from "next/link";
import type { ReactNode } from "react";
import type {
  ConfigurationFutureLayer,
  ConfigurationResolutionGroup,
  ConfigurationResolutionItem,
  ConfigurationSourceLayer
} from "@/lib/platform-admin/configuration-resolution";

type SuperAdminTab = {
  href: string;
  label: string;
  description?: string;
};

type SuperAdminTopTabsProps = {
  tabs: readonly SuperAdminTab[];
};

export function SuperAdminTopTabs({ tabs }: SuperAdminTopTabsProps) {
  return (
    <nav
      aria-label="Super admin section navigation"
      className="overflow-x-auto rounded-lg border border-[var(--border-warm)] bg-white p-2 shadow-[0_16px_40px_-34px_rgba(34,26,20,0.28)]"
    >
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="group min-w-[156px] rounded-md border border-transparent px-3 py-2 text-left transition hover:border-[var(--copper-light)] hover:bg-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]"
          >
            <span className="block text-sm font-semibold text-[var(--text-primary)]">
              {tab.label}
            </span>
            {tab.description ? (
              <span className="mt-1 block text-xs leading-5 text-[var(--text-tertiary)]">
                {tab.description}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

type FutureCapabilityPanelProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function FutureCapabilityPanel({
  id,
  title,
  children
}: FutureCapabilityPanelProps) {
  return (
    <section
      id={id}
      className="rounded-lg border border-dashed border-amber-300 bg-amber-50/80 px-5 py-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
        Future capability
      </p>
      <h3 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <div className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}

type ScopeLegendProps = {
  items: readonly {
    label: string;
    description: string;
  }[];
};

export function ScopeLegend({ items }: ScopeLegendProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 shadow-[0_14px_34px_-32px_rgba(34,26,20,0.2)]"
        >
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {item.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

const sourceLayerLabels: Record<ConfigurationSourceLayer, string> = {
  platform_default: "Platform default",
  organization_owned: "Contractor-owned",
  user_preference: "User preference",
  future_organization_override: "Future organization override",
  future_user_preference: "Future user preference",
  record_snapshot: "Record snapshot",
  fallback: "Fallback"
};

const sourceLayerClasses: Record<ConfigurationSourceLayer, string> = {
  platform_default:
    "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]",
  organization_owned: "border-emerald-200 bg-emerald-50 text-emerald-800",
  user_preference:
    "border-[var(--copper-light)] bg-[var(--copper)]/10 text-[var(--copper)]",
  future_organization_override:
    "border-dashed border-amber-300 bg-amber-50 text-amber-800",
  future_user_preference:
    "border-dashed border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]",
  record_snapshot:
    "border-dashed border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]",
  fallback:
    "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]"
};

type ConfigurationSourceBadgeProps = {
  sourceLayer: ConfigurationSourceLayer;
};

export function ConfigurationSourceBadge({
  sourceLayer
}: ConfigurationSourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${sourceLayerClasses[sourceLayer]}`}
    >
      {sourceLayerLabels[sourceLayer]}
    </span>
  );
}

type ConfigurationInheritanceTimelineProps = {
  futureLayers: readonly ConfigurationFutureLayer[];
  hasSelectedOrganization: boolean;
};

export function ConfigurationInheritanceTimeline({
  futureLayers,
  hasSelectedOrganization
}: ConfigurationInheritanceTimelineProps) {
  const steps = [
    {
      label: "Platform default",
      status: "Implemented",
      description: "Global settings and starter seeds visible today."
    },
    {
      label: "Contractor-owned setting or copy",
      status: hasSelectedOrganization ? "Inspectable" : "Select contractor",
      description:
        "Organization settings, adopted templates, and adopted catalog items."
    },
    ...futureLayers.map((layer) => ({
      label: layer.label,
      status: "Future",
      description: layer.notes
    }))
  ];

  return (
    <section className="rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-[0_18px_48px_-40px_rgba(34,26,20,0.24)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
            Resolution order
          </p>
          <h3 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
            Configuration inheritance preview
          </h3>
        </div>
        <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
          Read-only
        </span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="relative rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-warm)] bg-white text-xs font-semibold text-[var(--text-secondary)]">
                {index + 1}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                {step.status}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              {step.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

type ConfigurationResolutionCardProps = {
  group: ConfigurationResolutionGroup;
};

function ConfigurationResolutionRow({
  item
}: {
  item: ConfigurationResolutionItem;
}) {
  const ownershipLabel =
    item.sourceLayer === "user_preference"
      ? "User-owned"
      : item.isContractorOwned
        ? "Contractor-owned"
        : "Platform-owned";

  return (
    <div className="grid gap-3 border-t border-[var(--border-warm)] px-4 py-4 lg:grid-cols-[minmax(180px,0.8fr)_minmax(220px,1fr)_minmax(180px,0.8fr)]">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {item.label}
        </p>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">{item.key}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {item.effectiveValue}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
          {item.notes}
        </p>
      </div>
      <div className="space-y-2">
        <ConfigurationSourceBadge sourceLayer={item.sourceLayer} />
        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[var(--text-tertiary)]">
          <span>{item.isInherited ? "Inherited" : "Direct"}</span>
          <span>{ownershipLabel}</span>
          <span>
            {item.futureUserOverrideAllowed
              ? "Future user override allowed"
              : "No user override"}
          </span>
        </div>
        {item.sourceId ? (
          <p className="break-all text-xs text-[var(--text-tertiary)]/70">
            Source: {item.sourceId}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ConfigurationResolutionCard({
  group
}: ConfigurationResolutionCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_48px_-40px_rgba(34,26,20,0.24)]">
      <div className="h-1 bg-[linear-gradient(90deg,var(--graphite),#64748b)]" />
      <div className="px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          {group.key}
        </p>
        <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
          {group.label}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--text-tertiary)]">
          {group.description}
        </p>
      </div>
      <div>
        {group.items.map((item) => (
          <ConfigurationResolutionRow key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
}
