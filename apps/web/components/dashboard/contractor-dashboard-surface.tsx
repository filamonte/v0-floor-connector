"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { Customer } from "@floorconnector/types";

import { ChangeOrderQuickCreateForm } from "@/components/change-order-quick-create-form";
import { ContractQuickCreateForm } from "@/components/contract-quick-create-form";
import { CustomerQuickCreateForm } from "@/components/customer-quick-create-form";
import { EstimateQuickCreateForm } from "@/components/estimate-quick-create-form";
import { InvoiceQuickCreateForm } from "@/components/invoice-quick-create-form";
import { JobQuickCreateForm } from "@/components/job-quick-create-form";
import { OpportunityQuickCreateForm } from "@/components/opportunity-quick-create-form";
import { ProjectQuickCreateForm } from "@/components/project-quick-create-form";
import { UniversalCreateMenu } from "@/components/universal-create-menu";

type QuickCreateAction = (formData: FormData) => void | Promise<void>;

type DashboardMetric = {
  key: string;
  label: string;
  value: string;
  detail: string;
  href: string;
};

type DashboardQueueItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  actionLabel: string;
  badge?: string | null;
  trailing?: string | null;
  contextHref?: string | null;
  contextLabel?: string | null;
  searchText: string;
};

type DashboardWidget = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  items: DashboardQueueItem[];
};

type DashboardShortcut = {
  key: string;
  label: string;
  description: string;
  href: string;
  metric?: string;
};

type DashboardPlaceholder = {
  key: string;
  title: string;
  description: string;
  priority: "High";
};

type ProjectOption = {
  id: string;
  name: string;
  customerId?: string | null;
  customerName?: string | null;
  status?: string | null;
};

type OpportunityOption = {
  id: string;
  title: string;
  contactName: string;
  customerName?: string | null;
  jobType?: string | null;
  siteName?: string | null;
  status: string;
};

type ApprovedEstimateOption = {
  id: string;
  referenceNumber: string;
  projectName?: string | null;
};

type ContractOption = {
  id: string;
  projectId: string;
  title: string;
  status: string;
};

type InvoiceOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  status: string;
};

export type ContractorDashboardSurfaceProps = {
  header: {
    organizationName: string;
    roleLabel: string;
    activeProjectCount: number;
    openReceivablesLabel: string;
  };
  metrics: DashboardMetric[];
  attentionWidget?: DashboardWidget | null;
  commercialWidgets: DashboardWidget[];
  operationsWidgets: DashboardWidget[];
  financeWidgets: DashboardWidget[];
  shortcuts: DashboardShortcut[];
  placeholders: DashboardPlaceholder[];
  quickCreate: {
    defaultRetainagePercentage: string;
    customerOptions: Customer[];
    opportunityOptions: OpportunityOption[];
    projectOptions: ProjectOption[];
    approvedEstimateOptions: ApprovedEstimateOption[];
    contractOptions: ContractOption[];
    invoiceOptions: InvoiceOption[];
    preferredContractTemplateId?: string | null;
    requireContractInternalApproval?: boolean;
    actions: {
      lead: QuickCreateAction;
      customer: QuickCreateAction;
      project: QuickCreateAction;
      estimate: QuickCreateAction;
      contract: QuickCreateAction;
      job: QuickCreateAction;
      invoice: QuickCreateAction;
      changeOrder: QuickCreateAction;
    };
  };
};

type ComposerKey =
  | "lead"
  | "customer"
  | "project"
  | "estimate"
  | "contract"
  | "job"
  | "invoice"
  | "change-order";

const composerOrder: ComposerKey[] = [
  "lead",
  "customer",
  "project",
  "estimate",
  "contract",
  "job",
  "invoice",
  "change-order"
];

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[#9f9387]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12" />
      <path d="m11 5 5 5-5 5" />
    </svg>
  );
}

function filterItems(items: DashboardQueueItem[], query: string) {
  if (!query) {
    return items;
  }

  return items.filter((item) => item.searchText.toLowerCase().includes(query));
}

function UtilityChip({
  href,
  label,
  metric
}: {
  href: string;
  label: string;
  metric?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[4px] border border-[#d9cdc2] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e4424] transition hover:border-[#ef7d32] hover:bg-[#fff8f2]"
    >
      <span>{label}</span>
      {metric ? <span className="text-[#a65b25]">{metric}</span> : null}
    </Link>
  );
}

function BoardPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  dark = false
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={[
        "border",
        dark
          ? "border-[#d5c6b9] bg-[#f7f1ea] text-[#1f1813]"
          : "border-[#ddd1c6] bg-white text-[#1f1813]"
      ].join(" ")}
    >
      <div
        className={[
          "flex items-start justify-between gap-4 border-b px-4 py-3",
          dark ? "border-[#e4d7cd]" : "border-[#efe5dc]"
        ].join(" ")}
      >
        <div className="min-w-0">
          <p
            className={[
              "text-[10px] font-semibold uppercase tracking-[0.2em]",
              dark ? "text-[#a65b25]" : "text-[#a65b25]"
            ].join(" ")}
          >
            {eyebrow}
          </p>
          <h3 className="mt-1 text-[15px] font-semibold">{title}</h3>
          {description ? (
            <p
              className={[
                "mt-1 text-xs leading-5",
                dark ? "text-[#6d6157]" : "text-[#6d6157]"
              ].join(" ")}
            >
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PriorityGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <BoardPanel
      eyebrow="Priority board"
      title="Current pressure"
      description="Fast scan metrics for the queues that usually drive the next action."
      dark
    >
      <div className="grid gap-px bg-[#e4d7cd] md:grid-cols-2">
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="group bg-[#f7f1ea] px-4 py-4 transition hover:bg-[#fff8f2]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9f6740]">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1813]">
                  {metric.value}
                </p>
              </div>
              <span className="mt-1 text-[#d97e3e] transition group-hover:translate-x-0.5">
                <ArrowIcon />
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6d6157]">{metric.detail}</p>
          </Link>
        ))}
      </div>
    </BoardPanel>
  );
}

function QueueRows({
  widget,
  items,
  compact = true
}: {
  widget: DashboardWidget;
  items: DashboardQueueItem[];
  compact?: boolean;
}) {
  return (
    <BoardPanel
      eyebrow={widget.eyebrow}
      title={widget.title}
      description={widget.description}
      action={
        <Link
          href={widget.href}
          className="inline-flex shrink-0 items-center rounded-[4px] border border-[#dec9b7] bg-[#fff8f2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b4a26] transition hover:border-[#ef7d32] hover:text-[#b45417]"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      <div className="divide-y divide-[#efe5dc]">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className={compact ? "px-4 py-3" : "px-4 py-4"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[#1f1813] transition hover:text-[#b45417]"
                    >
                      {item.title}
                    </Link>
                    {item.badge ? (
                      <span className="rounded-full bg-[#fff1e7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9f531f]">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#514840]">{item.subtitle}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#8b7768]">
                    {item.meta}
                  </p>
                </div>
                {item.trailing ? (
                  <p className="shrink-0 text-sm font-semibold text-[#1f1813]">
                    {item.trailing}
                  </p>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={item.href}
                  className="inline-flex items-center rounded-[4px] border border-[#e0d4c9] bg-[#fbf7f3] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e4424] transition hover:border-[#ef7d32] hover:text-[#b45417]"
                >
                  {item.actionLabel}
                </Link>
                {item.contextHref && item.contextLabel ? (
                  <Link
                    href={item.contextHref}
                    className="inline-flex items-center rounded-[4px] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d7168] transition hover:text-[#1f1813]"
                  >
                    {item.contextLabel}
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="px-4 py-5">
            <p className="text-sm font-semibold text-[#1f1813]">{widget.emptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[#6d6157]">{widget.emptyDescription}</p>
          </div>
        )}
      </div>
    </BoardPanel>
  );
}

function FinanceTable({
  widget,
  items
}: {
  widget: DashboardWidget;
  items: DashboardQueueItem[];
}) {
  return (
    <BoardPanel
      eyebrow={widget.eyebrow}
      title={widget.title}
      description={widget.description}
      action={
        <Link
          href={widget.href}
          className="inline-flex shrink-0 items-center rounded-[4px] border border-[#dec9b7] bg-[#fff8f2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b4a26] transition hover:border-[#ef7d32] hover:text-[#b45417]"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      {items.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.95fr)_auto] gap-3 border-b border-[#efe5dc] bg-[#fbf7f3] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b7768]">
            <span>Record</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-[#efe5dc]">
            {items.map((item) => (
              <article key={item.id} className="px-4 py-3">
                <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.95fr)_auto] gap-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[#1f1813] transition hover:text-[#b45417]"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-[#5b5048]">{item.subtitle}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7768]">
                      {item.badge ?? item.meta}
                    </p>
                    <p className="mt-1 text-xs text-[#75695f]">{item.meta}</p>
                  </div>
                  <div className="text-right">
                    {item.trailing ? (
                      <p className="text-sm font-semibold text-[#1f1813]">{item.trailing}</p>
                    ) : null}
                    <div className="mt-1 flex justify-end gap-2">
                      <Link
                        href={item.href}
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b4a26] transition hover:text-[#b45417]"
                      >
                        {item.actionLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-5">
          <p className="text-sm font-semibold text-[#1f1813]">{widget.emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-[#6d6157]">{widget.emptyDescription}</p>
        </div>
      )}
    </BoardPanel>
  );
}

function ShortcutModule({ shortcuts }: { shortcuts: DashboardShortcut[] }) {
  return (
    <BoardPanel
      eyebrow="Utility"
      title="Module shortcuts"
      description="Jump into the most-used manager surfaces without leaving the board."
    >
      <div className="grid gap-px bg-[#efe5dc] sm:grid-cols-2">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.key}
            href={shortcut.href}
            className="group bg-white px-4 py-3 transition hover:bg-[#fff8f2]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1f1813]">{shortcut.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#6d6157]">
                  {shortcut.description}
                </p>
              </div>
              {shortcut.metric ? (
                <span className="shrink-0 rounded-full bg-[#fff1e7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9f531f]">
                  {shortcut.metric}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </BoardPanel>
  );
}

function PlaceholderZone({
  placeholders
}: {
  placeholders: DashboardPlaceholder[];
}) {
  return (
    <BoardPanel
      eyebrow="Still growing"
      title="Operational gaps still in view"
      description="Visible on purpose. These are honest next-layer capabilities that are only partially implemented today, so the home board can stay truthful about what still needs depth."
    >
      <div className="grid gap-px bg-[#eadfd4] lg:grid-cols-3">
        {placeholders.map((placeholder) => (
          <section key={placeholder.key} className="bg-[#fff8f2] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a65b25]">
                  Still Missing
                </p>
                <h4 className="mt-1 text-sm font-semibold text-[#1f1813]">
                  {placeholder.title}
                </h4>
              </div>
              <span className="rounded-full bg-[#17120f] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ffd7bb]">
                {placeholder.priority}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6d6157]">
              {placeholder.description}
            </p>
          </section>
        ))}
      </div>
    </BoardPanel>
  );
}

function QuickCreateStudio({
  quickCreate
}: {
  quickCreate: ContractorDashboardSurfaceProps["quickCreate"];
}) {
  const [selectedComposer, setSelectedComposer] = useState<ComposerKey>("lead");
  const composerOptions = [
    {
      key: "lead" as const,
      label: "Lead",
      description: "Opportunity intake",
      disabled: false
    },
    {
      key: "customer" as const,
      label: "Customer",
      description: "Create account",
      disabled: false
    },
    {
      key: "project" as const,
      label: "Project",
      description: "Open chain",
      disabled: false
    },
    {
      key: "estimate" as const,
      label: "Estimate",
      description: "Draft scope",
      disabled:
        quickCreate.opportunityOptions.length === 0 &&
        quickCreate.customerOptions.length === 0
    },
    {
      key: "contract" as const,
      label: "Contract",
      description: "Send-ready record",
      disabled: quickCreate.approvedEstimateOptions.length === 0
    },
    {
      key: "job" as const,
      label: "Job",
      description: "Execution record",
      disabled: quickCreate.projectOptions.length === 0
    },
    {
      key: "invoice" as const,
      label: "Invoice",
      description: "Billing record",
      disabled: quickCreate.projectOptions.length === 0
    },
    {
      key: "change-order" as const,
      label: "Change order",
      description: "Scope change",
      disabled: quickCreate.projectOptions.length === 0
    }
  ];

  const selectedOption =
    composerOptions.find((option) => option.key === selectedComposer) ?? composerOptions[0];

  return (
    <BoardPanel
      eyebrow="Workflow launcher"
      title="Quick create"
      description="Short-form contractor utility. Start the record here, then move into the full workspace."
      dark
    >
      <div className="grid gap-px bg-[#e2d5ca] sm:grid-cols-2">
        {composerOrder.map((key) => {
          const option = composerOptions.find((entry) => entry.key === key);

          if (!option) {
            return null;
          }

          const isActive = selectedComposer === option.key;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => !option.disabled && setSelectedComposer(option.key)}
              disabled={option.disabled}
              className={[
                "px-4 py-3 text-left transition",
                option.disabled
                  ? "cursor-not-allowed bg-[#f7f1ea] text-[#9d8f84]"
                  : isActive
                    ? "bg-[#fff4e8] text-[#1f1813]"
                    : "bg-[#f7f1ea] text-[#6d6157] hover:bg-[#fff8f2]"
              ].join(" ")}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="mt-1 text-[11px] leading-5">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#e4d7cd] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a65b25]">
          {selectedOption.label}
        </p>
        <div className="mt-3 rounded-[4px] border border-[#ddd1c6] bg-white p-4 text-slate-900 [&_button[type='submit']]:bg-[#ef7d32] [&_button[type='submit']]:text-[#1f140d] [&_button[type='submit']]:hover:bg-[#f08b47] [&_input:focus]:border-[#ef7d32] [&_select:focus]:border-[#ef7d32] [&_.text-brand-700]:text-[#a65b25]">
          {selectedComposer === "lead" ? (
            <OpportunityQuickCreateForm action={quickCreate.actions.lead} />
          ) : null}

          {selectedComposer === "customer" ? (
            <CustomerQuickCreateForm
              action={quickCreate.actions.customer}
              defaultRetainagePercentage={quickCreate.defaultRetainagePercentage}
            />
          ) : null}

          {selectedComposer === "project" ? (
            <ProjectQuickCreateForm
              action={quickCreate.actions.project}
              customers={quickCreate.customerOptions}
            />
          ) : null}

          {selectedComposer === "estimate" ? (
            quickCreate.opportunityOptions.length > 0 ||
            quickCreate.customerOptions.length > 0 ? (
              <EstimateQuickCreateForm
                action={quickCreate.actions.estimate}
                opportunities={quickCreate.opportunityOptions}
                customers={quickCreate.customerOptions.map((customer) => ({
                  id: customer.id,
                  name: customer.name,
                  companyName: customer.companyName ?? null
                }))}
                projects={quickCreate.projectOptions.map((project) => ({
                  id: project.id,
                  name: project.name,
                  customerId:
                    project.customerId ??
                    quickCreate.customerOptions.find(
                      (customer) => customer.name === project.customerName
                    )?.id ??
                    "",
                  status: project.status ?? "estimating"
                }))}
                estimatorLabel="Current estimator"
                estimateDateLabel={new Date().toISOString().slice(0, 10)}
              />
            ) : (
              <UnavailableQuickCreate message="Add an opportunity or customer before creating an estimate from the dashboard." />
            )
          ) : null}

          {selectedComposer === "contract" ? (
            quickCreate.approvedEstimateOptions.length > 0 ? (
              <ContractQuickCreateForm
                action={quickCreate.actions.contract}
                approvedEstimates={quickCreate.approvedEstimateOptions}
                preferredTemplateId={quickCreate.preferredContractTemplateId}
                requireInternalApproval={quickCreate.requireContractInternalApproval}
              />
            ) : (
              <UnavailableQuickCreate message="Approve at least one estimate before generating a contract from the dashboard." />
            )
          ) : null}

          {selectedComposer === "job" ? (
            quickCreate.projectOptions.length > 0 ? (
              <JobQuickCreateForm
                action={quickCreate.actions.job}
                projects={quickCreate.projectOptions}
              />
            ) : (
              <UnavailableQuickCreate message="Add a project before creating a job from the dashboard." />
            )
          ) : null}

          {selectedComposer === "invoice" ? (
            quickCreate.projectOptions.length > 0 ? (
              <InvoiceQuickCreateForm
                action={quickCreate.actions.invoice}
                projects={quickCreate.projectOptions}
              />
            ) : (
              <UnavailableQuickCreate message="Add a project before starting invoice creation from the dashboard." />
            )
          ) : null}

          {selectedComposer === "change-order" ? (
            quickCreate.projectOptions.length > 0 ? (
              <ChangeOrderQuickCreateForm
                action={quickCreate.actions.changeOrder}
                projects={quickCreate.projectOptions}
                contracts={quickCreate.contractOptions}
                invoices={quickCreate.invoiceOptions}
              />
            ) : (
              <UnavailableQuickCreate message="Add a project before creating a change order from the dashboard." />
            )
          ) : null}
        </div>
      </div>
    </BoardPanel>
  );
}

function UnavailableQuickCreate({ message }: { message: string }) {
  return (
    <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      {message}
    </div>
  );
}

export function ContractorDashboardSurface({
  header,
  metrics,
  attentionWidget,
  commercialWidgets,
  operationsWidgets,
  financeWidgets,
  shortcuts,
  placeholders,
  quickCreate
}: ContractorDashboardSurfaceProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredCommercialWidgets = useMemo(
    () =>
      commercialWidgets.map((widget) => ({
        ...widget,
        items: filterItems(widget.items, deferredQuery)
      })),
    [commercialWidgets, deferredQuery]
  );

  const filteredOperationsWidgets = useMemo(
    () =>
      operationsWidgets.map((widget) => ({
        ...widget,
        items: filterItems(widget.items, deferredQuery)
      })),
    [operationsWidgets, deferredQuery]
  );

  const filteredFinanceWidgets = useMemo(
    () =>
      financeWidgets.map((widget) => ({
        ...widget,
        items: filterItems(widget.items, deferredQuery)
      })),
    [financeWidgets, deferredQuery]
  );

  return (
    <div className="-mx-5 bg-[#f3eee8] sm:-mx-8">
      <section className="border-b border-[#d8ccc1] bg-[#f6f2ed] px-4 py-3 sm:px-6">
        <div className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0 border border-[#ddd1c6] bg-white px-4 py-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a65b25]">
                    Contractor dashboard
                  </p>
                  <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-[#1f1813]">
                    {header.organizationName}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#6b6058]">
                    Active queues, scheduling pressure, collections pressure, and quick
                    record creation in one board.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="border border-[#eee2d7] bg-[#fbf7f3] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f5b32]">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1f1813]">
                      {header.roleLabel}
                    </p>
                  </div>
                  <div className="border border-[#eee2d7] bg-[#fbf7f3] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f5b32]">
                      Active projects
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1f1813]">
                      {header.activeProjectCount}
                    </p>
                  </div>
                  <div className="border border-[#eee2d7] bg-[#fbf7f3] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f5b32]">
                      Open receivables
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1f1813]">
                      {header.openReceivablesLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <label className="relative min-w-0">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  startTransition(() => {
                    setQuery(nextValue);
                  });
                }}
                placeholder="Search dashboard queues by project, customer, record, status, or priority"
                className="h-11 w-full border border-[#d9cdc2] bg-white pl-12 pr-4 text-[15px] text-[#1f1813] outline-none placeholder:text-[#8e8178] focus:border-[#ef7d32]"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <UniversalCreateMenu
              buttonLabel="Universal create"
              buttonClassName="inline-flex h-11 items-center rounded-[4px] border border-[#ef7d32] bg-[#ef7d32] px-4 text-[13px] font-semibold text-[#1f140d] transition hover:bg-[#f08b47]"
              panelClassName="border-[#dccfc2]"
            />
            <UtilityChip
              href="/projects"
              label="Projects"
              metric={String(header.activeProjectCount)}
            />
            <UtilityChip href="/schedule" label="Schedule" />
            <UtilityChip href="/payments" label="Payments" />
            <UtilityChip href="/time" label="Time cards" />
          </div>
        </div>
      </section>

      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1.1fr)_minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <QuickCreateStudio quickCreate={quickCreate} />
            <ShortcutModule shortcuts={shortcuts} />
          </div>

          <div className="space-y-4">
            <PriorityGrid metrics={metrics} />
            {attentionWidget ? (
              <QueueRows widget={attentionWidget} items={attentionWidget.items} compact={false} />
            ) : null}
            {filteredCommercialWidgets[0] ? (
              <QueueRows
                widget={filteredCommercialWidgets[0]}
                items={filteredCommercialWidgets[0].items}
              />
            ) : null}
            {filteredOperationsWidgets[0] ? (
              <QueueRows
                widget={filteredOperationsWidgets[0]}
                items={filteredOperationsWidgets[0].items}
              />
            ) : null}
          </div>

          <div className="space-y-4">
            {filteredCommercialWidgets[1] ? (
              <QueueRows
                widget={filteredCommercialWidgets[1]}
                items={filteredCommercialWidgets[1].items}
              />
            ) : null}
            {filteredCommercialWidgets[2] ? (
              <QueueRows
                widget={filteredCommercialWidgets[2]}
                items={filteredCommercialWidgets[2].items}
              />
            ) : null}
            {filteredOperationsWidgets[1] ? (
              <QueueRows
                widget={filteredOperationsWidgets[1]}
                items={filteredOperationsWidgets[1].items}
              />
            ) : null}
          </div>

          <div className="space-y-4">
            {filteredOperationsWidgets[2] ? (
              <QueueRows
                widget={filteredOperationsWidgets[2]}
                items={filteredOperationsWidgets[2].items}
              />
            ) : null}
            {filteredFinanceWidgets[0] ? (
              <FinanceTable
                widget={filteredFinanceWidgets[0]}
                items={filteredFinanceWidgets[0].items}
              />
            ) : null}
            {filteredFinanceWidgets[1] ? (
              <FinanceTable
                widget={filteredFinanceWidgets[1]}
                items={filteredFinanceWidgets[1].items}
              />
            ) : null}
          </div>
        </div>

        <PlaceholderZone placeholders={placeholders} />
      </div>
    </div>
  );
}

