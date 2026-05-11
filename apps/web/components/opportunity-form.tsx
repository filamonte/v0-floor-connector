import type {
  Contact,
  Opportunity,
  OpportunityAttachment,
  OpportunityMeasurement,
  OpportunityObservation,
  OpportunityStatus
} from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { CountryComboboxField } from "@/components/country-combobox-field";
import { OpportunityStructuredIntakeFields } from "@/components/opportunity-structured-intake-fields";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { opportunityStatusesList } from "@/lib/opportunities/schemas";

type OpportunityFormOpportunity = Opportunity & {
  primaryContact?: Contact | null;
  measurements?: OpportunityMeasurement[];
  observations?: OpportunityObservation[];
  attachments?: OpportunityAttachment[];
};

type OpportunityFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  opportunity?: OpportunityFormOpportunity | null;
};

type AttachmentRow = {
  attachmentType: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  caption: string;
  tag: string;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function getDateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function formatStatusLabel(status: OpportunityStatus) {
  return status.replaceAll("_", " ");
}

function buildAttachmentRows(
  attachments: OpportunityAttachment[] | undefined
): AttachmentRow[] {
  const seeded =
    attachments?.map((attachment) => ({
      attachmentType: attachment.attachmentType,
      storagePath: attachment.storagePath,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      caption: attachment.caption ?? "",
      tag: attachment.tag ?? ""
    })) ?? [];

  while (seeded.length < 2) {
    seeded.push({
      attachmentType: "file",
      storagePath: "",
      fileName: "",
      mimeType: "",
      caption: "",
      tag: ""
    });
  }

  return seeded;
}

export function OpportunityForm({
  action,
  submitLabel,
  pendingLabel,
  opportunity
}: OpportunityFormProps) {
  const attachmentRows = buildAttachmentRows(opportunity?.attachments);

  return (
    <SaveStateForm
      action={action}
      enabled={Boolean(opportunity)}
      pendingLabel={pendingLabel}
      className="space-y-8"
    >
      {opportunity ? (
        <input type="hidden" name="opportunityId" value={opportunity.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Display title override"
          name="title"
          defaultValue={opportunity?.title ?? ""}
          placeholder="Optional manual display title"
          hint="Leave blank to auto-generate the lead title from the contact, job type, and site."
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Status
          </span>
          <select
            name="status"
            defaultValue={opportunity?.status ?? "new"}
            className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
            required
          >
            {opportunityStatusesList.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
            Primary Contact
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            The opportunity links to a real contact record. Once this lead creates or links a
            canonical customer, safe email updates can sync forward there, and downstream estimate
            send uses the customer record instead of a workforce person.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AuthField
            label="Contact name"
            name="contactName"
            defaultValue={
              opportunity?.primaryContact?.displayName ??
              opportunity?.prospectName ??
              ""
            }
            placeholder="Jeff Filamonte"
            required
          />
          <AuthField
            label="Company name"
            name="contactCompanyName"
            defaultValue={
              opportunity?.primaryContact?.companyName ??
              opportunity?.prospectCompanyName ??
              ""
            }
            placeholder="Danek Flooring Inc"
          />
          <AuthField
            label="Email"
            name="email"
            type="email"
            defaultValue={
              opportunity?.primaryContact?.email ?? opportunity?.email ?? ""
            }
            placeholder="prospect@example.com"
          />
          <AuthField
            label="Phone"
            name="contactPhone"
            type="tel"
            defaultValue={
              opportunity?.primaryContact?.phone ?? opportunity?.phone ?? ""
            }
            placeholder="(555) 555-0123"
            hint="Example: (555) 555-5555. Common phone formats are okay."
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
            Site and Request
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Keep the request type, source, and primary site structured so this same
            record can feed estimating and future app intake.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AuthField
            label="Lead source"
            name="source"
            defaultValue={getValue(opportunity?.source)}
            placeholder="Referral, website, repeat customer"
          />
          <AuthField
            label="Service type"
            name="serviceType"
            defaultValue={getValue(opportunity?.serviceType)}
            placeholder="Epoxy, polish, prep, coating"
          />
          <AuthField
            label="Job type"
            name="jobType"
            defaultValue={getValue(opportunity?.jobType)}
            placeholder="Garage coating, warehouse prep, polish restoration"
            hint="Required structured request context."
            required
          />
          <AuthField
            label="Site name"
            name="siteName"
            defaultValue={getValue(opportunity?.siteName)}
            placeholder="North Warehouse"
            hint="Required primary site or location label."
            required
          />
          <AuthField
            label="Address line 1"
            name="addressLine1"
            defaultValue={getValue(opportunity?.addressLine1)}
            placeholder="123 Main Street"
          />
          <AuthField
            label="Address line 2"
            name="addressLine2"
            defaultValue={getValue(opportunity?.addressLine2)}
            placeholder="Suite 200"
          />
          <AuthField
            label="City"
            name="city"
            defaultValue={getValue(opportunity?.city)}
            placeholder="Charlotte"
          />
          <AuthField
            label="State / region"
            name="stateRegion"
            defaultValue={getValue(opportunity?.stateRegion)}
            placeholder="NC"
          />
          <AuthField
            label="ZIP / postal code"
            name="postalCode"
            defaultValue={getValue(opportunity?.postalCode)}
            placeholder="28202"
          />
          <CountryComboboxField
            name="countryCode"
            defaultValue={getValue(opportunity?.countryCode)}
          />
          <AuthField
            label="Assessment scheduled"
            name="siteAssessmentScheduledOn"
            type="date"
            defaultValue={getDateValue(opportunity?.siteAssessmentScheduledAt)}
          />
          <AuthField
            label="Assessment completed"
            name="siteAssessmentCompletedOn"
            type="date"
            defaultValue={getDateValue(opportunity?.siteAssessmentCompletedAt)}
          />
        </div>
      </section>

      <OpportunityStructuredIntakeFields
        measurements={opportunity?.measurements}
        observations={opportunity?.observations}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
            Linked Photos and Files
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Attach intake evidence as linked records instead of hiding file context
            inside notes.
          </p>
        </div>
        <div className="space-y-4">
          {attachmentRows.map((attachment, index) => (
            <div
              key={`attachment-${index}`}
              className="grid gap-4 rounded-2xl border border-[var(--border-warm)] bg-white p-4 md:grid-cols-2"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Attachment type
                </span>
                <select
                  name="attachmentType"
                  defaultValue={attachment.attachmentType}
                  className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
                >
                  <option value="file">File</option>
                  <option value="photo">Photo</option>
                </select>
              </label>
              <AuthField
                label="File name"
                name="attachmentFileName"
                defaultValue={attachment.fileName}
                placeholder="north-wall-photo.jpg"
              />
              <div className="md:col-span-2">
                <AuthField
                  label="Storage path / link"
                  name="attachmentStoragePath"
                  defaultValue={attachment.storagePath}
                  placeholder="opportunities/lead-123/north-wall-photo.jpg"
                />
              </div>
              <AuthField
                label="Mime type"
                name="attachmentMimeType"
                defaultValue={attachment.mimeType}
                placeholder="image/jpeg"
              />
              <AuthField
                label="Tag"
                name="attachmentTag"
                defaultValue={attachment.tag}
                placeholder="jobsite_photo"
              />
              <div className="md:col-span-2">
                <AuthField
                  label="Caption"
                  name="attachmentCaption"
                  defaultValue={attachment.caption}
                  placeholder="North wall showing coating delamination"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Requirements summary
          </span>
          <textarea
            name="requirementsSummary"
            defaultValue={getValue(opportunity?.requirementsSummary)}
            rows={4}
            className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
            placeholder="High-level scope summary for estimator and handoff review"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Notes</span>
          <textarea
            name="notes"
            defaultValue={getValue(opportunity?.notes)}
            rows={4}
            className="w-full rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] focus:ring-4 focus:ring-[var(--copper)]/10"
            placeholder="Internal summary only. Structured intake should live in the sections above."
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          className="sm:min-w-[200px]"
        />
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Leads stay scoped to the active organization automatically.
        </p>
      </div>
    </SaveStateForm>
  );
}
