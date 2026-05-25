import { AuthSubmitButton } from "@/components/auth-submit-button";
import type { AiCopilotCommunicationHandoff } from "@/lib/ai-operational-copilot/communication-handoff";
import { replyToCommunicationThreadAction } from "@/lib/communications/actions";

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
};

export function CommunicationReplyForm({
  threadId,
  query,
  view,
  source,
  copilotHandoff
}: CommunicationReplyFormProps) {
  const submitLabel = copilotHandoff ? "Save reviewed draft" : "Send reply";
  const pendingLabel = copilotHandoff ? "Saving draft..." : "Sending reply...";

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
