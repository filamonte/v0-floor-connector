"use client";

import { useState } from "react";

type SaasSubscriptionCheckoutButtonProps = {
  canStartCheckout: boolean;
  unavailableReason: string | null;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

export function SaasSubscriptionCheckoutButton({
  canStartCheckout,
  unavailableReason
}: SaasSubscriptionCheckoutButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function startCheckout() {
    if (!canStartCheckout) {
      return;
    }

    setIsStarting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/stripe/create-saas-subscription-checkout", {
        method: "POST"
      });
      const payload = (await response.json()) as CheckoutResponse;

      if (!response.ok || !payload.url) {
        setErrorMessage(
          payload.error ?? "Subscription checkout is unavailable right now."
        );
        setIsStarting(false);
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setErrorMessage(
        "Subscription checkout is unavailable right now. Try again later or continue with platform review."
      );
      setIsStarting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={!canStartCheckout || isStarting}
        onClick={() => {
          void startCheckout();
        }}
        className="inline-flex h-11 items-center justify-center rounded-full bg-[#c75f12] px-5 text-sm font-semibold text-white transition hover:bg-[#a94f0d] disabled:cursor-not-allowed disabled:bg-[#b9aea4]"
      >
        {isStarting ? "Opening checkout..." : "Start founder subscription checkout"}
      </button>
      {!canStartCheckout && unavailableReason ? (
        <p className="max-w-2xl text-xs leading-5 text-[#756c63]">
          {unavailableReason}
        </p>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
