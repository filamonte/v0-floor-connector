import { NextResponse } from "next/server";

import { getPortalSharedEvidenceDownloadUrl } from "@/lib/portal-evidence-grants/data";

type PortalEvidenceDownloadRouteProps = {
  params: Promise<{
    projectId: string;
    grantId: string;
  }>;
};

function buildPortalProjectUrl(
  requestUrl: string,
  projectId: string,
  params: Record<string, string | undefined>
) {
  const url = new URL(`/portal/projects/${projectId}`, requestUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  url.hash = "shared-project-evidence";

  return url;
}

export async function GET(
  request: Request,
  { params }: PortalEvidenceDownloadRouteProps
) {
  const { projectId, grantId } = await params;

  try {
    const signedUrl = await getPortalSharedEvidenceDownloadUrl({
      projectId,
      grantId,
      next: `/portal/projects/${projectId}`
    });

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return NextResponse.redirect(
      buildPortalProjectUrl(request.url, projectId, {
        error:
          error instanceof Error
            ? error.message
            : "Shared evidence is not available."
      })
    );
  }
}
