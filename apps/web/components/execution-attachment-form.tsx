import { AuthField } from "@/components/auth-field";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

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
    >
      <input type="hidden" name="dailyLogId" value={dailyLogId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="jobId" value={jobId ?? ""} />
      <input type="hidden" name="subjectType" value={subjectType} />
      <input type="hidden" name="subjectId" value={subjectId} />

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Evidence type
          </span>
          <select
            name="attachmentType"
            defaultValue="file"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="file">File</option>
            <option value="photo">Photo</option>
          </select>
        </label>

        <AuthField
          label="File name"
          name="fileName"
          placeholder="progress-photo-01.jpg"
          required
        />

        <AuthField
          label="MIME type"
          name="mimeType"
          placeholder="image/jpeg"
          required
        />
      </div>

      <AuthField
        label="Storage / file reference"
        name="storagePath"
        placeholder="execution-attachments/project-day/progress-photo-01.jpg or https://..."
        hint="Use the existing storage path or file reference. This does not upload a new file."
        required
      />

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

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          variant="secondary"
          className="w-full sm:w-auto sm:min-w-[180px]"
        />
        <p className="text-sm leading-6 text-slate-500">
          Evidence stays on the Daily Job Log or Job Note itself instead of
          branching into a separate field evidence system.
        </p>
      </div>
    </SaveStateForm>
  );
}
