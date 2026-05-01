"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { InvoiceWorkflowRole } from "@floorconnector/types";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type InvoiceQuickCreateProjectOption = {
  id: string;
  name: string;
  customerName?: string | null;
};

type InvoiceQuickCreateEstimateOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  totalAmount: string;
};

type InvoiceQuickCreateJobOption = {
  id: string;
  projectId: string;
  estimateReferenceNumber?: string | null;
  scheduledDate?: string | null;
};

type InvoiceQuickCreateChangeOrderOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  title: string;
};

type InvoiceQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: InvoiceQuickCreateProjectOption[];
  approvedEstimates: InvoiceQuickCreateEstimateOption[];
  completedJobs: InvoiceQuickCreateJobOption[];
  approvedChangeOrders: InvoiceQuickCreateChangeOrderOption[];
  initialProjectId?: string | null;
  initialEstimateId?: string | null;
  initialJobId?: string | null;
  initialChangeOrderId?: string | null;
  initialWorkflowRole?: InvoiceWorkflowRole | null;
  errorMessage?: string | null;
};

type InvoiceSourceType = "" | "deposit" | "job" | "estimate" | "changeOrder";
type InvoiceErrorTarget = "project" | "source" | "job" | "estimate" | "changeOrder" | null;

const baseSelectClassName =
  "w-full rounded-[4px] border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition";

function getSelectClassName(isInvalid: boolean) {
  return isInvalid
    ? `${baseSelectClassName} border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-100`
    : `${baseSelectClassName} border-[#d9dee8] focus:border-[#91a5c6]`;
}

function resolveInitialSourceType(input: {
  initialWorkflowRole?: InvoiceWorkflowRole | null;
  initialEstimateId?: string | null;
  initialJobId?: string | null;
  initialChangeOrderId?: string | null;
}): InvoiceSourceType {
  if (input.initialWorkflowRole === "deposit") {
    return "deposit";
  }

  if (input.initialJobId) {
    return "job";
  }

  if (input.initialChangeOrderId) {
    return "changeOrder";
  }

  if (input.initialEstimateId) {
    return "estimate";
  }

  return "";
}

function resolveErrorTarget(input: {
  errorMessage?: string | null;
  selectedProjectId: string;
  sourceType: InvoiceSourceType;
}) {
  if (!input.errorMessage) {
    return null;
  }

  const error = input.errorMessage.toLowerCase();

  if (!input.selectedProjectId || error.includes("valid project")) {
    return "project";
  }

  if (
    !input.sourceType ||
    error.includes("billing source") ||
    error.includes("freeform") ||
    error.includes("disconnected")
  ) {
    return "source";
  }

  if (error.includes("completed job") || error.includes("completed work")) {
    return input.sourceType === "job" ? "job" : "source";
  }

  if (
    error.includes("approved estimate") ||
    error.includes("approved scope") ||
    error.includes("billable scope")
  ) {
    return input.sourceType === "estimate" ? "estimate" : "source";
  }

  if (error.includes("change order")) {
    return input.sourceType === "changeOrder" ? "changeOrder" : "source";
  }

  if (
    error.includes("deposit") ||
    error.includes("signed contract") ||
    error.includes("contract") ||
    error.includes("readiness")
  ) {
    return "source";
  }

  return "source";
}

export function InvoiceQuickCreateForm({
  action,
  projects,
  approvedEstimates,
  completedJobs,
  approvedChangeOrders,
  initialProjectId,
  initialEstimateId,
  initialJobId,
  initialChangeOrderId,
  initialWorkflowRole,
  errorMessage
}: InvoiceQuickCreateFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "");
  const [selectedEstimateId, setSelectedEstimateId] = useState(initialEstimateId ?? "");
  const [selectedJobId, setSelectedJobId] = useState(initialJobId ?? "");
  const [selectedChangeOrderId, setSelectedChangeOrderId] = useState(
    initialChangeOrderId ?? ""
  );
  const [sourceType, setSourceType] = useState<InvoiceSourceType>(
    resolveInitialSourceType({
      initialWorkflowRole,
      initialEstimateId,
      initialJobId,
      initialChangeOrderId
    })
  );
  const projectSelectRef = useRef<HTMLSelectElement | null>(null);
  const sourceSelectRef = useRef<HTMLSelectElement | null>(null);
  const jobSelectRef = useRef<HTMLSelectElement | null>(null);
  const estimateSelectRef = useRef<HTMLSelectElement | null>(null);
  const changeOrderSelectRef = useRef<HTMLSelectElement | null>(null);
  const workflowRole: InvoiceWorkflowRole =
    sourceType === "deposit" ? "deposit" : "standard";
  const filteredEstimates = approvedEstimates.filter(
    (estimate) => estimate.projectId === selectedProjectId
  );
  const filteredJobs = completedJobs.filter((job) => job.projectId === selectedProjectId);
  const filteredChangeOrders = approvedChangeOrders.filter(
    (changeOrder) => changeOrder.projectId === selectedProjectId
  );
  const errorTarget = useMemo(
    () =>
      resolveErrorTarget({
        errorMessage,
        selectedProjectId,
        sourceType
      }),
    [errorMessage, selectedProjectId, sourceType]
  );
  const contextualHint = useMemo(() => {
    if (!selectedProjectId) {
      return "Select a project to create an invoice.";
    }

    if (!sourceType) {
      return "Select a job, approved estimate scope, or change order.";
    }

    if (sourceType === "deposit") {
      return "Deposit invoices require a signed contract.";
    }

    if (sourceType === "job") {
      if (filteredJobs.length === 0) {
        return "Complete a job or choose Deposit to create an invoice.";
      }

      return selectedJobId ? "" : "Select a completed job to invoice.";
    }

    if (sourceType === "estimate") {
      if (filteredEstimates.length === 0) {
        return "Approved estimate scope is required before this invoice source can be used.";
      }

      return selectedEstimateId ? "" : "Select approved estimate scope to continue.";
    }

    if (filteredChangeOrders.length === 0) {
      return "Approve a change order with billable scope before selecting this source.";
    }

    return selectedChangeOrderId ? "" : "Select an approved change order to invoice.";
  }, [
    filteredChangeOrders.length,
    filteredEstimates.length,
    filteredJobs.length,
    selectedChangeOrderId,
    selectedEstimateId,
    selectedJobId,
    selectedProjectId,
    sourceType
  ]);

  useEffect(() => {
    if (!errorTarget) {
      return;
    }

    const targetByField: Record<Exclude<InvoiceErrorTarget, null>, HTMLSelectElement | null> = {
      project: projectSelectRef.current,
      source: sourceSelectRef.current,
      job: jobSelectRef.current,
      estimate: estimateSelectRef.current,
      changeOrder: changeOrderSelectRef.current
    };

    targetByField[errorTarget]?.focus({ preventScroll: false });
  }, [errorTarget]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="workflowRole" value={workflowRole} />
      {errorMessage ? (
        <div className="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
          {errorMessage}
        </div>
      ) : null}
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create invoice"
        description="Select the project and billing trigger, create the canonical invoice, and then finish the rest inside the full invoice workspace."
        footer={
          workflowRole === "deposit"
            ? "Deposit invoices create the canonical billing record first, then you finish details and payment readiness inside the invoice workspace."
            : "Standard invoices require completed work, approved scope lineage, or an approved change order before the invoice workspace opens."
        }
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
            <select
              ref={projectSelectRef}
              name="projectId"
              value={selectedProjectId}
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setSourceType((current) => (current === "deposit" ? current : ""));
                setSelectedEstimateId("");
                setSelectedJobId("");
                setSelectedChangeOrderId("");
              }}
              className={getSelectClassName(errorTarget === "project")}
              aria-invalid={errorTarget === "project"}
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
              Billing trigger
            </span>
            <select
              ref={sourceSelectRef}
              value={sourceType}
              onChange={(event) => {
                setSourceType(event.target.value as InvoiceSourceType);
                setSelectedEstimateId("");
                setSelectedJobId("");
                setSelectedChangeOrderId("");
              }}
              className={getSelectClassName(errorTarget === "source")}
              aria-invalid={errorTarget === "source"}
              required
            >
              <option value="" disabled>
                Select a billing trigger
              </option>
              <option value="deposit">Deposit request</option>
              <option value="job">Completed job</option>
              <option value="estimate">Approved estimate scope</option>
              <option value="changeOrder">Approved change order</option>
            </select>
          </label>

          {sourceType === "job" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Completed job
              </span>
              <select
                ref={jobSelectRef}
                name="jobId"
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                className={getSelectClassName(errorTarget === "job")}
                aria-invalid={errorTarget === "job"}
                required
              >
                <option value="" disabled>
                  Select a completed job
                </option>
                {filteredJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.estimateReferenceNumber
                      ? `Job from ${job.estimateReferenceNumber}`
                      : `Job ${job.id.slice(0, 8)}`}
                    {job.scheduledDate ? ` - ${job.scheduledDate}` : ""}
                  </option>
                ))}
              </select>
              {selectedProjectId && filteredJobs.length === 0 ? (
                <span className="mt-2 block text-xs leading-5 text-amber-700">
                  This project has no completed jobs available for invoicing yet.
                </span>
              ) : null}
            </label>
          ) : null}

          {sourceType === "estimate" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Approved estimate
              </span>
              <select
                ref={estimateSelectRef}
                name="estimateId"
                value={selectedEstimateId}
                onChange={(event) => setSelectedEstimateId(event.target.value)}
                className={getSelectClassName(errorTarget === "estimate")}
                aria-invalid={errorTarget === "estimate"}
                required
              >
                <option value="" disabled>
                  Select approved estimate scope
                </option>
                {filteredEstimates.map((estimate) => (
                  <option key={estimate.id} value={estimate.id}>
                    {estimate.referenceNumber} - {Number(estimate.totalAmount).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD"
                    })}
                  </option>
                ))}
              </select>
              {selectedProjectId && filteredEstimates.length === 0 ? (
                <span className="mt-2 block text-xs leading-5 text-amber-700">
                  This project has no approved estimate scope available for invoicing.
                </span>
              ) : null}
            </label>
          ) : null}

          {sourceType === "changeOrder" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Approved change order
              </span>
              <select
                ref={changeOrderSelectRef}
                name="changeOrderId"
                value={selectedChangeOrderId}
                onChange={(event) => setSelectedChangeOrderId(event.target.value)}
                className={getSelectClassName(errorTarget === "changeOrder")}
                aria-invalid={errorTarget === "changeOrder"}
                required
              >
                <option value="" disabled>
                  Select approved change order
                </option>
                {filteredChangeOrders.map((changeOrder) => (
                  <option key={changeOrder.id} value={changeOrder.id}>
                    {changeOrder.referenceNumber} - {changeOrder.title}
                  </option>
                ))}
              </select>
              {selectedProjectId && filteredChangeOrders.length === 0 ? (
                <span className="mt-2 block text-xs leading-5 text-amber-700">
                  This project has no unbilled approved change orders available.
                </span>
              ) : null}
            </label>
          ) : null}
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating invoice..." className="w-full">
          <span>Create invoice</span>
        </AuthSubmitButton>
        {contextualHint ? (
          <p className="text-xs leading-5 text-slate-500">{contextualHint}</p>
        ) : null}
      </div>
    </form>
  );
}
