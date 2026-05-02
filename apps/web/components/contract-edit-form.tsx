"use client";

import type { Contract } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type ContractEditFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  contract: Pick<
    Contract,
    "id" | "title" | "renderedSubject" | "renderedContent"
  >;
};

export function ContractEditForm({ action, contract }: ContractEditFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="contractId" value={contract.id} />

      <section
        id="details"
        className="rounded-[24px] border border-[#d6d6d6] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AuthField
            label="Title"
            name="title"
            defaultValue={contract.title}
            required
          />
          <AuthField
            label="Rendered subject"
            name="renderedSubject"
            defaultValue={contract.renderedSubject ?? ""}
            placeholder="Optional contract subject"
          />
        </div>
      </section>

      <section
        id="terms"
        className="rounded-[24px] border border-[#d6d6d6] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Contract content
          </span>
          <textarea
            name="renderedContent"
            defaultValue={contract.renderedContent}
            rows={18}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          />
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            Keep this focused on practical pre-sign edits. Canonical project, customer, and estimate links remain unchanged.
          </span>
        </label>
      </section>

      <section
        id="signers-approval"
        className="rounded-[24px] border border-[#d6d6d6] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]"
      >
        <p className="text-sm font-semibold text-slate-900">Signers / Approval</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Customer signers, internal approval, and signature readiness stay on the canonical contract record. This edit workspace keeps them visible as part of the same lifecycle without creating a detached approval model.
        </p>
      </section>

      <section
        id="files"
        className="rounded-[24px] border border-[#d6d6d6] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]"
      >
        <p className="text-sm font-semibold text-slate-900">Files</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Contract file attachments will remain tied to the same shared contract record. This slice keeps the section structure aligned to CF without introducing parallel file persistence.
        </p>
      </section>

      <section
        id="notes"
        className="rounded-[24px] border border-[#d6d6d6] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Edit summary
          </span>
          <input
            name="editSummary"
            type="text"
            maxLength={255}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Optional note about what changed"
          />
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            Saved as part of the lightweight revision history for this draft contract.
          </span>
        </label>
      </section>

      <section
        id="review-send"
        className="rounded-[24px] border border-[#d6d6d6] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AuthSubmitButton pendingLabel="Saving contract..." className="sm:min-w-[220px]">
            <span>Save contract</span>
          </AuthSubmitButton>
          <p className="text-sm leading-6 text-slate-500">
            Draft edits remain available only until signature activity begins.
          </p>
        </div>
      </section>
    </form>
  );
}
