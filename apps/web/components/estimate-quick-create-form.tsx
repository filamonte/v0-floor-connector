"use client";

import { useState } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type EstimateQuickCreateOpportunityOption = {
  id: string;
  title: string;
  contactName: string;
  customerId?: string | null;
  customerName?: string | null;
  siteName?: string | null;
  status: string;
};

type EstimateQuickCreateCustomerOption = {
  id: string;
  name: string;
  companyName?: string | null;
};

type EstimateQuickCreateProjectOption = {
  id: string;
  customerId: string;
  name: string;
  status: string;
};

type EstimateQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  opportunities: EstimateQuickCreateOpportunityOption[];
  customers: EstimateQuickCreateCustomerOption[];
  projects: EstimateQuickCreateProjectOption[];
  estimatorLabel: string;
  estimateDateLabel: string;
  initialCreationMode?: "opportunity" | "customer" | "standalone" | null;
  initialOpportunityId?: string | null;
  initialCustomerId?: string | null;
  initialProjectId?: string | null;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function ModeButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[4px] border px-3 py-2 text-sm font-medium transition",
        active
          ? "border-[#233a64] bg-[#233a64] text-white"
          : "border-[#d9dee8] bg-white text-slate-700 hover:bg-slate-50"
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SelectionCard({
  active,
  title,
  subtitle,
  meta,
  onClick
}: {
  active: boolean;
  title: string;
  subtitle: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-[4px] border px-3 py-3 text-left transition",
        active
          ? "border-[#233a64] bg-white"
          : "border-transparent bg-white/70 hover:border-[#d9dee8] hover:bg-white"
      ].join(" ")}
    >
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{meta}</p>
    </button>
  );
}

function SearchPanel({
  label,
  placeholder,
  value,
  onChange,
  children,
  empty
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (nextValue: string) => void;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">{label}</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
        />
      </label>

      <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-[4px] border border-[#dde3eb] bg-[#fbfcfe] p-2">
        {empty ? (
          <div className="rounded-[4px] bg-white px-3 py-4 text-sm leading-6 text-slate-500">
            No matching records found.
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function EstimateQuickCreateForm({
  action,
  opportunities,
  customers,
  projects,
  estimatorLabel,
  estimateDateLabel,
  initialCreationMode,
  initialOpportunityId,
  initialCustomerId,
  initialProjectId
}: EstimateQuickCreateFormProps) {
  const [creationMode, setCreationMode] = useState<
    "opportunity" | "customer" | "standalone"
  >(initialCreationMode ?? "customer");
  const [opportunityQuery, setOpportunityQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [title, setTitle] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(
    initialOpportunityId ?? ""
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomerId ?? ""
  );
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "");

  const selectedOpportunity =
    opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? null;
  const derivedCustomerId =
    selectedOpportunity?.customerId && selectedOpportunity.customerId.length > 0
      ? selectedOpportunity.customerId
      : null;
  const activeCustomerId = derivedCustomerId ?? selectedCustomerId;
  const activeCustomer =
    customers.find((customer) => customer.id === activeCustomerId) ?? null;

  const visibleOpportunities = opportunities
    .filter((opportunity) => {
      if (
        creationMode !== "opportunity" &&
        activeCustomerId &&
        opportunity.customerId !== activeCustomerId
      ) {
        return false;
      }

      if (opportunityQuery.trim().length === 0) {
        return true;
      }

      const haystack = [
        opportunity.title,
        opportunity.contactName,
        opportunity.customerName ?? "",
        opportunity.siteName ?? "",
        opportunity.status
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(opportunityQuery.trim().toLowerCase());
    })
    .slice(0, 8);

  const visibleCustomers = customers
    .filter((customer) => {
      if (customerQuery.trim().length === 0) {
        return true;
      }

      const haystack = [customer.name, customer.companyName ?? ""]
        .join(" ")
        .toLowerCase();

      return haystack.includes(customerQuery.trim().toLowerCase());
    })
    .slice(0, 8);

  const visibleProjects = projects
    .filter((project) => {
      if (!activeCustomerId || project.customerId !== activeCustomerId) {
        return false;
      }

      if (projectQuery.trim().length === 0) {
        return true;
      }

      return [project.name, project.status]
        .join(" ")
        .toLowerCase()
        .includes(projectQuery.trim().toLowerCase());
    })
    .slice(0, 8);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="creationMode" value={creationMode} />
      <input type="hidden" name="opportunityId" value={selectedOpportunityId} />
      <input type="hidden" name="customerId" value={activeCustomerId ?? ""} />
      <input type="hidden" name="projectId" value={selectedProjectId} />

      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create estimate"
        description="Start from opportunity continuity, customer continuity, or a standalone commercial intake. FloorConnector will always create or reuse the canonical opportunity behind the scenes before opening the estimate workspace."
        footer="Estimate build is the primary destination. Review, send, and customer-facing proposal flow come after the commercial scope is ready."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <ModeButton
              active={creationMode === "opportunity"}
              label="Opportunity"
              onClick={() => {
                setCreationMode("opportunity");
                setSelectedCustomerId("");
                setSelectedProjectId("");
              }}
            />
            <ModeButton
              active={creationMode === "customer"}
              label="Customer"
              onClick={() => {
                setCreationMode("customer");
                setSelectedOpportunityId("");
              }}
            />
            <ModeButton
              active={creationMode === "standalone"}
              label="Standalone"
              onClick={() => {
                setCreationMode("standalone");
                setSelectedOpportunityId("");
              }}
            />
          </div>

          {creationMode === "opportunity" ? (
            <SearchPanel
              label="Opportunity"
              placeholder="Search lead, customer, site, or status"
              value={opportunityQuery}
              onChange={setOpportunityQuery}
              empty={visibleOpportunities.length === 0}
            >
              {visibleOpportunities.map((opportunity) => (
                <SelectionCard
                  key={opportunity.id}
                  active={selectedOpportunityId === opportunity.id}
                  title={opportunity.title}
                  subtitle={[
                    opportunity.contactName,
                    opportunity.customerName ?? "Customer pending"
                  ].join(" - ")}
                  meta={[
                    opportunity.siteName ?? "Site pending",
                    formatStatusLabel(opportunity.status)
                  ].join(" - ")}
                  onClick={() => {
                    setSelectedOpportunityId(opportunity.id);
                    setSelectedCustomerId(opportunity.customerId ?? "");
                    setSelectedProjectId("");
                  }}
                />
              ))}
            </SearchPanel>
          ) : (
            <>
              <SearchPanel
                label="Customer"
                placeholder="Search customer or company"
                value={customerQuery}
                onChange={setCustomerQuery}
                empty={visibleCustomers.length === 0}
              >
                {visibleCustomers.map((customer) => (
                  <SelectionCard
                    key={customer.id}
                    active={activeCustomerId === customer.id}
                    title={customer.name}
                    subtitle={customer.companyName ?? "Customer account"}
                    meta="Customer"
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setSelectedOpportunityId("");
                      setSelectedProjectId("");
                    }}
                  />
                ))}
              </SearchPanel>

              {activeCustomerId ? (
                <SearchPanel
                  label="Opportunity (optional)"
                  placeholder="Reuse an existing opportunity when continuity already exists"
                  value={opportunityQuery}
                  onChange={setOpportunityQuery}
                  empty={visibleOpportunities.length === 0}
                >
                  {visibleOpportunities.map((opportunity) => (
                    <SelectionCard
                      key={opportunity.id}
                      active={selectedOpportunityId === opportunity.id}
                      title={opportunity.title}
                      subtitle={opportunity.contactName}
                      meta={[
                        opportunity.siteName ?? "Site pending",
                        formatStatusLabel(opportunity.status)
                      ].join(" - ")}
                      onClick={() => setSelectedOpportunityId(opportunity.id)}
                    />
                  ))}
                </SearchPanel>
              ) : null}

              {activeCustomerId && visibleProjects.length > 0 ? (
                <SearchPanel
                  label="Site / job (optional)"
                  placeholder="Search customer sites and jobs"
                  value={projectQuery}
                  onChange={setProjectQuery}
                  empty={visibleProjects.length === 0}
                >
                  {visibleProjects.map((project) => (
                    <SelectionCard
                      key={project.id}
                      active={selectedProjectId === project.id}
                      title={project.name}
                      subtitle="Project"
                      meta={project.status.replaceAll("_", " ")}
                      onClick={() => setSelectedProjectId(project.id)}
                    />
                  ))}
                </SearchPanel>
              ) : null}
            </>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <AuthField
              label="Title"
              name="title"
              placeholder="Garage floor recoating proposal"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2 md:col-span-1">
              <div className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Estimate date
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{estimateDateLabel}</p>
              </div>
              <div className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Estimator / sales person
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{estimatorLabel}</p>
              </div>
            </div>
          </div>

          {selectedOpportunity ? (
            <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              This estimate will stay attached to <strong>{selectedOpportunity.title}</strong>.
            </div>
          ) : activeCustomer ? (
            <div className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-slate-700">
              FloorConnector will silently create or reuse the canonical opportunity continuity for{" "}
              <strong>{activeCustomer.name}</strong> before opening the estimate workspace.
            </div>
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Select the opportunity or customer that should anchor this estimate before creation.
            </div>
          )}
        </div>
      </QuickCreateFormShell>

      <AuthSubmitButton pendingLabel="Creating estimate..." className="w-full">
        <span>Create estimate</span>
      </AuthSubmitButton>
    </form>
  );
}
