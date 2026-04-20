"use client";

import { useState } from "react";
import type { InvoiceWorkflowRole } from "@floorconnector/types";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type InvoiceQuickCreateProjectOption = {
  id: string;
  name: string;
  customerName?: string | null;
};

type InvoiceQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: InvoiceQuickCreateProjectOption[];
  initialProjectId?: string | null;
  initialEstimateId?: string | null;
  initialJobId?: string | null;
  initialWorkflowRole?: InvoiceWorkflowRole | null;
};

function formatWorkflowRoleLabel(role: InvoiceWorkflowRole) {
  return role === "deposit" ? "Deposit request" : "Standard invoice";
}

export function InvoiceQuickCreateForm({
  action,
  projects,
  initialProjectId,
  initialEstimateId,
  initialJobId,
  initialWorkflowRole
}: InvoiceQuickCreateFormProps) {
  const [workflowRole, setWorkflowRole] = useState<InvoiceWorkflowRole>(
    initialWorkflowRole ?? "standard"
  );

  return (
    <form action={action} className="space-y-5">
      {initialEstimateId ? <input type="hidden" name="estimateId" value={initialEstimateId} /> : null}
      {initialJobId && workflowRole !== "deposit" ? (
        <input type="hidden" name="jobId" value={initialJobId} />
      ) : null}
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create invoice"
        description="Collect just the minimum billing context here, create the canonical invoice, and then finish the rest inside the full invoice workspace."
        footer={
          workflowRole === "deposit"
            ? "Deposit invoices create the canonical billing record first, then you finish details and payment readiness inside the invoice workspace."
            : "Standard invoices create the canonical billing record first, then you finish line items and review details inside the invoice workspace."
        }
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
            <select
              name="projectId"
              defaultValue={initialProjectId ?? ""}
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
              required
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.customerName ? ` - ${project.customerName}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Workflow role
            </span>
            <select
              name="workflowRole"
              value={workflowRole}
              onChange={(event) =>
                setWorkflowRole(event.target.value as InvoiceWorkflowRole)
              }
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
              required
            >
              {(["standard", "deposit"] as const).map((role) => (
                <option key={role} value={role}>
                  {formatWorkflowRoleLabel(role)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating invoice..." className="w-full">
          <span>Create invoice</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
