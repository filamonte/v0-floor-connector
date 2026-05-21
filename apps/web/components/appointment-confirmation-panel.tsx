import type { CommunicationMessage } from "@floorconnector/types";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import type { AppointmentConfirmationEligibility } from "@/lib/communications/appointment-confirmation-eligibility";
import type { AppointmentConfirmationEmailRecipient } from "@/lib/communications/appointment-confirmation-email-core";
import type { AppointmentConfirmationPreview } from "@/lib/communications/appointment-confirmation-preview";
import type { AppointmentConfirmationEmailDelivery } from "@/lib/communications/appointment-confirmations";

type AppointmentConfirmationPanelProps = {
  appointmentId: string;
  preview: AppointmentConfirmationPreview | null;
  eligibility: AppointmentConfirmationEligibility;
  confirmationLogs: CommunicationMessage[];
  emailRecipients: AppointmentConfirmationEmailRecipient[];
  emailDeliveries: AppointmentConfirmationEmailDelivery[];
  isEmailLocked: boolean;
  logAction: (formData: FormData) => Promise<void>;
  sendEmailAction: (formData: FormData) => Promise<void>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMessageKind(value: string) {
  return value.replaceAll("_", " ");
}

function formatRecipientSource(value: string) {
  switch (value) {
    case "portal_access":
      return "Portal access";
    case "customer_contact":
      return "Customer contact";
    case "customer":
      return "Customer account";
    default:
      return formatMessageKind(value);
  }
}

function getDeliveryTone(status: string) {
  if (status === "sent" || status === "delivered" || status === "opened" || status === "clicked") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function getDefaultRecipientEmail(recipients: AppointmentConfirmationEmailRecipient[]) {
  return (
    recipients.find((recipient) => recipient.source === "portal_access" && recipient.isPrimaryContact)?.email ??
    recipients.find((recipient) => recipient.source === "portal_access")?.email ??
    recipients.find((recipient) => recipient.isPrimaryContact)?.email ??
    recipients[0]?.email ??
    ""
  );
}

export function AppointmentConfirmationPanel({
  appointmentId,
  preview,
  eligibility,
  confirmationLogs,
  emailRecipients,
  emailDeliveries,
  isEmailLocked,
  logAction,
  sendEmailAction
}: AppointmentConfirmationPanelProps) {
  const defaultRecipientEmail = getDefaultRecipientEmail(emailRecipients);
  const latestDelivery = emailDeliveries[0] ?? null;
  const deliveryByMessageId = new Map(
    emailDeliveries.map((delivery) => [delivery.communicationMessageId, delivery])
  );
  const canSendEmail =
    Boolean(preview?.body.trim()) &&
    eligibility.eligible &&
    emailRecipients.length > 0 &&
    !isEmailLocked;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                eligibility.eligible
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-800"
              ].join(" ")}
            >
              {eligibility.eligible ? "Ready" : "Needs setup"}
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Email only
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Manual send
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              This can log a customer-visible confirmation in canonical communication history
              and manually send the same customer-safe content by email. It does not send SMS,
              voice, chat, calendar invites, or reminders.
            </p>
            {eligibility.eligible ? (
              <p>
                The appointment is customer-visible and linked to customer/project context,
                so the confirmation can be logged or emailed after contractor confirmation.
              </p>
            ) : (
              <div>
                <p className="font-semibold text-slate-950">Before sending:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {eligibility.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </div>
            )}
            {isEmailLocked ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                <p className="font-semibold text-amber-950">Email sending is locked</p>
                <p className="mt-1">
                  External sends unlock after activation. You can still log confirmation
                  history from this panel.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Customer-safe preview
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Preview content uses customer-safe appointment fields only. Keep edits
              customer-facing before logging or sending.
            </p>
          </div>

          {preview ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">{preview.subject}</p>
                <form action={sendEmailAction} className="mt-3 space-y-4">
                  <input type="hidden" name="appointmentId" value={appointmentId} />
                  <textarea
                    name="body"
                    rows={10}
                    defaultValue={preview.body}
                    required
                    maxLength={5000}
                    className="min-h-[220px] w-full rounded-[4px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-[#ef7d32]"
                  />
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <label
                      htmlFor="appointment-confirmation-recipient"
                      className="text-sm font-semibold text-slate-950"
                    >
                      Email recipient
                    </label>
                    {emailRecipients.length > 0 ? (
                      <>
                        <select
                          id="appointment-confirmation-recipient"
                          name="recipientEmail"
                          defaultValue={defaultRecipientEmail}
                          required
                          className="mt-2 w-full rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#ef7d32]"
                        >
                          {emailRecipients.map((recipient) => (
                            <option key={recipient.key} value={recipient.email}>
                              {recipient.displayName ?? recipient.email} - {recipient.email} ({formatRecipientSource(recipient.source)})
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          V1 sends one email at a time. Recipients come from active portal
                          access, customer contacts, or the canonical customer email.
                        </p>
                      </>
                    ) : (
                      <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        No eligible email recipient is available. Add a valid customer email,
                        customer contact, or active portal contact before sending.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-500">
                      On success, the communication message is marked sent. On failure, the
                      provider attempt is recorded and the message is not marked sent.
                    </p>
                    <AuthSubmitButton
                      pendingLabel="Sending email..."
                      className="px-4"
                      disabled={!canSendEmail}
                    >
                      Send email confirmation
                    </AuthSubmitButton>
                  </div>
                </form>
              </div>
              <form
                action={logAction}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <input type="hidden" name="appointmentId" value={appointmentId} />
                <input type="hidden" name="body" value={preview.body} />
                <p className="text-xs leading-5 text-slate-500">
                  Prefer not to email yet? Record the generated confirmation as logged-only
                  communication history.
                </p>
                <AuthSubmitButton
                  pendingLabel="Logging confirmation..."
                  variant="secondary"
                  className="px-4"
                >
                  Log only
                </AuthSubmitButton>
              </form>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
              A customer-safe preview will appear after the appointment is customer-visible
              and linked to customer/project context.
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email delivery state
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Provider attempts are audit records. Postmark is a delivery adapter, not the
              appointment or communication source of truth.
            </p>
          </div>
          <span
            className={[
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
              latestDelivery
                ? getDeliveryTone(latestDelivery.status)
                : "border-slate-200 bg-white text-slate-600"
            ].join(" ")}
          >
            {latestDelivery ? latestDelivery.status : "No email attempts"}
          </span>
        </div>

        {latestDelivery ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-950">
              Latest email attempt: {formatDateTime(latestDelivery.createdAt)}
            </p>
            <p className="mt-2">
              Recipient: {latestDelivery.recipientEmail ?? "Unknown recipient"}
            </p>
            <p className="mt-1">
              Provider: {latestDelivery.provider ?? "email"}
              {latestDelivery.providerMessageId ? ` / ${latestDelivery.providerMessageId}` : ""}
            </p>
            {latestDelivery.status === "failed" ? (
              <p className="mt-2 text-rose-700">
                Failed: {latestDelivery.errorMessage ?? "The provider did not accept the message."}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
            No email confirmation has been attempted yet.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recent confirmation logs
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These are customer-visible communication records. Logged means history only;
              sent means an email provider send succeeded.
            </p>
          </div>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            {confirmationLogs.length} records
          </span>
        </div>

        {confirmationLogs.length > 0 ? (
          <div className="mt-4 space-y-3">
            {confirmationLogs.map((message) => {
              const delivery = deliveryByMessageId.get(message.id);

              return (
                <article
                  key={message.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                          message.deliveryStatus === "sent"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        ].join(" ")}
                      >
                        {message.deliveryStatus}
                      </span>
                      {delivery ? (
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                            getDeliveryTone(delivery.status)
                          ].join(" ")}
                        >
                          email {delivery.status}
                        </span>
                      ) : null}
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {formatMessageKind(message.messageKind)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-slate-700">{message.body}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Created by: {message.senderUserId ?? "Unknown"}
                  </p>
                  {delivery?.status === "failed" ? (
                    <p className="mt-2 text-xs leading-5 text-rose-700">
                      Email failed: {delivery.errorMessage ?? "The provider did not accept the message."}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
            No appointment confirmations have been logged or sent yet.
          </div>
        )}
      </section>
    </div>
  );
}
