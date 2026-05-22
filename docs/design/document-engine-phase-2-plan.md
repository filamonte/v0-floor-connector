# Document Engine Phase 2 Plan

Status: Planned
Doc Type: Planning

## Purpose

This plan defines the next safe Document Engine step after Phase 1 print/export
foundations.

Document Engine Phase 1 made estimate, contract, and invoice print/save routes
more explicit through shared helpers, consistent notices, and browser
`Print / Save PDF` flows. Phase 2 should deepen document usefulness without
creating a second document system, stored PDF truth, provider-send side effects,
or portal-only copies.

Recommended Phase 2 path: build a contractor-side Project Closeout Package
HTML/print route first, with no persisted PDFs and no storage changes.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/design/operating-core-checkpoint.md](C:/FloorConnector/docs/design/operating-core-checkpoint.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md](C:/FloorConnector/docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/design/document-engine-phase-1-pdf-export-foundations.md](C:/FloorConnector/docs/design/document-engine-phase-1-pdf-export-foundations.md)
- [docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md)
- [docs/document-send-signature-architecture.md](C:/FloorConnector/docs/document-send-signature-architecture.md)
- [docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/warranty-document-system-plan.md](C:/FloorConnector/docs/warranty-document-system-plan.md)
- [docs/service-warranty-plan.md](C:/FloorConnector/docs/service-warranty-plan.md)
- [docs/import-export-readiness.md](C:/FloorConnector/docs/import-export-readiness.md)
- [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md)

## Current Phase 1 Implementation Summary

Implemented Phase 1 behavior:

- contractor print/save routes for estimates, contracts, and invoices
- portal-scoped print/save routes for estimates, contracts, and invoices
- shared Document Engine helpers for print links, back links, branding, export
  notices, and footer copy
- shared customer document print view and print button
- customer-safe portal branding through existing portal loaders
- explicit copy that print/save does not send, sign, approve, pay, or create
  delivery proof

Phase 1 intentionally does not implement:

- server-generated PDF binaries
- stored generated PDF files
- generated document artifact records
- document versioning
- storage buckets or storage policies
- provider-send behavior
- customer closeout packages
- portal download packages

## Existing Repo Capabilities Inspected

Implementation areas inspected:

- `apps/web/lib/document-engine/print.ts`
- `apps/web/components/customer-document-print-view.tsx`
- `apps/web/components/document-print-button.tsx`
- contractor estimate, contract, and invoice detail and `/pdf` routes
- portal estimate, contract, and invoice detail and `/pdf` routes
- `apps/web/lib/document-delivery/*`
- `apps/web/lib/sendtrail/*`
- `apps/web/lib/proofcenter/*`
- `apps/web/lib/closeouttrail/*`
- `apps/web/lib/estimates/*`
- `apps/web/lib/contracts/*`
- `apps/web/lib/invoices/*`
- `apps/web/lib/portal/*`
- `apps/web/lib/warranty-documents/*`
- `apps/web/lib/execution-attachments/*`
- storage and attachment migrations for the shared `documents` bucket,
  estimate attachments, execution attachments, contract sent-PDF snapshot
  fields, document delivery events, document signature events, and warranty
  documents

Grounded findings:

- The current Document Engine is a render/link/copy layer over existing records.
- The shared `documents` storage bucket already exists for attachments and the
  existing contract sent-PDF snapshot path, but there is no general generated
  document artifact table.
- `document_delivery_events` exists for evidence-only Send Trail history across
  warranty documents, estimates, invoices, and contracts.
- Proof Center and CloseoutTrail already derive project proof/readiness from
  source records without creating document or closeout tables.
- Portal loaders already scope estimate, contract, invoice, and warranty
  document print views through Customer Access/project visibility.

## Options Evaluated

### Persisted Generated PDFs

Value:

- gives contractors a durable downloadable artifact
- can support future sent/downloaded version references
- may help with legal, warranty, closeout, and archival expectations

Risk:

- requires explicit artifact/version policy
- can become duplicate business truth if file metadata stores business fields
- needs storage, RLS, signed URL, retention, and revision rules
- creates ambiguity when a source record changes after generation

Recommendation: defer until source revision and artifact version semantics are
locked.

### Project Closeout Package Print/Export

Value:

- strengthens Proof Center and CloseoutTrail immediately
- uses already-derived project proof/readiness signals
- gives contractors a practical project handoff artifact
- avoids storage/versioning while the package shape is proven

Risk:

- must avoid implying all proof is complete or customer-visible
- must not expose internal-only field notes or private evidence later in the
  portal without explicit policy

Recommendation: implement first as Phase 2A, contractor-side HTML/print only.

### Customer-Facing Portal Downloads

Value:

- makes customer handoff more useful
- aligns with existing portal print/save patterns

Risk:

- customer visibility policy is broader than contractor print policy
- internal field evidence, job notes, service tickets, and closeout readiness
  may include contractor-only context

Recommendation: plan as Phase 2B after contractor closeout package content and
visibility rules are explicit.

### Server-Side PDF Generation

Value:

- produces consistent downloadable PDF bytes
- enables future stored artifacts and email attachments

Risk:

- adds runtime/dependency/platform complexity
- may require headless browser infrastructure or external provider
- can distract from the source-record package model

Recommendation: defer. Continue HTML print routes until stored artifacts or
provider attachment requirements make server generation necessary.

### Export Audit Trail

Value:

- can show who generated/downloaded an artifact
- may be useful for internal compliance

Risk:

- easy to confuse with Send Trail
- export history is not delivery proof

Recommendation: defer. If needed later, model as artifact/export audit, not
`document_delivery_events`.

## Recommended Phase 2 Path

Build Document Engine Phase 2 in three small stages:

### Phase 2A: Contractor Project Closeout Package Print Route

Create a contractor-side HTML/print route for a project closeout package, likely
under Project Workspace route ownership.

The first version should:

- render from the current project source records
- use existing Proof Center and CloseoutTrail summary helpers where safe
- include source record references and links
- include a clear generated-from-current-records notice
- remain contractor-side only
- use browser print/save
- avoid persisted PDF files
- avoid new schema, migrations, storage, provider sends, and delivery events

### Phase 2B: Portal-Safe Closeout Download Strategy

After Phase 2A proves the package shape, add or design a portal-safe closeout
package view that uses existing portal project access and customer-safe loaders.

This stage should:

- include only explicitly customer-visible content
- avoid internal-only FieldTrail details, job-note text, service-ticket internals,
  and contractor-only financial notes
- keep portal links scoped to existing Customer Access/project visibility
- continue using HTML print/save unless stored artifacts are required

### Phase 2C: Persisted Artifact And Version Policy

Only after the package and portal visibility rules are stable, design and
implement generated artifact records and storage.

This stage should:

- define when an artifact is a current rendering versus a stored snapshot
- store source references and revision/version context, not duplicate business
  data
- use private storage and short-lived signed URLs
- define retention, regeneration, voiding, and supersession rules
- keep provider delivery proof in Send Trail only when a real send occurs

## Source-Of-Truth Boundaries

Source records remain the truth:

- estimate, contract, invoice, warranty document, project, job, daily log, field
  note, execution attachment, change order, payment, and signature records keep
  their existing ownership
- record revisions and specialized event streams remain the audit sources where
  already implemented
- generated print views are artifacts derived from those records

A generated artifact may be stored later only when:

- the artifact was sent to a customer or provider and must be reproducible
- legal, warranty, closeout, or customer-handoff expectations require a snapshot
- source records may change and the exact delivered version must be preserved

Regeneration is enough when:

- the user only needs a current internal view
- the artifact has not been delivered as evidence
- no legal, signature, warranty, or customer-handoff snapshot is required

If snapshot/versioning is required later, the stored artifact should reference:

- source record type and id
- source revision number or source version marker where available
- generation timestamp and actor
- generated artifact type
- storage path or provider reference
- superseded/voided status if needed

It should not duplicate customer, totals, signature state, payment state, or
project status as alternate business truth.

## Storage Strategy

No storage changes should be made in Phase 2A.

If persisted documents become necessary later, Supabase Storage is the natural
first candidate because the repo already has a private `documents` bucket used
for attachments and contract sent-PDF snapshots.

Future storage rules should be:

- private bucket, not public files
- organization-first paths, for example:
  `companyId/projects/projectId/closeout-packages/artifactId.pdf`
- short-lived signed URLs for downloads
- explicit tenant ownership on artifact metadata records
- project/customer access checks before creating portal download URLs
- metadata stores lineage and storage reference only, not duplicate business data
- retention and supersession rules are explicit before launch

Storage should not be used just to make Phase 2 feel more complete. Stored files
are useful only when artifact identity, access, and version behavior are clear.

## PDF Generation Strategy

Current recommendation: continue HTML print routes and browser print/save for
Phase 2A and likely Phase 2B.

Comparison:

- Browser print/HTML route: lowest risk, already implemented, easy to review,
  no binary dependency.
- Server-side PDF generation: useful later for stored artifacts, email
  attachments, and consistent output, but adds runtime complexity.
- Headless browser PDF: likely the best future server-side path if the app needs
  faithful rendering, but it may need worker/runtime planning.
- External document provider: defer unless FloorConnector needs provider-managed
  templates, envelopes, or regulated delivery beyond current scope.
- Queue/worker generation: appropriate only when generation becomes slow,
  backgrounded, or provider-attached.

Recommended future path:

1. Prove package content with HTML print routes.
2. Add portal-safe print views only after visibility rules are clear.
3. Introduce server-side PDF generation only when stored artifacts or outbound
   attachments require stable PDF bytes.

## Closeout Package Strategy

The future `Closeout Package` should be a generated project handoff artifact
from existing records, not a new closeout subsystem.

A Phase 2A package can include:

- project and customer summary
- contract and Signature Trail status summary
- invoice and Payment Trail status summary
- change order status summary
- job completion summary
- Daily Job Log count and latest dates
- field evidence count from FieldTrail and execution attachments
- open blocker summary from field notes where contractor-safe
- Proof Center categories and missing proof items
- CloseoutTrail checklist state
- warranty documents and service/warranty handoff references
- Send Trail counts and source record links
- footer explaining the package is generated from current records and is not
  delivery proof

It should not include:

- generated conclusions that are not supported by source records
- AI summaries
- customer-visible internal notes by default
- stored PDF files
- provider-send events
- a new customer closeout workflow
- a new closeout status model

Contractor-only first is the safe scope. Portal availability should wait until
every included section has customer-safe visibility rules.

## Warranty And Service Export Strategy

Warranty documents already have canonical records, template-rendered content,
contractor print/save, portal review/sign/print, generic warranty-signature
events, and delivery evidence.

Future warranty/service exports should:

- attach to the original project/job/service-ticket context
- appear as Proof Center and CloseoutTrail evidence where already linked
- reuse Document Engine print/export patterns
- avoid a separate warranty document silo
- avoid service-ticket portal exposure unless explicitly implemented
- avoid manufacturer claim or billing mutation

Warranty/service should be included in a closeout package as source-record
references first. Warranty PDF packets and stored warranty artifact versions
should wait for the same artifact/version policy as other generated documents.

## Portal And Download Security Rules

Portal downloads must use existing Customer Access and project scope.

Rules:

- no broad public file URLs
- no portal-only document copies
- no bypassing portal loaders for estimate, contract, invoice, warranty, or
  project data
- no internal-only FieldTrail, Job Note, service-ticket, or contractor financial
  detail exposed unless a later approved policy allows it
- stored artifacts, if implemented later, must use private storage and
  short-lived signed URLs
- project-linked artifacts must require portal project access
- customer-only artifacts need an explicit customer-scoped access decision before
  implementation

Portal closeout should start as a customer-safe rendering, not as a storage
permission shortcut.

## Send Trail, Proof Center, And CloseoutTrail Boundaries

Send Trail:

- provider send/delivery/request evidence belongs in Send Trail
- Print / Save PDF does not create Send Trail proof
- export history, if added later, is an artifact/audit concept, not delivery
  proof

Proof Center:

- indexes source records, evidence, and proof
- may eventually reference generated artifacts
- must not become a duplicate file system or document-management table

CloseoutTrail:

- summarizes closeout readiness from existing records
- can power the closeout package content
- must not become a separate closeout workflow or auto-close engine

## Proposed Phase 2A Implementation Prompt

```text
Chat: Document Engine Phase 2A - Contractor Project Closeout Package Print Route

You are working in the FloorConnector repo.

Goal:
Implement the first contractor-side Project Closeout Package HTML/print route.

This is a source-record rendering slice only.
Do not add schema, migrations, storage, persisted PDFs, provider sends, delivery
events, portal downloads, AI summaries, or closeout workflow mutations.

Read:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/product-language.md
- docs/design/document-engine-phase-1-pdf-export-foundations.md
- docs/design/document-engine-phase-2-plan.md
- docs/design/proof-center-phase-1-project-document-evidence-index.md
- docs/design/closeouttrail-phase-1-project-closeout-workspace.md
- docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md
- docs/local-auth-qa-recovery.md

Inspect:
- apps/web/app/(app)/projects/[projectId]/page.tsx
- apps/web/lib/proofcenter/*
- apps/web/lib/closeouttrail/*
- apps/web/lib/fieldtrail/*
- apps/web/lib/messagecenter/*
- apps/web/lib/document-engine/print.ts
- apps/web/components/customer-document-print-view.tsx
- existing estimate/contract/invoice /pdf route patterns

Implement:
- a contractor-side `/projects/[projectId]/closeout-package` or equivalent
  print route following existing route conventions
- a small Project Workspace affordance labeled `Print closeout package` or
  `Print / Save PDF` where it fits naturally
- reuse existing project loaders and summary helpers where safe
- include Project, Customer, CloseoutTrail, Proof Center, FieldTrail,
  MessageCenter, Send Trail, Signature Trail, Payment Trail, warranty/service,
  and source-record reference summaries where already available
- include a notice that the package is generated from current source records,
  not stored PDF truth or delivery proof

Preserve:
- no schema, migrations, storage, server PDF dependency, provider send,
  payment/signature/estimate/invoice math, auth/RLS, tenant logic, portal grants,
  settings, platform-admin behavior, or route rewrites

Validate:
- focused helper tests if new pure helpers are added
- pnpm.cmd --filter @floorconnector/web typecheck
- pnpm.cmd --filter @floorconnector/web lint
- focused Prettier write/check
- git diff --check
```

## What Is Intentionally Not Implemented Yet

This plan does not implement:

- app source changes
- new routes
- schema or migrations
- storage buckets or storage policies
- generated artifact tables
- stored PDF files
- server-side PDF generation
- provider delivery events
- provider retry lifecycle
- email/SMS sending
- customer portal downloads
- customer closeout package generation
- warranty PDF packets
- AI document summaries
- e-sign provider PDF packets
- auth/RLS, tenant, portal grant, payment, signature, estimate math, invoice
  math, settings, or platform-admin changes
