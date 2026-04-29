import type { Customer } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type CustomerFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  customer?: Customer | null;
  defaultRetainagePercentage?: string;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

export function CustomerForm({
  action,
  submitLabel,
  pendingLabel,
  customer,
  defaultRetainagePercentage
}: CustomerFormProps) {
  return (
    <form action={action} className="space-y-5">
      {customer ? <input type="hidden" name="customerId" value={customer.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Customer name"
          name="name"
          defaultValue={customer?.name ?? ""}
          placeholder="Jane Doe"
          hint="Use the primary billing, project, or estimate-recipient contact name."
          required
        />
        <AuthField
          label="Company name"
          name="companyName"
          defaultValue={getValue(customer?.companyName)}
          placeholder="Acme Property Group"
          hint="Optional business or organization name."
        />
        <AuthField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={getValue(customer?.phone)}
          placeholder="(555) 555-0123"
          hint="Use the main customer coordination number for this canonical account."
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          defaultValue={getValue(customer?.email)}
          placeholder="customer@example.com"
          hint="Estimate send and customer-facing billing handoff use this customer email."
        />
        <AuthField
          label="Address line 1"
          name="addressLine1"
          defaultValue={getValue(customer?.addressLine1)}
          placeholder="123 Main Street"
        />
        <AuthField
          label="Address line 2"
          name="addressLine2"
          defaultValue={getValue(customer?.addressLine2)}
          placeholder="Suite 200"
        />
        <AuthField
          label="City"
          name="city"
          defaultValue={getValue(customer?.city)}
          placeholder="Charlotte"
        />
        <AuthField
          label="State / region"
          name="stateRegion"
          defaultValue={getValue(customer?.stateRegion)}
          placeholder="NC"
        />
        <AuthField
          label="Postal code"
          name="postalCode"
          defaultValue={getValue(customer?.postalCode)}
          placeholder="28202"
        />
        <AuthField
          label="Country code"
          name="countryCode"
          defaultValue={getValue(customer?.countryCode)}
          placeholder="US"
          hint="Use a two-letter country code when available."
        />
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-slate-950">Financial defaults</p>
          <p className="text-sm leading-6 text-slate-600">
            These defaults flow into future invoice, contract, and AIA-ready billing behavior.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 md:col-span-2">
            <input
              type="checkbox"
              name="isTaxExempt"
              defaultChecked={customer?.isTaxExempt ?? false}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Customer is tax exempt
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Tax exemption is stored canonically on the customer so downstream financial workflows can reuse it.
              </span>
            </span>
          </label>

          <AuthField
            label="Tax exemption reason"
            name="taxExemptionReason"
            defaultValue={getValue(customer?.taxExemptionReason)}
            placeholder="Resale, nonprofit, government, etc."
          />
          <AuthField
            label="Exemption reference"
            name="taxExemptionReference"
            defaultValue={getValue(customer?.taxExemptionReference)}
            placeholder="Certificate or permit number"
          />
          <AuthField
            label="Exemption expires"
            name="taxExemptionExpiresOn"
            type="date"
            defaultValue={getValue(customer?.taxExemptionExpiresOn)}
          />
          <AuthField
            label="Default retainage %"
            name="retainagePercentageDefault"
            type="number"
            min="0"
            max="100"
            step="0.01"
            defaultValue={
              customer?.retainagePercentageDefault ??
              defaultRetainagePercentage ??
              "0.00"
            }
            hint="Used as the first retainage default for invoices and future SOV workflows."
            required
          />
        </div>
      </section>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(customer?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional internal notes about this customer"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[200px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Customer records are scoped to the active organization automatically and stay separate from workforce People records.
        </p>
      </div>
    </form>
  );
}
