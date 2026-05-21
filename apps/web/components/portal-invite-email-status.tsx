import type { PortalInviteEmailDeliverySummary } from "@/lib/portal-access/data";

type PortalInviteEmailStatusProps = {
  action: (formData: FormData) => void | Promise<void>;
  customerId: string;
  portalAccessGrantId: string;
  status: "invited" | "active" | "revoked";
  delivery: PortalInviteEmailDeliverySummary;
  returnTo?: string;
  compact?: boolean;
};

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : null;
}

function getDeliveryLabel(delivery: PortalInviteEmailDeliverySummary) {
  if (delivery.status === "sent") {
    return delivery.sendCount > 1 ? "Email resent" : "Email sent";
  }

  if (delivery.status === "failed") {
    return "Email failed";
  }

  return "Email not sent";
}

export function PortalInviteEmailStatus({
  action,
  customerId,
  portalAccessGrantId,
  status,
  delivery,
  returnTo,
  compact = false
}: PortalInviteEmailStatusProps) {
  const lastSentAt = formatDateTime(delivery.lastSentAt);
  const lastFailedAt = formatDateTime(delivery.lastFailedAt);
  const lastAttemptAt = formatDateTime(delivery.lastAttemptAt);
  const canSend = status === "invited";
  const buttonLabel = delivery.lastAttemptAt ? "Resend invite email" : "Send invite email";

  return (
    <div
      className={
        compact
          ? "space-y-3 border border-slate-200 bg-slate-50/70 px-3 py-3"
          : "space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
      }
    >
      <div className="space-y-1 text-sm leading-6 text-slate-600">
        <p className="font-medium text-slate-950">Invite email delivery</p>
        <p>
          Status:{" "}
          <span className="font-medium text-slate-950">{getDeliveryLabel(delivery)}</span>
        </p>
        {lastSentAt ? (
          <p>
            Last sent: <span className="font-medium text-slate-950">{lastSentAt}</span>
          </p>
        ) : null}
        {delivery.sendCount > 0 ? (
          <p>
            Send count:{" "}
            <span className="font-medium text-slate-950">{delivery.sendCount}</span>
          </p>
        ) : null}
        {lastFailedAt ? (
          <p>
            Last failed: <span className="font-medium text-slate-950">{lastFailedAt}</span>
          </p>
        ) : null}
        {!lastSentAt && !lastFailedAt && lastAttemptAt ? (
          <p>
            Last attempt: <span className="font-medium text-slate-950">{lastAttemptAt}</span>
          </p>
        ) : null}
        {delivery.lastFailureMessage ? (
          <p className="text-rose-700">
            Failure: <span className="font-medium">{delivery.lastFailureMessage}</span>
          </p>
        ) : null}
        <p className="text-xs leading-5 text-slate-500">
          The email is only the delivery path. The customer must still sign up or log in
          with the invited email, and portal access remains controlled by this grant.
        </p>
      </div>

      {canSend ? (
        <form action={action}>
          <input type="hidden" name="portalAccessGrantId" value={portalAccessGrantId} />
          <input type="hidden" name="customerId" value={customerId} />
          {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
          <button
            type="submit"
            className={
              compact
                ? "inline-flex items-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                : "inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            }
          >
            {buttonLabel}
          </button>
        </form>
      ) : null}
    </div>
  );
}
