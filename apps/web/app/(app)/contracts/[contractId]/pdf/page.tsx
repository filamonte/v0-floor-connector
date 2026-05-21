import { notFound } from "next/navigation";

import {
  CustomerDocumentHtml,
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentDate,
  formatDocumentStatus,
  type DocumentBrand
} from "@/components/customer-document-print-view";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getContractById } from "@/lib/contracts/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type ContractPdfPageProps = {
  params: Promise<{
    contractId: string;
  }>;
};

function buildDocumentBrand(
  organizationContext: Awaited<ReturnType<typeof getActiveOrganizationContext>>
): DocumentBrand {
  return {
    name: organizationContext?.organization.displayName ?? "FloorConnector",
    logoUrl: organizationContext?.organization.logoUrl,
    phone: organizationContext?.organization.phone,
    email: organizationContext?.organization.email,
    websiteUrl: organizationContext?.organization.websiteUrl,
    accentColor: organizationContext?.organization.brandAccentColor
  };
}

function formatSignerRole(role: string) {
  return role === "contractor" ? "Contractor countersigner" : "Customer signer";
}

export default async function ContractPdfPage({ params }: ContractPdfPageProps) {
  const { contractId } = await params;
  const user = await requireAuthenticatedUser(`/contracts/${contractId}/pdf`);
  const [contract, organizationContext] = await Promise.all([
    getContractById(contractId, `/contracts/${contractId}/pdf`),
    getActiveOrganizationContext(user.id)
  ]);

  if (!contract) {
    notFound();
  }

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentBrand(organizationContext)}
      title={contract.title}
      subtitle={`Contract ${contract.referenceNumber}`}
      statusLabel={formatDocumentStatus(contract.status)}
      backHref={`/contracts/${contract.id}`}
      backLabel="Back to contract"
      facts={[
        { label: "Customer", value: contract.customer?.name ?? "Unknown customer" },
        { label: "Project", value: contract.project?.name ?? "Unknown project" },
        {
          label: "Estimate",
          value: contract.estimate?.referenceNumber ?? contract.generatedFromEstimateReference ?? "Not linked"
        },
        { label: "Sent", value: formatDocumentDate(contract.sentAt) },
        { label: "Signed", value: formatDocumentDate(contract.signedAt) },
        { label: "Status", value: formatDocumentStatus(contract.status) }
      ]}
      footerNote="This PDF/print view is a customer-facing rendering of the shared FloorConnector contract. Signature state remains controlled by the contract signature workflow."
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
                    <td className="py-3 pr-3">
                      <p className="font-medium text-[var(--text-primary)]">{signer.displayName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{signer.email}</p>
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
