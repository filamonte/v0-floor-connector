import type { EstimateStatus } from "@floorconnector/types";

type EstimateStatusActionsProps = {
  estimateId: string;
  currentStatus: EstimateStatus;
};

export function EstimateStatusActions({
  estimateId: _estimateId,
  currentStatus
}: EstimateStatusActionsProps) {
  void _estimateId;

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
      {currentStatus === "sent"
        ? "This estimate is out for customer portal review. Approval and rejection now come back from the portal, not from contractor-side status buttons."
        : currentStatus === "approved"
          ? "This estimate is approved and has moved into downstream readiness guidance."
          : currentStatus === "rejected"
            ? "This estimate needs revision before it should be sent again."
            : "Contractor-side status buttons are disabled for estimates. Use the send flow and customer portal decisions instead."}
    </div>
  );
}
