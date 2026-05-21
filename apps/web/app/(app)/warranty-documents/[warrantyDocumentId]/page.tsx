import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import {
  addWarrantyDocumentSignerAction,
  recordWarrantyDocumentDeliveryEventAction,
  requestWarrantyDocumentSignatureAction,
  sendWarrantyDocumentReviewEmailAction,
  updateWarrantyDocumentDraftAction,
  updateWarrantyDocumentSignerAction,
  voidWarrantyDocumentSignerAction,
  updateWarrantyDocumentStatusAction
} from "@/lib/warranty-documents/actions";
import {
  getWarrantyDocumentById,
  getWarrantyDocumentDeliveryState,
  getWarrantyDocumentSignatureState
} from "@/lib/warranty-documents/data";
import { sanitizeHtml } from "@/lib/html/sanitize";

type WarrantyDocumentDetailPageProps = {
  params: Promise<{ warrantyDocumentId: string }>;
  searchParams?: Promise<{ error?: string; message?: string }>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function formatEventNote(value: string | null) {
  return value && value.trim().length > 0 ? value : "No note recorded.";
}

export default async function WarrantyDocumentDetailPage({
  params,
  searchParams
}: WarrantyDocumentDetailPageProps) {
  const { warrantyDocumentId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const document = await getWarrantyDocumentById(warrantyDocumentId);

  if (!document) {
    notFound();
  }

  const signatureState =
    await getWarrantyDocumentSignatureState(warrantyDocumentId);
  const deliveryState =
    await getWarrantyDocumentDeliveryState(warrantyDocumentId);
  const canEditDraft = document.status === "draft";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Warranty Document"
            title={document.title}
            description="Canonical warranty output tied to the customer, project, job, and service ticket context. Print/save is rendering evidence, not a loose PDF source of truth."
            backHref={
              document.serviceTicketId
                ? `/service-tickets/${document.serviceTicketId}`
                : "/service-tickets"
            }
            backLabel="Back to service ticket"
            actions={
              <Link
                href={`/warranty-documents/${document.id}/print`}
                className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
              >
                Print / save PDF
              </Link>
            }
          />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f7f4ef] px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Status</p>
              <p className="mt-3 text-lg font-semibold capitalize tracking-tight text-slate-950">
                {formatLabel(document.status)}
              </p>
            </div>
            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f7f4ef] px-5 py-4">
              <p className="text-sm font-medium text-slate-950">
                Warranty start
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                {formatDate(document.warrantyStartDate)}
              </p>
            </div>
            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f7f4ef] px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Warranty end</p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                {formatDate(document.warrantyEndDate)}
              </p>
            </div>
            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f7f4ef] px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Issued</p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                {formatDateTime(document.issuedAt)}
              </p>
            </div>
          </div>
        </div>

        <DetailPanel
          title="Warranty Content"
          description="Rendered from the selected warranty template and canonical merge data."
        >
          <div
            className="prose prose-sm max-w-none rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-5 text-slate-600"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                document.renderedContent ?? "<p>Not rendered yet.</p>"
              )
            }}
          />
        </DetailPanel>

        <DetailPanel
          title="Draft Fields"
          description={
            canEditDraft
              ? "Update draft warranty language inputs before issuing. Re-rendering uses the saved warranty template and current service-ticket context."
              : "Issued or void warranty documents are locked from draft field edits in this first slice."
          }
        >
          <form
            action={updateWarrantyDocumentDraftAction}
            className="grid gap-4"
          >
            <input
              type="hidden"
              name="warrantyDocumentId"
              value={document.id}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Title
              </span>
              <input
                name="title"
                required
                disabled={!canEditDraft}
                defaultValue={document.title}
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Warranty start
                </span>
                <input
                  type="date"
                  name="warrantyStartDate"
                  disabled={!canEditDraft}
                  defaultValue={document.warrantyStartDate ?? ""}
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Warranty end
                </span>
                <input
                  type="date"
                  name="warrantyEndDate"
                  disabled={!canEditDraft}
                  defaultValue={document.warrantyEndDate ?? ""}
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Warranty basis
              </span>
              <textarea
                name="warrantyBasis"
                rows={5}
                disabled={!canEditDraft}
                defaultValue={document.warrantyBasis ?? ""}
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
              />
            </label>
            <button
              type="submit"
              disabled={!canEditDraft}
              className="inline-flex items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              Save draft and re-render
            </button>
          </form>
        </DetailPanel>

        <DetailPanel
          title="Delivery History"
          description="Evidence-only delivery trail for this canonical warranty document."
        >
          <div className="grid gap-6">
            <div className="rounded-[4px] border border-[#d6d6d6] bg-[#f7f4ef] px-5 py-4 text-sm leading-6 text-slate-700">
              Manual rows record internal delivery evidence only. Provider email
              rows record send attempts and provider acceptance without updating
              document status or signature state.
            </div>

            {deliveryState.events.length > 0 ? (
              <div className="grid gap-3">
                {deliveryState.events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold capitalize text-slate-950">
                        {formatLabel(event.eventType)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium capitalize">
                      <span className="rounded-full border border-[#d6d6d6] bg-[#f7f4ef] px-3 py-1 text-slate-700">
                        {formatLabel(event.channel)}
                      </span>
                      {event.provider ? (
                        <span className="rounded-full border border-[#d6d6d6] bg-white px-3 py-1 text-slate-700">
                          {formatLabel(event.provider)}
                        </span>
                      ) : null}
                      {event.recipientRole ? (
                        <span className="rounded-full border border-[#d6d6d6] bg-white px-3 py-1 text-slate-700">
                          {formatLabel(event.recipientRole)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {event.recipientName ?? "No recipient name recorded."}
                      {event.recipientEmail ? ` - ${event.recipientEmail}` : ""}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {formatEventNote(event.eventNote)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-white px-5 py-5 text-sm leading-6 text-slate-600">
                No delivery evidence has been recorded yet.
              </div>
            )}

            <form
              action={recordWarrantyDocumentDeliveryEventAction}
              className="grid gap-4 rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-5"
            >
              <input
                type="hidden"
                name="warrantyDocumentId"
                value={document.id}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Evidence type
                  </span>
                  <select
                    name="eventType"
                    defaultValue="delivery_recorded"
                    className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                  >
                    <option value="delivery_recorded">Delivery recorded</option>
                    <option value="send_requested">Send requested</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Channel
                  </span>
                  <select
                    name="channel"
                    defaultValue="internal"
                    className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                  >
                    <option value="internal">Internal</option>
                    <option value="manual">Manual</option>
                    <option value="print">Print</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Recipient role
                  </span>
                  <input
                    name="recipientRole"
                    placeholder="Customer, billing contact..."
                    className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Recipient name
                  </span>
                  <input
                    name="recipientName"
                    className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Recipient email
                  </span>
                  <input
                    type="email"
                    name="recipientEmail"
                    className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Evidence note
                </span>
                <textarea
                  name="eventNote"
                  rows={3}
                  placeholder="Example: Printed and handed to owner during closeout."
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>
              <button
                type="submit"
                className="justify-self-start rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
              >
                Record delivery evidence
              </button>
            </form>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Internal Signature Routing"
          description="Manage warranty signers, record request-signature audit events, and send the first guarded warranty review link through the provider boundary."
        >
          <div className="grid gap-6">
            <div className="rounded-[4px] border border-[#d6d6d6] bg-[#f7f4ef] px-5 py-4 text-sm leading-6 text-slate-700">
              Request signature records an internal audit event only. It does
              not send customer email by itself. Send review/sign link records
              notification telemetry and delivery evidence, and does not change
              signature state.
            </div>

            {signatureState.signers.length > 0 ? (
              <div className="grid gap-4">
                {signatureState.signers.map((signer) => {
                  const canMutateSigner =
                    signer.status !== "signed" && signer.status !== "voided";
                  const canRequestSignature =
                    signer.status === "pending" ||
                    signer.status === "requested";
                  const canSendReviewEmail =
                    signer.signerRole === "customer" &&
                    (signer.status === "requested" ||
                      signer.status === "viewed") &&
                    document.projectId !== null &&
                    document.status !== "draft" &&
                    document.status !== "void";

                  return (
                    <section
                      key={signer.id}
                      className="rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {signer.signerName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {signer.signerEmail}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-medium capitalize">
                          <span className="rounded-full border border-[#d6d6d6] bg-[#f7f4ef] px-3 py-1 text-slate-700">
                            {formatLabel(signer.signerRole)}
                          </span>
                          <span className="rounded-full border border-[#d6d6d6] bg-white px-3 py-1 text-slate-700">
                            {formatLabel(signer.status)}
                          </span>
                        </div>
                      </div>

                      <form
                        action={updateWarrantyDocumentSignerAction}
                        className="mt-5 grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                      >
                        <input
                          type="hidden"
                          name="warrantyDocumentId"
                          value={document.id}
                        />
                        <input
                          type="hidden"
                          name="signerId"
                          value={signer.id}
                        />
                        <label className="block">
                          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Role
                          </span>
                          <select
                            name="signerRole"
                            defaultValue={signer.signerRole}
                            disabled={!canMutateSigner}
                            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
                          >
                            <option value="customer">Customer</option>
                            <option value="contractor">Contractor</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Name
                          </span>
                          <input
                            name="signerName"
                            defaultValue={signer.signerName}
                            disabled={!canMutateSigner}
                            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Email
                          </span>
                          <input
                            type="email"
                            name="signerEmail"
                            defaultValue={signer.signerEmail}
                            disabled={!canMutateSigner}
                            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] disabled:bg-slate-100"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={!canMutateSigner}
                          className="self-end rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#ef7d32] hover:text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          Update
                        </button>
                      </form>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <form action={requestWarrantyDocumentSignatureAction}>
                          <input
                            type="hidden"
                            name="warrantyDocumentId"
                            value={document.id}
                          />
                          <input
                            type="hidden"
                            name="signerId"
                            value={signer.id}
                          />
                          <button
                            type="submit"
                            disabled={!canRequestSignature}
                            className="rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                          >
                            Record request
                          </button>
                        </form>
                        <form action={sendWarrantyDocumentReviewEmailAction}>
                          <input
                            type="hidden"
                            name="warrantyDocumentId"
                            value={document.id}
                          />
                          <input
                            type="hidden"
                            name="signerId"
                            value={signer.id}
                          />
                          <button
                            type="submit"
                            disabled={!canSendReviewEmail}
                            className="rounded-[4px] border border-[#171717] bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-[#ef7d32] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Send review/sign link
                          </button>
                        </form>
                        <form action={voidWarrantyDocumentSignerAction}>
                          <input
                            type="hidden"
                            name="warrantyDocumentId"
                            value={document.id}
                          />
                          <input
                            type="hidden"
                            name="signerId"
                            value={signer.id}
                          />
                          <button
                            type="submit"
                            disabled={!canMutateSigner}
                            className="rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#ef7d32] hover:text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Void signer
                          </button>
                        </form>
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-white px-5 py-5 text-sm leading-6 text-slate-600">
                No warranty signers are configured yet.
              </div>
            )}

            <form
              action={addWarrantyDocumentSignerAction}
              className="grid gap-4 rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <input
                type="hidden"
                name="warrantyDocumentId"
                value={document.id}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Role
                </span>
                <select
                  name="signerRole"
                  defaultValue="customer"
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                >
                  <option value="customer">Customer</option>
                  <option value="contractor">Contractor</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Name
                </span>
                <input
                  name="signerName"
                  required
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  name="signerEmail"
                  required
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>
              <button
                type="submit"
                className="self-end rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
              >
                Add signer
              </button>
            </form>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Signature Events"
          description="Append-only internal audit events for this warranty document."
        >
          {signatureState.events.length > 0 ? (
            <div className="grid gap-3">
              {signatureState.events.map((event) => {
                const signer = signatureState.signers.find(
                  (candidate) => candidate.id === event.signerId
                );

                return (
                  <div
                    key={event.id}
                    className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold capitalize text-slate-950">
                        {formatLabel(event.eventType)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {signer?.signerName ?? "Document-level event"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {formatEventNote(event.eventNote)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-white px-5 py-5 text-sm leading-6 text-slate-600">
              No signature audit events have been recorded yet.
            </div>
          )}
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel title="Connected Records">
          <div className="grid gap-4">
            {document.customer ? (
              <LinkedRecordCard
                href={`/customers/${document.customer.id}`}
                title={document.customer.name}
                subtitle="Customer"
                meta="Warranty recipient"
              />
            ) : null}
            {document.project ? (
              <LinkedRecordCard
                href={`/projects/${document.project.id}`}
                title={document.project.name}
                subtitle="Project"
                meta="Project warranty context"
              />
            ) : null}
            {document.job ? (
              <LinkedRecordCard
                href={`/jobs/${document.job.id}`}
                title={`Job ${document.job.id.slice(0, 8)}`}
                subtitle="Original job"
                meta={formatLabel(document.job.dispatchStatus)}
              />
            ) : null}
            {document.serviceTicket ? (
              <LinkedRecordCard
                href={`/service-tickets/${document.serviceTicket.id}`}
                title={document.serviceTicket.title}
                subtitle="Service ticket"
                meta={formatLabel(document.serviceTicket.status)}
              />
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Status Actions"
          description="Issue or void the warranty document without sending, signing, billing, or changing service ticket state."
        >
          <div className="grid gap-3">
            <form action={updateWarrantyDocumentStatusAction}>
              <input
                type="hidden"
                name="warrantyDocumentId"
                value={document.id}
              />
              <input type="hidden" name="status" value="issued" />
              <button
                type="submit"
                disabled={document.status !== "draft"}
                className="w-full rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
              >
                Issue warranty
              </button>
            </form>
            <form action={updateWarrantyDocumentStatusAction}>
              <input
                type="hidden"
                name="warrantyDocumentId"
                value={document.id}
              />
              <input type="hidden" name="status" value="void" />
              <button
                type="submit"
                disabled={document.status === "void"}
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#ef7d32] hover:text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                Void warranty
              </button>
            </form>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Planned Later"
          description="These remain deferred after the first provider-backed warranty send slice."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>Contractor countersign</li>
            <li>Provider delivery callbacks and bounce/open reconciliation</li>
            <li>Resend/retry orchestration</li>
            <li>Portal-visible delivery proof</li>
          </ul>
        </DetailPanel>
      </aside>
    </div>
  );
}
