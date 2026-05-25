import { AuthSubmitButton } from "@/components/auth-submit-button";
import type { AiCopilotCommunicationHandoff } from "@/lib/ai-operational-copilot/communication-handoff";
import { replyToCommunicationThreadAction } from "@/lib/communications/actions";
import type { CustomerCommunicationSendReadiness } from "@/lib/communications/send-readiness";

type CommunicationReplyFormProps = {
  threadId: string;
  query: string;
  view: "all" | "needs_response" | "unread" | "recent";
  source:
    | "all"
    | "opportunity"
    | "appointment"
    | "customer"
    | "project"
    | "estimate"
    | "contract"
    | "invoice"
    | "change_order"
    | "payment";
  copilotHandoff?: AiCopilotCommunicationHandoff | null;
  sendReadiness?: CustomerCommunicationSendReadiness | null;
};

export function CommunicationReplyForm({
  threadId,
  query,
  view,
  source,
  copilotHandoff,
  sendReadiness
}: CommunicationReplyFormProps) {
  const submitLabel = copilotHandoff ? "Save reviewed draft" : "Send reply";
  const pendingLabel = copilotHandoff ? "Saving draft..." : "Sending reply...";
  const readinessToneClass =
    sendReadiness?.tone === "ready"
      ? "border-[#d6e6d9] bg-[#f4fbf5] text-[#2f6b3b]"
      : sendReadiness?.tone === "blocked"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-[#ead9c7] bg-[#fff8f2] text-[#8f5b32]";
  const readinessLabel =
    sendReadiness?.readinessStatus.replaceAll("_", " ") ?? "";

  return (
    <form action={replyToCommunicationThreadAction} className="space-y-3">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="q" value={query} />
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="source" value={source} />
      {copilotHandoff ? (
        <>
          <input
            type="hidden"
            name="copilotDraftId"
            value={copilotHandoff.draftId}
          />
          <input
            type="hidden"
            name="copilotActionType"
            value={copilotHandoff.actionType}
          />
          <input
            type="hidden"
            name="copilotAudience"
            value={copilotHandoff.audience}
          />
          <input
            type="hidden"
            name="copilotSubject"
            value={copilotHandoff.subject}
          />
          <input
            type="hidden"
            name="copilotReason"
            value={copilotHandoff.operationalReason}
          />
          <input
            type="hidden"
            name="copilotSignals"
            value={copilotHandoff.sourceWorkflowSignals.join("\n")}
          />
          <input
            type="hidden"
            name="copilotProjectId"
            value={copilotHandoff.projectId}
          />
          <input
            type="hidden"
            name="copilotProjectName"
            value={copilotHandoff.projectName}
          />
          <input
            type="hidden"
            name="copilotCustomerId"
            value={copilotHandoff.customerId ?? ""}
          />
          <input
            type="hidden"
            name="copilotCustomerName"
            value={copilotHandoff.customerName ?? ""}
          />
        </>
      ) : null}

      {sendReadiness ? (
        <section className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Customer send readiness
              </p>
              <h5 className="mt-2 text-sm font-semibold text-slate-950">
                Preparation and review only
              </h5>
            </div>
            <span
              className={[
                "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                readinessToneClass
              ].join(" ")}
            >
              {readinessLabel}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
            <p>
              Audience{" "}
              <span className="font-medium text-slate-800">
                {sendReadiness.targetCustomerLabel}
              </span>
            </p>
            <p>
              Related record{" "}
              <span className="font-medium text-slate-800">
                {sendReadiness.relatedRecordLabel}
              </span>
            </p>
          </div>

          <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
            {sendReadiness.reasons.slice(0, 3).map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
            {sendReadiness.missingRequirements.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {sendReadiness.missingRequirements
                  .slice(0, 3)
                  .map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
              </ul>
            ) : null}
            {sendReadiness.safeBodyFraming ? (
              <p>{sendReadiness.safeBodyFraming}</p>
            ) : null}
            <p className="font-medium text-slate-700">
              Nothing is sent automatically from this composer.
            </p>
          </div>
        </section>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor={`communication-reply-${threadId}`}
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]"
        >
          Reply
        </label>
        <textarea
          id={`communication-reply-${threadId}`}
          name="body"
          rows={5}
          maxLength={5000}
          required
          defaultValue={copilotHandoff?.draftBody}
          placeholder={
            copilotHandoff
              ? "Review and edit the Copilot draft before saving it to this thread."
              : "Write a reply on this canonical communication thread."
          }
          className="min-h-[132px] w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
        />
        <p className="text-xs leading-5 text-slate-500">
          {copilotHandoff
            ? "This saves the reviewed draft as one internal communication message on the selected canonical thread. It does not create notifications, send email or SMS, or create automation."
            : "This posts one internal reply to the selected communication thread. It does not send email or SMS and does not create automation."}
        </p>
      </div>

      <div className="flex items-center justify-end">
        <AuthSubmitButton pendingLabel={pendingLabel} className="px-4">
          {submitLabel}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
