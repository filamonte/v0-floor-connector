import { AuthSubmitButton } from "@/components/auth-submit-button";
import type {
  CustomerAppointmentReminderPreferenceDisplayStatus,
  CustomerAppointmentReminderPreferenceSummaryRow
} from "@/lib/communications/customer-communication-preferences-core";

type CustomerCommunicationPreferencesPanelProps = {
  customerId: string;
  preferences: CustomerAppointmentReminderPreferenceSummaryRow[];
  canManage: boolean;
  action: (formData: FormData) => void | Promise<void>;
};

const statusOptions = [
  {
    value: "allowed",
    label: "Allowed"
  },
  {
    value: "opted_out",
    label: "Opted out"
  },
  {
    value: "suppressed",
    label: "Suppressed"
  }
];

function formatStatus(value: CustomerAppointmentReminderPreferenceDisplayStatus) {
  switch (value) {
    case "allowed_by_default":
      return "Allowed by default";
    case "opted_out":
      return "Opted out";
    default:
      return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

function getStatusTone(value: CustomerAppointmentReminderPreferenceDisplayStatus) {
  switch (value) {
    case "opted_out":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "suppressed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

function getRelationshipLabel(row: CustomerAppointmentReminderPreferenceSummaryRow) {
  if (row.subjectType === "customer") {
    return "Account default";
  }

  if (row.isPrimary) {
    return "Main contact";
  }

  return row.relationshipLabel?.replaceAll("_", " ") ?? "Related contact";
}

export function CustomerCommunicationPreferencesPanel({
  customerId,
  preferences,
  canManage,
  action
}: CustomerCommunicationPreferencesPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-5 text-sm leading-6 text-slate-600">
        <p className="font-semibold text-slate-950">Email appointment reminders</p>
        <div className="mt-2 space-y-2">
          <p>
            Missing preference means reminders are allowed by default. Customer-level
            opted out or suppressed blocks all reminder recipients for this customer.
          </p>
          <p>
            Suppressed is contractor/admin controlled. SMS preferences are not managed
            yet, and this does not create automated reminders.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {preferences.map((row) => (
          <section
            key={`${row.subjectType}:${row.subjectId}`}
            className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{row.label}</p>
                  <span
                    className={[
                      "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                      getStatusTone(row.status)
                    ].join(" ")}
                  >
                    {formatStatus(row.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {getRelationshipLabel(row)}
                  {row.email ? ` / ${row.email}` : " / No email on file"}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {row.reason ?? "No reason recorded."}
                </p>
              </div>
            </div>

            {canManage ? (
              <form action={action} className="mt-5 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-end">
                <input type="hidden" name="customerId" value={customerId} />
                <input type="hidden" name="subjectType" value={row.subjectType} />
                <input type="hidden" name="subjectId" value={row.subjectId} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/customers/${customerId}#communication-preferences`}
                />
                <label className="block">
                  <span className="text-sm font-medium text-slate-950">Status</span>
                  <select
                    name="status"
                    defaultValue={row.status === "allowed_by_default" ? "allowed" : row.status}
                    className="mt-2 w-full rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#ef7d32]"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-950">Reason</span>
                  <input
                    name="reason"
                    defaultValue={row.reason ?? ""}
                    maxLength={1000}
                    placeholder="Optional internal reason"
                    className="mt-2 w-full rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#ef7d32]"
                  />
                </label>
                <AuthSubmitButton pendingLabel="Saving..." className="px-4">
                  Save preference
                </AuthSubmitButton>
              </form>
            ) : (
              <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                Contractor admins can update communication preferences.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
