import { estimateStatusTransitions } from "@floorconnector/domain";
import type { EstimateStatus } from "@floorconnector/types";

import { updateEstimateStatusAction } from "@/lib/estimates/actions";

type EstimateStatusActionsProps = {
  estimateId: string;
  currentStatus: EstimateStatus;
};

function formatStatusLabel(status: EstimateStatus) {
  return status.replaceAll("_", " ");
}

function getStatusButtonStyles(status: EstimateStatus) {
  switch (status) {
    case "sent":
      return "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100";
    case "approved":
      return "border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100";
    case "rejected":
      return "border-rose-300 bg-rose-50 text-rose-900 hover:border-rose-400 hover:bg-rose-100";
    default:
      return "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50";
  }
}

export function EstimateStatusActions({
  estimateId,
  currentStatus
}: EstimateStatusActionsProps) {
  const nextStatuses = estimateStatusTransitions[currentStatus];

  if (nextStatuses.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        This estimate is in a final review state. No further status changes are
        available from here.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {nextStatuses.map((nextStatus) => (
        <form key={nextStatus} action={updateEstimateStatusAction}>
          <input type="hidden" name="estimateId" value={estimateId} />
          <input type="hidden" name="currentStatus" value={currentStatus} />
          <input type="hidden" name="nextStatus" value={nextStatus} />
          <button
            type="submit"
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${getStatusButtonStyles(nextStatus)}`}
          >
            Mark as {formatStatusLabel(nextStatus)}
          </button>
        </form>
      ))}
    </div>
  );
}
