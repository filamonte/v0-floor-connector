import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { EXECUTION_ATTACHMENT_MAX_FILE_SIZE_BYTES } from "@/lib/execution-attachments/storage";

type ExecutionAttachmentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  dailyLogId: string;
  projectId: string;
  jobId?: string | null;
  subjectType: "daily_log" | "field_note";
  subjectId: string;
};

export function ExecutionAttachmentForm({
  action,
  submitLabel,
  pendingLabel,
  dailyLogId,
  projectId,
  jobId,
  subjectType,
  subjectId
}: ExecutionAttachmentFormProps) {
  return (
    <SaveStateForm
      action={action}
      enabled={false}
      resetOnSuccess
      pendingLabel={pendingLabel}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <input type="hidden" name="dailyLogId" value={dailyLogId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="jobId" value={jobId ?? ""} />
      <input type="hidden" name="subjectType" value={subjectType} />
      <input type="hidden" name="subjectId" value={subjectId} />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Evidence file
          </span>
          <input
            type="file"
            name="evidenceFile"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-[4px] file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          />
          <span className="mt-2 block text-sm leading-6 text-slate-500">
            JPG, PNG, WebP, or PDF up to{" "}
            {EXECUTION_ATTACHMENT_MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Caption
          </span>
          <textarea
            name="caption"
            rows={3}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Optional context for why this photo or file matters."
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          variant="secondary"
          className="w-full sm:w-auto sm:min-w-[180px]"
        />
        <p className="text-sm leading-6 text-slate-500">
          Photos or PDFs that support the Daily Job Log stay private to the
          contractor workspace.
        </p>
      </div>
    </SaveStateForm>
  );
}
