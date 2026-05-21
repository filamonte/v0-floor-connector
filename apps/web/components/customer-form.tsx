import type { Customer } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { CountryComboboxField } from "@/components/country-combobox-field";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

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
    <SaveStateForm
      action={action}
      enabled={Boolean(customer)}
      pendingLabel={pendingLabel}
      className="space-y-5"
    >
      {customer ? <input type="hidden" name="customerId" value={customer.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Customer name"
          name="name"
          defaultValue={customer?.name ?? ""}
          placeholder="Jane Doe"
          hint={
            customer
              ? "This remains the customer account name. Manage additional contacts in People."
              : "This person becomes the primary customer contact. Additional contacts can be managed in People."
          }
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
          hint="Example: (555) 555-5555. Common phone formats are okay."
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          defaultValue={getValue(customer?.email)}
          placeholder="customer@example.com"
          hint="Portal access is granted to contacts, not just customer accounts."
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
          label="ZIP / postal code"
          name="postalCode"
          defaultValue={getValue(customer?.postalCode)}
          placeholder="28202"
        />
        <CountryComboboxField
          name="countryCode"
          defaultValue={getValue(customer?.countryCode)}
        />
      </div>

      <section className="rounded-[1.75rem] border border-[var(--border-warm)] bg-[var(--highlight)] p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-[var(--text-primary)]">Financial defaults</p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            These defaults flow into future invoice, contract, and AIA-ready billing behavior.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--border-warm)] bg-white px-4 py-4 md:col-span-2">
            <input
              type="checkbox"
              name="isTaxExempt"
              defaultChecked={customer?.isTaxExempt ?? false}
              className="mt-1 h-4 w-4 rounded border-[var(--border-warm)] text-[var(--copper)] focus:ring-[var(--copper)]/20"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--text-primary)]">
                Customer is tax exempt
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">
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
        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(customer?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
          placeholder="Optional internal notes about this customer"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          className="sm:min-w-[200px]"
        />
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Customer records are scoped to the active organization automatically and stay separate from workforce People records.
        </p>
      </div>
    </SaveStateForm>
  );
}
