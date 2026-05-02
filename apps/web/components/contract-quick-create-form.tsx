"use client";

import { QuickCreateFormShell } from "@/components/quick-create-form-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type ApprovedEstimateOption = {
  id: string;
  referenceNumber: string;
  projectName?: string | null;
};

type ContractQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  approvedEstimates: ApprovedEstimateOption[];
  initialEstimateId?: string | null;
  preferredTemplateId?: string | null;
  requireInternalApproval?: boolean;
};

export function ContractQuickCreateForm({
  action,
  approvedEstimates,
  initialEstimateId,
  preferredTemplateId,
  requireInternalApproval = false
}: ContractQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      {preferredTemplateId ? (
        <input type="hidden" name="templateId" value={preferredTemplateId} />
      ) : null}

      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create contract"
        description="Choose the approved estimate, create the canonical contract, and then finish review and signature setup in the full contract workspace."
        footer={
          requireInternalApproval
            ? "Internal contract approval is turned on for this organization. The new draft contract will still need approval before send."
            : "This creates a real contract record and takes you straight into the full contract workspace."
        }
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Approved estimate
          </span>
          <select
            name="estimateId"
            defaultValue={initialEstimateId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            required
          >
            <option value="" disabled>
              Select an approved estimate
            </option>
            {approvedEstimates.map((estimate) => (
              <option key={estimate.id} value={estimate.id}>
                {estimate.referenceNumber}
                {estimate.projectName ? ` - ${estimate.projectName}` : ""}
              </option>
            ))}
          </select>
        </label>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating contract..." className="w-full">
          <span>Create contract</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
