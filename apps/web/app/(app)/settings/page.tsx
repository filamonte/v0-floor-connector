import Link from "next/link";

import {
  industrialEyebrowClassName,
  industrialPanelClassName,
  industrialSecondaryActionClassName
} from "@/components/industrial-os-primitives";
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
  eyebrow: string;
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
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1e3a8a]";
  }

  return "border-[#d1d5db] bg-[#f9fafb] text-[#475569]";
}

const setupPanelClassName = [industrialPanelClassName, "p-5"].join(" ");
const setupLinkClassName = [
  industrialSecondaryActionClassName,
  "min-h-8 py-1.5 font-medium"
].join(" ");

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
      eyebrow: "Company Controls",
      title: "Company profile and identity",
      description:
        "Keep the contractor-owned profile, app header identity, contact details, and web presence in one place.",
      href: "/settings/organization",
      ctaLabel: "Open company profile",
      facts: [
        scope.organization.displayName,
        scope.organization.websiteUrl ?? "Website URL missing",
        scope.organization.primaryTrade ?? "Primary trade not set",
        "Tenant status remains platform-controlled"
      ]
    },
    {
      eyebrow: "Users / Access",
      title: "Company users and role guardrails",
      description:
        "Review organization members, role assignment, and admin-only troubleshooting without changing platform policy.",
      href: "/settings/admin",
      ctaLabel: "Open users / access",
      facts: [
        `${members.length} member${members.length === 1 ? "" : "s"}`,
        "Company admins manage this organization only",
        "Operations Monitor preview lives here temporarily"
      ]
    },
    {
      eyebrow: "Workflow Defaults",
      title: "Workflow gates and operating defaults",
      description:
        "Set Ready Check posture, contract approval rules, guidance preferences, and notification-only automation readiness.",
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
      eyebrow: "Sales / Estimate",
      title: "Estimate systems and sales setup",
      description:
        "Organize reusable estimate templates, catalog items, floor systems, finish products, and selected-system validation.",
      href: "/settings/templates",
      ctaLabel: "Open sales setup",
      facts: [
        `${allTemplates.length} template${allTemplates.length === 1 ? "" : "s"}`,
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
      eyebrow: "Financial",
      title: "Billing defaults and tax posture",
      description:
        "Own the organization tax behavior, retainage baseline, and tax-code settings that seed downstream billing records.",
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
      eyebrow: "Templates",
      title: "Reusable company documents",
      description:
        "Keep SOPs, policies, agreements, and reusable business documents visible without moving source-record action here.",
      href: "/settings/company-documents",
      ctaLabel: "Open company documents",
      facts: [
        `${activeCompanyDocuments} active company document${
          activeCompanyDocuments === 1 ? "" : "s"
        }`,
        "Document adoption stays organization-owned",
        "Source workflow records remain canonical"
      ]
    },
    {
      eyebrow: "Portal / Admin boundaries",
      title: "Feature controls and data boundaries",
      description:
        "Clarify what company admins can inspect or override while platform policy, portal guards, and tenant lifecycle stay outside local settings.",
      href: "/settings/modules",
      ctaLabel: "Open boundary controls",
      facts: [
        `${featureOverrides.length} company feature override${
          featureOverrides.length === 1 ? "" : "s"
        }`,
        "Platform feature policy remains in Super Admin",
        "Data export is owner/admin scoped and read-only",
        "Portal access rules are not changed from Settings overview"
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
            label: "Company Controls",
            description:
              "This page summarizes activation, missing configuration, and where each company-owned setting lives."
          },
          {
            label: "Owner sections stay focused",
            description:
              "Workflow defaults, sales setup, financial controls, templates, users, and boundary controls stay on focused routes."
          },
          {
            label: "Canonical action stays in workspaces",
            description:
              "Settings can unblock configuration gaps, but estimates, contracts, invoices, schedules, jobs, and collections still act in their owning workspaces."
          }
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className={setupPanelClassName}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className={industrialEyebrowClassName}>
                Overview / setup health
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f172a]">
                Company setup health
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#475569]">
                These signals are read from existing tenant, membership, and
                setup records. No fake score, percentage, integration state, or
                module readiness is inferred.
              </p>
            </div>
            <Link
              href="/setup/pending-activation"
              className={setupLinkClassName}
            >
              View activation status
            </Link>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {setupSignals.map((signal) => (
              <div
                key={signal.label}
                className={`rounded-[4px] border px-4 py-4 text-sm ${getSignalClassName(
                  signal.tone
                )}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                  {signal.label}
                </p>
                <p className="mt-2 text-base font-semibold capitalize">
                  {signal.value}
                </p>
                <p className="mt-2 leading-6 opacity-80">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={setupPanelClassName}>
          <p className={industrialEyebrowClassName}>Next setup actions</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0f172a]">
            Resolve missing company configuration before adding more controls
          </h2>
          <div className="mt-4 border border-[#d1d5db] bg-[#f9fafb] px-4 py-4 text-sm leading-6 text-[#475569]">
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
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/settings/organization" className={setupLinkClassName}>
              Company
            </Link>
            <Link href="/settings/admin" className={setupLinkClassName}>
              Users / Access
            </Link>
            <Link href="/settings/workflows" className={setupLinkClassName}>
              Workflow Defaults
            </Link>
            <Link href="/settings/templates" className={setupLinkClassName}>
              Sales / Estimate
            </Link>
            <Link href="/settings/financial" className={setupLinkClassName}>
              Financial
            </Link>
            <Link
              href="/settings/company-documents"
              className={setupLinkClassName}
            >
              Templates
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-5 2xl:grid-cols-2">
        {ownerSections.map((section) => (
          <SettingsOverviewCard
            key={section.title}
            title={section.title}
            description={section.description}
            href={section.href}
            ctaLabel={section.ctaLabel}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
              {section.eyebrow}
            </p>
            <ul className="space-y-2 rounded-[4px] border border-[#d1d5db] bg-[#f9fafb] px-4 py-4 text-sm leading-6 text-[#475569]">
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
