import { AuthSubmitButton } from "@/components/auth-submit-button";
import {
  markAllCommunicationNotificationsReadAction,
  markCommunicationThreadNotificationsReadAction
} from "@/lib/communications/actions";

type CommunicationNotificationTriageFormProps = {
  mode: "thread" | "all";
  threadId?: string;
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
  disabled?: boolean;
};

export function CommunicationNotificationTriageForm({
  mode,
  threadId,
  query,
  view,
  source,
  disabled = false
}: CommunicationNotificationTriageFormProps) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-9 items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
      >
        {mode === "thread" ? "Mark thread read" : "Mark all read"}
      </button>
    );
  }

  return (
    <form
      action={
        mode === "thread"
          ? markCommunicationThreadNotificationsReadAction
          : markAllCommunicationNotificationsReadAction
      }
    >
      {threadId ? <input type="hidden" name="threadId" value={threadId} /> : null}
      <input type="hidden" name="q" value={query} />
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="source" value={source} />
      <AuthSubmitButton
        pendingLabel={mode === "thread" ? "Marking thread..." : "Marking all..."}
        variant="secondary"
        className="px-3 text-xs font-semibold uppercase tracking-[0.14em]"
      >
        {mode === "thread" ? "Mark thread read" : "Mark all read"}
      </AuthSubmitButton>
    </form>
  );
}
