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
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional payment notes"
        />
      </label>

      <AuthSubmitButton pendingLabel="Recording payment..." className="sm:min-w-[200px]">
        <span>Record payment</span>
      </AuthSubmitButton>
    </form>
  );
}
