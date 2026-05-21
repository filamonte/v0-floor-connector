import { NextResponse } from "next/server";

import {
  buildExportFilename,
  buildJsonManifest,
  getExportModuleDefinition,
  isExportFormat,
  serializeCsv,
  summarizeExportError,
  type ExportFormat
} from "@/lib/data-export/core";
import { getDataExportScope, loadModuleExportData } from "@/lib/data-export/data";
import { recordDataExportEvent } from "@/lib/data-export/events";

type RouteContext = {
  params: Promise<{
    module: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  const moduleDefinition = getExportModuleDefinition(params.module);

  if (!moduleDefinition) {
    return NextResponse.json(
      { error: "Unsupported export module." },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const requestedFormat = url.searchParams.get("format");
  const format: ExportFormat = isExportFormat(requestedFormat)
    ? requestedFormat
    : "csv";
  const exportedAt = new Date().toISOString();
  const scope = await getDataExportScope();

  try {
    const { organization, rows } = await loadModuleExportData(moduleDefinition, scope);
    const filename = buildExportFilename({
      organizationSlug: organization.slug,
      moduleKey: moduleDefinition.key,
      format,
      exportedAt
    });

    await recordDataExportEvent({
      scope,
      moduleKey: moduleDefinition.key,
      format,
      status: "success",
      recordCount: rows.length,
      filename,
      requestRoute: url.pathname
    });

    if (format === "json") {
      const manifest = buildJsonManifest({
        module: moduleDefinition,
        organization,
        rows,
        exportedAt
      });

      return new NextResponse(JSON.stringify(manifest, null, 2), {
        headers: downloadHeaders(filename, "application/json; charset=utf-8")
      });
    }

    return new NextResponse(serializeCsv({ module: moduleDefinition, rows }), {
      headers: downloadHeaders(filename, "text/csv; charset=utf-8")
    });
  } catch (error) {
    try {
      await recordDataExportEvent({
        scope,
        moduleKey: moduleDefinition.key,
        format,
        status: "failed",
        recordCount: null,
        filename: null,
        error,
        requestRoute: url.pathname
      });
    } catch {
      // Export failure responses stay customer-safe even if audit recording is also unavailable.
    }

    return NextResponse.json(
      { error: summarizeExportError(error) },
      { status: 500 }
    );
  }
}

function downloadHeaders(filename: string, contentType: string) {
  return {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store"
  };
}
