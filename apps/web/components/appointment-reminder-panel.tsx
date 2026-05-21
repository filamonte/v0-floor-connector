import type { CommunicationMessage } from "@floorconnector/types";
import Link from "next/link";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import type {
  AppointmentReminderEmailDelivery,
  AppointmentReminderEmailRecipient,
  AppointmentReminderReadiness
} from "@/lib/communications/appointment-reminders";

type AppointmentReminderPanelProps = {
  appointmentId: string;
  customerId?: string | null;
  readiness: AppointmentReminderReadiness;
  reminderLogs: CommunicationMessage[];
  emailDeliveries: AppointmentReminderEmailDelivery[];
  isEmailLocked: boolean;
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

function formatPreferenceStatus(value: AppointmentReminderEmailRecipient["preferenceStatus"]) {
  switch (value) {
    case "allowed":
      return "Allowed";
    case "default_allowed":
      return "Default allowed";
    case "opted_out":
      return "Opted out";
    case "suppressed":
      return "Suppressed";
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

function getDefaultRecipientEmail(recipients: AppointmentReminderEmailRecipient[]) {
  return (
    recipients.find((recipient) => recipient.source === "portal_access" && recipient.isPrimaryContact)?.email ??
    recipients.find((recipient) => recipient.source === "portal_access")?.email ??
    recipients.find((recipient) => recipient.isPrimaryContact)?.email ??
    recipients[0]?.email ??
    ""
  );
}

export function AppointmentReminderPanel({
  appointmentId,
  customerId,
  readiness,
  reminderLogs,
  emailDeliveries,
  isEmailLocked,
  sendEmailAction
}: AppointmentReminderPanelProps) {
  const defaultRecipientEmail = getDefaultRecipientEmail(readiness.recipients);
  const latestDelivery = emailDeliveries[0] ?? null;
  const deliveryByMessageId = new Map(
    emailDeliveries.map((delivery) => [delivery.communicationMessageId, delivery])
  );
  const preview = readiness.preview;
  const canSendEmail =
    Boolean(preview?.body.trim()) &&
    readiness.ready &&
    readiness.recipients.length > 0 &&
    !isEmailLocked;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                readiness.ready
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-800"
              ].join(" ")}
            >
              {readiness.ready ? "Ready" : "Needs setup"}
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
              This sends a one-off reminder email for an upcoming customer-visible
              appointment. It does not schedule future reminders, send SMS, create
              automation, or expose portal reminder actions.
            </p>
            {readiness.ready ? (
              <p>
                The appointment is eligible for a manual email reminder, and recipients
                have been filtered through appointment-reminder communication preferences.
              </p>
            ) : (
              <div>
                <p className="font-semibold text-slate-950">Before sending:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {readiness.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </div>
            )}
            {isEmailLocked ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                <p className="font-semibold text-amber-950">Email sending is locked</p>
                <p className="mt-1">
                  External sends unlock after activation. Reminder preview and readiness
                  can still be reviewed here.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Customer-safe reminder preview
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Reminder copy says the appointment is coming up. It uses customer-safe
              appointment fields only.
            </p>
          </div>

          {preview ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
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
                    htmlFor="appointment-reminder-recipient"
                    className="text-sm font-semibold text-slate-950"
                  >
                    Email recipient
                  </label>
                  {readiness.recipients.length > 0 ? (
                    <>
                      <select
                        id="appointment-reminder-recipient"
                        name="recipientEmail"
                        defaultValue={defaultRecipientEmail}
                        required
                        className="mt-2 w-full rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#ef7d32]"
                      >
                        {readiness.recipients.map((recipient) => (
                          <option key={recipient.key} value={recipient.email}>
                            {recipient.displayName ?? recipient.email} - {recipient.email} ({formatRecipientSource(recipient.source)}, {formatPreferenceStatus(recipient.preferenceStatus)})
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        V1 sends one reminder email at a time. Opted-out and suppressed
                        recipients are removed before this list is shown.
                      </p>
                    </>
                  ) : (
                    <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      <p>
                        No eligible reminder recipient is available after communication
                        preferences are applied.
                      </p>
                      {customerId ? (
                        <Link
                          href={`/customers/${customerId}#communication-preferences`}
                          className="mt-2 inline-flex font-semibold text-amber-950 underline underline-offset-4"
                        >
                          Manage reminder preferences on this customer
                        </Link>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-500">
                    Duplicate successful reminder emails to the same recipient for this
                    appointment are blocked by the server.
                  </p>
                  <AuthSubmitButton
                    pendingLabel="Sending reminder..."
                    className="px-4"
                    disabled={!canSendEmail}
                  >
                    Send email reminder
                  </AuthSubmitButton>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
              A customer-safe reminder preview will appear when the appointment is
              customer-visible, scheduled, linked to customer/project context, not closed,
              and has at least one eligible email recipient.
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Reminder delivery state
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Delivery attempts are provider audit records. The reminder communication
              message is marked sent only after provider success.
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
            {latestDelivery ? latestDelivery.status : "No reminder attempts"}
          </span>
        </div>

        {latestDelivery ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-950">
              Latest reminder attempt: {formatDateTime(latestDelivery.createdAt)}
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
            No email reminder has been attempted yet.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recent reminder logs
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These are customer-visible reminder communication records. Sent means an
              email provider send succeeded.
            </p>
          </div>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            {reminderLogs.length} records
          </span>
        </div>

        {reminderLogs.length > 0 ? (
          <div className="mt-4 space-y-3">
            {reminderLogs.map((message) => {
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
            No appointment reminders have been sent yet.
          </div>
        )}
      </section>
    </div>
  );
}
