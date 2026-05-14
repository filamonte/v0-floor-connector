import { notFound } from "next/navigation";

import {
  CustomerDocumentHtml,
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentDate,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import { getPortalContractReviewData } from "@/lib/portal/data";

type PortalContractPdfPageProps = {
  params: Promise<{
    contractId: string;
  }>;
};

function formatSignerRole(role: string) {
  return role === "contractor" ? "Contractor countersigner" : "Customer signer";
}

export default async function PortalContractPdfPage({ params }: PortalContractPdfPageProps) {
  const { contractId } = await params;
  const contract = await getPortalContractReviewData(
    contractId,
    `/portal/contracts/${contractId}/pdf`
  );

  if (!contract) {
    notFound();
  }

  return (
    <CustomerDocumentPrintView
      brand={contract.contractorBrand}
      title={contract.title}
      subtitle="Shared contract"
      statusLabel={formatDocumentStatus(contract.status)}
      backHref={`/portal/contracts/${contract.id}`}
      backLabel="Back to contract"
      facts={[
        { label: "Customer", value: contract.customer?.name ?? "Unknown customer" },
        { label: "Project", value: contract.project?.name ?? "Unknown project" },
        { label: "Estimate", value: contract.estimate?.referenceNumber ?? "Not linked" },
        { label: "Sent", value: formatDocumentDate(contract.sentAt) },
        { label: "Signed", value: formatDocumentDate(contract.signedAt) },
        { label: "Status", value: formatDocumentStatus(contract.status) }
      ]}
      footerNote="This PDF/print view is a customer-facing rendering of the shared contract. Signing still happens through the portal contract page."
    >
      <CustomerDocumentSection title="Agreement">
        <CustomerDocumentHtml html={contract.renderedContent} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Signer summary">
        {contract.signers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-warm)] text-left text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <th className="py-2 pr-3 font-semibold">Signer</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="py-2 pl-3 font-semibold">Signed</th>
                </tr>
              </thead>
              <tbody>
                {contract.signers.map((signer) => (
                  <tr key={signer.id} className="border-b border-[var(--border-warm)] align-top">
                    <td className="py-3 pr-3 font-medium text-[var(--text-primary)]">
                      {signer.displayName}
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)]">
                      {formatSignerRole(signer.signerRole)}
                    </td>
                    <td className="px-3 py-3 capitalize text-[var(--text-secondary)]">
                      {formatDocumentStatus(signer.signerStatus)}
                    </td>
                    <td className="py-3 pl-3 text-[var(--text-secondary)]">
                      {formatDocumentDate(signer.signedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">No signer routing is listed.</p>
        )}
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
