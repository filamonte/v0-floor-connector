import type { CustomerContactListItem } from "@/lib/contacts/data";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type CustomerContactFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customerId: string;
  customerContact?: CustomerContactListItem;
  returnTo?: string;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

export function CustomerContactForm({
  action,
  customerId,
  customerContact,
  returnTo
}: CustomerContactFormProps) {
  const contact = customerContact?.contact;
  const isEditing = Boolean(customerContact);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="customerId" value={customerId} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {customerContact ? (
        <input type="hidden" name="customerContactId" value={customerContact.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Contact name"
          name="displayName"
          defaultValue={contact?.displayName ?? ""}
          placeholder="Jordan Reyes"
          required
        />
        <AuthField
          label="Relationship"
          name="relationshipLabel"
          defaultValue={getValue(customerContact?.relationshipLabel)}
          placeholder="Billing contact"
          hint="Keep this label customer-account specific."
        />
        <AuthField
          label="Company"
          name="companyName"
          defaultValue={getValue(contact?.companyName)}
          placeholder="Acme Property Group"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          defaultValue={getValue(contact?.email)}
          placeholder="contact@example.com"
        />
        <AuthField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={getValue(contact?.phone)}
          placeholder="(555) 555-0123"
          hint="Example: (555) 555-5555. Common phone formats are okay."
        />
      </div>

      {!isEditing ? (
        <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
          <input
            type="checkbox"
            name="setAsMainContact"
            defaultChecked={false}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Set as the main customer contact
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              The main contact stays distinct from the account-level customer email, which still drives estimate and billing recipient continuity in this phase.
            </span>
          </span>
        </label>
      ) : null}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton
          pendingLabel={
            isEditing ? "Saving contact..." : "Adding customer contact..."
          }
          className="sm:min-w-[220px]"
        >
          <span>{isEditing ? "Save contact" : "Add customer contact"}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          These are related contacts beneath the canonical customer account, not replacement customer records.
        </p>
      </div>
    </form>
  );
}
