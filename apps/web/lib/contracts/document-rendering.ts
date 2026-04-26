import { getServerEnv, STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import type { Contract } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { escapeHtmlText, hasMeaningfulSanitizedHtml, sanitizeHtml } from "@/lib/html/sanitize";

type ContractEstimateSnapshotContent = {
  scopeItems?: ContractEstimateSnapshotContentItem[];
};

type ContractEstimateSnapshotContentItem = {
  id?: string;
  text?: string;
  includeInOutput?: boolean;
  sortOrder?: number;
};

export type ContractEstimateSnapshotRenderInput = {
  estimateReferenceNumber: string;
  projectNameSnapshot: string;
  customerNameSnapshot: string;
  customerCompanyNameSnapshot: string | null;
  customerEmailSnapshot: string | null;
  customerPhoneSnapshot: string | null;
  customerAddressLine1Snapshot: string | null;
  customerAddressLine2Snapshot: string | null;
  customerCitySnapshot: string | null;
  customerStateRegionSnapshot: string | null;
  customerPostalCodeSnapshot: string | null;
  customerCountryCodeSnapshot: string | null;
  serviceAddressLine1Snapshot: string | null;
  serviceAddressLine2Snapshot: string | null;
  serviceCitySnapshot: string | null;
  serviceStateRegionSnapshot: string | null;
  servicePostalCodeSnapshot: string | null;
  serviceCountryCodeSnapshot: string | null;
  subtotalAmount: string;
  taxableSalesAmount: string;
  exemptSalesAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  scopeSummaryHtml: string | null;
  inclusionsHtml: string | null;
  exclusionsHtml: string | null;
  termsHtml: string | null;
  contentSnapshot: Record<string, unknown> | null;
};

export type ContractEstimateSnapshotItemRenderInput = {
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  lineTotal: string;
  sortOrder: number;
};

function formatAddress(parts: Array<string | null | undefined>) {
  const filtered = parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part.length > 0);

  return filtered.length > 0 ? filtered.join(", ") : null;
}

function parseSnapshotContent(
  value: Record<string, unknown> | null | undefined
): ContractEstimateSnapshotContent {
  if (!value || typeof value !== "object") {
    return {};
  }

  const scopeItems = Array.isArray(value.scopeItems) ? value.scopeItems : [];

  return {
    scopeItems: scopeItems
      .filter(
        (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object"
      )
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : undefined,
        text: typeof item.text === "string" ? item.text : undefined,
        includeInOutput: item.includeInOutput !== false,
        sortOrder:
          typeof item.sortOrder === "number" && Number.isFinite(item.sortOrder)
            ? item.sortOrder
            : undefined
      }))
  };
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function buildScopeItemsHtml(
  snapshot: ContractEstimateSnapshotRenderInput,
  snapshotItems: ContractEstimateSnapshotItemRenderInput[]
) {
  const scopeItems = (parseSnapshotContent(snapshot.contentSnapshot).scopeItems ?? [])
    .filter((item) => item.includeInOutput !== false && item.text?.trim())
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  if (scopeItems.length > 0) {
    return `<ul>${scopeItems
      .map((item) => `<li>${escapeHtmlText(item.text?.trim() ?? "")}</li>`)
      .join("")}</ul>`;
  }

  const commercialLines = snapshotItems.filter((item) => item.name.trim().length > 0);

  if (commercialLines.length === 0) {
    return "<p>No scope items were listed on the approved estimate.</p>";
  }

  return `<ul>${commercialLines
    .map((item) => {
      const quantityLabel = `${Number(item.quantity).toFixed(2)} ${item.unit}`;
      return `<li>${escapeHtmlText(`${quantityLabel} ${item.name}`)}</li>`;
    })
    .join("")}</ul>`;
}

function buildCommercialLineItemsHtml(snapshotItems: ContractEstimateSnapshotItemRenderInput[]) {
  if (snapshotItems.length === 0) {
    return "<p>No commercial line items were available on the approved estimate snapshot.</p>";
  }

  return `
    <table>
      <thead>
        <tr>
          <th align="left">Item</th>
          <th align="left">Quantity</th>
          <th align="right">Line total</th>
        </tr>
      </thead>
      <tbody>
        ${snapshotItems
          .slice()
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((item) => {
            const description = item.description?.trim()
              ? `<div>${escapeHtmlText(item.description)}</div>`
              : "";

            return `
              <tr>
                <td>
                  <div>${escapeHtmlText(item.name)}</div>
                  ${description}
                </td>
                <td>${escapeHtmlText(`${Number(item.quantity).toFixed(2)} ${item.unit}`)}</td>
                <td align="right">${escapeHtmlText(formatMoney(item.lineTotal))}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function buildPricingSummaryHtml(snapshot: ContractEstimateSnapshotRenderInput) {
  return `
    <table>
      <tbody>
        <tr><th align="left">Subtotal</th><td align="right">${escapeHtmlText(formatMoney(snapshot.subtotalAmount))}</td></tr>
        <tr><th align="left">Taxable sales</th><td align="right">${escapeHtmlText(formatMoney(snapshot.taxableSalesAmount))}</td></tr>
        <tr><th align="left">Exempt sales</th><td align="right">${escapeHtmlText(formatMoney(snapshot.exemptSalesAmount))}</td></tr>
        <tr><th align="left">Tax</th><td align="right">${escapeHtmlText(formatMoney(snapshot.taxAmount))}</td></tr>
        <tr><th align="left">Discount</th><td align="right">${escapeHtmlText(formatMoney(snapshot.discountAmount))}</td></tr>
        <tr><th align="left">Total</th><td align="right">${escapeHtmlText(formatMoney(snapshot.totalAmount))}</td></tr>
      </tbody>
    </table>
  `;
}

function buildCustomerSummaryHtml(snapshot: ContractEstimateSnapshotRenderInput) {
  const address = formatAddress([
    snapshot.customerAddressLine1Snapshot,
    snapshot.customerAddressLine2Snapshot,
    snapshot.customerCitySnapshot,
    snapshot.customerStateRegionSnapshot,
    snapshot.customerPostalCodeSnapshot,
    snapshot.customerCountryCodeSnapshot
  ]);

  return `
    <p><strong>${escapeHtmlText(snapshot.customerNameSnapshot)}</strong></p>
    ${
      snapshot.customerCompanyNameSnapshot
        ? `<p>${escapeHtmlText(snapshot.customerCompanyNameSnapshot)}</p>`
        : ""
    }
    ${snapshot.customerEmailSnapshot ? `<p>${escapeHtmlText(snapshot.customerEmailSnapshot)}</p>` : ""}
    ${snapshot.customerPhoneSnapshot ? `<p>${escapeHtmlText(snapshot.customerPhoneSnapshot)}</p>` : ""}
    ${address ? `<p>${escapeHtmlText(address)}</p>` : "<p>No customer address was captured on the approved estimate snapshot.</p>"}
  `;
}

function buildServiceAddressHtml(snapshot: ContractEstimateSnapshotRenderInput) {
  const serviceAddress = formatAddress([
    snapshot.serviceAddressLine1Snapshot,
    snapshot.serviceAddressLine2Snapshot,
    snapshot.serviceCitySnapshot,
    snapshot.serviceStateRegionSnapshot,
    snapshot.servicePostalCodeSnapshot,
    snapshot.serviceCountryCodeSnapshot
  ]);

  return `
    <p><strong>${escapeHtmlText(snapshot.projectNameSnapshot)}</strong></p>
    ${
      serviceAddress
        ? `<p>${escapeHtmlText(serviceAddress)}</p>`
        : "<p>No service address was captured on the approved estimate snapshot.</p>"
    }
    <p>Estimate reference: ${escapeHtmlText(snapshot.estimateReferenceNumber)}</p>
  `;
}

function renderSection(title: string, bodyHtml: string) {
  return `
    <section>
      <h2>${escapeHtmlText(title)}</h2>
      ${bodyHtml}
    </section>
  `;
}

export function buildContractRenderedHtml(input: {
  templateBody: string;
  snapshot: ContractEstimateSnapshotRenderInput;
  snapshotItems: ContractEstimateSnapshotItemRenderInput[];
}) {
  const introHtml = hasMeaningfulSanitizedHtml(input.templateBody)
    ? sanitizeHtml(input.templateBody)
    : "<p>This agreement is generated from the approved estimate and project record.</p>";
  const scopeSummaryHtml = hasMeaningfulSanitizedHtml(input.snapshot.scopeSummaryHtml)
    ? sanitizeHtml(input.snapshot.scopeSummaryHtml)
    : "<p>No scope summary was provided on the approved estimate.</p>";
  const inclusionsHtml = hasMeaningfulSanitizedHtml(input.snapshot.inclusionsHtml)
    ? sanitizeHtml(input.snapshot.inclusionsHtml)
    : "<p>No inclusions were provided on the approved estimate.</p>";
  const exclusionsHtml = hasMeaningfulSanitizedHtml(input.snapshot.exclusionsHtml)
    ? sanitizeHtml(input.snapshot.exclusionsHtml)
    : "<p>No exclusions were provided on the approved estimate.</p>";
  const termsHtml = hasMeaningfulSanitizedHtml(input.snapshot.termsHtml)
    ? sanitizeHtml(input.snapshot.termsHtml)
    : "<p>No terms were provided on the approved estimate.</p>";

  return sanitizeHtml(`
    <article>
      <section>
        ${introHtml}
      </section>
      ${renderSection("Customer", buildCustomerSummaryHtml(input.snapshot))}
      ${renderSection("Service Address", buildServiceAddressHtml(input.snapshot))}
      ${renderSection("Scope Summary", scopeSummaryHtml)}
      ${renderSection("Scope Items", buildScopeItemsHtml(input.snapshot, input.snapshotItems))}
      ${renderSection("Commercial Line Items", buildCommercialLineItemsHtml(input.snapshotItems))}
      ${renderSection("Inclusions", inclusionsHtml)}
      ${renderSection("Exclusions", exclusionsHtml)}
      ${renderSection("Terms", termsHtml)}
      ${renderSection("Pricing Summary", buildPricingSummaryHtml(input.snapshot))}
    </article>
  `);
}

export function buildContractPdfHtmlDocument(input: {
  contractTitle: string;
  renderedHtml: string;
}) {
  const safeTitle = escapeHtmlText(input.contractTitle);
  const safeBody = sanitizeHtml(input.renderedHtml);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>
      body { color: #17243b; font-family: Arial, sans-serif; margin: 42px; }
      article { display: block; }
      h1, h2, h3 { color: #17243b; margin: 0 0 12px; }
      h1 { font-size: 28px; }
      h2 { border-bottom: 1px solid #d9dee8; font-size: 18px; margin-top: 28px; padding-bottom: 8px; }
      p, li, td, th, div, span, blockquote { font-size: 14px; line-height: 1.65; }
      table { border-collapse: collapse; margin-top: 8px; width: 100%; }
      th, td { border: 1px solid #d9dee8; padding: 8px 10px; vertical-align: top; }
      ul, ol { padding-left: 24px; }
      blockquote { border-left: 4px solid #d9dee8; margin: 16px 0; padding-left: 16px; }
      hr { border: 0; border-top: 1px solid #d9dee8; margin: 24px 0; }
      a { color: #1f5fd6; text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    ${safeBody}
  </body>
</html>`;
}

function getPdfBrowserExecutablePath() {
  const env = getServerEnv();
  const configuredPath = (env as { PDF_BROWSER_EXECUTABLE_PATH?: string | null })
    .PDF_BROWSER_EXECUTABLE_PATH;

  if (configuredPath) {
    return configuredPath;
  }

  throw new Error(
    "Contract PDF generation requires PDF_BROWSER_EXECUTABLE_PATH to point to a Chromium or Edge executable."
  );
}

export async function createAndUploadContractPdf(input: {
  contract: Pick<Contract, "id" | "organizationId" | "title" | "renderedContent">;
}) {
  const { execFile } = await import("node:child_process");
  const { mkdtemp, readFile, rm, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const browserPath = getPdfBrowserExecutablePath();
  const tempDir = await mkdtemp(path.join(tmpdir(), "floorconnector-contract-pdf-"));
  const htmlPath = path.join(tempDir, "contract.html");
  const pdfPath = path.join(tempDir, "contract.pdf");
  const fileName = `${input.contract.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "contract"}.pdf`;

  try {
    await writeFile(
      htmlPath,
      buildContractPdfHtmlDocument({
        contractTitle: input.contract.title,
        renderedHtml: input.contract.renderedContent
      }),
      "utf8"
    );

    await new Promise<void>((resolve, reject) => {
      execFile(
        browserPath,
        [
          "--headless=new",
          "--disable-gpu",
          "--no-first-run",
          "--no-default-browser-check",
          `--print-to-pdf=${pdfPath}`,
          pathToFileURL(htmlPath).toString()
        ],
        (error) => {
          if (error) {
            reject(
              error instanceof Error
                ? error
                : new Error("Unknown browser PDF generation failure.")
            );
            return;
          }

          resolve();
        }
      );
    });

    const pdfBuffer = await readFile(pdfPath);
    const storagePath = `${input.contract.organizationId}/contracts/${input.contract.id}/sent-contract.pdf`;
    const supabase = await getSupabaseServerClient();
    const uploadResponse = await supabase.storage
      .from(STORAGE_BUCKET_NAMES.documents)
      .upload(storagePath, pdfBuffer, {
        upsert: true,
        contentType: "application/pdf"
      });

    if (uploadResponse.error) {
      throw new Error(`Unable to upload contract PDF: ${uploadResponse.error.message}`);
    }

    return {
      storagePath,
      fileName,
      mimeType: "application/pdf" as const,
      generatedAt: new Date().toISOString()
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
