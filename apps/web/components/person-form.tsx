import type { Person } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type VendorOption = {
  id: string;
  name: string;
  isLaborProvider: boolean;
};

type MemberOption = {
  userId: string;
  label: string;
};

type PersonFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  person?: Person | null;
  vendors: VendorOption[];
  members: MemberOption[];
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

export function PersonForm({
  action,
  submitLabel,
  pendingLabel,
  person,
  vendors,
  members
}: PersonFormProps) {
  const laborProviderVendors = vendors.filter((vendor) => vendor.isLaborProvider);

  return (
    <form action={action} className="space-y-5">
      {person ? <input type="hidden" name="personId" value={person.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Workforce type
          </span>
          <select
            name="personType"
            defaultValue={person?.personType ?? "employee"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="employee">Employee</option>
            <option value="subcontractor_worker">Subcontractor worker</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Linked app user
          </span>
          <select
            name="membershipUserId"
            defaultValue={person?.membershipUserId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">No linked user</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.label}
              </option>
            ))}
          </select>
        </label>
        <AuthField
          label="Display name"
          name="displayName"
          defaultValue={person?.displayName ?? ""}
          placeholder="Jordan Reyes"
          hint="This is the primary workforce label shown across the contractor app."
          required
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Linked vendor
          </span>
          <select
            name="vendorId"
            defaultValue={person?.vendorId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">No vendor</option>
            {laborProviderVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </label>
        <AuthField
          label="First name"
          name="firstName"
          defaultValue={getValue(person?.firstName)}
          placeholder="Jordan"
        />
        <AuthField
          label="Last name"
          name="lastName"
          defaultValue={getValue(person?.lastName)}
          placeholder="Reyes"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          defaultValue={getValue(person?.email)}
          placeholder="jordan@example.com"
        />
        <AuthField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={getValue(person?.phone)}
          placeholder="(555) 555-0123"
        />
        <AuthField
          label="Job title"
          name="jobTitle"
          defaultValue={getValue(person?.jobTitle)}
          placeholder="Project lead"
        />
        <AuthField
          label="Trade"
          name="trade"
          defaultValue={getValue(person?.trade)}
          placeholder="Epoxy coatings"
        />
        <AuthField
          label="Classification"
          name="classification"
          defaultValue={getValue(person?.classification)}
          placeholder="W-2, 1099, apprentice, foreman, etc."
        />
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-slate-950">Workforce state</p>
          <p className="text-sm leading-6 text-slate-600">
            Keep the labor identity usable for future assignment, time, and compliance work without adding scheduling or payroll logic yet.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
            <input
              type="checkbox"
              name="isAssignable"
              defaultChecked={person?.isAssignable ?? true}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Assignable workforce record
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Keep this on when the person should be available for future project, job, and time allocation.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={person?.isActive ?? true}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Active workforce record
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Inactive people remain historical records but should not represent current labor capacity.
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
          defaultValue={getValue(person?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional internal notes about this workforce record"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[220px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          People stay scoped to the active organization and may optionally link to a labor-provider vendor.
        </p>
      </div>
    </form>
  );
}
