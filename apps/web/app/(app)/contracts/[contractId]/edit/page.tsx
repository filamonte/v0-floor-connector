import { notFound, redirect } from "next/navigation";

import { ContractEditForm } from "@/components/contract-edit-form";
import {
  RecordWorkspaceShell,
  type RecordWorkspaceStage
} from "@/components/record-workspace-shell";
import { updateContractDraftAction } from "@/lib/contracts/actions";
import { getContractById } from "@/lib/contracts/data";

type ContractEditPageProps = {
  params: Promise<{
    contractId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function buildStages(status: string): RecordWorkspaceStage[] {
  return [
    { label: "Draft", tone: status === "draft" ? "active" : "complete" },
    {
      label: "Sent",
      tone:
        status === "sent" || status === "viewed"
          ? "active"
          : status === "signed"
            ? "complete"
            : "pending"
    },
    {
      label: "Signed",
      tone: status === "signed" ? "complete" : "pending"
    }
  ];
}

export default async function ContractEditPage({
  params,
  searchParams
}: ContractEditPageProps) {
  const { contractId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const contract = await getContractById(contractId, `/contracts/${contractId}/edit`);

  if (!contract) {
    notFound();
  }

  if (!contract.isEditable) {
    const search = new URLSearchParams();
    search.set("error", "This contract is locked and can no longer be edited.");
    redirect(`/contracts/${contract.id}?${search.toString()}`);
  }

  return (
    <RecordWorkspaceShell
      backHref="/contracts"
      backLabel="Back"
      title={contract.title}
      subtitle={
        contract.customer?.name
          ? `Contract workspace for ${contract.customer.name}.`
          : "Contract workspace aligned to the same shared commercial lifecycle."
      }
      referenceLabel="Contract"
      referenceValue={contract.generatedFromEstimateReference ?? contract.id}
      statusBadge={contract.status.replaceAll("_", " ")}
      stages={buildStages(contract.status)}
      sections={[
        { id: "details", label: "Details" },
        { id: "terms", label: "Terms" },
        { id: "signers-approval", label: "Signers / Approval" },
        { id: "files", label: "Files" },
        { id: "notes", label: "Notes" },
        { id: "review-send", label: "Review / Send" }
      ]}
      footerActionLabel="Review and Send"
      footerActionHref={`/contracts/${contract.id}`}
      footerMeta={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>Created {new Date(contract.createdAt).toLocaleDateString()}</span>
          <span>Updated {new Date(contract.updatedAt).toLocaleDateString()}</span>
          <span>Signature readiness {contract.signatureReadinessStatus.replaceAll("_", " ")}</span>
        </div>
      }
    >
      {resolvedSearchParams.error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <ContractEditForm action={updateContractDraftAction} contract={contract} />
    </RecordWorkspaceShell>
  );
}
