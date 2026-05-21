import type {
  DocumentSignatureEventType,
  DocumentSignerStatus
} from "@floorconnector/types";

export type WarrantyDocumentSignatureSummary = {
  signerCount: number;
  requestedSignerCount: number;
  signedSignerCount: number;
  latestEventType: DocumentSignatureEventType | null;
  latestEventCreatedAt: string | null;
};

export function summarizeWarrantyDocumentSignatures(
  warrantyDocumentIds: string[],
  signers: Array<{ subject_id: string; status: DocumentSignerStatus }>,
  events: Array<{
    subject_id: string;
    event_type: DocumentSignatureEventType;
    created_at: string;
  }>
) {
  const summaries = new Map<string, WarrantyDocumentSignatureSummary>();

  for (const warrantyDocumentId of warrantyDocumentIds) {
    summaries.set(warrantyDocumentId, {
      signerCount: 0,
      requestedSignerCount: 0,
      signedSignerCount: 0,
      latestEventType: null,
      latestEventCreatedAt: null
    });
  }

  for (const signer of signers) {
    const summary = summaries.get(signer.subject_id);

    if (!summary) {
      continue;
    }

    summary.signerCount += 1;

    if (signer.status === "requested") {
      summary.requestedSignerCount += 1;
    }

    if (signer.status === "signed") {
      summary.signedSignerCount += 1;
    }
  }

  for (const event of events) {
    const summary = summaries.get(event.subject_id);

    if (!summary) {
      continue;
    }

    if (
      !summary.latestEventCreatedAt ||
      new Date(event.created_at).getTime() >
        new Date(summary.latestEventCreatedAt).getTime()
    ) {
      summary.latestEventType = event.event_type;
      summary.latestEventCreatedAt = event.created_at;
    }
  }

  return summaries;
}
