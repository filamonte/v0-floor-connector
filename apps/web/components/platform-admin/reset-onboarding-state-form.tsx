"use client";

import type { ReactNode } from "react";

type ResetOnboardingStateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  companyId: string;
  companyName: string;
  children: ReactNode;
};

export function ResetOnboardingStateForm({
  action,
  companyId,
  companyName,
  children
}: ResetOnboardingStateFormProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `DEV / TEST ONLY: reset onboarding state for ${companyName}? This clears this tenant's project, estimate, contract, invoice, and related workflow test records.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="companyId" value={companyId} />
      {children}
    </form>
  );
}
