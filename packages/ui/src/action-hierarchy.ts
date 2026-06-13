export const primaryActionClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-[4px] border border-[#005eb8] bg-[#005eb8] px-3 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.16)_inset] transition hover:border-[#004f9e] hover:bg-[#004f9e]";

export const secondaryActionClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-[4px] border border-[#c7d2e2] bg-white px-3 text-sm font-medium text-[#0f172a] transition hover:border-[#005eb8] hover:bg-[#eef6ff] hover:text-[#003d7c]";

export const overflowActionClassName =
  "block w-full px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]";

export type EmptyStateKind =
  | "noRecords"
  | "missingUpstream"
  | "waitingOnCustomer"
  | "waitingOnPayment"
  | "waitingOnSignature"
  | "readyNotScheduled";

export type EmptyStateCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export const emptyStateCopyByKind: Record<EmptyStateKind, EmptyStateCopy> = {
  noRecords: {
    eyebrow: "No records",
    title: "Nothing is recorded here yet",
    description:
      "Create the canonical record first, then use the owning workspace for follow-through."
  },
  missingUpstream: {
    eyebrow: "Missing prerequisite",
    title: "An upstream step is still required",
    description:
      "Complete the source record or handoff step before this workspace can move forward."
  },
  waitingOnCustomer: {
    eyebrow: "Waiting on customer",
    title: "Customer action is still pending",
    description:
      "Keep the record visible, but do not advance workflow state until customer action is recorded."
  },
  waitingOnPayment: {
    eyebrow: "Waiting on payment",
    title: "Payment evidence is still pending",
    description:
      "Use the canonical invoice and payment records before treating this work as financially clear."
  },
  waitingOnSignature: {
    eyebrow: "Waiting on signature",
    title: "Signature is still pending",
    description:
      "Use the contract workspace for signature follow-through before downstream handoff."
  },
  readyNotScheduled: {
    eyebrow: "Ready, not scheduled",
    title: "This work is ready for scheduling",
    description:
      "Route scheduling action to the schedule or job workspace without creating a local queue."
  }
};

export function getEmptyStateCopy(kind: EmptyStateKind) {
  return emptyStateCopyByKind[kind];
}
