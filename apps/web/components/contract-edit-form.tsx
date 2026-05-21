"use client";

import type { Contract } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

type ContractEditFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  contract: Pick<
    Contract,
    "id" | "title" | "renderedSubject" | "renderedContent"
  >;
};

export function ContractEditForm({ action, contract }: ContractEditFormProps) {
  return (
    <SaveStateForm action={action} pendingLabel="Saving..." className="space-y-5">
      <input type="hidden" name="contractId" value={contract.id} />

      <section
        id="details"
        className="rounded-[24px] border border-[var(--border-warm)] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(34,26,20,0.35)]"
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
        className="rounded-[24px] border border-[var(--border-warm)] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(34,26,20,0.35)]"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Contract content
          </span>
          <textarea
            name="renderedContent"
            defaultValue={contract.renderedContent}
            rows={18}
            className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-7 text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
            required
          />
          <span className="mt-2 block text-xs leading-5 text-[var(--text-secondary)]">
            Keep this focused on practical pre-sign edits. Canonical project, customer, and estimate links remain unchanged.
          </span>
        </label>
      </section>

      <section
        id="signers-approval"
        className="rounded-[24px] border border-[var(--border-warm)] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(34,26,20,0.35)]"
      >
        <p className="text-sm font-semibold text-[var(--text-primary)]">Signers / Approval</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Customer signers, internal approval, and signature readiness stay on the canonical contract record. This edit workspace keeps them visible as part of the same lifecycle without creating a detached approval model.
        </p>
      </section>

      <section
        id="files"
        className="rounded-[24px] border border-[var(--border-warm)] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(34,26,20,0.35)]"
      >
        <p className="text-sm font-semibold text-[var(--text-primary)]">Files</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Contract file attachments will remain tied to the same shared contract record. This slice keeps the section structure aligned to CF without introducing parallel file persistence.
        </p>
      </section>

      <section
        id="notes"
        className="rounded-[24px] border border-[var(--border-warm)] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(34,26,20,0.35)]"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Edit summary
          </span>
          <input
            name="editSummary"
            type="text"
            maxLength={255}
            className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
            placeholder="Optional note about what changed"
          />
          <span className="mt-2 block text-xs leading-5 text-[var(--text-secondary)]">
            Saved as part of the lightweight revision history for this draft contract.
          </span>
        </label>
      </section>

      <section
        id="review-send"
        className="rounded-[24px] border border-[var(--border-warm)] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(34,26,20,0.35)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SaveStateSubmitButton
            submitLabel="Save contract"
            pendingLabel="Saving..."
            className="sm:min-w-[220px]"
          />
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Draft edits remain available only until signature activity begins.
          </p>
        </div>
      </section>
    </SaveStateForm>
  );
}
