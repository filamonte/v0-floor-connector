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
    <form action={action} className="space-y-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Payment amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          required
        />
        <AuthField
          label="Payment date"
          name="paymentDate"
          type="date"
          defaultValue={getTodayDate()}
          required
        />
        <AuthField
          label="Payment method"
          name="paymentMethod"
          type="text"
          placeholder="Check, ACH, card, cash"
          required
        />
        <AuthField
          label="Reference"
          name="reference"
          type="text"
          placeholder="Check number or transaction id"
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          Notes
        </span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper-light)]/20"
          placeholder="Optional payment notes"
        />
      </label>

      <AuthSubmitButton pendingLabel="Recording payment..." className="sm:min-w-[200px]">
        <span>Record payment</span>
      </AuthSubmitButton>
    </form>
  );
}
