import "server-only";

import {
  computeContractSignatureWorkflowSummary,
  canTransitionDocumentSignerStatus,
  computeInvoicePaymentWorkflowGate
} from "@floorconnector/domain";
import type {
  ContractSignerRole,
  ContractSignerStatus,
  DocumentSignatureEventType,
  DocumentSignerRole,
  DocumentSignerStatus,
  ContractStatus,
  EstimateAttachment,
  EstimateWorkspaceContent,
  EstimateStatus,
  InvoiceStatus,
  PaymentEventActorType,
  PaymentEventType,
  PortalRecordViewSubjectType,
  ProjectStatus,
  WarrantyDocumentStatus
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { normalizeEstimateWorkspaceContent } from "@/lib/estimates/workspace";
import { recordInvoiceNotificationEvent } from "@/lib/notifications/system";
import {
  mapPortalSafeAppointment,
  type PortalAppointmentSafeRow,
  type PortalSafeAppointmentListItem
} from "@/lib/portal/appointment-visibility";
import {
  isPortalWarrantyDocumentStatusVisible,
  isPortalWarrantySignerActionable,
  normalizePortalSignerEmail,
  resolvePortalWarrantySignerState,
  shouldMarkWarrantyDocumentSigned
} from "@/lib/portal/warranty-documents";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";
import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PortalProjectRow = {
  id: string;
  company_id: string;
  customer_id: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

type PortalEstimateRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  reference_number: string;
  title: string | null;
  status: EstimateStatus;
  subtotal_amount: string | number;
  tax_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  notes: string | null;
  content: Record<string, unknown> | null;
  sent_at: string | null;
  customer_viewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

type PortalEstimateAttachmentRow = {
  id: string;
  company_id: string;
  estimate_id: string;
  attachment_type: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

type PortalEstimateLineItemRow = {
  id: string;
  estimate_id: string;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string | number;
  group_name: string | null;
  sort_order: number;
};

type PortalContractRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  status: ContractStatus;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  internal_approval_status: string;
  signature_readiness_status: string;
  customer_viewed_at: string | null;
  customer_signed_at: string | null;
  contractor_countersigned_at: string | null;
  signature_declined_at: string | null;
  signature_voided_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
  estimates?: {
    id: string;
    reference_number: string;
    status: string;
  } | null;
};

type PortalContractSignerRow = {
  id: string;
  contract_id: string;
  signer_role: ContractSignerRole;
  signer_status: ContractSignerStatus;
  display_name: string;
  email: string;
  signer_order: number;
  portal_user_id: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
};

type PortalInvoiceRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  job_id: string | null;
  reference_number: string;
  workflow_role: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal_amount: string | number;
  tax_amount: string | number;
  discount_amount: string | number;
  retainage_held_amount: string | number;
  total_amount: string | number;
  balance_due_amount: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

type PortalChangeOrderRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  contract_id: string | null;
  invoice_id: string | null;
  applied_invoice_line_item_id: string | null;
  status: "draft" | "sent" | "approved" | "rejected";
  title: string;
  description: string | null;
  scope_change_notes: string | null;
  price_adjustment: string | number;
  decision_note: string | null;
  sent_at: string | null;
  customer_viewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
  contracts?: {
    id: string;
    title: string;
    status: string;
  } | null;
  invoices?: {
    id: string;
    reference_number: string;
    status: string;
    balance_due_amount: string | number;
  } | null;
};

type PortalInvoiceLineItemRow = {
  id: string;
  invoice_id: string;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string | number;
  sort_order: number;
};

type PortalPaymentRow = {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  status: string;
};

type PortalPaymentEventRow = {
  id: string;
  invoice_id: string;
  payment_id: string | null;
  event_type: PaymentEventType;
  actor_type: PaymentEventActorType;
  occurred_at: string;
  payload: Record<string, unknown> | null;
};

type PortalJobRow = {
  id: string;
  project_id: string;
  dispatch_status: string;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  updated_at: string;
};

type PortalWarrantyDocumentRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string | null;
  job_id: string | null;
  service_ticket_id: string | null;
  status: WarrantyDocumentStatus;
  title: string;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  warranty_basis: string | null;
  rendered_content: string | null;
  issued_at: string | null;
  voided_at: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
    status: string;
  } | null;
  jobs?: {
    id: string;
    dispatch_status: string;
  } | null;
};

type PortalDocumentSignerRow = {
  id: string;
  company_id: string;
  subject_type: "warranty_document";
  subject_id: string;
  signer_role: DocumentSignerRole;
  signer_name: string;
  signer_email: string;
  status: DocumentSignerStatus;
  signed_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
};

type PortalDocumentSignatureEventRow = {
  id: string;
  company_id: string;
  subject_type: "warranty_document";
  subject_id: string;
  signer_id: string | null;
  event_type: DocumentSignatureEventType;
  event_note: string | null;
  created_at: string;
};

type ProjectStatusRow = {
  id: string;
  project_id: string;
  status: string;
  updated_at: string;
};

type ProjectLatestStatusSummary = {
  id: string;
  status: string;
};

type PortalDocumentBrandRow = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  brand_accent_color: string | null;
};

export type PortalDocumentBrand = {
  name: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  accentColor: string | null;
};

export type PortalAccessibleProjectListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  locationSummary: string | null;
  latestEstimateId: string | null;
  latestEstimateStatus: string | null;
  latestContractId: string | null;
  latestContractStatus: string | null;
  latestInvoiceId: string | null;
  latestInvoiceStatus: string | null;
  latestInvoiceReferenceNumber: string | null;
  latestInvoiceWorkflowRole: string | null;
  latestInvoiceBalanceDueAmount: string | null;
  latestInvoicePaymentEventType: PaymentEventType | null;
  latestInvoicePaymentEventAt: string | null;
  latestJobId: string | null;
  latestJobDispatchStatus: string | null;
  latestJobScheduledDate: string | null;
  latestJobScheduledStartAt: string | null;
  latestJobScheduledEndAt: string | null;
  updatedAt: string;
};

export type PortalProjectDetailSummary = {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  location: {
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateRegion: string | null;
    postalCode: string | null;
    countryCode: string | null;
  };
  visibleEstimateCount: number;
  visibleContractCount: number;
  visibleInvoiceCount: number;
  latestEstimateId: string | null;
  latestEstimateStatus: string | null;
  latestContractId: string | null;
  latestContractStatus: string | null;
  latestInvoiceId: string | null;
  latestInvoiceStatus: string | null;
  latestInvoiceReferenceNumber: string | null;
  latestInvoiceWorkflowRole: string | null;
  latestInvoiceBalanceDueAmount: string | null;
  latestInvoicePaymentEventType: PaymentEventType | null;
  latestInvoicePaymentEventAt: string | null;
  latestJobId: string | null;
  latestJobDispatchStatus: string | null;
  latestJobScheduledDate: string | null;
  latestJobScheduledStartAt: string | null;
  latestJobScheduledEndAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectEstimateListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  status: EstimateStatus;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectContractListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  status: ContractStatus;
  title: string;
  renderedSubject: string | null;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectInvoiceListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  jobId: string | null;
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  totalAmount: string;
  balanceDueAmount: string;
  latestPaymentEventType: PaymentEventType | null;
  latestPaymentEventAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectChangeOrderListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  contractId: string | null;
  invoiceId: string | null;
  appliedInvoiceLineItemId: string | null;
  status: "draft" | "sent" | "approved" | "rejected";
  title: string;
  description: string | null;
  scopeChangeNotes: string | null;
  priceAdjustment: string;
  decisionNote: string | null;
  sentAt: string | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectAppointmentListItem = PortalSafeAppointmentListItem;

export type PortalProjectWarrantyDocumentListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  jobId: string | null;
  serviceTicketId: string | null;
  status: WarrantyDocumentStatus;
  title: string;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
  currentUserSignerStatus: DocumentSignerStatus | null;
  currentUserCanAct: boolean;
  signerCount: number;
  requestedSignerCount: number;
  signedSignerCount: number;
  latestSignatureEventType: DocumentSignatureEventType | null;
  latestSignatureEventAt: string | null;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalUpcomingAppointmentListItem = PortalSafeAppointmentListItem;

type PortalProjectLatestInvoiceRow = {
  id: string;
  project_id: string;
  reference_number: string;
  workflow_role: string;
  status: InvoiceStatus;
  balance_due_amount: string | number;
  updated_at: string;
};

type PortalProjectLatestInvoiceSummary = {
  id: string;
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  balanceDueAmount: string;
  latestPaymentEventType: PaymentEventType | null;
  latestPaymentEventAt: string | null;
};

type PortalProjectLatestJobSummary = {
  id: string;
  dispatchStatus: string;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
};

export type PortalEstimateReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  title: string | null;
  status: EstimateStatus;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes: string | null;
  content: EstimateWorkspaceContent;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  contractorBrand: PortalDocumentBrand;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
    lineTotal: string;
    groupName: string | null;
    sortOrder: number;
  }>;
  attachments: Array<
    EstimateAttachment & {
      downloadUrl: string | null;
    }
  >;
  sentAt: string | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalContractReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  status: ContractStatus;
  title: string;
  renderedSubject: string | null;
  renderedContent: string;
  internalApprovalStatus: string;
  signatureReadinessStatus: string;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signatureDeclinedAt: string | null;
  signatureVoidedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  signers: Array<{
    id: string;
    signerRole: ContractSignerRole;
    signerStatus: ContractSignerStatus;
    displayName: string;
    email: string;
    signerOrder: number;
    viewedAt: string | null;
    signedAt: string | null;
    declinedAt: string | null;
    declineReason: string | null;
  }>;
  signatureSummary: {
    customerSignerCount: number;
    contractorSignerCount: number;
    signedCustomerSignerCount: number;
    signedContractorSignerCount: number;
    viewedCustomerSignerCount: number;
    declinedSignerCount: number;
    requiresCountersign: boolean;
    allCustomerSignersSigned: boolean;
    allRequiredSignersSigned: boolean;
    canCustomerAct: boolean;
    canContractorCountersign: boolean;
    isDeclined: boolean;
    isVoided: boolean;
    isCompleted: boolean;
    anyCustomerInteraction: boolean;
  };
  currentUserSignerStatus: ContractSignerStatus | null;
  currentUserCanSign: boolean;
  currentUserCanDecline: boolean;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  contractorBrand: PortalDocumentBrand;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalInvoiceReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  jobId: string | null;
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  retainageHeldAmount: string;
  totalAmount: string;
  balanceDueAmount: string;
  paidAmount: string;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  contractorBrand: PortalDocumentBrand;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
    lineTotal: string;
    sortOrder: number;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentDate: string;
    paymentMethod: string;
    reference: string | null;
    status: string;
  }>;
  paymentEvents: Array<{
    id: string;
    paymentId: string | null;
    eventType: PaymentEventType;
    actorType: PaymentEventActorType;
    occurredAt: string;
    payload: Record<string, unknown> | null;
  }>;
  paymentWorkflow: {
    canRequestPayment: boolean;
    canStartCheckout: boolean;
    canRecordSuccess: boolean;
    hasBalanceDue: boolean;
    isSettled: boolean;
    requestBlockers: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type PortalChangeOrderReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  contractId: string | null;
  invoiceId: string | null;
  appliedInvoiceLineItemId: string | null;
  status: "draft" | "sent" | "approved" | "rejected";
  title: string;
  description: string | null;
  scopeChangeNotes: string | null;
  priceAdjustment: string;
  decisionNote: string | null;
  sentAt: string | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  contract: {
    id: string;
    title: string;
    status: string;
  } | null;
  invoice: {
    id: string;
    referenceNumber: string;
    status: string;
    balanceDueAmount: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalWarrantyDocumentReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  jobId: string | null;
  serviceTicketId: string | null;
  status: WarrantyDocumentStatus;
  title: string;
  renderedContent: string | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  warrantyBasis: string | null;
  issuedAt: string | null;
  currentUserSignerId: string | null;
  currentUserSignerStatus: DocumentSignerStatus | null;
  currentUserCanSign: boolean;
  currentUserCanDecline: boolean;
  signerSummary: {
    customerSignerCount: number;
    signedCustomerSignerCount: number;
    requestedCustomerSignerCount: number;
    declinedCustomerSignerCount: number;
    allCustomerSignersSigned: boolean;
  };
  signatureEvents: Array<{
    id: string;
    eventType: DocumentSignatureEventType;
    eventNote: string | null;
    createdAt: string;
  }>;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  contractorBrand: PortalDocumentBrand;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  job: {
    id: string;
    dispatchStatus: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type PortalScope = {
  userId: string;
  userEmail: string | null;
  activeCustomerIds: string[];
  accessibleProjectIds: string[];
};

const portalProjectSelect = `
  id,
  company_id,
  customer_id,
  name,
  status,
  description,
  address_line_1,
  address_line_2,
  city,
  state_region,
  postal_code,
  country_code,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    email,
    phone
  )
`;

const portalEstimateSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  reference_number,
  title,
  status,
  subtotal_amount,
  tax_amount,
  discount_amount,
  total_amount,
  notes,
  content,
  sent_at,
  customer_viewed_at,
  approved_at,
  rejected_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  )
`;

const portalContractSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  status,
  title,
  rendered_subject,
  rendered_content,
  internal_approval_status,
  signature_readiness_status,
  customer_viewed_at,
  customer_signed_at,
  contractor_countersigned_at,
  signature_declined_at,
  signature_voided_at,
  sent_at,
  viewed_at,
  signed_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  ),
  estimates (
    id,
    reference_number,
    status
  )
`;

const portalInvoiceSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  job_id,
  reference_number,
  workflow_role,
  status,
  issue_date,
  due_date,
  subtotal_amount,
  tax_amount,
  discount_amount,
  retainage_held_amount,
  total_amount,
  balance_due_amount,
  notes,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  )
`;

const portalChangeOrderSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  contract_id,
  invoice_id,
  applied_invoice_line_item_id,
  status,
  title,
  description,
  scope_change_notes,
  price_adjustment,
  decision_note,
  sent_at,
  customer_viewed_at,
  approved_at,
  rejected_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  ),
  contracts (
    id,
    title,
    status
  ),
  invoices (
    id,
    reference_number,
    status,
    balance_due_amount
  )
`;

const portalAppointmentSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  title,
  appointment_type,
  starts_at,
  ends_at,
  location,
  customer_notes,
  status,
  created_at,
  updated_at
`;

const portalAppointmentWithProjectSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  title,
  appointment_type,
  starts_at,
  ends_at,
  location,
  customer_notes,
  status,
  created_at,
  updated_at,
  projects (
    id,
    name
  )
`;

const portalWarrantyDocumentSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  job_id,
  service_ticket_id,
  status,
  title,
  warranty_start_date,
  warranty_end_date,
  warranty_basis,
  rendered_content,
  issued_at,
  voided_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  ),
  jobs (
    id,
    dispatch_status
  )
`;

const portalDocumentSignerSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  signer_role,
  signer_name,
  signer_email,
  status,
  signed_at,
  declined_at,
  created_at,
  updated_at
`;

const portalDocumentSignatureEventSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  signer_id,
  event_type,
  event_note,
  created_at
`;

function formatMoney(value: string | number) {
  return Number(value).toFixed(2);
}

function formatQuantity(value: string | number) {
  return Number(value).toFixed(2);
}

function mapPortalEstimateAttachment(
  row: PortalEstimateAttachmentRow
): EstimateAttachment {
  return {
    id: row.id,
    organizationId: row.company_id,
    estimateId: row.estimate_id,
    attachmentType: row.attachment_type,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    caption: row.caption,
    uploadedByUserId: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function resolvePortalEstimateAttachmentDownloadUrls(
  attachments: EstimateAttachment[]
) {
  if (attachments.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const signedUrlEntries = await Promise.all(
    attachments.map(async (attachment) => {
      const response = await supabase.storage
        .from(STORAGE_BUCKET_NAMES.documents)
        .createSignedUrl(attachment.storagePath, 60 * 60);

      return [attachment.id, response.data?.signedUrl ?? null] as const;
    })
  );
  const signedUrlMap = new Map<string, string | null>(signedUrlEntries);

  return attachments.map((attachment) => ({
    ...attachment,
    downloadUrl: signedUrlMap.get(attachment.id) ?? null
  }));
}

function formatLocationSummary(project: PortalProjectRow) {
  const parts = [
    project.address_line_1,
    project.city,
    project.state_region,
    project.postal_code
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

function mapPortalContractSigner(row: PortalContractSignerRow) {
  return {
    id: row.id,
    signerRole: row.signer_role,
    signerStatus: row.signer_status,
    displayName: row.display_name,
    email: row.email,
    signerOrder: row.signer_order,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    declinedAt: row.declined_at,
    declineReason: row.decline_reason
  };
}

function mapPortalPaymentEvent(row: PortalPaymentEventRow) {
  return {
    id: row.id,
    paymentId: row.payment_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    occurredAt: row.occurred_at,
    payload: row.payload
  };
}

function mapPortalProjectChangeOrder(
  row: PortalChangeOrderRow
): PortalProjectChangeOrderListItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    contractId: row.contract_id,
    invoiceId: row.invoice_id,
    appliedInvoiceLineItemId: row.applied_invoice_line_item_id,
    status: row.status,
    title: row.title,
    description: row.description,
    scopeChangeNotes: row.scope_change_notes,
    priceAdjustment: formatMoney(row.price_adjustment),
    decisionNote: row.decision_note,
    sentAt: row.sent_at,
    customerViewedAt: row.customer_viewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getWarrantySignerRowsForState(signers: PortalDocumentSignerRow[]) {
  return signers.map((signer) => ({
    signerRole: signer.signer_role,
    signerEmail: signer.signer_email,
    status: signer.status
  }));
}

function getPortalWarrantySignerSummary(signers: PortalDocumentSignerRow[]) {
  const customerSigners = signers.filter(
    (signer) => signer.signer_role === "customer" && signer.status !== "voided"
  );

  return {
    customerSignerCount: customerSigners.length,
    signedCustomerSignerCount: customerSigners.filter(
      (signer) => signer.status === "signed"
    ).length,
    requestedCustomerSignerCount: customerSigners.filter(
      (signer) => signer.status === "requested"
    ).length,
    declinedCustomerSignerCount: customerSigners.filter(
      (signer) => signer.status === "declined"
    ).length,
    allCustomerSignersSigned: shouldMarkWarrantyDocumentSigned(
      getWarrantySignerRowsForState(signers)
    )
  };
}

function isWarrantyDocumentAccessibleToPortalScope(
  row: PortalWarrantyDocumentRow,
  scope: PortalScope
) {
  return (
    typeof row.project_id === "string" &&
    scope.accessibleProjectIds.includes(row.project_id) &&
    scope.activeCustomerIds.includes(row.customer_id) &&
    isPortalWarrantyDocumentStatusVisible(row.status)
  );
}

function canPortalCompleteWarrantySignerStatus(
  from: DocumentSignerStatus,
  to: Extract<DocumentSignerStatus, "signed" | "declined">
) {
  return (
    isPortalWarrantySignerActionable(from) &&
    (from === "pending" || canTransitionDocumentSignerStatus(from, to))
  );
}

async function loadPortalWarrantyDocumentContext(
  warrantyDocumentId: string,
  next: string
) {
  const scope = await getPortalScope(next);
  const admin = getSupabaseAdminClient();
  const documentResponse = await admin
    .from("warranty_documents")
    .select(portalWarrantyDocumentSelect)
    .eq("id", warrantyDocumentId)
    .maybeSingle();
  const row = documentResponse.data as PortalWarrantyDocumentRow | null;

  if (documentResponse.error) {
    throw new Error(
      `Unable to load the portal warranty document: ${documentResponse.error.message}`
    );
  }

  if (!row || !isWarrantyDocumentAccessibleToPortalScope(row, scope)) {
    return null;
  }

  const [signersResponse, eventsResponse, contractorBrand] = await Promise.all([
    admin
      .from("document_signers")
      .select(portalDocumentSignerSelect)
      .eq("company_id", row.company_id)
      .eq("subject_type", "warranty_document")
      .eq("subject_id", row.id)
      .order("created_at", { ascending: true }),
    admin
      .from("document_signature_events")
      .select(portalDocumentSignatureEventSelect)
      .eq("company_id", row.company_id)
      .eq("subject_type", "warranty_document")
      .eq("subject_id", row.id)
      .order("created_at", { ascending: false })
      .limit(20),
    getPortalDocumentBrand(row.company_id)
  ]);
  const signers =
    (signersResponse.data as PortalDocumentSignerRow[] | null) ?? [];
  const events =
    (eventsResponse.data as PortalDocumentSignatureEventRow[] | null) ?? [];

  if (signersResponse.error) {
    throw new Error(
      `Unable to load portal warranty signer routing: ${signersResponse.error.message}`
    );
  }

  if (eventsResponse.error) {
    throw new Error(
      `Unable to load portal warranty signature events: ${eventsResponse.error.message}`
    );
  }

  const signerState = resolvePortalWarrantySignerState(
    getWarrantySignerRowsForState(signers),
    scope.userEmail
  );
  const currentUserSignerIds = new Set(
    signers
      .filter(
        (signer) =>
          signer.signer_role === "customer" &&
          normalizePortalSignerEmail(signer.signer_email) === scope.userEmail
      )
      .map((signer) => signer.id)
  );

  return {
    scope,
    row,
    signers,
    events,
    contractorBrand,
    currentUserSignerIds,
    signerState,
    signerSummary: getPortalWarrantySignerSummary(signers)
  };
}

async function getPortalScope(next = "/portal"): Promise<PortalScope> {
  const user = await requireAuthenticatedUser(next);
  const activeGrants = (
    await listPortalAccessGrantsForCurrentUser(next)
  ).filter((grant) => grant.status === "active");

  const activeCustomerIds = [
    ...new Set(activeGrants.map((grant) => grant.customerId))
  ];

  if (activeGrants.length === 0) {
    return {
      userId: user.id,
      userEmail: normalizePortalSignerEmail(user.email),
      activeCustomerIds,
      accessibleProjectIds: []
    };
  }

  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");
  const projectAccessRows =
    (projectAccessResponse.data as Array<{ project_id?: string }> | null) ?? [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to load portal-scoped project visibility: ${projectAccessResponse.error.message}`
    );
  }

  return {
    userId: user.id,
    userEmail: normalizePortalSignerEmail(user.email),
    activeCustomerIds,
    accessibleProjectIds: [
      ...new Set(
        projectAccessRows
          .map((row) => row.project_id)
          .filter((value): value is string => typeof value === "string")
      )
    ]
  };
}

async function createPortalRecordView(
  input: {
    companyId: string;
    customerId: string;
    projectId: string;
    subjectType: PortalRecordViewSubjectType;
    subjectId: string;
  },
  next = "/portal"
) {
  const user = await requireAuthenticatedUser(next);
  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("portal_record_views")
    .select("id")
    .eq("company_id", input.companyId)
    .eq("portal_user_id", user.id)
    .eq("subject_type", input.subjectType)
    .eq("subject_id", input.subjectId)
    .limit(1)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to inspect the portal view event: ${existingResponse.error.message}`
    );
  }

  const response = await supabase.from("portal_record_views").insert({
    company_id: input.companyId,
    portal_user_id: user.id,
    customer_id: input.customerId,
    project_id: input.projectId,
    subject_type: input.subjectType,
    subject_id: input.subjectId
  });

  if (response.error) {
    throw new Error(
      `Unable to record the portal view event: ${response.error.message}`
    );
  }

  return {
    portalUserId: user.id,
    isFirstView: !existingResponse.data
  };
}

export async function getPortalDocumentBrand(
  companyId: string
): Promise<PortalDocumentBrand> {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("companies")
    .select(
      "id, slug, legal_name, display_name, logo_url, phone, email, website_url, brand_accent_color"
    )
    .eq("id", companyId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load portal document branding: ${response.error.message}`
    );
  }

  const row = response.data as PortalDocumentBrandRow | null;
  const nameCandidates = [row?.display_name, row?.legal_name, row?.slug]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  const brandName =
    nameCandidates.find((value) => value.toLowerCase() !== "your contractor") ??
    nameCandidates[0] ??
    "FloorConnector contractor";

  return {
    name: brandName,
    logoUrl: row?.logo_url ?? null,
    phone: row?.phone ?? null,
    email: row?.email ?? null,
    websiteUrl: row?.website_url ?? null,
    accentColor: row?.brand_accent_color ?? null
  };
}

async function getLatestStatusesByProjectIds(projectIds: string[]) {
  if (projectIds.length === 0) {
    return {
      estimates: new Map<string, ProjectLatestStatusSummary>(),
      contracts: new Map<string, ProjectLatestStatusSummary>()
    };
  }

  const supabase = await getSupabaseServerClient();
  const [estimatesResponse, contractsResponse] = await Promise.all([
    supabase
      .from("estimates")
      .select("id, project_id, status, updated_at")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("contracts")
      .select("id, project_id, status, updated_at")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false })
  ]);

  if (estimatesResponse.error) {
    throw new Error(
      `Unable to load latest portal estimate statuses: ${estimatesResponse.error.message}`
    );
  }

  if (contractsResponse.error) {
    throw new Error(
      `Unable to load latest portal contract statuses: ${contractsResponse.error.message}`
    );
  }

  const estimateRows =
    (estimatesResponse.data as ProjectStatusRow[] | null) ?? [];
  const contractRows =
    (contractsResponse.data as ProjectStatusRow[] | null) ?? [];

  const estimateMap = new Map<string, ProjectLatestStatusSummary>();
  const contractMap = new Map<string, ProjectLatestStatusSummary>();

  for (const row of estimateRows) {
    if (!estimateMap.has(row.project_id)) {
      estimateMap.set(row.project_id, {
        id: row.id,
        status: row.status
      });
    }
  }

  for (const row of contractRows) {
    if (!contractMap.has(row.project_id)) {
      contractMap.set(row.project_id, {
        id: row.id,
        status: row.status
      });
    }
  }

  return {
    estimates: estimateMap,
    contracts: contractMap
  };
}

function isCustomerActiveInvoiceStatus(status: InvoiceStatus) {
  return status !== "paid" && status !== "void";
}

async function getLatestPaymentEventsByInvoiceIds(invoiceIds: string[]) {
  if (invoiceIds.length === 0) {
    return new Map<string, PortalPaymentEventRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .select(
      `
        id,
        invoice_id,
        payment_id,
        event_type,
        actor_type,
        occurred_at,
        payload
      `
    )
    .in("invoice_id", invoiceIds)
    .order("occurred_at", { ascending: false });
  const rows = (response.data as PortalPaymentEventRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal invoice payment activity: ${response.error.message}`
    );
  }

  const latestEvents = new Map<string, PortalPaymentEventRow>();

  for (const row of rows) {
    if (!latestEvents.has(row.invoice_id)) {
      latestEvents.set(row.invoice_id, row);
    }
  }

  return latestEvents;
}

async function getLatestInvoiceSummariesByProjectIds(projectIds: string[]) {
  if (projectIds.length === 0) {
    return new Map<string, PortalProjectLatestInvoiceSummary>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(
      `
        id,
        project_id,
        reference_number,
        workflow_role,
        status,
        balance_due_amount,
        updated_at
      `
    )
    .in("project_id", projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalProjectLatestInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load latest portal invoice summaries: ${response.error.message}`
    );
  }

  const latestInvoicesByProject = new Map<
    string,
    PortalProjectLatestInvoiceRow
  >();

  for (const row of rows) {
    const current = latestInvoicesByProject.get(row.project_id);

    if (!current) {
      latestInvoicesByProject.set(row.project_id, row);
      continue;
    }

    if (
      !isCustomerActiveInvoiceStatus(current.status) &&
      isCustomerActiveInvoiceStatus(row.status)
    ) {
      latestInvoicesByProject.set(row.project_id, row);
    }
  }

  const latestPaymentEventsByInvoiceId =
    await getLatestPaymentEventsByInvoiceIds(
      [...latestInvoicesByProject.values()].map((row) => row.id)
    );

  return new Map(
    [...latestInvoicesByProject.entries()].map(([projectId, row]) => {
      const latestEvent = latestPaymentEventsByInvoiceId.get(row.id) ?? null;

      return [
        projectId,
        {
          id: row.id,
          referenceNumber: row.reference_number,
          workflowRole: row.workflow_role,
          status: row.status,
          balanceDueAmount: formatMoney(row.balance_due_amount),
          latestPaymentEventType: latestEvent?.event_type ?? null,
          latestPaymentEventAt: latestEvent?.occurred_at ?? null
        }
      ];
    })
  );
}

async function getLatestJobSummariesByProjectIds(
  projectIds: string[]
): Promise<Map<string, PortalProjectLatestJobSummary>> {
  if (projectIds.length === 0) {
    return new Map();
  }

  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("jobs")
    .select(
      `
        id,
        project_id,
        dispatch_status,
        scheduled_date,
        scheduled_start_at,
        scheduled_end_at,
        updated_at
      `
    )
    .in("project_id", projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalJobRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal project job summaries: ${response.error.message}`
    );
  }

  const latestJobsByProject = new Map<string, PortalJobRow>();

  for (const row of rows) {
    if (!latestJobsByProject.has(row.project_id)) {
      latestJobsByProject.set(row.project_id, row);
    }
  }

  return new Map(
    [...latestJobsByProject.entries()].map(([projectId, row]) => [
      projectId,
      {
        id: row.id,
        dispatchStatus: row.dispatch_status,
        scheduledDate: row.scheduled_date,
        scheduledStartAt: row.scheduled_start_at,
        scheduledEndAt: row.scheduled_end_at
      }
    ])
  );
}

export async function listPortalAccessibleProjects(
  next = "/portal"
): Promise<PortalAccessibleProjectListItem[]> {
  const scope = await getPortalScope(next);

  if (scope.accessibleProjectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(portalProjectSelect)
    .in("id", scope.accessibleProjectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalProjectRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal projects: ${response.error.message}`
    );
  }

  const latestStatuses = await getLatestStatusesByProjectIds(
    scope.accessibleProjectIds
  );
  const latestInvoiceSummaries = await getLatestInvoiceSummariesByProjectIds(
    scope.accessibleProjectIds
  );
  const latestJobSummaries = await getLatestJobSummariesByProjectIds(
    scope.accessibleProjectIds
  );

  return rows.map((row) => {
    const latestEstimateSummary = latestStatuses.estimates.get(row.id) ?? null;
    const latestContractSummary = latestStatuses.contracts.get(row.id) ?? null;
    const latestInvoiceSummary = latestInvoiceSummaries.get(row.id) ?? null;
    const latestJobSummary = latestJobSummaries.get(row.id) ?? null;

    return {
      id: row.id,
      organizationId: row.company_id,
      customerId: row.customer_id,
      name: row.name,
      status: row.status,
      description: row.description,
      customer: row.customers
        ? {
            id: row.customers.id,
            name: row.customers.name,
            companyName: row.customers.company_name,
            email: row.customers.email,
            phone: row.customers.phone
          }
        : null,
      locationSummary: formatLocationSummary(row),
      latestEstimateId: latestEstimateSummary?.id ?? null,
      latestEstimateStatus: latestEstimateSummary?.status ?? null,
      latestContractId: latestContractSummary?.id ?? null,
      latestContractStatus: latestContractSummary?.status ?? null,
      latestInvoiceId: latestInvoiceSummary?.id ?? null,
      latestInvoiceStatus: latestInvoiceSummary?.status ?? null,
      latestInvoiceReferenceNumber:
        latestInvoiceSummary?.referenceNumber ?? null,
      latestInvoiceWorkflowRole: latestInvoiceSummary?.workflowRole ?? null,
      latestInvoiceBalanceDueAmount:
        latestInvoiceSummary?.balanceDueAmount ?? null,
      latestInvoicePaymentEventType:
        latestInvoiceSummary?.latestPaymentEventType ?? null,
      latestInvoicePaymentEventAt:
        latestInvoiceSummary?.latestPaymentEventAt ?? null,
      latestJobId: latestJobSummary?.id ?? null,
      latestJobDispatchStatus: latestJobSummary?.dispatchStatus ?? null,
      latestJobScheduledDate: latestJobSummary?.scheduledDate ?? null,
      latestJobScheduledStartAt: latestJobSummary?.scheduledStartAt ?? null,
      latestJobScheduledEndAt: latestJobSummary?.scheduledEndAt ?? null,
      updatedAt: row.updated_at
    };
  });
}

export async function getPortalProjectDetailSummary(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectDetailSummary | null> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const projectResponse = await supabase
    .from("projects")
    .select(portalProjectSelect)
    .eq("id", projectId)
    .maybeSingle();
  const row = projectResponse.data as PortalProjectRow | null;

  if (projectResponse.error) {
    throw new Error(
      `Unable to load the portal project summary: ${projectResponse.error.message}`
    );
  }

  if (!row) {
    return null;
  }

  const [
    estimateCountResponse,
    contractCountResponse,
    invoiceCountResponse,
    latestStatuses,
    latestInvoiceSummaries,
    latestJobSummaries
  ] = await Promise.all([
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId),
    getLatestStatusesByProjectIds([projectId]),
    getLatestInvoiceSummariesByProjectIds([projectId]),
    getLatestJobSummariesByProjectIds([projectId])
  ]);

  if (estimateCountResponse.error) {
    throw new Error(
      `Unable to load portal estimate counts for the project: ${estimateCountResponse.error.message}`
    );
  }

  if (contractCountResponse.error) {
    throw new Error(
      `Unable to load portal contract counts for the project: ${contractCountResponse.error.message}`
    );
  }

  if (invoiceCountResponse.error) {
    throw new Error(
      `Unable to load portal invoice counts for the project: ${invoiceCountResponse.error.message}`
    );
  }

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.id,
      subjectType: "project",
      subjectId: row.id
    },
    next
  );

  const latestEstimateSummary = latestStatuses.estimates.get(projectId) ?? null;
  const latestContractSummary = latestStatuses.contracts.get(projectId) ?? null;
  const latestInvoiceSummary = latestInvoiceSummaries.get(projectId) ?? null;
  const latestJobSummary = latestJobSummaries.get(projectId) ?? null;

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    name: row.name,
    status: row.status,
    description: row.description,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          email: row.customers.email,
          phone: row.customers.phone
        }
      : null,
    location: {
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      city: row.city,
      stateRegion: row.state_region,
      postalCode: row.postal_code,
      countryCode: row.country_code
    },
    visibleEstimateCount: estimateCountResponse.count ?? 0,
    visibleContractCount: contractCountResponse.count ?? 0,
    visibleInvoiceCount: invoiceCountResponse.count ?? 0,
    latestEstimateId: latestEstimateSummary?.id ?? null,
    latestEstimateStatus: latestEstimateSummary?.status ?? null,
    latestContractId: latestContractSummary?.id ?? null,
    latestContractStatus: latestContractSummary?.status ?? null,
    latestInvoiceId: latestInvoiceSummary?.id ?? null,
    latestInvoiceStatus: latestInvoiceSummary?.status ?? null,
    latestInvoiceReferenceNumber: latestInvoiceSummary?.referenceNumber ?? null,
    latestInvoiceWorkflowRole: latestInvoiceSummary?.workflowRole ?? null,
    latestInvoiceBalanceDueAmount:
      latestInvoiceSummary?.balanceDueAmount ?? null,
    latestInvoicePaymentEventType:
      latestInvoiceSummary?.latestPaymentEventType ?? null,
    latestInvoicePaymentEventAt:
      latestInvoiceSummary?.latestPaymentEventAt ?? null,
    latestJobId: latestJobSummary?.id ?? null,
    latestJobDispatchStatus: latestJobSummary?.dispatchStatus ?? null,
    latestJobScheduledDate: latestJobSummary?.scheduledDate ?? null,
    latestJobScheduledStartAt: latestJobSummary?.scheduledStartAt ?? null,
    latestJobScheduledEndAt: latestJobSummary?.scheduledEndAt ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listPortalProjectEstimates(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectEstimateListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select(portalEstimateSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalEstimateRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal estimates for the project: ${response.error.message}`
    );
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    totalAmount: formatMoney(row.total_amount),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function listPortalProjectContracts(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectContractListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(portalContractSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalContractRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal contracts for the project: ${response.error.message}`
    );
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    customerViewedAt: row.customer_viewed_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function listPortalProjectInvoices(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectInvoiceListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(portalInvoiceSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal invoices for the project: ${response.error.message}`
    );
  }

  const latestPaymentEventsByInvoiceId =
    await getLatestPaymentEventsByInvoiceIds(rows.map((row) => row.id));

  return rows.map((row) => {
    const latestPaymentEvent =
      latestPaymentEventsByInvoiceId.get(row.id) ?? null;

    return {
      id: row.id,
      organizationId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      estimateId: row.estimate_id,
      jobId: row.job_id,
      referenceNumber: row.reference_number,
      workflowRole: row.workflow_role,
      status: row.status,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      totalAmount: formatMoney(row.total_amount),
      balanceDueAmount: formatMoney(row.balance_due_amount),
      latestPaymentEventType: latestPaymentEvent?.event_type ?? null,
      latestPaymentEventAt: latestPaymentEvent?.occurred_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });
}

export async function listPortalProjectChangeOrders(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectChangeOrderListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select(portalChangeOrderSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalChangeOrderRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal change orders for the project: ${response.error.message}`
    );
  }

  return rows.map(mapPortalProjectChangeOrder);
}

export async function listPortalProjectAppointments(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectAppointmentListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(portalAppointmentSelect)
    .eq("project_id", projectId)
    .eq("customer_visible", true)
    .order("starts_at", { ascending: true });
  const rows = (response.data as PortalAppointmentSafeRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal appointments for the project: ${response.error.message}`
    );
  }

  return rows
    .filter((row) => row.project_id === projectId)
    .map(mapPortalSafeAppointment);
}

export async function listPortalProjectWarrantyDocuments(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectWarrantyDocumentListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("warranty_documents")
    .select(portalWarrantyDocumentSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(10);
  const rows = (response.data as PortalWarrantyDocumentRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal warranty documents for the project: ${response.error.message}`
    );
  }

  const documents = rows.filter((row) =>
    isWarrantyDocumentAccessibleToPortalScope(row, scope)
  );
  const documentIds = documents.map((document) => document.id);

  if (documentIds.length === 0) {
    return [];
  }

  const [signersResponse, eventsResponse] = await Promise.all([
    admin
      .from("document_signers")
      .select(portalDocumentSignerSelect)
      .eq("subject_type", "warranty_document")
      .in("subject_id", documentIds),
    admin
      .from("document_signature_events")
      .select(portalDocumentSignatureEventSelect)
      .eq("subject_type", "warranty_document")
      .in("subject_id", documentIds)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);
  const signers =
    (signersResponse.data as PortalDocumentSignerRow[] | null) ?? [];
  const events =
    (eventsResponse.data as PortalDocumentSignatureEventRow[] | null) ?? [];

  if (signersResponse.error) {
    throw new Error(
      `Unable to load portal warranty signer summaries: ${signersResponse.error.message}`
    );
  }

  if (eventsResponse.error) {
    throw new Error(
      `Unable to load portal warranty signature summaries: ${eventsResponse.error.message}`
    );
  }

  return documents.map((document) => {
    const documentSigners = signers.filter(
      (signer) =>
        signer.company_id === document.company_id &&
        signer.subject_id === document.id
    );
    const documentEvents = events.filter(
      (event) =>
        event.company_id === document.company_id &&
        event.subject_id === document.id
    );
    const signerState = resolvePortalWarrantySignerState(
      getWarrantySignerRowsForState(documentSigners),
      scope.userEmail
    );
    const latestEvent = documentEvents[0] ?? null;

    return {
      id: document.id,
      organizationId: document.company_id,
      customerId: document.customer_id,
      projectId: document.project_id ?? projectId,
      jobId: document.job_id,
      serviceTicketId: document.service_ticket_id,
      status: document.status,
      title: document.title,
      warrantyStartDate: document.warranty_start_date,
      warrantyEndDate: document.warranty_end_date,
      warrantyBasis: document.warranty_basis,
      currentUserSignerStatus: signerState.currentUserSignerStatus,
      currentUserCanAct: signerState.currentUserCanAct,
      signerCount: documentSigners.filter(
        (signer) => signer.status !== "voided"
      ).length,
      requestedSignerCount: documentSigners.filter(
        (signer) => signer.status === "requested"
      ).length,
      signedSignerCount: documentSigners.filter(
        (signer) => signer.status === "signed"
      ).length,
      latestSignatureEventType: latestEvent?.event_type ?? null,
      latestSignatureEventAt: latestEvent?.created_at ?? null,
      issuedAt: document.issued_at,
      createdAt: document.created_at,
      updatedAt: document.updated_at
    };
  });
}

export async function listPortalUpcomingAppointments(
  next = "/portal",
  limit = 5
): Promise<PortalUpcomingAppointmentListItem[]> {
  const scope = await getPortalScope(next);

  if (scope.accessibleProjectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("appointments")
    .select(portalAppointmentWithProjectSelect)
    .in("project_id", scope.accessibleProjectIds)
    .eq("customer_visible", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  const rows = (response.data as PortalAppointmentSafeRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal upcoming appointments: ${response.error.message}`
    );
  }

  return rows.map(mapPortalSafeAppointment);
}

export async function getPortalEstimateReviewData(
  estimateId: string,
  next = "/portal"
): Promise<PortalEstimateReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const estimateResponse = await supabase
    .from("estimates")
    .select(portalEstimateSelect)
    .eq("id", estimateId)
    .maybeSingle();
  const row = estimateResponse.data as PortalEstimateRow | null;

  if (estimateResponse.error) {
    throw new Error(
      `Unable to load the portal estimate review data: ${estimateResponse.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  const [lineItemsResponse, contractorBrand] = await Promise.all([
    supabase
      .from("estimate_line_items")
      .select(
        `
          id,
          estimate_id,
          name,
          description,
          quantity,
          unit,
          unit_price,
          line_total,
          group_name,
          sort_order
        `
      )
      .eq("estimate_id", estimateId)
      .order("sort_order", { ascending: true }),
    getPortalDocumentBrand(row.company_id)
  ]);
  const lineItemRows =
    (lineItemsResponse.data as PortalEstimateLineItemRow[] | null) ?? [];

  if (lineItemsResponse.error) {
    throw new Error(
      `Unable to load portal estimate line items: ${lineItemsResponse.error.message}`
    );
  }

  const attachmentsResponse = await supabase
    .from("estimate_attachments")
    .select(
      `
        id,
        company_id,
        estimate_id,
        attachment_type,
        storage_path,
        file_name,
        mime_type,
        file_size_bytes,
        caption,
        uploaded_by,
        created_at,
        updated_at
      `
    )
    .eq("company_id", row.company_id)
    .eq("estimate_id", estimateId)
    .order("created_at", { ascending: false });
  const attachmentRows =
    (attachmentsResponse.data as PortalEstimateAttachmentRow[] | null) ?? [];

  if (attachmentsResponse.error) {
    throw new Error(
      `Unable to load portal estimate attachments: ${attachmentsResponse.error.message}`
    );
  }

  const attachments = await resolvePortalEstimateAttachmentDownloadUrls(
    attachmentRows.map((attachment) => mapPortalEstimateAttachment(attachment))
  );

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "estimate",
      subjectId: row.id
    },
    next
  );

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    title: row.title,
    status: row.status,
    subtotalAmount: formatMoney(row.subtotal_amount),
    taxAmount: formatMoney(row.tax_amount),
    discountAmount: formatMoney(row.discount_amount),
    totalAmount: formatMoney(row.total_amount),
    notes: row.notes,
    content: normalizeEstimateWorkspaceContent(row.content, row.notes),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    contractorBrand,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    lineItems: lineItemRows.map((lineItem) => ({
      id: lineItem.id,
      name: lineItem.name,
      description: lineItem.description,
      quantity: formatQuantity(lineItem.quantity),
      unit: lineItem.unit,
      unitPrice: formatMoney(lineItem.unit_price),
      lineTotal: formatMoney(lineItem.line_total),
      groupName: lineItem.group_name,
      sortOrder: lineItem.sort_order
    })),
    attachments,
    sentAt: row.sent_at,
    customerViewedAt: row.customer_viewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPortalContractReviewData(
  contractId: string,
  next = "/portal"
): Promise<PortalContractReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const contractResponse = await supabase
    .from("contracts")
    .select(portalContractSelect)
    .eq("id", contractId)
    .maybeSingle();
  const row = contractResponse.data as PortalContractRow | null;

  if (contractResponse.error) {
    throw new Error(
      `Unable to load the portal contract review data: ${contractResponse.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const contractSignerResponse = await admin
    .from("contract_signers")
    .select(
      `
        id,
        contract_id,
        signer_role,
        signer_status,
        display_name,
        email,
        signer_order,
        portal_user_id,
        viewed_at,
        signed_at,
        declined_at,
        decline_reason
      `
    )
    .eq("contract_id", contractId)
    .order("signer_order", { ascending: true })
    .order("created_at", { ascending: true });
  const signerRows =
    (contractSignerResponse.data as PortalContractSignerRow[] | null) ?? [];

  if (contractSignerResponse.error) {
    throw new Error(
      `Unable to load portal contract signer routing: ${contractSignerResponse.error.message}`
    );
  }

  const contractorBrand = await getPortalDocumentBrand(row.company_id);

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "contract",
      subjectId: row.id
    },
    next
  );

  const signatureSummary = computeContractSignatureWorkflowSummary({
    status: row.status,
    signatureReadinessStatus: row.signature_readiness_status as
      | "draft"
      | "ready_to_send"
      | "out_for_signature"
      | "signed",
    signatureStartedAt: row.sent_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    signatureDeclinedAt: row.signature_declined_at,
    signatureVoidedAt: row.signature_voided_at,
    signers: signerRows.map((signer) => ({
      signerRole: signer.signer_role,
      signerStatus: signer.signer_status
    }))
  });
  const currentUserSignerRows = signerRows.filter(
    (signer) =>
      signer.signer_role === "customer" &&
      signer.portal_user_id === scope.userId
  );
  const currentUserSignerStatus =
    currentUserSignerRows.length > 0
      ? currentUserSignerRows.some(
          (signer) => signer.signer_status === "declined"
        )
        ? "declined"
        : currentUserSignerRows.some(
              (signer) => signer.signer_status === "signed"
            )
          ? "signed"
          : currentUserSignerRows.some(
                (signer) => signer.signer_status === "viewed"
              )
            ? "viewed"
            : "pending"
      : null;

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    internalApprovalStatus: row.internal_approval_status,
    signatureReadinessStatus: row.signature_readiness_status,
    customerViewedAt: row.customer_viewed_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    signatureDeclinedAt: row.signature_declined_at,
    signatureVoidedAt: row.signature_voided_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    signers: signerRows.map(mapPortalContractSigner),
    signatureSummary,
    currentUserSignerStatus,
    currentUserCanSign:
      signatureSummary.canCustomerAct &&
      currentUserSignerRows.some(
        (signer) =>
          signer.signer_status === "pending" ||
          signer.signer_status === "viewed"
      ),
    currentUserCanDecline:
      signatureSummary.canCustomerAct &&
      currentUserSignerRows.some(
        (signer) =>
          signer.signer_status === "pending" ||
          signer.signer_status === "viewed"
      ),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    contractorBrand,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number,
          status: row.estimates.status
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPortalWarrantyDocumentReviewData(
  warrantyDocumentId: string,
  next = "/portal"
): Promise<PortalWarrantyDocumentReviewDetail | null> {
  const context = await loadPortalWarrantyDocumentContext(
    warrantyDocumentId,
    next
  );

  if (!context) {
    return null;
  }

  const {
    row,
    signers,
    events,
    contractorBrand,
    currentUserSignerIds,
    signerState,
    signerSummary
  } = context;
  const currentUserSigner = signers.find((signer) =>
    currentUserSignerIds.has(signer.id)
  );

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id ?? "",
    jobId: row.job_id,
    serviceTicketId: row.service_ticket_id,
    status: row.status,
    title: row.title,
    renderedContent: row.rendered_content,
    warrantyStartDate: row.warranty_start_date,
    warrantyEndDate: row.warranty_end_date,
    warrantyBasis: row.warranty_basis,
    issuedAt: row.issued_at,
    currentUserSignerId: currentUserSigner?.id ?? null,
    currentUserSignerStatus: signerState.currentUserSignerStatus,
    currentUserCanSign: signerState.currentUserCanAct,
    currentUserCanDecline: signerState.currentUserCanAct,
    signerSummary,
    signatureEvents: events
      .filter(
        (event) => event.signer_id && currentUserSignerIds.has(event.signer_id)
      )
      .slice(0, 8)
      .map((event) => ({
        id: event.id,
        eventType: event.event_type,
        eventNote: event.event_note,
        createdAt: event.created_at
      })),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    contractorBrand,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    job: row.jobs
      ? {
          id: row.jobs.id,
          dispatchStatus: row.jobs.dispatch_status
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function recordPortalWarrantyDocumentViewed(
  warrantyDocumentId: string,
  next = "/portal"
) {
  const context = await loadPortalWarrantyDocumentContext(
    warrantyDocumentId,
    next
  );

  if (!context) {
    return null;
  }

  const signer = context.signers.find(
    (candidate) =>
      candidate.signer_role === "customer" &&
      context.currentUserSignerIds.has(candidate.id) &&
      (candidate.status === "pending" || candidate.status === "requested")
  );

  if (!signer || !canTransitionDocumentSignerStatus(signer.status, "viewed")) {
    return null;
  }

  const existingViewedEvent = context.events.some(
    (event) => event.signer_id === signer.id && event.event_type === "viewed"
  );
  const admin = getSupabaseAdminClient();
  const updateResponse = await admin
    .from("document_signers")
    .update({
      status: "viewed",
      updated_by: context.scope.userId
    })
    .eq("company_id", context.row.company_id)
    .eq("subject_type", "warranty_document")
    .eq("subject_id", warrantyDocumentId)
    .eq("id", signer.id);

  if (updateResponse.error) {
    throw new Error(
      `Unable to mark warranty signer viewed: ${updateResponse.error.message}`
    );
  }

  if (existingViewedEvent) {
    return null;
  }

  const eventResponse = await admin
    .from("document_signature_events")
    .insert({
      company_id: context.row.company_id,
      subject_type: "warranty_document",
      subject_id: warrantyDocumentId,
      signer_id: signer.id,
      event_type: "viewed",
      event_note: "Customer portal warranty document view.",
      metadata: {
        source: "portal",
        portalUserId: context.scope.userId,
        signerRole: signer.signer_role
      },
      created_by: context.scope.userId
    })
    .select(portalDocumentSignatureEventSelect)
    .single();

  if (eventResponse.error) {
    throw new Error(
      `Unable to record warranty viewed event: ${eventResponse.error.message}`
    );
  }

  return eventResponse.data as PortalDocumentSignatureEventRow;
}

async function updatePortalWarrantySignerStatus(input: {
  warrantyDocumentId: string;
  targetStatus: Extract<DocumentSignerStatus, "signed" | "declined">;
  declineReason?: string | null;
  next: string;
}) {
  const context = await loadPortalWarrantyDocumentContext(
    input.warrantyDocumentId,
    input.next
  );

  if (!context) {
    throw new Error(
      "Warranty document is not available in this portal project."
    );
  }

  const signer = context.signers.find(
    (candidate) =>
      candidate.signer_role === "customer" &&
      context.currentUserSignerIds.has(candidate.id) &&
      isPortalWarrantySignerActionable(candidate.status)
  );

  if (!signer) {
    throw new Error(
      "This warranty document is not assigned to your portal email."
    );
  }

  if (
    !canPortalCompleteWarrantySignerStatus(signer.status, input.targetStatus)
  ) {
    throw new Error(
      `Signer status cannot move from ${signer.status} to ${input.targetStatus}.`
    );
  }

  const admin = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const signerUpdate =
    input.targetStatus === "signed"
      ? {
          status: "signed",
          signed_at: now,
          updated_by: context.scope.userId
        }
      : {
          status: "declined",
          declined_at: now,
          updated_by: context.scope.userId
        };
  const signerResponse = await admin
    .from("document_signers")
    .update(signerUpdate)
    .eq("company_id", context.row.company_id)
    .eq("subject_type", "warranty_document")
    .eq("subject_id", input.warrantyDocumentId)
    .eq("id", signer.id)
    .select(portalDocumentSignerSelect)
    .single();
  const updatedSigner = signerResponse.data as PortalDocumentSignerRow | null;

  if (signerResponse.error) {
    throw new Error(
      `Unable to update warranty signer status: ${signerResponse.error.message}`
    );
  }

  if (!updatedSigner) {
    throw new Error("Warranty signer status update did not return a signer.");
  }

  const eventResponse = await admin.from("document_signature_events").insert({
    company_id: context.row.company_id,
    subject_type: "warranty_document",
    subject_id: input.warrantyDocumentId,
    signer_id: signer.id,
    event_type: input.targetStatus,
    event_note:
      input.targetStatus === "declined"
        ? input.declineReason?.trim() || "Customer declined warranty document."
        : "Customer signed warranty document through the portal.",
    metadata: {
      source: "portal",
      portalUserId: context.scope.userId,
      previousStatus: signer.status,
      signerRole: signer.signer_role
    },
    created_by: context.scope.userId
  });

  if (eventResponse.error) {
    throw new Error(
      `Unable to record warranty signature event: ${eventResponse.error.message}`
    );
  }

  const nextSigners = context.signers.map((candidate) =>
    candidate.id === updatedSigner.id ? updatedSigner : candidate
  );

  if (
    input.targetStatus === "signed" &&
    context.row.status !== "signed" &&
    shouldMarkWarrantyDocumentSigned(getWarrantySignerRowsForState(nextSigners))
  ) {
    const documentStatusResponse = await admin
      .from("warranty_documents")
      .update({
        status: "signed",
        updated_by: context.scope.userId
      })
      .eq("company_id", context.row.company_id)
      .eq("id", input.warrantyDocumentId);

    if (documentStatusResponse.error) {
      throw new Error(
        `Unable to mark warranty document signed: ${documentStatusResponse.error.message}`
      );
    }
  }

  return updatedSigner;
}

export async function customerSignPortalWarrantyDocument(
  warrantyDocumentId: string,
  next = "/portal"
) {
  return updatePortalWarrantySignerStatus({
    warrantyDocumentId,
    targetStatus: "signed",
    next
  });
}

export async function customerDeclinePortalWarrantyDocument(
  input: {
    warrantyDocumentId: string;
    declineReason?: string | null;
  },
  next = "/portal"
) {
  return updatePortalWarrantySignerStatus({
    warrantyDocumentId: input.warrantyDocumentId,
    targetStatus: "declined",
    declineReason: input.declineReason,
    next
  });
}

export async function getPortalInvoiceReviewData(
  invoiceId: string,
  next = "/portal"
): Promise<PortalInvoiceReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const invoiceResponse = await supabase
    .from("invoices")
    .select(portalInvoiceSelect)
    .eq("id", invoiceId)
    .maybeSingle();
  const row = invoiceResponse.data as PortalInvoiceRow | null;

  if (invoiceResponse.error) {
    throw new Error(
      `Unable to load the portal invoice review data: ${invoiceResponse.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const [
    lineItemsResponse,
    paymentsResponse,
    paymentEventsResponse,
    contractorBrand
  ] = await Promise.all([
    supabase
      .from("invoice_line_items")
      .select(
        `
          id,
          invoice_id,
          name,
          description,
          quantity,
          unit,
          unit_price,
          line_total,
          sort_order
        `
      )
      .eq("invoice_id", invoiceId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("payments")
      .select(
        `
          id,
          invoice_id,
          amount,
          payment_date,
          payment_method,
          reference,
          status
        `
      )
      .eq("invoice_id", invoiceId)
      .eq("status", "recorded")
      .order("payment_date", { ascending: false }),
    admin
      .from("payment_events")
      .select(
        `
          id,
          invoice_id,
          payment_id,
          event_type,
          actor_type,
          occurred_at,
          payload
        `
      )
      .eq("invoice_id", invoiceId)
      .order("occurred_at", { ascending: false })
      .limit(6),
    getPortalDocumentBrand(row.company_id)
  ]);

  const lineItemRows =
    (lineItemsResponse.data as PortalInvoiceLineItemRow[] | null) ?? [];
  const paymentRows =
    (paymentsResponse.data as PortalPaymentRow[] | null) ?? [];
  const paymentEventRows =
    (paymentEventsResponse.data as PortalPaymentEventRow[] | null) ?? [];

  if (lineItemsResponse.error) {
    throw new Error(
      `Unable to load portal invoice line items: ${lineItemsResponse.error.message}`
    );
  }

  if (paymentsResponse.error) {
    throw new Error(
      `Unable to load portal invoice payments: ${paymentsResponse.error.message}`
    );
  }

  if (paymentEventsResponse.error) {
    throw new Error(
      `Unable to load portal invoice payment activity: ${paymentEventsResponse.error.message}`
    );
  }

  const portalView = await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "invoice",
      subjectId: row.id
    },
    next
  );
  if (portalView.isFirstView) {
    await recordInvoiceNotificationEvent({
      organizationId: row.company_id,
      invoiceId: row.id,
      customerId: row.customer_id,
      projectId: row.project_id,
      invoiceReferenceNumber: row.reference_number,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: portalView.portalUserId,
      occurredAt: new Date().toISOString()
    });
  }

  const paidAmount = paymentRows.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const paymentWorkflow = computeInvoicePaymentWorkflowGate({
    invoiceStatus: row.status,
    balanceDueAmount: formatMoney(row.balance_due_amount)
  });

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    jobId: row.job_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotalAmount: formatMoney(row.subtotal_amount),
    taxAmount: formatMoney(row.tax_amount),
    discountAmount: formatMoney(row.discount_amount),
    retainageHeldAmount: formatMoney(row.retainage_held_amount),
    totalAmount: formatMoney(row.total_amount),
    balanceDueAmount: formatMoney(row.balance_due_amount),
    paidAmount: paidAmount.toFixed(2),
    notes: row.notes,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    contractorBrand,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    lineItems: lineItemRows.map((lineItem) => ({
      id: lineItem.id,
      name: lineItem.name,
      description: lineItem.description,
      quantity: formatQuantity(lineItem.quantity),
      unit: lineItem.unit,
      unitPrice: formatMoney(lineItem.unit_price),
      lineTotal: formatMoney(lineItem.line_total),
      sortOrder: lineItem.sort_order
    })),
    payments: paymentRows.map((payment) => ({
      id: payment.id,
      amount: formatMoney(payment.amount),
      paymentDate: payment.payment_date,
      paymentMethod: payment.payment_method,
      reference: payment.reference,
      status: payment.status
    })),
    paymentEvents: paymentEventRows.map(mapPortalPaymentEvent),
    paymentWorkflow,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPortalChangeOrderReviewData(
  changeOrderId: string,
  next = "/portal"
): Promise<PortalChangeOrderReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("change_orders")
    .select(portalChangeOrderSelect)
    .eq("id", changeOrderId)
    .maybeSingle();
  const row = response.data as PortalChangeOrderRow | null;

  if (response.error) {
    throw new Error(
      `Unable to load the portal change order review data: ${response.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "change_order",
      subjectId: row.id
    },
    next
  );

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    contractId: row.contract_id,
    invoiceId: row.invoice_id,
    appliedInvoiceLineItemId: row.applied_invoice_line_item_id,
    status: row.status,
    title: row.title,
    description: row.description,
    scopeChangeNotes: row.scope_change_notes,
    priceAdjustment: formatMoney(row.price_adjustment),
    decisionNote: row.decision_note,
    sentAt: row.sent_at,
    customerViewedAt: row.customer_viewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    contract: row.contracts
      ? {
          id: row.contracts.id,
          title: row.contracts.title,
          status: row.contracts.status
        }
      : null,
    invoice: row.invoices
      ? {
          id: row.invoices.id,
          referenceNumber: row.invoices.reference_number,
          status: row.invoices.status,
          balanceDueAmount: formatMoney(row.invoices.balance_due_amount)
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
