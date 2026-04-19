import type { Vendor } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type VendorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  vendor?: Vendor | null;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

export function VendorForm({
  action,
  submitLabel,
  pendingLabel,
  vendor
}: VendorFormProps) {
  return (
    <form action={action} className="space-y-5">
      {vendor ? <input type="hidden" name="vendorId" value={vendor.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Vendor name"
          name="name"
          defaultValue={vendor?.name ?? ""}
          placeholder="Precision Surface Pros"
          hint="Use the company or subcontract business name."
          required
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Vendor type
          </span>
          <select
            name="vendorType"
            defaultValue={vendor?.vendorType ?? "subcontractor"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="subcontractor">Subcontractor</option>
            <option value="supplier">Supplier</option>
            <option value="other">Other</option>
          </select>
        </label>
        <AuthField
          label="Primary contact"
          name="primaryContactName"
          defaultValue={getValue(vendor?.primaryContactName)}
          placeholder="Maya Chen"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          defaultValue={getValue(vendor?.email)}
          placeholder="ops@vendorco.com"
        />
        <AuthField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={getValue(vendor?.phone)}
          placeholder="(555) 555-0188"
        />
        <AuthField
          label="Tax identifier last four"
          name="taxIdentifierLast4"
          defaultValue={getValue(vendor?.taxIdentifierLast4)}
          placeholder="1234"
        />
        <AuthField
          label="Address line 1"
          name="addressLine1"
          defaultValue={getValue(vendor?.addressLine1)}
          placeholder="100 Service Lane"
        />
        <AuthField
          label="Address line 2"
          name="addressLine2"
          defaultValue={getValue(vendor?.addressLine2)}
          placeholder="Suite B"
        />
        <AuthField
          label="City"
          name="city"
          defaultValue={getValue(vendor?.city)}
          placeholder="Charlotte"
        />
        <AuthField
          label="State / region"
          name="stateRegion"
          defaultValue={getValue(vendor?.stateRegion)}
          placeholder="NC"
        />
        <AuthField
          label="Postal code"
          name="postalCode"
          defaultValue={getValue(vendor?.postalCode)}
          placeholder="28202"
        />
        <AuthField
          label="Country code"
          name="countryCode"
          defaultValue={getValue(vendor?.countryCode)}
          placeholder="US"
          hint="Use a two-letter country code when available."
        />
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-slate-950">Operational flags</p>
          <p className="text-sm leading-6 text-slate-600">
            These flags determine whether the vendor can supply subcontract labor participants and remain part of the active contractor roster.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
            <input
              type="checkbox"
              name="isLaborProvider"
              defaultChecked={vendor?.isLaborProvider ?? false}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Labor provider
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Enable this when the vendor can supply subcontractor workers through the shared people model.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={vendor?.isActive ?? true}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Active vendor
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Inactive vendors stay historical but should not represent current operating partners.
              </span>
            </span>
          </label>
        </div>
      </section>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(vendor?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional internal notes about this vendor"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[220px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Vendors stay organization-scoped and can optionally supply subcontract labor through linked workforce people.
        </p>
      </div>
    </form>
  );
}
