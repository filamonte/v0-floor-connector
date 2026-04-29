import type {
  Contact,
  Opportunity,
  OpportunityAttachment,
  OpportunityObservation,
  OpportunityMeasurement,
  OpportunityStatus
} from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
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

type MeasurementRow = {
  areaLabel: string;
  measurementType: string;
  valueNumeric: string;
  unit: string;
  quantity: string;
  captureMethod: string;
  notes: string;
};

type ObservationRow = {
  observationType: string;
  title: string;
  body: string;
  severity: string;
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

function buildMeasurementRows(
  measurements: OpportunityMeasurement[] | undefined
): MeasurementRow[] {
  const seeded =
    measurements?.map((measurement) => ({
      areaLabel: measurement.areaLabel ?? "",
      measurementType: measurement.measurementType,
      valueNumeric: measurement.valueNumeric,
      unit: measurement.unit,
      quantity:
        measurement.quantity === null ? "" : String(measurement.quantity),
      captureMethod: measurement.captureMethod ?? "",
      notes: measurement.notes ?? ""
    })) ?? [];

  while (seeded.length < 3) {
    seeded.push({
      areaLabel: "",
      measurementType: "",
      valueNumeric: "",
      unit: "",
      quantity: "",
      captureMethod: "",
      notes: ""
    });
  }

  return seeded;
}

function buildObservationRows(
  observations: OpportunityObservation[] | undefined
): ObservationRow[] {
  const seeded =
    observations?.map((observation) => ({
      observationType: observation.observationType,
      title: observation.title,
      body: observation.body ?? "",
      severity: observation.severity ?? ""
    })) ?? [];

  while (seeded.length < 3) {
    seeded.push({
      observationType: "",
      title: "",
      body: "",
      severity: ""
    });
  }

  return seeded;
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
  const measurementRows = buildMeasurementRows(opportunity?.measurements);
  const observationRows = buildObservationRows(opportunity?.observations);
  const attachmentRows = buildAttachmentRows(opportunity?.attachments);

  return (
    <form action={action} className="space-y-8">
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
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={opportunity?.status ?? "new"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Primary Contact
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
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
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Site and Request
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
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
            label="Postal code"
            name="postalCode"
            defaultValue={getValue(opportunity?.postalCode)}
            placeholder="28202"
          />
          <AuthField
            label="Country code"
            name="countryCode"
            defaultValue={getValue(opportunity?.countryCode)}
            placeholder="US"
            hint="Use a two-letter country code when available."
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

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Measurements
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Save structured measurement facts here instead of burying quantities
            inside notes.
          </p>
        </div>
        <div className="space-y-4">
          {measurementRows.map((measurement, index) => (
            <div
              key={`measurement-${index}`}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3"
            >
              <AuthField
                label="Area label"
                name="measurementAreaLabel"
                defaultValue={measurement.areaLabel}
                placeholder="Main slab"
              />
              <AuthField
                label="Measurement type"
                name="measurementType"
                defaultValue={measurement.measurementType}
                placeholder="square_footage"
              />
              <AuthField
                label="Value"
                name="measurementValue"
                defaultValue={measurement.valueNumeric}
                placeholder="1200"
              />
              <AuthField
                label="Unit"
                name="measurementUnit"
                defaultValue={measurement.unit}
                placeholder="sq_ft"
              />
              <AuthField
                label="Quantity"
                name="measurementQuantity"
                defaultValue={measurement.quantity}
                placeholder="1"
              />
              <AuthField
                label="Capture method"
                name="measurementCaptureMethod"
                defaultValue={measurement.captureMethod}
                placeholder="manual, onsite, photo_derived"
              />
              <div className="md:col-span-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Measurement notes
                  </span>
                  <textarea
                    name="measurementNotes"
                    defaultValue={measurement.notes}
                    rows={2}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    placeholder="Optional context for this measurement"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Observations
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Capture structured pre-sale observations for estimator review and later
            automation.
          </p>
        </div>
        <div className="space-y-4">
          {observationRows.map((observation, index) => (
            <div
              key={`observation-${index}`}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2"
            >
              <AuthField
                label="Observation type"
                name="observationType"
                defaultValue={observation.observationType}
                placeholder="substrate, access, damage"
              />
              <AuthField
                label="Severity"
                name="observationSeverity"
                defaultValue={observation.severity}
                placeholder="low, medium, high"
              />
              <div className="md:col-span-2">
                <AuthField
                  label="Observation title"
                  name="observationTitle"
                  defaultValue={observation.title}
                  placeholder="Existing coating is peeling near north wall"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Observation details
                  </span>
                  <textarea
                    name="observationBody"
                    defaultValue={observation.body}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    placeholder="Describe the condition, risk, customer request, or estimator note"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Linked Photos and Files
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Attach intake evidence as linked records instead of hiding file context
            inside notes.
          </p>
        </div>
        <div className="space-y-4">
          {attachmentRows.map((attachment, index) => (
            <div
              key={`attachment-${index}`}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Attachment type
                </span>
                <select
                  name="attachmentType"
                  defaultValue={attachment.attachmentType}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Requirements summary
          </span>
          <textarea
            name="requirementsSummary"
            defaultValue={getValue(opportunity?.requirementsSummary)}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="High-level scope summary for estimator and handoff review"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Notes</span>
          <textarea
            name="notes"
            defaultValue={getValue(opportunity?.notes)}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Internal summary only. Structured intake should live in the sections above."
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[200px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Leads stay scoped to the active organization automatically.
        </p>
      </div>
    </form>
  );
}
