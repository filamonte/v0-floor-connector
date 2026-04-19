import { NextResponse } from "next/server";

import { verifyAndNormalizePaymentGatewayWebhookEvent } from "@floorconnector/integrations";

import { processProviderPaymentWebhookEvent } from "@/lib/invoices/data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const event = await verifyAndNormalizePaymentGatewayWebhookEvent("stripe", {
      headers: request.headers,
      rawBody
    });
    const result = await processProviderPaymentWebhookEvent(event);

    return NextResponse.json({
      received: true,
      provider: event.gatewayProvider,
      eventType: event.providerEventType,
      duplicate: result.duplicate,
      handled: result.handled,
      reason: "reason" in result ? result.reason : undefined
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process payment webhook.";
    const status = message.toLowerCase().includes("signature") ? 400 : 500;

    return NextResponse.json(
      {
        received: false,
        error: message
      },
      { status }
    );
  }
}
