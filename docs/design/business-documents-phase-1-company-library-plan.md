# Business Documents Phase 1 - Company Library Plan

## Purpose

Business Documents Phase 1 was evaluated as a contractor-side Company Document
Library foundation for business administration documents such as employee
agreements, subcontractor agreements, handbooks, SOPs, safety plans, onboarding
documents, policy documents, training documents, and internal operating docs.

The decision for this pass is plan-only. The current repository has strong
document-template and warranty-document foundations, but it does not yet have a
safe persisted model for general company administration documents.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/operating-core-checkpoint.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2-plan.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- document/template/settings/people/compliance related docs found through repo
  search

## Existing Model Inspected

Inspected implementation areas:

- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/app/(app)/settings/templates/page.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/settings-overview-card.tsx`
- `apps/web/lib/templates/data.ts`
- `apps/web/lib/templates/workflows.ts`
- `apps/web/lib/templates/merge-data.ts`
- `apps/web/lib/document-engine/print.ts`
- `apps/web/lib/document-delivery/*`
- `apps/web/lib/proofcenter/*`
- `apps/web/lib/sendtrail/*`
- `apps/web/lib/organizations/*`
- `apps/web/lib/settings/*`
- `apps/web/app/(app)/people/page.tsx`
- `apps/web/app/(app)/vendors/page.tsx`
- warranty document routes and related docs as reference
- Supabase migrations for `document_templates`, `platform_template_seeds`,
  `warranty_documents`, `document_delivery_events`, storage/file foundations,
  and starter-pack provisioning

Current relevant model:

- `document_templates` is organization-owned and shared across supported output
  workflows.
- `template_type` currently supports `estimate`, `invoice`, `contract`, and
  `warranty`.
- `/settings/templates` manages organization-owned estimate, invoice, contract,
  and warranty templates.
- `warranty_documents` are generated records tied to customer/project/job or
  service-ticket context.
- `document_delivery_events` are evidence-only events for supported document
  subjects.
- Document Engine print/save routes render existing source records. They are
  not a stored document library.

## Implementation Decision

Do not implement Company Documents UI in this pass.

Reason:

- The existing template enum does not include company document categories such
  as employee agreement, subcontractor agreement, handbook, SOP, safety plan,
  onboarding document, policy, training document, or operating document.
- Reusing `warranty` or commercial template types for company documents would
  pollute estimate/contract/invoice/warranty behavior and make library rows look
  like operational workflow templates.
- There is no current persisted company-document record with category, status,
  owner, review date, attachment/rendering strategy, archive behavior, or usage
  context.
- Adding a route with static placeholder rows would risk presenting fake
  documents as real contractor content.
- Adding schema was explicitly discouraged unless clearly necessary and safe,
  and this feature needs a deliberate model rather than an opportunistic enum
  patch.

## Model Gap

Company Documents needs one of these future model decisions:

1. Extend `template_type` with explicit business document template categories.
   This is useful if Phase 1 focuses on reusable editable templates only.
2. Add a new `company_documents` table for actual company library records, with
   optional `document_template_id` linkage where a document is rendered from a
   template.
3. Add a broader document-library model with subject links to people, vendors,
   compliance records, projects, jobs, service tickets, or company-only scope.

Recommended next implementation path:

- Start with `company_documents`, not by overloading workflow templates.
- Keep `document_templates` as reusable output content for supported document
  types.
- Let Company Document records optionally reference templates later.
- Keep storage/upload behavior separate until file ownership, virus scanning,
  access, retention, and export behavior are designed.

## Proposed Future Company Document Record

Future fields to consider:

- `company_id`
- `title`
- `category`
  - agreement
  - employee_document
  - subcontractor_document
  - safety_and_compliance
  - operations_sop
  - onboarding
  - policy
  - training
  - customer_service
  - other
- `status`
  - draft
  - active
  - archived
- `description`
- `document_template_id` nullable
- `content` or `rendered_content` only if inline content is approved
- `file_reference` only after storage rules are approved
- `owner_user_id` nullable
- `review_due_date` nullable
- `effective_date` nullable
- `expires_at` nullable
- `created_by`, `updated_by`, `created_at`, `updated_at`

This should be tenant-scoped, RLS-protected, and owner/admin/manager writable
unless a stricter role policy is chosen.

## Proposed Future Surfaces

Contractor settings:

- `/settings/company-documents`
- card on `/settings` titled `Company Documents`
- settings navigation item under Company Controls

Company Document Library sections:

- Agreements
- Employee documents
- Safety and compliance
- Operations and SOPs
- Customer/service documents
- Archived documents

Future actions:

- view
- create
- edit
- archive
- duplicate from starter document
- print/save through Document Engine only after rendering rules exist

Actions intentionally deferred:

- AI generation
- legal advice generation
- e-sign
- employee portal distribution
- customer portal exposure
- public links
- provider sending
- stored PDF generation
- storage bucket changes

## Product Language

Use:

- `Company Documents` for contractor business administration documents.
- `Document Library` for the organized management surface.
- `Starter Documents` for platform-provided examples/templates once a safe
  adoption model exists.
- `Company Controls` for the settings/admin location.

Avoid:

- legal advice
- generated contract
- source of truth
- tenant/RLS/canonical language in user-facing copy
- accounting, payment, signature, or portal-adjacent promises

## Behavior Preserved

This plan-only pass does not change:

- schema or migrations
- routes
- app UI behavior
- server actions
- auth, RLS, tenant logic, portal grants, settings behavior, or platform-admin
  behavior
- document template runtime behavior
- estimate, contract, invoice, warranty, payment, or signature behavior
- storage buckets, file records, provider sending, Send Trail, Proof Center, or
  Document Engine routes
- AI, automation, legal advice generation, employee distribution, public links,
  or customer portal exposure

## Follow-Up Candidates

1. Add a schema proposal for `company_documents` and document categories.
2. Add a migration only after the category/status/access model is approved.
3. Build `/settings/company-documents` as a real persisted admin surface.
4. Add Starter Documents through platform seeds only after adoption and local
   copy behavior is designed.
5. Add print/save rendering only after inline content or template linkage is
   implemented.
6. Add file attachment support only after storage, retention, access, export,
   and malware-scanning policy is decided.
7. Add people/vendor/compliance links after the base company library is stable.

## Validation

Because this pass is docs-only and plan-only, no app tests were required. Run
focused markdown formatting and `git diff --check` for this checkpoint.
