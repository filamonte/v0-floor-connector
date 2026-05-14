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
  const now = new Date();
  const defaultApprovalDate = now.toISOString().slice(0, 10);
  const defaultApprovalTime = now.toTimeString().slice(0, 5);

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
          downstream contract, job, and invoice workflows can continue from
          customer-confirmed scope.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <form action={updateEstimateStatusAction} className="rounded-[8px] border border-emerald-200 bg-white px-4 py-4">
            <input type="hidden" name="estimateId" value={estimateId} />
            <input type="hidden" name="currentStatus" value={currentStatus} />
            <input type="hidden" name="nextStatus" value="approved" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Record approval evidence</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Capture who approved, how they approved, when it happened, and the supporting note or evidence.
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Approved by
                </span>
                <input
                  required
                  name="approvedByName"
                  type="text"
                  placeholder="Customer name"
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Approval method
                </span>
                <select
                  required
                  name="approvalMethod"
                  defaultValue="paper_signature"
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                >
                  <option value="paper_signature">Paper signature</option>
                  <option value="verbal">Verbal approval</option>
                  <option value="email">Email approval</option>
                  <option value="text_message">Text message</option>
                  <option value="onsite_signature">Onsite signature</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Approval date
                </span>
                <input
                  required
                  name="approvalDate"
                  type="date"
                  defaultValue={defaultApprovalDate}
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Approval time
                </span>
                <input
                  required
                  name="approvalTime"
                  type="time"
                  defaultValue={defaultApprovalTime}
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                />
              </label>
            </div>
            <label className="mt-3 block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Notes
              </span>
              <textarea
                name="approvalNotes"
                rows={2}
                placeholder="Optional context, conditions, or follow-up."
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              />
            </label>
            <label className="mt-3 block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Evidence / reference
              </span>
              <textarea
                required
                name="approvalEvidence"
                rows={2}
                placeholder="Signed paper copy, email thread, call log, or other supporting reference."
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              />
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex items-center rounded-full bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--copper-light)]"
            >
              Record customer approval with evidence
            </button>
          </form>
          <form action={updateEstimateStatusAction} className="rounded-[8px] border border-rose-200 bg-white px-4 py-4">
            <input type="hidden" name="estimateId" value={estimateId} />
            <input type="hidden" name="currentStatus" value={currentStatus} />
            <input type="hidden" name="nextStatus" value="rejected" />
            <p className="font-semibold text-[var(--text-primary)]">Record rejection</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              Use only for a real customer decision outside the portal.
            </p>
            <button
              type="submit"
              className="mt-3 inline-flex items-center rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-900 transition hover:border-rose-400 hover:bg-rose-50"
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
