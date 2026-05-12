import { updateEstimateStatusAction } from "@/lib/estimates/actions";
import type { EstimateStatus } from "@floorconnector/types";

type EstimateStatusActionsProps = {
  estimateId: string;
  currentStatus: EstimateStatus;
};

export function EstimateStatusActions({
  estimateId,
  currentStatus
}: EstimateStatusActionsProps) {
  if (currentStatus === "draft" || currentStatus === "sent") {
    return (
      <div
        id="estimate-decision-actions"
        className="rounded-[1.5rem] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]"
      >
        <p className="font-medium text-[var(--text-primary)]">Manual customer decision</p>
        <p className="mt-2">
          Use manual approval or rejection only when the customer decision happened outside
          the portal, such as a paper signature, verbal approval, fake email during testing,
          or a non-portal customer. This records the decision on the canonical estimate so
          downstream workflows can continue from customer-confirmed scope.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={updateEstimateStatusAction}>
            <input type="hidden" name="estimateId" value={estimateId} />
            <input type="hidden" name="currentStatus" value={currentStatus} />
            <input type="hidden" name="nextStatus" value="approved" />
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--copper-light)]"
            >
              Record customer approval
            </button>
          </form>
          <form action={updateEstimateStatusAction}>
            <input type="hidden" name="estimateId" value={estimateId} />
            <input type="hidden" name="currentStatus" value={currentStatus} />
            <input type="hidden" name="nextStatus" value="rejected" />
            <button
              type="submit"
              className="inline-flex items-center rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-900 transition hover:border-rose-400 hover:bg-rose-50"
            >
              Record rejection
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
      {currentStatus === "approved"
          ? "This estimate is approved and is ready for the downstream contract and billing handoff."
          : currentStatus === "rejected"
            ? "This estimate is marked rejected and needs revision before you send estimate again."
            : "Use Send estimate before recording a manual customer approval decision."}
    </div>
  );
}
