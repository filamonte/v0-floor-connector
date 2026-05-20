import type {
  DocumentSignerRole,
  DocumentSignerStatus,
  WarrantyDocumentStatus
} from "@floorconnector/types";

export type PortalWarrantySignerStateInput = {
  signerRole: DocumentSignerRole;
  signerEmail: string;
  status: DocumentSignerStatus;
};

const customerVisibleWarrantyStatuses = new Set<WarrantyDocumentStatus>([
  "issued",
  "sent",
  "viewed",
  "signed"
]);

const actionableWarrantySignerStatuses = new Set<DocumentSignerStatus>([
  "pending",
  "requested",
  "viewed"
]);

export function normalizePortalSignerEmail(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";

  return normalized.length > 0 ? normalized : null;
}

export function isPortalWarrantyDocumentStatusVisible(
  status: WarrantyDocumentStatus
) {
  return customerVisibleWarrantyStatuses.has(status);
}

export function isPortalWarrantySignerActionable(status: DocumentSignerStatus) {
  return actionableWarrantySignerStatuses.has(status);
}

export function resolvePortalWarrantySignerState(
  signers: PortalWarrantySignerStateInput[],
  portalUserEmail: string | null | undefined
) {
  const normalizedUserEmail = normalizePortalSignerEmail(portalUserEmail);
  const matchingCustomerSigners = normalizedUserEmail
    ? signers.filter(
        (signer) =>
          signer.signerRole === "customer" &&
          normalizePortalSignerEmail(signer.signerEmail) === normalizedUserEmail
      )
    : [];
  const currentUserSignerStatus: DocumentSignerStatus | null =
    matchingCustomerSigners.length > 0
      ? matchingCustomerSigners.some((signer) => signer.status === "declined")
        ? "declined"
        : matchingCustomerSigners.some((signer) => signer.status === "signed")
          ? "signed"
          : matchingCustomerSigners.some((signer) => signer.status === "viewed")
            ? "viewed"
            : matchingCustomerSigners.some(
                  (signer) => signer.status === "requested"
                )
              ? "requested"
              : "pending"
      : null;

  return {
    matchingCustomerSigners,
    currentUserSignerStatus,
    currentUserCanAct: matchingCustomerSigners.some((signer) =>
      isPortalWarrantySignerActionable(signer.status)
    )
  };
}

export function shouldMarkWarrantyDocumentSigned(
  signers: PortalWarrantySignerStateInput[]
) {
  const activeCustomerSigners = signers.filter(
    (signer) => signer.signerRole === "customer" && signer.status !== "voided"
  );

  return (
    activeCustomerSigners.length > 0 &&
    activeCustomerSigners.every((signer) => signer.status === "signed")
  );
}
