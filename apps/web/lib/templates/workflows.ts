import "server-only";

import type { DocumentTemplate, TemplateType } from "@floorconnector/types";

import { resolveDocumentTemplateReference } from "@/lib/templates/data";
import {
  prepareContractTemplateMergeDataFromEstimate,
  prepareEstimateTemplateMergeData,
  prepareInvoiceTemplateMergeData,
  renderTemplateString,
  type TemplateMergeRecord
} from "@/lib/templates/merge-data";

// Workflow helpers stay thin on purpose: template ownership and selection come
// from the shared template system, while merge data comes from canonical
// business records. Future document generation flows should build on these
// helpers rather than creating module-specific template pipelines.

export type PreparedTemplateRenderContext = {
  template: DocumentTemplate;
  mergeData: TemplateMergeRecord;
  renderedSubject: string | null;
  renderedBody: string;
};

async function renderTemplateContext(options: {
  templateType: TemplateType;
  templateId?: string | null;
  mergeData: TemplateMergeRecord;
  next?: string;
}): Promise<PreparedTemplateRenderContext> {
  const template = await resolveDocumentTemplateReference({
    templateType: options.templateType,
    templateId: options.templateId,
    next: options.next
  });

  if (!template) {
    throw new Error(`No ${options.templateType} template is available for this organization.`);
  }

  return {
    template,
    mergeData: options.mergeData,
    renderedSubject: renderTemplateString(template.subjectTemplate, options.mergeData),
    renderedBody: renderTemplateString(template.bodyTemplate, options.mergeData) ?? ""
  };
}

export async function prepareEstimateTemplateContext(options: {
  estimateId: string;
  templateId?: string | null;
  next?: string;
}) {
  const mergeData = await prepareEstimateTemplateMergeData(
    options.estimateId,
    options.next ?? "/estimates"
  );

  return renderTemplateContext({
    templateType: "estimate",
    templateId: options.templateId,
    mergeData,
    next: options.next ?? "/estimates"
  });
}

export async function prepareInvoiceTemplateContext(options: {
  invoiceId: string;
  templateId?: string | null;
  next?: string;
}) {
  const mergeData = await prepareInvoiceTemplateMergeData(
    options.invoiceId,
    options.next ?? "/invoices"
  );

  return renderTemplateContext({
    templateType: "invoice",
    templateId: options.templateId,
    mergeData,
    next: options.next ?? "/invoices"
  });
}

export async function prepareContractTemplateContextFromEstimate(options: {
  estimateId: string;
  templateId?: string | null;
  next?: string;
}) {
  const mergeData = await prepareContractTemplateMergeDataFromEstimate(
    options.estimateId,
    options.next ?? "/estimates"
  );

  return renderTemplateContext({
    templateType: "contract",
    templateId: options.templateId,
    mergeData,
    next: options.next ?? "/estimates"
  });
}
