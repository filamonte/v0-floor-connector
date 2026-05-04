"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DetailPanel } from "@/components/detail-panel";
import type {
  EstimateApprovalChecklistItem,
  EstimateApprovalOrchestrationState
} from "@/lib/estimates/approval-orchestration";

type EstimateApprovalNextStepsPanelProps = {
  orchestration: EstimateApprovalOrchestrationState;
  contractAction: (formData: FormData) => void | Promise<void>;
  scheduleOfValuesAction: (formData: FormData) => void | Promise<void>;
  rebuildSnapshotAction?: (formData: FormData) => void | Promise<void>;
  initialOpen?: boolean;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function ChecklistItem({ item }: { item: EstimateApprovalChecklistItem }) {
  return (
    <li
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
        item.ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <p className="font-semibold">{item.label}</p>
      <p className="mt-1 text-sm leading-6 opacity-90">{item.detail}</p>
    </li>
  );
}

export function EstimateApprovalNextStepsPanel({
  orchestration,
  contractAction,
  scheduleOfValuesAction,
  rebuildSnapshotAction,
  initialOpen = false
}: EstimateApprovalNextStepsPanelProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen, orchestration.estimateId, orchestration.approvedSnapshot.id]);

  if (!isOpen) {
    return (
      <div className="rounded-[1.75rem] border border-[#e3d6c7] bg-[#fbf5ee] px-5 py-4 text-sm leading-6 text-[#665446]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a4581a]">
              Approval Next Steps
            </p>
            <p className="mt-2">
              {orchestration.estimateReferenceNumber} is approved. Reopen the next-step panel any
              time to continue contract, schedule-of-values, or estimate-based invoice work.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#d8731f] bg-[#d8731f] px-4 text-sm font-medium text-white transition hover:bg-[#bf6519]"
          >
            Open Next Steps
          </button>
        </div>
      </div>
    );
  }

  const existingContract = orchestration.contract.existingContract;
  const existingInvoice = orchestration.invoice.existingInvoice;

  return (
    <DetailPanel
      title="Approval Next Steps"
      description="Approval is complete. Downstream actions stay manual here, with contract generation still requiring explicit confirmation."
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Contract
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {existingContract ? "Existing contract found" : "Manual confirmation required"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {existingContract
                ? `${existingContract.title} is already on the approved estimate chain.`
                : "Contract generation uses approved snapshot data only and will never auto-run from approval."}
            </p>
            <div className="mt-4">
              {existingContract ? (
                <Link
                  href={`/contracts/${existingContract.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Open Existing Contract
                </Link>
              ) : orchestration.contract.canCreate ? (
                <form action={contractAction}>
                  <input type="hidden" name="estimateId" value={orchestration.estimateId} />
                  {orchestration.contract.template ? (
                    <input
                      type="hidden"
                      name="templateId"
                      value={orchestration.contract.template.id}
                    />
                  ) : null}
                  <AuthSubmitButton pendingLabel="Generating contract...">
                    <span>Generate Contract</span>
                  </AuthSubmitButton>
                </form>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-400"
                >
                  Generate Contract
                </button>
              )}
            </div>
            {orchestration.contract.template ? (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Template: {orchestration.contract.template.name}
              </p>
            ) : null}
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Schedule Of Values
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {orchestration.scheduleOfValues.exists ? "Already provisioned" : "Missing foundation"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Approved estimates usually auto-create the SOV foundation. This action only opens it
              when present or recovers it if something is missing.
            </p>
            <div className="mt-4">
              {orchestration.scheduleOfValues.exists &&
              orchestration.scheduleOfValues.scheduleOfValuesId ? (
                <Link
                  href={`/progress-billing/${orchestration.scheduleOfValues.scheduleOfValuesId}`}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Open Schedule of Values
                </Link>
              ) : (
                <form action={scheduleOfValuesAction}>
                  <input type="hidden" name="estimateId" value={orchestration.estimateId} />
                  <AuthSubmitButton pendingLabel="Opening schedule of values...">
                    <span>Create Schedule of Values</span>
                  </AuthSubmitButton>
                </form>
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Billing Readiness
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {existingInvoice ? "Existing invoice found" : "Continue downstream first"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {orchestration.invoice.safetySummary}
            </p>
            <div className="mt-4">
              {existingInvoice ? (
                <Link
                  href={`/invoices/${existingInvoice.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Open Existing Estimate-Based Invoice
                </Link>
              ) : (
                <Link
                  href={
                    existingContract
                      ? `/contracts/${existingContract.id}`
                      : `/projects/${orchestration.projectId}`
                  }
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  {existingContract ? "Open Contract" : "Open Project Readiness"}
                </Link>
              )}
            </div>
          </section>
        </div>

        {!orchestration.contract.canCreate ? (
          <section className="space-y-4 rounded-[1.75rem] border border-[#eadfce] bg-[#fff8f1] p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a4581a]">
                Contract Checklist
              </p>
              <p className="mt-2 text-sm leading-6 text-[#665446]">
                Contract generation stays blocked until every required approved-estimate input is
                ready.
              </p>
            </div>
            {orchestration.contract.snapshotMissing ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                <p className="font-semibold">
                  This approved estimate is missing its approval snapshot.
                </p>
                <p className="mt-1">
                  Rebuild the approval snapshot before generating a contract.
                </p>
                {rebuildSnapshotAction ? (
                  <form action={rebuildSnapshotAction} className="mt-3">
                    <input type="hidden" name="estimateId" value={orchestration.estimateId} />
                    <AuthSubmitButton pendingLabel="Rebuilding snapshot...">
                      <span>Rebuild Approval Snapshot</span>
                    </AuthSubmitButton>
                  </form>
                ) : null}
              </div>
            ) : null}
            <ul className="grid gap-3 lg:grid-cols-2">
              {orchestration.contract.checklist.map((item) => (
                <ChecklistItem key={item.key} item={item} />
              ))}
            </ul>
          </section>
        ) : null}

        {(orchestration.existingRecords.contracts.length > 0 ||
          orchestration.existingRecords.invoices.length > 0) ? (
          <section className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Existing Downstream Records
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Approval did not auto-run anything, but these records are already connected to the
                same estimate.
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {orchestration.existingRecords.contracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="font-semibold text-slate-950">{contract.title}</p>
                  <p className="mt-1 capitalize">{formatStatusLabel(contract.status)}</p>
                </Link>
              ))}
              {orchestration.existingRecords.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="font-semibold text-slate-950">{invoice.referenceNumber}</p>
                  <p className="mt-1 capitalize">
                    {formatStatusLabel(invoice.status)} | {formatStatusLabel(invoice.workflowRole)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Do Later
          </button>
        </div>
      </div>
    </DetailPanel>
  );
}
