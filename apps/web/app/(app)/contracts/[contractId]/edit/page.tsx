import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ContractEditForm } from "@/components/contract-edit-form";
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Edit Contract
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {contract.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Make light pre-sign adjustments to the generated contract content. Canonical project, customer, and estimate links stay intact.
          </p>
        </div>

        <Link
          href={`/contracts/${contract.id}`}
          className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          Back to contract
        </Link>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <ContractEditForm
          action={updateContractDraftAction}
          contract={contract}
        />
      </section>
    </div>
  );
}
