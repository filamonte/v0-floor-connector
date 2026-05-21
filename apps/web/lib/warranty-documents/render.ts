import type { DocumentTemplate } from "@floorconnector/types";

export type WarrantyDocumentMergeData = {
  organization: {
    displayName: string;
    legalName: string | null;
  };
  customer: {
    name: string;
  };
  project: {
    name: string;
  };
  job: {
    label: string;
  };
  serviceTicket: {
    title: string;
    status: string;
  };
  warranty: {
    documentTitle: string;
    status: string;
    startDate: string;
    endDate: string;
    basis: string;
  };
  signatures: {
    customerPlaceholder: string;
    contractorPlaceholder: string;
  };
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getMergeValue(data: WarrantyDocumentMergeData, path: string): string {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, data);

  return typeof value === "string" ? value : "";
}

export function renderWarrantyTemplateText(
  template: Pick<DocumentTemplate, "bodyTemplate">,
  data: WarrantyDocumentMergeData
) {
  return template.bodyTemplate.replaceAll(
    /\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g,
    (_match, path: string) => getMergeValue(data, path)
  );
}

export function renderWarrantyTemplateHtml(
  template: Pick<DocumentTemplate, "bodyTemplate">,
  data: WarrantyDocumentMergeData
) {
  const renderedText = renderWarrantyTemplateText(template, data);

  return renderedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`
    )
    .join("\n");
}
