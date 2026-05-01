"use client";

import type { ReactNode } from "react";
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
  email?: string | null;
  phone?: string | null;
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
  estimateNumberLabel?: string;
  errorMessage?: string | null;
  initialCreationMode?: "opportunity" | "customer" | "standalone" | null;
  initialOpportunityId?: string | null;
  initialCustomerId?: string | null;
  initialProjectId?: string | null;
  initialProjectName?: string | null;
  initialTitle?: string | null;
  errorField?: string | null;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function ChoiceButton({
  active,
  label,
  description,
  onClick
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[4px] border px-3 py-2 text-left transition",
        active
          ? "border-[#233a64] bg-[#233a64] text-white"
          : "border-[#d9dee8] bg-white text-slate-700 hover:bg-slate-50"
      ].join(" ")}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span
        className={[
          "mt-1 block text-xs leading-5",
          active ? "text-white/75" : "text-slate-500"
        ].join(" ")}
      >
        {description}
      </span>
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
  children: ReactNode;
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

function CustomerCombobox({
  customers,
  selectedCustomerId,
  query,
  error,
  onQueryChange,
  onSelect
}: {
  customers: EstimateQuickCreateCustomerOption[];
  selectedCustomerId: string | null;
  query: string;
  error: boolean;
  onQueryChange: (nextValue: string) => void;
  onSelect: (customerId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  const visibleCustomers = customers
    .filter((customer) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return [
        customer.name,
        customer.companyName ?? "",
        customer.email ?? "",
        customer.phone ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, 8);

  return (
    <div className="relative">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        Customer / account
      </span>
      <input
        type="search"
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setIsOpen(true);
        }}
        placeholder="Search name, email, or phone"
        aria-invalid={error}
        className={[
          "w-full rounded-[4px] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]",
          error ? "border-rose-300 ring-4 ring-rose-50" : "border-[#d9dee8]"
        ].join(" ")}
      />
      {selectedCustomer ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Selected: {selectedCustomer.name}
          {selectedCustomer.email ? ` / ${selectedCustomer.email}` : ""}
          {selectedCustomer.phone ? ` / ${selectedCustomer.phone}` : ""}
        </p>
      ) : null}
      {isOpen ? (
        <div className="absolute z-20 mt-2 max-h-[240px] w-full overflow-y-auto rounded-[4px] border border-[#dde3eb] bg-white p-1 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]">
          {visibleCustomers.length === 0 ? (
            <div className="px-3 py-4 text-sm leading-6 text-slate-500">
              No matching customer accounts found.
            </div>
          ) : (
            visibleCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(customer.id);
                  onQueryChange(customer.name);
                  setIsOpen(false);
                }}
                className={[
                  "w-full rounded-[4px] px-3 py-2.5 text-left text-sm transition",
                  selectedCustomerId === customer.id
                    ? "bg-[#233a64] text-white"
                    : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                <span className="block font-semibold">{customer.name}</span>
                <span
                  className={[
                    "mt-1 block text-xs leading-5",
                    selectedCustomerId === customer.id ? "text-white/75" : "text-slate-500"
                  ].join(" ")}
                >
                  {[customer.companyName, customer.email, customer.phone]
                    .filter(Boolean)
                    .join(" / ") || "Customer account"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
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
  estimateNumberLabel = "Assigned on create",
  errorMessage,
  errorField,
  initialOpportunityId,
  initialCustomerId,
  initialProjectId,
  initialProjectName,
  initialTitle
}: EstimateQuickCreateFormProps) {
  const initialProject =
    projects.find((project) => project.id === (initialProjectId ?? "")) ?? null;
  const initialCustomer =
    customers.find(
      (customer) => customer.id === (initialProject?.customerId ?? initialCustomerId ?? "")
    ) ?? null;
  const isProjectContextLocked = Boolean(initialProject);
  const [opportunityQuery, setOpportunityQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState(initialCustomer?.name ?? "");
  const [projectQuery, setProjectQuery] = useState("");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [projectChoice, setProjectChoice] = useState<"existing" | "new">(
    initialProjectId ? "existing" : "new"
  );
  const [projectName, setProjectName] = useState(initialProjectName ?? "");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(
    initialOpportunityId ?? ""
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialProject?.customerId ?? initialCustomerId ?? ""
  );
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "");

  const selectedOpportunity =
    opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? null;
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;
  const derivedCustomerId =
    selectedOpportunity?.customerId && selectedOpportunity.customerId.length > 0
      ? selectedOpportunity.customerId
      : null;
  const projectCustomerId =
    selectedProject?.customerId && selectedProject.customerId.length > 0
      ? selectedProject.customerId
      : null;
  const activeCustomerId =
    projectCustomerId || selectedCustomerId || derivedCustomerId || null;
  const selectedCustomer =
    customers.find((customer) => customer.id === activeCustomerId) ?? null;
  const visibleOpportunities = opportunities
    .filter((opportunity) => {
      if (
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

  const hasExistingProjects = visibleProjects.length > 0;
  const isCustomerError = errorField === "customerId";
  const isProjectError = errorField === "projectId" || errorField === "projectName";
  const isTitleError = errorField === "title";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="creationMode" value="customer" />
      <input type="hidden" name="opportunityId" value={selectedOpportunityId} />
      <input type="hidden" name="customerId" value={activeCustomerId ?? ""} />
      <input
        type="hidden"
        name="projectId"
        value={projectChoice === "existing" ? selectedProjectId : ""}
      />
      <input
        type="hidden"
        name="projectName"
        value={projectChoice === "new" ? projectName : ""}
      />

      <QuickCreateFormShell
        eyebrow="Add estimate"
        title="Create estimate"
        description="Confirm the customer and project, then open the estimate workspace."
        footer="Next step: generate the estimate from a system."
      >
        <div className="space-y-4">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
            >
              <p className="font-semibold">Estimate was not created</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          ) : null}

          {isProjectContextLocked ? (
            <div className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Project context
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {initialProject?.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {selectedCustomer?.name ?? "Customer account"} is already linked to this project.
              </p>
            </div>
          ) : (
            <CustomerCombobox
              customers={customers}
              selectedCustomerId={activeCustomerId}
              query={customerQuery}
              error={isCustomerError}
              onQueryChange={setCustomerQuery}
              onSelect={(customerId) => {
                setSelectedCustomerId(customerId);
                setSelectedOpportunityId("");
                setSelectedProjectId("");
                setProjectChoice("new");
              }}
            />
          )}

          {activeCustomerId ? (
            <div className="space-y-3">
              {isProjectContextLocked ? null : (
                <div>
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Project / site
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ChoiceButton
                    active={projectChoice === "existing"}
                    label="Use existing project"
                    description="Attach this estimate to one of this customer's project records."
                    onClick={() => setProjectChoice("existing")}
                  />
                  <ChoiceButton
                    active={projectChoice === "new"}
                    label="Create new project"
                    description="Create the customer project before opening the estimate workspace."
                    onClick={() => {
                      setProjectChoice("new");
                      setSelectedProjectId("");
                    }}
                  />
                </div>
              </div>
              )}

              {isProjectContextLocked ? (
                <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                  This estimate will be created on the current project. You do not need to re-select the customer or project.
                </div>
              ) : projectChoice === "existing" ? (
                <SearchPanel
                  label="Existing customer project"
                  placeholder="Search customer projects"
                  value={projectQuery}
                  onChange={setProjectQuery}
                  empty={!hasExistingProjects}
                >
                  {isProjectError ? (
                    <div className="mb-2 rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800">
                      Select one of this customer's projects, or switch to create a new project.
                    </div>
                  ) : null}
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
              ) : (
                <AuthField
                  label="New project name"
                  name="projectNameDisplay"
                  placeholder="Garage floor recoating"
                  value={projectName}
                  aria-invalid={isProjectError}
                  className={isProjectError ? "border-rose-300 ring-4 ring-rose-50" : undefined}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              )}
            </div>
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Select the customer account before choosing or creating the project.
            </div>
          )}

          {activeCustomerId ? (
            <details className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Linked opportunity (optional)
              </summary>
              <div className="mt-3">
                <SearchPanel
                  label="Opportunity"
                  placeholder="Search lead or opportunity"
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
                        if (!opportunity.customerId || opportunity.customerId !== activeCustomerId) {
                          setSelectedProjectId("");
                          setProjectChoice("new");
                        }
                      }}
                    />
                  ))}
                </SearchPanel>
              </div>
            </details>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <AuthField
              label="Title"
              name="title"
              placeholder="Garage floor recoating proposal"
              required
              value={title}
              aria-invalid={isTitleError}
              className={isTitleError ? "border-rose-300 ring-4 ring-rose-50" : undefined}
              onChange={(event) => setTitle(event.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2 md:col-span-1">
              <div className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  EST. #
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {estimateNumberLabel}
                </p>
              </div>
              <div className="rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Estimate date
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">{estimateDateLabel}</p>
              </div>
            </div>
            <div className="md:col-span-2 rounded-[4px] border border-[#d9dee8] bg-[#f8fafc] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Estimator / sales person
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">{estimatorLabel}</p>
            </div>
          </div>

          {selectedOpportunity ? (
            <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              This estimate will stay attached to <strong>{selectedOpportunity.title}</strong>.
            </div>
          ) : null}
        </div>
      </QuickCreateFormShell>

      <AuthSubmitButton pendingLabel="Creating estimate..." className="w-full">
        <span>Create Estimate</span>
      </AuthSubmitButton>
    </form>
  );
}
