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
