"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  SignaturePad,
  type SignaturePadHandle
} from "@/components/ui/signature-pad";
import { recordOnsiteContractSignatureAction } from "@/lib/contracts/actions";

type OnsiteSignatureModalProps = {
  contractId: string;
  signerId: string;
  contractTitle: string;
  contractReference: string;
  customerName: string;
  depositHref?: string | null;
};

export function OnsiteSignatureModal({
  contractId,
  signerId,
  contractTitle,
  contractReference,
  customerName,
  depositHref
}: OnsiteSignatureModalProps) {
  const router = useRouter();
  const signaturePadRef = useRef<SignaturePadHandle | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    if (isPending) {
      return;
    }

    setError(null);
    setIsOpen(false);
    signaturePadRef.current?.clear();
  }

  function handleSubmit() {
    const signatureImage = signaturePadRef.current?.getSignature();

    if (!signatureImage) {
      setError("Capture a customer signature before completing.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await recordOnsiteContractSignatureAction({
        contractId,
        signerId,
        signatureImage
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      signaturePadRef.current?.clear();
      router.replace(
        `/contracts/${contractId}?message=${encodeURIComponent(
          depositHref
            ? "Customer signature was captured onsite. Create or collect the deposit next."
            : "Customer signature was captured onsite."
        )}`
      );
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
      >
        Capture onsite signature
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-[#17120f]/80 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onsite-signature-title"
        >
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-[8px] bg-[#f8f5f1] shadow-2xl">
            <div className="border-b border-[#d9cdc2] bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                    Onsite signature
                  </p>
                  <h2
                    id="onsite-signature-title"
                    className="mt-2 text-2xl font-semibold tracking-tight text-[#17120f]"
                  >
                    {contractTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[#6f6256]">
                    {contractReference} for {customerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full border border-[#d9cdc2] bg-white px-4 py-2 text-sm font-medium text-[#4a4037] transition hover:border-[#bda58f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="mx-auto max-w-3xl space-y-5">
                <div className="rounded-[6px] border border-[#d9cdc2] bg-white px-5 py-4">
                  <p className="text-lg font-semibold text-[#17120f]">
                    Please review and sign below.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f6256]">
                    By completing this signature, the customer signature is recorded on the
                    same contract used by the contractor app and portal.
                  </p>
                </div>

                <SignaturePad
                  ref={signaturePadRef}
                  label={`Signature for ${customerName}`}
                  onSignatureChange={setHasSignature}
                />

                {error ? (
                  <div
                    role="alert"
                    className="rounded-[6px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
                  >
                    {error}
                  </div>
                ) : null}

                {depositHref ? (
                  <p className="text-sm leading-6 text-[#6f6256]">
                    After signing, return to the contractor workflow to create or collect
                    the deposit from the canonical invoice and payment flow.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[#d9cdc2] bg-white px-5 py-4 sm:px-7">
              <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    signaturePadRef.current?.clear();
                    setError(null);
                  }}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full border border-[#d9cdc2] bg-white px-4 py-2 text-sm font-medium text-[#4a4037] transition hover:border-[#bda58f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-full border border-[#d9cdc2] bg-white px-4 py-2 text-sm font-medium text-[#4a4037] transition hover:border-[#bda58f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!hasSignature || isPending}
                    className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-[#d9cdc2] disabled:text-[#7f7165]"
                  >
                    {isPending ? "Completing..." : "Complete Signature"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
