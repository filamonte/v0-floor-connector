import Link from "next/link";

import { SettingsBoundaryNotice } from "@/components/settings-boundary-notice";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsOverviewCard } from "@/components/settings-overview-card";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import {
  requireOrganizationAdminScope,
  listOrganizationMembers
} from "@/lib/organizations/admin";
import { listOrganizationFeatureOverrides } from "@/lib/organizations/module-settings";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listCatalogItems } from "@/lib/catalogs/data";
import { getSelectedSystemsAdminData } from "@/lib/selected-systems/data";
import { getSystemLayersAdminData } from "@/lib/system-layers/data";
import { listDocumentTemplates } from "@/lib/templates/data";
import { listCompanyDocuments } from "@/lib/company-documents/data";

type SettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

type SetupSignal = {
  label: string;
  value: string;
  description: string;
  tone?: "ready" | "attention" | "neutral";
};

type OwnerSection = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  facts: string[];
};

function formatPercentFromRate(rate: string) {
  return (Number(rate) * 100).toFixed(2);
}

function formatStatus(value: string | null | undefined) {
  if (!value) {
    return "Not exposed";
  }

  return value.replaceAll("_", " ");
}

function getSignalClassName(tone: SetupSignal["tone"] = "neutral") {
  if (tone === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (tone === "attention") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]";
}

const setupPanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-[0_18px_48px_-40px_rgba(34,26,20,0.28)]";
const setupLinkClassName =
  "inline-flex rounded-md border border-[var(--border-warm)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]";

export default async function SettingsPage({
  searchParams
}: SettingsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings");

  const [
    allTemplates,
    catalogItems,
    financialSettings,
    workflowSettings,
    members,
    featureOverrides,
    systemLayersData,
    selectedSystemsData,
    companyDocuments
  ] = await Promise.all([
    listDocumentTemplates(),
    listCatalogItems(),
    getOrganizationFinancialSettings(scope.organizationId),
    getOrganizationWorkflowSettings(scope.organizationId),
    listOrganizationMembers(scope.organizationId),
    listOrganizationFeatureOverrides(scope.organizationId),
    getSystemLayersAdminData("/settings"),
    getSelectedSystemsAdminData("/settings"),
    listCompanyDocuments("/settings")
  ]);

  const activeCompanyDocuments = companyDocuments.filter(
    (document) => document.status === "active"
  ).length;
  const systemCount = catalogItems.filter(
    (item) => item.itemType === "system"
  ).length;
  const addOnOptionCount = catalogItems.filter(
    (item) => (item.category ?? "").trim().toLowerCase() === "add-ons / options"
  ).length;
  const missingSetupItems = [
    scope.organization.websiteUrl ? null : "Contractor website URL",
    scope.organization.email ? null : "Company email",
    scope.organization.phone ? null : "Company phone",
    allTemplates.length > 0 ? null : "Document templates",
    catalogItems.length > 0 ? null : "Catalog items",
    members.length > 1 ? null : "Additional team members"
  ].filter((item): item is string => Boolean(item));

  const setupSignals: SetupSignal[] = [
    {
      label: "Tenant status",
      value: formatStatus(scope.organization.tenantStatus),
      description:
        "Activation and tenant lifecycle remain platform-controlled.",
      tone: scope.organization.tenantStatus === "active" ? "ready" : "attention"
    },
    {
      label: "Lifecycle state",
      value: formatStatus(scope.organization.lifecycleState),
      description:
        "Read from the existing company record; no setup score is inferred.",
      tone: scope.organization.lifecycleState === "active" ? "ready" : "neutral"
    },
    {
      label: "Profile basics",
      value:
        missingSetupItems.length === 0
          ? "No obvious gaps"
          : `${missingSetupItems.length} gap${
              missingSetupItems.length === 1 ? "" : "s"
            }`,
      description:
        "Missing items are derived only from existing company and setup records.",
      tone: missingSetupItems.length === 0 ? "ready" : "attention"
    }
  ];

  const ownerSections: OwnerSection[] = [
    {
      title: "Company",
      description:
        "Profile, identity, brand header accent, contact details, and contractor website URL.",
      href: "/settings/organization",
      ctaLabel: "Open company profile",
      facts: [
        scope.organization.displayName,
        scope.organization.websiteUrl ?? "Website URL missing",
        scope.organization.primaryTrade ?? "Primary trade not set"
      ]
    },
    {
      title: "Team & Access",
      description:
        "Organization members, roles, and tenant-scoped access guardrails.",
      href: "/settings/admin",
      ctaLabel: "Open team access",
      facts: [
        `${members.length} member${members.length === 1 ? "" : "s"}`,
        "Company admins manage this organization only",
        "Operations Monitor preview lives here temporarily"
      ]
    },
    {
      title: "Sales / Workflow",
      description:
        "Contract generation defaults, Ready Check posture, workflow guidance, and AI assistance preferences.",
      href: "/settings/workflows",
      ctaLabel: "Open workflow defaults",
      facts: [
        workflowSettings.requireContractInternalApproval
          ? "Internal contract approval required"
          : "Internal contract approval not required",
        workflowSettings.requireDepositBeforeJobScheduling
          ? "Deposit before scheduling required"
          : "Deposit before scheduling optional",
        workflowSettings.approvedEstimateContractTemplateId
          ? "Approved-estimate contract template assigned"
          : "Default contract template resolution"
      ]
    },
    {
      title: "Operations",
      description:
        "Next Move cue rules, responsibility defaults, and automation readiness without moving workflow action into Settings.",
      href: "/settings/operational-intelligence",
      ctaLabel: "Open operations settings",
      facts: [
        "Derived suggestions stay on canonical records",
        "Dismiss and snooze only affect user visibility",
        "Automation execution remains separate from notification preferences"
      ]
    },
    {
      title: "Financials",
      description:
        "Tax, retainage, billing defaults, and tax-code settings that seed downstream billing records.",
      href: "/settings/financial",
      ctaLabel: "Open financial defaults",
      facts: [
        `${financialSettings.defaultTaxBehavior} tax at ${formatPercentFromRate(
          financialSettings.defaultTaxRate
        )}%`,
        `${financialSettings.defaultRetainagePercentage}% retainage baseline`,
        "Invoice/payment action remains in Financials and Invoice Workspaces"
      ]
    },
    {
      title: "Documents / Templates / Catalogs",
      description:
        "Document templates, company documents, catalogs, systems, add-ons, and selected system admin maintenance.",
      href: "/settings/templates",
      ctaLabel: "Open reusable setup",
      facts: [
        `${allTemplates.length} template${allTemplates.length === 1 ? "" : "s"}`,
        `${activeCompanyDocuments} active company document${
          activeCompanyDocuments === 1 ? "" : "s"
        }`,
        `${systemCount} system item${systemCount === 1 ? "" : "s"} and ${addOnOptionCount} add-on option${
          addOnOptionCount === 1 ? "" : "s"
        }`,
        `${systemLayersData.finishProducts.length} finish product${
          systemLayersData.finishProducts.length === 1 ? "" : "s"
        } and ${selectedSystemsData.selectedSystems.length} selected system${
          selectedSystemsData.selectedSystems.length === 1 ? "" : "s"
        }`
      ]
    },
    {
      title: "Integrations / Modules",
      description:
        "Company feature overrides and tenant-scoped data export without platform policy ownership.",
      href: "/settings/modules",
      ctaLabel: "Open module controls",
      facts: [
        `${featureOverrides.length} company feature override${
          featureOverrides.length === 1 ? "" : "s"
        }`,
        "Platform feature policy remains in Super Admin",
        "Data export is owner/admin scoped and read-only"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsBoundaryNotice
        title="Company Controls configure this contractor organization"
        items={[
          {
            label: "Overview / setup health",
            description:
              "This page summarizes activation, missing configuration, and where each owner section lives."
          },
          {
            label: "Configuration belongs in owner sections",
            description:
              "Company, team, workflow, operations, financial, document, catalog, module, and export controls stay on focused routes."
          },
          {
            label: "Workflow action stays in workspaces",
            description:
              "Settings can unblock configuration gaps, but estimates, contracts, invoices, schedules, jobs, and collections still act in their owning workspaces."
          }
        ]}
      />

      <section className={setupPanelClassName}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
              Overview / setup health
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Company setup health
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              These signals are read from existing tenant, membership, and setup
              records. No fake score, percentage, integration state, or module
              readiness is inferred.
            </p>
          </div>
          <Link href="/setup/pending-activation" className={setupLinkClassName}>
            View activation status
          </Link>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {setupSignals.map((signal) => (
            <div
              key={signal.label}
              className={`rounded-lg border px-4 py-4 text-sm ${getSignalClassName(
                signal.tone
              )}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                {signal.label}
              </p>
              <p className="mt-2 text-base font-semibold capitalize">
                {signal.value}
              </p>
              <p className="mt-2 leading-6 opacity-80">{signal.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={setupPanelClassName}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
              Next setup actions
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Resolve missing company configuration before adding more controls
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              The overview routes admins to the right owner section instead of
              exposing every editable control at the top level.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            {missingSetupItems.length > 0 ? (
              <ul className="space-y-2">
                {missingSetupItems.map((item) => (
                  <li key={item}>Set {item}.</li>
                ))}
              </ul>
            ) : (
              <p>No obvious setup gaps were found from the current records.</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/settings/organization" className={setupLinkClassName}>
            Company
          </Link>
          <Link href="/settings/admin" className={setupLinkClassName}>
            Team & Access
          </Link>
          <Link href="/settings/workflows" className={setupLinkClassName}>
            Sales / Workflow
          </Link>
          <Link
            href="/settings/operational-intelligence"
            className={setupLinkClassName}
          >
            Operations
          </Link>
          <Link href="/settings/financial" className={setupLinkClassName}>
            Financials
          </Link>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-2">
        {ownerSections.map((section) => (
          <SettingsOverviewCard
            key={section.title}
            title={section.title}
            description={section.description}
            href={section.href}
            ctaLabel={section.ctaLabel}
          >
            <ul className="space-y-2 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
              {section.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </SettingsOverviewCard>
        ))}
      </div>
    </div>
  );
}
