"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

type SetupIntentFormProps = {
  publishableKey: string | null;
  initialPaymentMethodSaved: boolean;
};

type SetupIntentResponse = {
  clientSecret?: string;
  error?: string;
};

type SavePaymentMethodResponse = {
  stripePaymentMethodId?: string;
  error?: string;
};

function getSafeBillingErrorMessage(message?: string) {
  if (!message) {
    return "Billing setup could not be completed right now. You can retry or continue setup and add billing later.";
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("declined") ||
    lowerMessage.includes("card") ||
    lowerMessage.includes("payment method")
  ) {
    return message;
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "We could not reach secure billing. Check your connection, then retry or continue setup and add billing later.";
  }

  if (lowerMessage.includes("configured") || lowerMessage.includes("key")) {
    return "Secure billing is not available right now. You can continue setup and add billing later.";
  }

  return "Billing setup could not be completed right now. You can retry or continue setup and add billing later.";
}

function BillingSetupInnerForm({
  clientSecret,
  initialPaymentMethodSaved
}: {
  clientSecret: string;
  initialPaymentMethodSaved: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(initialPaymentMethodSaved);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const submitResult = await elements.submit();

    if (submitResult.error) {
      setErrorMessage(getSafeBillingErrorMessage(submitResult.error.message));
      setIsSubmitting(false);
      return;
    }

    const confirmResult = await stripe.confirmSetup({
      elements,
      clientSecret,
      redirect: "if_required"
    });

    if (confirmResult.error) {
      setErrorMessage(getSafeBillingErrorMessage(confirmResult.error.message));
      setIsSubmitting(false);
      return;
    }

    if (confirmResult.setupIntent.status !== "succeeded") {
      setErrorMessage("Billing setup needs one more step before this payment method can be saved. Retry or continue setup and add billing later.");
      setIsSubmitting(false);
      return;
    }

    let saveResponse: Response;
    let savePayload: SavePaymentMethodResponse;

    try {
      saveResponse = await fetch("/api/stripe/save-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          setupIntentId: confirmResult.setupIntent.id
        })
      });
      savePayload = (await saveResponse.json()) as SavePaymentMethodResponse;
    } catch {
      setErrorMessage(getSafeBillingErrorMessage("network"));
      setIsSubmitting(false);
      return;
    }

    if (!saveResponse.ok || !savePayload.stripePaymentMethodId) {
      setErrorMessage(getSafeBillingErrorMessage(savePayload.error));
      setIsSubmitting(false);
      return;
    }

    setIsSaved(true);
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="space-y-5"
    >
      <div className="rounded-xl border border-[#d8d1c9] bg-white p-4">
        <PaymentElement />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <p className="font-semibold">Billing setup did not finish.</p>
          <p className="mt-1">{errorMessage}</p>
        </div>
      ) : null}

      {isSaved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <span className="font-semibold">Payment method saved.</span> You can continue to activation review. No charge, invoice, or subscription has been created.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#11100f] px-5 text-sm font-semibold text-white transition hover:bg-[#2b241f] disabled:cursor-not-allowed disabled:bg-[#a49b91]"
        >
          {isSubmitting ? "Saving..." : "Save payment method"}
        </button>
        <Link
          href="/setup/pending-activation"
          className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
            isSaved
              ? "bg-[#c75f12] text-white hover:bg-[#a94f0d]"
              : "border border-[#d8d1c9] bg-white text-[#4e473f] hover:border-[#171412]"
          }`}
        >
          {isSaved ? "Continue to activation" : "Continue and add billing later"}
        </Link>
      </div>
    </form>
  );
}

function ContinueWithoutStripeLink({
  reason,
  onRetry
}: {
  reason: string;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
      <div>
        <p className="font-semibold">Secure billing setup is unavailable right now.</p>
        <p className="mt-1 text-amber-900">{reason}</p>
      </div>
      <p className="text-amber-900">
        You can still continue into founder early access and add a billing method before platform activation.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-300 bg-white px-5 text-sm font-semibold text-amber-950 transition hover:border-amber-500"
          >
            Retry billing setup
          </button>
        ) : null}
        <Link
          href="/setup/pending-activation"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#11100f] px-5 text-sm font-semibold text-white transition hover:bg-[#2b241f]"
        >
          Continue and add billing later
        </Link>
      </div>
    </div>
  );
}

export function SetupIntentForm({
  publishableKey,
  initialPaymentMethodSaved
}: SetupIntentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(publishableKey));
  const [retryKey, setRetryKey] = useState(0);
  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  useEffect(() => {
    if (!publishableKey) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function createSetupIntent() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/stripe/create-setup-intent", {
          method: "POST"
        });
        const payload = (await response.json()) as SetupIntentResponse;

        if (!isMounted) {
          return;
        }

        if (!response.ok || !payload.clientSecret) {
          setErrorMessage(getSafeBillingErrorMessage(payload.error));
          setClientSecret(null);
          return;
        }

        setClientSecret(payload.clientSecret);
      } catch {
        if (isMounted) {
          setErrorMessage(getSafeBillingErrorMessage("network"));
          setClientSecret(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void createSetupIntent();

    return () => {
      isMounted = false;
    };
  }, [publishableKey, retryKey]);

  if (!publishableKey) {
    return (
      <ContinueWithoutStripeLink reason="Secure card collection is not configured yet." />
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#d8d1c9] bg-[#fbfaf8] p-5 text-sm leading-6 text-[#4e473f]">
        <p className="font-semibold">Loading secure billing form</p>
        <p className="mt-1">This usually takes a few seconds. No payment will be collected.</p>
      </div>
    );
  }

  if (errorMessage || !clientSecret || !stripePromise) {
    return (
      <ContinueWithoutStripeLink
        reason={errorMessage ?? "Secure card collection is unavailable right now."}
        onRetry={() => setRetryKey((current) => current + 1)}
      />
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <BillingSetupInnerForm
        clientSecret={clientSecret}
        initialPaymentMethodSaved={initialPaymentMethodSaved}
      />
    </Elements>
  );
}
