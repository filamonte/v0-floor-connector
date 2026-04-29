import type {
  ContractContractorSignerOption,
  ContractSignatureParticipantOption
} from "@/lib/contracts/data";
import {
  ContractInternalApprovalStatus,
  ContractStatus
} from "@floorconnector/types";

import {
  countersignContractAction,
  sendContractForSignatureAction,
  updateContractInternalApprovalStatusAction,
  updateContractStatusAction
} from "@/lib/contracts/actions";

type ContractStatusActionsProps = {
  contractId: string;
  currentStatus: ContractStatus;
  currentInternalApprovalStatus: ContractInternalApprovalStatus;
  requireContractInternalApproval: boolean;
  canSend: boolean;
  sendReadinessMessage: string;
  isLocked: boolean;
  customerPortalSignerOptions: ContractSignatureParticipantOption[];
  contractorSignerOptions: ContractContractorSignerOption[];
  canCountersign: boolean;
  countersignMessage: string;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusButtonStyles(status: ContractStatus) {
  switch (status) {
    case "sent":
      return "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100";
    case "viewed":
      return "border-sky-300 bg-sky-50 text-sky-900 hover:border-sky-400 hover:bg-sky-100";
    case "signed":
      return "border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100";
    case "void":
      return "border-rose-300 bg-rose-50 text-rose-900 hover:border-rose-400 hover:bg-rose-100";
    default:
      return "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50";
  }
}

export function ContractStatusActions({
  contractId,
  currentStatus,
  currentInternalApprovalStatus,
  requireContractInternalApproval,
  canSend,
  sendReadinessMessage,
  isLocked,
  customerPortalSignerOptions,
  contractorSignerOptions,
  canCountersign,
  countersignMessage
}: ContractStatusActionsProps) {
  const nextStatuses: ContractStatus[] =
    currentStatus === "draft"
      ? ["void"]
      : currentStatus === "sent" || currentStatus === "viewed"
        ? ["void"]
        : [];

  if (
    nextStatuses.length === 0 &&
    (!requireContractInternalApproval || currentStatus !== "draft" || isLocked) &&
    !canCountersign
  ) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        This contract is in a final state. No further status changes are available from here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requireContractInternalApproval && currentStatus === "draft" && !isLocked ? (
        <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Internal approval</p>
            <p className="mt-1 capitalize">
              Current state: {formatStatusLabel(currentInternalApprovalStatus)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {currentInternalApprovalStatus !== "approved" ? (
              <form action={updateContractInternalApprovalStatusAction}>
                <input type="hidden" name="contractId" value={contractId} />
                <input
                  type="hidden"
                  name="currentInternalApprovalStatus"
                  value={currentInternalApprovalStatus}
                />
                <input
                  type="hidden"
                  name="nextInternalApprovalStatus"
                  value="approved"
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
                >
                  Approve for send
                </button>
              </form>
            ) : null}
            {currentInternalApprovalStatus !== "rejected" ? (
              <form action={updateContractInternalApprovalStatusAction}>
                <input type="hidden" name="contractId" value={contractId} />
                <input
                  type="hidden"
                  name="currentInternalApprovalStatus"
                  value={currentInternalApprovalStatus}
                />
                <input
                  type="hidden"
                  name="nextInternalApprovalStatus"
                  value="rejected"
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-900 shadow-sm transition hover:border-rose-400 hover:bg-rose-100"
                >
                  Mark needs revision
                </button>
              </form>
            ) : null}
            {currentInternalApprovalStatus !== "pending" ? (
              <form action={updateContractInternalApprovalStatusAction}>
                <input type="hidden" name="contractId" value={contractId} />
                <input
                  type="hidden"
                  name="currentInternalApprovalStatus"
                  value={currentInternalApprovalStatus}
                />
                <input
                  type="hidden"
                  name="nextInternalApprovalStatus"
                  value="pending"
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Reset to pending
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      {!canSend && currentStatus === "draft" ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
          {sendReadinessMessage}
        </div>
      ) : null}

      {currentStatus === "draft" ? (
        <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
          <div className="space-y-1 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Send for customer signature</p>
            <p>
              Choose the active customer portal signer for this project, then optionally add the
              contractor countersigner who should complete the final signature if required.
            </p>
          </div>

          {customerPortalSignerOptions.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              No eligible customer signer is available for this project. Grant portal access and,
              for linked customer contacts, confirm contract-signing permission before sending.
            </div>
          ) : (
            <form action={sendContractForSignatureAction} className="space-y-4">
              <input type="hidden" name="contractId" value={contractId} />

              <label className="block space-y-2 text-sm leading-6 text-slate-600">
                <span className="font-medium text-slate-950">Customer portal signer</span>
                <select
                  name="customerPortalUserId"
                  required
                  defaultValue={
                    customerPortalSignerOptions.length === 1
                      ? customerPortalSignerOptions[0]?.userId
                      : ""
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="">Select a portal user</option>
                  {customerPortalSignerOptions.map((option) => (
                    <option key={option.userId} value={option.userId}>
                      {option.displayName} ({option.email})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm leading-6 text-slate-600">
                <span className="font-medium text-slate-950">
                  Contractor countersigner
                </span>
                <select
                  name="contractorSignerUserId"
                  defaultValue=""
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="">No contractor countersign required</option>
                  {contractorSignerOptions.map((option) => (
                    <option key={option.userId} value={option.userId}>
                      {option.displayName} ({option.membershipRole})
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={!canSend || customerPortalSignerOptions.length === 0}
                className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                Send for signature
              </button>
            </form>
          )}
        </div>
      ) : null}

      {canCountersign ? (
        <div className="space-y-3 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="text-sm leading-6 text-emerald-900">
            <p className="font-medium text-emerald-950">Contractor countersign</p>
            <p className="mt-1">{countersignMessage}</p>
          </div>
          <form action={countersignContractAction}>
            <input type="hidden" name="contractId" value={contractId} />
            <button
              type="submit"
              className="inline-flex items-center rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
            >
              Complete contractor countersign
            </button>
          </form>
        </div>
      ) : currentStatus !== "draft" && countersignMessage ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          {countersignMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {nextStatuses.map((nextStatus) => (
          <form key={nextStatus} action={updateContractStatusAction}>
            <input type="hidden" name="contractId" value={contractId} />
            <input type="hidden" name="currentStatus" value={currentStatus} />
            <input type="hidden" name="nextStatus" value={nextStatus} />
            <button
              type="submit"
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${getStatusButtonStyles(nextStatus)}`}
            >
              {`Mark as ${formatStatusLabel(nextStatus)}`}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
