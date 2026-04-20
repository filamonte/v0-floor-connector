"use client";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type InvoicePaymentFormProps = {
  invoiceId: string;
  action: (formData: FormData) => void | Promise<void>;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function InvoicePaymentForm({
  invoiceId,
  action
}: InvoicePaymentFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="invoiceId" value={invoiceId} />

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Payment Date*"
          name="paymentDate"
          type="date"
          defaultValue={getTodayDate()}
          required
        />
        <AuthField
          label="Amount*"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="$0.00"
          required
        />
        <AuthField
          label="Payment Type*"
          name="paymentMethod"
          type="text"
          placeholder="Check, ACH, card, cash"
          required
        />
        <AuthField
          label="Payment Status*"
          name="status"
          type="text"
          placeholder="Received"
          defaultValue="Received"
        />
        <AuthField
          label="Invoice #*"
          name="reference"
          type="text"
          placeholder="Select an Unpaid Invoice"
        />
        <AuthField
          label="Deposit to"
          name="depositTo"
          type="text"
          placeholder="Select account"
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-neutral-800">
          Payment Notes
        </span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
          placeholder="Optional payment notes"
        />
      </label>

      <AuthSubmitButton pendingLabel="Applying..." className="w-full">
        <span>Apply</span>
      </AuthSubmitButton>
    </form>
  );
}
