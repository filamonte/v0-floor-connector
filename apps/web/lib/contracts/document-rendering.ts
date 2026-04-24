import { getServerEnv, STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import type { Contract } from "@floorconnector/types";

import type { EstimateDetail } from "@/lib/estimates/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { escapeHtmlText, hasMeaningfulSanitizedHtml, sanitizeHtml } from "@/lib/html/sanitize";

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function buildScopeItemsHtml(estimate: EstimateDetail) {
  const scopeItems = estimate.content.scopeItems.filter((item) => item.text.trim().length > 0);

  if (scopeItems.length === 0) {
    return "<p>No scope items were listed on the approved estimate.</p>";
  }

  return `<ul>${scopeItems
    .map((item) => `<li>${escapeHtmlText(item.text)}</li>`)
    .join("")}</ul>`;
}

function buildPricingSummaryHtml(estimate: EstimateDetail) {
  return `
    <table>
      <tbody>
        <tr><th align="left">Subtotal</th><td align="right">${escapeHtmlText(formatMoney(estimate.subtotalAmount))}</td></tr>
        <tr><th align="left">Taxable sales</th><td align="right">${escapeHtmlText(formatMoney(estimate.taxableSalesAmount))}</td></tr>
        <tr><th align="left">Exempt sales</th><td align="right">${escapeHtmlText(formatMoney(estimate.exemptSalesAmount))}</td></tr>
        <tr><th align="left">Tax</th><td align="right">${escapeHtmlText(formatMoney(estimate.taxAmount))}</td></tr>
        <tr><th align="left">Discount</th><td align="right">${escapeHtmlText(formatMoney(estimate.discountAmount))}</td></tr>
        <tr><th align="left">Total</th><td align="right">${escapeHtmlText(formatMoney(estimate.totalAmount))}</td></tr>
      </tbody>
    </table>
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
  estimate: EstimateDetail;
}) {
  const introHtml = hasMeaningfulSanitizedHtml(input.templateBody)
    ? sanitizeHtml(input.templateBody)
    : "<p>This agreement is generated from the approved estimate and project record.</p>";
  const scopeSummaryHtml = hasMeaningfulSanitizedHtml(input.estimate.content.scopeSummaryHtml)
    ? sanitizeHtml(input.estimate.content.scopeSummaryHtml)
    : "<p>No scope summary was provided on the approved estimate.</p>";
  const inclusionsHtml = hasMeaningfulSanitizedHtml(input.estimate.content.inclusionsHtml)
    ? sanitizeHtml(input.estimate.content.inclusionsHtml)
    : "<p>No inclusions were provided on the approved estimate.</p>";
  const exclusionsHtml = hasMeaningfulSanitizedHtml(input.estimate.content.exclusionsHtml)
    ? sanitizeHtml(input.estimate.content.exclusionsHtml)
    : "<p>No exclusions were provided on the approved estimate.</p>";
  const termsHtml = hasMeaningfulSanitizedHtml(input.estimate.content.termsHtml)
    ? sanitizeHtml(input.estimate.content.termsHtml)
    : "<p>No terms were provided on the approved estimate.</p>";

  return sanitizeHtml(`
    <article>
      <section>
        ${introHtml}
      </section>
      ${renderSection("Scope Summary", scopeSummaryHtml)}
      ${renderSection("Scope Items", buildScopeItemsHtml(input.estimate))}
      ${renderSection("Inclusions", inclusionsHtml)}
      ${renderSection("Exclusions", exclusionsHtml)}
      ${renderSection("Terms", termsHtml)}
      ${renderSection("Pricing Summary", buildPricingSummaryHtml(input.estimate))}
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
