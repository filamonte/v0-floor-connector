import type { EstimateCustomerEventListItem } from "@/lib/estimates/data";

type EstimateCustomerTimelineProps = {
  events: EstimateCustomerEventListItem[];
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getEventLabel(event: EstimateCustomerEventListItem) {
  switch (event.eventType) {
    case "sent":
      return "Sent to customer";
    case "viewed":
      return "Viewed in portal";
    case "comment_added":
      return "Customer comment";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected / changes requested";
    default:
      return event.eventType;
  }
}

function getEventTone(event: EstimateCustomerEventListItem) {
  switch (event.eventType) {
    case "approved":
      return "border-emerald-200 bg-emerald-50/80";
    case "rejected":
      return "border-rose-200 bg-rose-50/80";
    case "comment_added":
      return "border-amber-200 bg-amber-50/80";
    default:
      return "border-slate-200 bg-slate-50/80";
  }
}

export function EstimateCustomerTimeline({
  events
}: EstimateCustomerTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
        No customer send or approval history has been recorded for this estimate yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <article
          key={event.id}
          className={`rounded-2xl border px-4 py-4 ${getEventTone(event)}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {getEventLabel(event)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                {event.actorType.replaceAll("_", " ")}
              </p>
            </div>
            <p className="text-xs text-slate-500">{formatDateTime(event.occurredAt)}</p>
          </div>

          {event.emailRecipient ? (
            <p className="mt-3 text-sm text-slate-600">
              Email recipient: <span className="font-medium text-slate-950">{event.emailRecipient}</span>
            </p>
          ) : null}

          {event.emailOpenedAt ? (
            <p className="mt-2 text-sm text-slate-600">
              Email opened: <span className="font-medium text-slate-950">{formatDateTime(event.emailOpenedAt)}</span>
            </p>
          ) : null}

          {event.emailClickedAt ? (
            <p className="mt-2 text-sm text-slate-600">
              Portal link clicked: <span className="font-medium text-slate-950">{formatDateTime(event.emailClickedAt)}</span>
            </p>
          ) : null}

          {event.eventNote ? (
            <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 text-sm leading-6 text-slate-700">
              {event.eventNote}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
