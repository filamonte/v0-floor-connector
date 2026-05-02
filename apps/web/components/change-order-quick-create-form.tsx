"use client";

import { useMemo, useState } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ProjectOption = {
  id: string;
  name: string;
  customerName?: string | null;
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

type ChangeOrderQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  contracts: ContractOption[];
  invoices: InvoiceOption[];
  defaultProjectId?: string | null;
  defaultContractId?: string | null;
  defaultInvoiceId?: string | null;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ChangeOrderQuickCreateForm({
  action,
  projects,
  contracts,
  invoices,
  defaultProjectId,
  defaultContractId,
  defaultInvoiceId
}: ChangeOrderQuickCreateFormProps) {
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");

  const visibleContracts = useMemo(
    () => (projectId ? contracts.filter((contract) => contract.projectId === projectId) : contracts),
    [contracts, projectId]
  );
  const visibleInvoices = useMemo(
    () => (projectId ? invoices.filter((invoice) => invoice.projectId === projectId) : invoices),
    [invoices, projectId]
  );

  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create change order"
        description="Capture the minimum scope adjustment here, create the canonical change order, and then finish the commercial review in the full workspace."
        footer="Approved change orders stay tied to the same project chain. If you link a positive adjustment to an invoice, FloorConnector will add the invoice line automatically after customer approval."
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
            <select
              name="projectId"
              required
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.customerName ? ` - ${project.customerName}` : ""}
                </option>
              ))}
            </select>
          </label>

          <AuthField
            label="Change order title"
            name="title"
            placeholder="Example: Add prep and moisture mitigation"
            required
          />

          <AuthField
            label="Price adjustment"
            name="priceAdjustment"
            type="number"
            step="0.01"
            defaultValue="0.00"
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Related contract
            </span>
            <select
              name="contractId"
              defaultValue={defaultContractId ?? ""}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            >
              <option value="">No linked contract</option>
              {visibleContracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.title} | {formatStatusLabel(contract.status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Related invoice
            </span>
            <select
              name="invoiceId"
              defaultValue={defaultInvoiceId ?? ""}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            >
              <option value="">No linked invoice</option>
              {visibleInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.referenceNumber} | {formatStatusLabel(invoice.status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating change order..." className="w-full">
          <span>Create change order</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
