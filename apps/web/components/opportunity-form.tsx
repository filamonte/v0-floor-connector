import type { Opportunity, OpportunityStatus } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { opportunityStatusesList } from "@/lib/opportunities/schemas";

type OpportunityFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  opportunity?: Opportunity | null;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function formatStatusLabel(status: OpportunityStatus) {
  return status.replaceAll("_", " ");
}

export function OpportunityForm({
  action,
  submitLabel,
  pendingLabel,
  opportunity
}: OpportunityFormProps) {
  return (
    <form action={action} className="space-y-5">
      {opportunity ? (
        <input type="hidden" name="opportunityId" value={opportunity.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Lead title"
          name="title"
          defaultValue={opportunity?.title ?? ""}
          placeholder="North warehouse epoxy flooring"
          hint="Use a short job or opportunity title."
          required
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={opportunity?.status ?? "new"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          >
            {opportunityStatusesList.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Prospect name"
          name="prospectName"
          defaultValue={opportunity?.prospectName ?? ""}
          placeholder="Jeff Filamonte"
          hint="Primary contact for this opportunity."
          required
        />
        <AuthField
          label="Company name"
          name="prospectCompanyName"
          defaultValue={getValue(opportunity?.prospectCompanyName)}
          placeholder="Danek Flooring Inc"
        />
        <AuthField
          label="Lead source"
          name="source"
          defaultValue={getValue(opportunity?.source)}
          placeholder="Referral, website, repeat customer"
        />
        <AuthField
          label="Service type"
          name="serviceType"
          defaultValue={getValue(opportunity?.serviceType)}
          placeholder="Epoxy, polish, prep, coating"
        />
        <AuthField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={getValue(opportunity?.phone)}
          placeholder="(555) 555-0123"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          defaultValue={getValue(opportunity?.email)}
          placeholder="prospect@example.com"
        />
        <AuthField
          label="Address line 1"
          name="addressLine1"
          defaultValue={getValue(opportunity?.addressLine1)}
          placeholder="123 Main Street"
        />
        <AuthField
          label="Address line 2"
          name="addressLine2"
          defaultValue={getValue(opportunity?.addressLine2)}
          placeholder="Suite 200"
        />
        <AuthField
          label="City"
          name="city"
          defaultValue={getValue(opportunity?.city)}
          placeholder="Charlotte"
        />
        <AuthField
          label="State / region"
          name="stateRegion"
          defaultValue={getValue(opportunity?.stateRegion)}
          placeholder="NC"
        />
        <AuthField
          label="Postal code"
          name="postalCode"
          defaultValue={getValue(opportunity?.postalCode)}
          placeholder="28202"
        />
        <AuthField
          label="Country code"
          name="countryCode"
          defaultValue={getValue(opportunity?.countryCode)}
          placeholder="US"
          hint="Use a two-letter country code when available."
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(opportunity?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Qualification notes, site context, or follow-up details"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[200px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Leads stay scoped to the active organization automatically.
        </p>
      </div>
    </form>
  );
}
