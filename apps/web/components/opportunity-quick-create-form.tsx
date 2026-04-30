"use client";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type OpportunityQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

const leadStageOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "site_assessment_scheduled", label: "Site Assessment Scheduled" },
  { value: "site_assessment_complete", label: "Site Assessment Complete" },
  { value: "estimating", label: "Estimating" }
] as const;

export function OpportunityQuickCreateForm({
  action
}: OpportunityQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create lead"
        description="Capture the same intake fields the sales team expects first. FloorConnector will create the canonical contact and lead continuity behind the scenes, then take you into the lead workspace."
        footer="This creates a real opportunity record first. Estimate creation still stays downstream of intake continuity."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AuthField
            label="First Name"
            name="firstName"
            placeholder="Jeff"
            required
          />
          <AuthField
            label="Last Name"
            name="lastName"
            placeholder="Filamonte"
            required
          />
          <div className="md:col-span-2">
            <AuthField
              label="Company Name"
              name="companyName"
              placeholder="Optional company"
            />
          </div>
          <div className="md:col-span-2">
            <AuthField
              label="Address line 1"
              name="addressLine1"
              placeholder="123 Main Street"
              required
            />
          </div>
          <div className="md:col-span-2">
            <AuthField
              label="Address line 2"
              name="addressLine2"
              placeholder="Suite, unit, building, or floor"
            />
          </div>
          <AuthField label="City" name="city" placeholder="Westfield" required />
          <AuthField
            label="State"
            name="stateRegion"
            placeholder="MA"
            maxLength={2}
            autoCapitalize="characters"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.toUpperCase();
            }}
            hint="Use the 2-letter state code."
            required
          />
          <AuthField
            label="ZIP / postal code"
            name="postalCode"
            placeholder="01085"
            required
          />
          <AuthField label="Country" name="countryCode" placeholder="US" />
          <AuthField
            label="Phone Number"
            name="phoneNumber"
            placeholder="(555) 555-0100"
            required
          />
          <AuthField
            label="Cell Phone"
            name="cellPhone"
            placeholder="(555) 555-0101"
            required
          />
          <AuthField
            label="Email"
            name="email"
            type="email"
            placeholder="lead@example.com"
            required
          />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Lead Stage
            </span>
            <select
              name="leadStage"
              defaultValue="new"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            >
              {leadStageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating lead..." className="w-full">
          <span>Create lead</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
