import type {
  DocumentDeliveryEvent,
  DocumentDeliverySubjectType
} from "@floorconnector/types";

import { DetailPanel } from "@/components/detail-panel";
import { recordDocumentDeliveryEventAction } from "@/lib/document-delivery/actions";
import { deriveSendTrailSummary } from "@/lib/sendtrail/summary";

type DocumentDeliveryHistoryPanelProps = {
  subjectType: DocumentDeliverySubjectType;
  subjectId: string;
  events: DocumentDeliveryEvent[];
  title?: string;
  description?: string;
  boundaryCopy: string;
  sourceLabel?: string;
  sourceHref?: string;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function formatEventNote(value: string | null) {
  return value && value.trim().length > 0 ? value : "No note recorded.";
}

export function DocumentDeliveryHistoryPanel({
  subjectType,
  subjectId,
  events,
  title = "Send Trail",
  description = "Document send, delivery, and request proof for this record.",
  boundaryCopy,
  sourceLabel,
  sourceHref
}: DocumentDeliveryHistoryPanelProps) {
  const sendTrail = deriveSendTrailSummary({
    sourceRecords: [
      {
        id: subjectId,
        type: subjectType,
        label: sourceLabel ?? formatLabel(subjectType),
        href: sourceHref ?? `/${subjectType.replace("_", "-")}s/${subjectId}`
      }
    ],
    deliveryEvents: events.map((event) => ({
      id: event.id,
      subjectType: event.subjectType,
      subjectId: event.subjectId,
      eventType: event.eventType,
      recipientName: event.recipientName,
      recipientEmail: event.recipientEmail,
      recipientRole: event.recipientRole,
      channel: event.channel,
      provider: event.provider,
      eventNote: event.eventNote,
      createdAt: event.createdAt
    }))
  });

  return (
    <DetailPanel title={title} description={description}>
      <div className="grid gap-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              label: "Send events",
              value: sendTrail.counts.total,
              detail: sendTrail.latestItem
                ? `Latest ${formatDateTime(sendTrail.latestItem.occurredAt)}`
                : "No Send Trail events yet"
            },
            {
              label: "Viewed / acted",
              value: sendTrail.counts.viewed + sendTrail.counts.acted,
              detail:
                sendTrail.counts.viewed + sendTrail.counts.acted > 0
                  ? "Customer activity is recorded"
                  : "No customer view or action yet"
            },
            {
              label: "Needs review",
              value: sendTrail.attentionCount,
              detail:
                sendTrail.attentionCount > 0
                  ? "Pending or failed delivery proof"
                  : "No send attention items"
            },
            {
              label: "Next Move",
              value: sendTrail.nextMove.label,
              detail: sendTrail.nextMove.reason
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[8px] border border-[var(--border-warm)] bg-white px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {item.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
          {boundaryCopy}
        </div>

        {events.length > 0 ? (
          <div className="grid gap-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-[8px] border border-[var(--border-warm)] bg-white px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold capitalize text-[var(--text-primary)]">
                    {formatLabel(event.eventType)}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium capitalize">
                  <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-[var(--text-secondary)]">
                    {formatLabel(event.channel)}
                  </span>
                  {event.recipientRole ? (
                    <span className="rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-[var(--text-secondary)]">
                      {formatLabel(event.recipientRole)}
                    </span>
                  ) : null}
                  {event.provider ? (
                    <span className="rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-[var(--text-secondary)]">
                      {formatLabel(event.provider)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {event.recipientName ?? "No recipient name recorded."}
                  {event.recipientEmail ? ` - ${event.recipientEmail}` : ""}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {formatEventNote(event.eventNote)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[var(--border-warm)] bg-white px-5 py-5 text-sm leading-6 text-[var(--text-secondary)]">
            No delivery evidence has been recorded yet.
          </div>
        )}

        <form
          action={recordDocumentDeliveryEventAction}
          className="grid gap-4 rounded-[8px] border border-[var(--border-warm)] bg-white px-5 py-5"
        >
          <input type="hidden" name="subjectType" value={subjectType} />
          <input type="hidden" name="subjectId" value={subjectId} />
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Evidence type
              </span>
              <select
                name="eventType"
                defaultValue="delivery_recorded"
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              >
                <option value="delivery_recorded">Delivery recorded</option>
                <option value="send_requested">Send requested</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Channel
              </span>
              <select
                name="channel"
                defaultValue="internal"
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              >
                <option value="internal">Internal</option>
                <option value="manual">Manual</option>
                <option value="print">Print</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Recipient role
              </span>
              <input
                name="recipientRole"
                placeholder="Customer, billing contact..."
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Recipient name
              </span>
              <input
                name="recipientName"
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Recipient email
              </span>
              <input
                type="email"
                name="recipientEmail"
                className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              Evidence note
            </span>
            <textarea
              name="eventNote"
              rows={3}
              placeholder="Example: Printed and handed to customer during closeout."
              className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
            />
          </label>
          <button
            type="submit"
            className="justify-self-start rounded-[4px] border border-[var(--graphite)] bg-[var(--graphite)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--graphite-light)]"
          >
            Record delivery evidence
          </button>
        </form>
      </div>
    </DetailPanel>
  );
}
