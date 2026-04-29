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
        ? "This estimate is out for customer portal review. Approve estimate happens through the portal handoff, not through contractor-side status buttons."
        : currentStatus === "approved"
          ? "This estimate is approved and is ready for the downstream contract and billing handoff."
          : currentStatus === "rejected"
            ? "This estimate needs revision before you send estimate again."
            : "Contractor-side status buttons are disabled for estimates. Use Send estimate, then let customer portal approval drive the next step."}
    </div>
  );
}
