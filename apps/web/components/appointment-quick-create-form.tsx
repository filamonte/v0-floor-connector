"use client";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type AppointmentQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function AppointmentQuickCreateForm({ action }: AppointmentQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create appointment"
        description="Schedule an appointment with a subject, date, and time. Attendees, reminders, and location details can be added in the full scheduling workspace."
        footer="This creates a real appointment record that will appear in your calendar and dashboard."
      >
        <div className="space-y-4">
          <AuthField
            label="Subject"
            name="subject"
            placeholder="Client meeting - Project walkthrough"
            hint="Brief title for the appointment."
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Date"
              name="date"
              type="date"
              hint="When is the appointment?"
              required
            />

            <AuthField
              label="Time"
              name="time"
              type="time"
              hint="Start time for the appointment."
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Duration"
              name="duration"
              as="select"
              hint="Expected length of the appointment."
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </AuthField>

            <AuthField
              label="Type"
              name="type"
              as="select"
              hint="What kind of appointment is this?"
            >
              <option value="meeting">Meeting</option>
              <option value="site-visit">Site Visit</option>
              <option value="phone-call">Phone Call</option>
              <option value="video-call">Video Call</option>
              <option value="other">Other</option>
            </AuthField>
          </div>

          <AuthField
            label="Notes"
            name="notes"
            as="textarea"
            placeholder="Meeting agenda, location details, preparation needed..."
            hint="Optional notes about the appointment."
          />
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating appointment..." className="w-full">
          <span>Create appointment</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
