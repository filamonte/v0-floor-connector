"use client";

import type { ReactNode } from "react";

type ActivateCompanyFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  companyId: string;
  children: ReactNode;
};

export function ActivateCompanyForm({
  action,
  companyId,
  children
}: ActivateCompanyFormProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Mark this early-access company active? Active unlocks guarded production actions. Billing or subscription setup still requires a separate operator action unless it is already implemented."
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
