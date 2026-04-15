import { contractStatusTransitions } from "@floorconnector/domain";
import type { ContractStatus } from "@floorconnector/types";

import { updateContractStatusAction } from "@/lib/contracts/actions";

type ContractStatusActionsProps = {
  contractId: string;
  currentStatus: ContractStatus;
};

function formatStatusLabel(status: ContractStatus) {
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
  currentStatus
}: ContractStatusActionsProps) {
  const nextStatuses = contractStatusTransitions[currentStatus];

  if (nextStatuses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        This contract is in a final state. No further status changes are available from here.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {nextStatuses.map((nextStatus) => (
        <form key={nextStatus} action={updateContractStatusAction}>
          <input type="hidden" name="contractId" value={contractId} />
          <input type="hidden" name="currentStatus" value={currentStatus} />
          <input type="hidden" name="nextStatus" value={nextStatus} />
          <button
            type="submit"
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${getStatusButtonStyles(nextStatus)}`}
          >
            Mark as {formatStatusLabel(nextStatus)}
          </button>
        </form>
      ))}
    </div>
  );
}
