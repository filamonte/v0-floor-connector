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
      return "border-blue-500/30 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25";
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25";
    case "rejected":
      return "border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25";
    default:
      return "border-[--line] bg-[--background] text-white hover:bg-[--surface-strong]";
  }
}

export function EstimateStatusActions({
  estimateId,
  currentStatus
}: EstimateStatusActionsProps) {
  const nextStatuses = estimateStatusTransitions[currentStatus];

  if (nextStatuses.length === 0) {
    return (
      <div className="rounded-lg border border-[--line] bg-[--background] px-4 py-3 text-sm text-[--muted]">
        This estimate is in a final state. No further status changes are available.
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
            className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition ${getStatusButtonStyles(nextStatus)}`}
          >
            Mark as {formatStatusLabel(nextStatus)}
          </button>
        </form>
      ))}
    </div>
  );
}
