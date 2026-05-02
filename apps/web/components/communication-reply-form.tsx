import { AuthSubmitButton } from "@/components/auth-submit-button";
import { replyToCommunicationThreadAction } from "@/lib/communications/actions";

type CommunicationReplyFormProps = {
  threadId: string;
  query: string;
  view: "all" | "needs_response" | "unread" | "recent";
  source:
    | "all"
    | "customer"
    | "project"
    | "estimate"
    | "contract"
    | "invoice"
    | "change_order"
    | "payment";
};

export function CommunicationReplyForm({
  threadId,
  query,
  view,
  source
}: CommunicationReplyFormProps) {
  return (
    <form action={replyToCommunicationThreadAction} className="space-y-3">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="q" value={query} />
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="source" value={source} />

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
          placeholder="Write a reply on this canonical communication thread."
          className="min-h-[132px] w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
        />
        <p className="text-xs leading-5 text-slate-500">
          This posts one internal reply to the selected communication thread. It does not send
          email or SMS and does not create automation.
        </p>
      </div>

      <div className="flex items-center justify-end">
        <AuthSubmitButton pendingLabel="Sending reply..." className="px-4">
          Send reply
        </AuthSubmitButton>
      </div>
    </form>
  );
}
