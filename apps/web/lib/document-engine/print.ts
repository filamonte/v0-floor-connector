export type DocumentEngineSubjectType = "estimate" | "contract" | "invoice";

export type DocumentEngineAudience = "contractor" | "portal";

export type DocumentEngineBrandSource = {
  organization?: {
    displayName?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    websiteUrl?: string | null;
    brandAccentColor?: string | null;
  } | null;
} | null;

export type DocumentEngineBrand = {
  name: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  accentColor?: string | null;
};

const documentLabels: Record<DocumentEngineSubjectType, string> = {
  estimate: "estimate",
  contract: "contract",
  invoice: "invoice"
};

export function buildDocumentEngineBrand(
  source: DocumentEngineBrandSource
): DocumentEngineBrand {
  return {
    name: source?.organization?.displayName ?? "FloorConnector",
    logoUrl: source?.organization?.logoUrl,
    phone: source?.organization?.phone,
    email: source?.organization?.email,
    websiteUrl: source?.organization?.websiteUrl,
    accentColor: source?.organization?.brandAccentColor
  };
}

export function getDocumentEngineSubjectLabel(
  subjectType: DocumentEngineSubjectType
) {
  return documentLabels[subjectType];
}

export function buildDocumentPrintHref(input: {
  subjectType: DocumentEngineSubjectType;
  subjectId: string;
  audience?: DocumentEngineAudience;
}) {
  const prefix = input.audience === "portal" ? "/portal" : "";
  const plural = `${input.subjectType}s`;

  return `${prefix}/${plural}/${input.subjectId}/pdf`;
}

export function buildDocumentBackHref(input: {
  subjectType: DocumentEngineSubjectType;
  subjectId: string;
  audience?: DocumentEngineAudience;
}) {
  const prefix = input.audience === "portal" ? "/portal" : "";
  const plural = `${input.subjectType}s`;

  return `${prefix}/${plural}/${input.subjectId}`;
}

export function buildProjectCloseoutPackagePrintHref(projectId: string) {
  return `/projects/${projectId}/closeout-package/pdf`;
}

export function getProjectCloseoutPackageBackHref(projectId: string) {
  return `/projects/${projectId}`;
}

export function buildProjectEvidenceReceiptPrintHref(projectId: string) {
  return `/projects/${projectId}/evidence/receipt`;
}

export function buildPortalProjectEvidenceReceiptPrintHref(projectId: string) {
  return `/portal/projects/${projectId}/evidence/receipt`;
}

export function getProjectEvidenceReceiptBackHref(projectId: string) {
  return `/projects/${projectId}#portal-evidence-sharing`;
}

export function getPortalProjectEvidenceReceiptBackHref(projectId: string) {
  return `/portal/projects/${projectId}#shared-project-evidence`;
}

export function buildCompanyDocumentPrintHref(documentId: string) {
  return `/settings/company-documents/${documentId}/pdf`;
}

export function buildCompanyDocumentBackHref(documentId: string) {
  return `/settings/company-documents/${documentId}`;
}

export function getDocumentEngineExportNotice(
  subjectType: DocumentEngineSubjectType
) {
  const label = getDocumentEngineSubjectLabel(subjectType);

  return `Generated from the current ${label} workspace. Printing or saving this page does not send it to the customer or change delivery, signature, payment, or approval status.`;
}

export function getDocumentEngineFooterNote(
  subjectType: DocumentEngineSubjectType
) {
  const label = getDocumentEngineSubjectLabel(subjectType);

  return `This PDF/print view is a customer-facing rendering of the shared FloorConnector ${label}. It is not delivery proof and does not create a separate document record.`;
}

export function getProjectCloseoutPackageExportNotice() {
  return "This package is generated from current FloorConnector records. Printing or saving it does not send it, create delivery proof, or change project, payment, signature, or closeout status.";
}

export function getProjectCloseoutPackageFooterNote() {
  return "This closeout package is a printable project summary generated from current FloorConnector records. It is not a stored PDF artifact, delivery proof, or a separate project closeout record.";
}

export function getSharedEvidenceReceiptFooterNote() {
  return "This shared evidence receipt is a printable summary of explicit portal evidence sharing and customer activity events. It is not a stored PDF artifact, legal delivery certification, signature, or separate evidence record.";
}

export function getCompanyDocumentExportNotice() {
  return "Printing or saving this document does not send it, sign it, create delivery proof, or change document status.";
}

export function getCompanyDocumentFooterNote() {
  return "Company Documents stores your company's document content. It does not provide legal advice. This print view is not a stored PDF, public link, provider send, signature packet, acknowledgement, or delivery proof.";
}
