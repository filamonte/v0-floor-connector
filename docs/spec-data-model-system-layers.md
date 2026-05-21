---
title: "Data Model Specification: System Layers, Products, Files, Communication Proof, and Activity"
version: "1.1"
date_created: "2026-05-04"
date_updated: "2026-05-05"
status: "Planned"
tags: [architecture, data-model, planning, products, systems, files, communication, delivery-proof, activity]
---

# Data Model Specification: System Layers, Products, Files, Communication Proof, and Activity

## 1. Overview

Status: planning/spec only.

This document is a top-level data-model helper for future implementation planning. It does not create schema, migrations, UI, routes, server actions, tests, or product behavior.

The goal is to keep future system/spec, shared file/evidence, communication delivery proof, and activity timeline work aligned with FloorConnector's canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The model direction is:
- shared canonical data everywhere
- no duplicate cost item database
- no module-specific file or communication silos
- no portal-only copies of shared records
- no fake customer/project records just to preserve early selection context
- project as the eventual operational memory hub
- activity as a readable memory/index layer, not the legal or business source of truth

For implemented status, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md). The layers below are planned unless `current-state.md` says otherwise.

## 2. Planned Layers

Future system-layer planning should separate these concerns:

- **System and product/spec metadata**: manufacturers, finish/manufacturer products, floor system templates, and template components.
- **System selection and snapshots**: selected systems/specs that may begin before lead intake and later attach downstream, plus estimate/contract snapshots.
- **Shared files and evidence**: files and multi-record links for photos, renders, spec sheets, signed docs, field photos, markups, and closeout evidence.
- **Canonical communications and communication delivery proof**: communication threads/messages plus message delivery attempts/events for estimates, contracts, invoices, change orders, payment requests, portal invites, and future SMS/app push.
- **Activity timeline**: immutable readable summaries/links generated from canonical actions.

Field names and table names in this document are planning names. Implementation may refine them in an approved schema plan.

## 3. System And Product Specification Layer

### 3.1 manufacturers

Purpose: manufacturer/vendor identity and metadata for products or finish systems.

Planning notes:
- Manufacturer records are specification metadata, not cost items.
- Examples may include Torginol-style manufacturer/product metadata, but the model should not hardcode any single vendor.
- Records should be organization-scoped where tenant context exists.
- Future platform-managed starter metadata may need a separate platform/defaults ownership design before implementation.

Useful metadata:
- manufacturer/vendor name
- website
- notes
- active/retired status

### 3.2 finish_products or manufacturer_products

Purpose: visual/manufacturer/spec metadata for finish products, colors, flakes, quartz blends, metallic systems, sealers, polish systems, or other product identities.

These records are specification metadata. They do not replace `catalog_items`, and they are not a second cost item database.

Useful metadata:
- manufacturer_id
- product line
- product code or SKU
- product name
- service family applicability
- finish family where applicable
- color/blend/display metadata where applicable
- product images
- spec sheet file references
- technical notes
- customer-facing description
- active/retired status

Relationship to costing:
- `catalog_items` remain the canonical reusable item/cost/estimate/invoice foundation.
- Finish/manufacturer product records identify what product/spec was selected or proven.
- A catalog item may optionally reference a finish/manufacturer product when the reusable item needs product identity, spec proof, or a spec sheet.
- A finish/manufacturer product may be reused by many catalog items or components, but it should not own pricing logic by default.

### 3.3 floor_system_templates

Purpose: reusable system blueprints that describe sellable/installable surface systems.

The model must support both:
- visual finish selections, such as flake, quartz, metallic, and solid color coating choices
- process/service systems, such as concrete polishing and grind-and-seal

Supported future service/finish families should include:
- decorative flake
- metallic epoxy
- decorative quartz
- solid color coating
- concrete polishing
- grind and seal
- future specialty systems

Planning notes:
- A floor system template can represent a visual finish package, an installation process, or a combined system.
- It should not be reduced to coating/color-only behavior.
- It should not bypass the existing estimate/cost item foundation.
- Templates may later need versioning, but snapshots must remain unchanged even if a template changes.

Useful metadata:
- name
- service family
- finish family where applicable
- customer-facing description
- internal notes
- prep requirements
- technical notes
- status: draft, active, retired, archived

### 3.4 floor_system_template_components

Purpose: ordered reusable component definitions for a floor system template.

Critical correction:
- Components should link to existing `catalog_items` for costing, quantity basis, estimate expansion, reusable item behavior, and future invoice/material planning.
- Components may optionally reference a finish/manufacturer product when that component needs product identity, spec proof, images, SKU, or spec sheet context.
- Components should not create a second product/cost database.

Useful relationships:
- floor_system_template_id
- catalog_item_id
- optional finish_product_id or manufacturer_product_id
- sequence/order
- quantity basis or formula planning notes
- customer-facing component label where needed
- internal install/spec notes

Invariants:
- `catalog_items` remain the reusable item/cost foundation.
- Finish/manufacturer products remain specification metadata.
- Component changes after estimate or contract snapshot creation must not mutate historical snapshots.

## 4. System Selection And Snapshot Layer

### 4.1 selected_floor_systems

Purpose: selected system/spec context as it moves from visual choice to real workflow truth.

Pre-lead correction:
- `selected_floor_systems` must not require `project_id`.
- A future room visualizer can start before lead intake.
- The model should allow selected finish/spec context to attach downstream as the workflow becomes real.
- Do not force fake project/customer records just to preserve a selection.

Potential nullable links:
- visualizer_session_id or external_session_key
- opportunity_id
- customer_id
- project_id
- estimate_id
- contract_id
- job_id

Tenant context:
- Require `organization_id` where tenant context exists.
- A future public/pre-auth visualizer may need a safe handoff pattern before organization, customer, or project is fully known.
- Public/pre-auth context must not weaken tenant isolation once the selection is claimed by a contractor organization.

Supported selection structure:
- multiple systems per project/customer/opportunity are allowed
- systems can represent areas, rooms, phases, options, alternates, or revisions
- selected systems can be visual finish selections, process/service systems, or combined finish/process packages

Useful metadata:
- system/template reference where known
- service family
- finish family where applicable
- area/room/phase/option label
- customer-facing description
- selected product/spec metadata
- linked render/image/spec sheet references via shared files
- status: draft, proposed, selected, rejected, superseded, retracted, void, amended

Invariants:
- A selected system/spec represents what may be sold and installed; it is not loose estimate-line text.
- Once approval or contract/signature activity begins, the selected system/spec must be snapshotted or locked through estimate/contract truth.
- Later changes require estimate revision, contract amendment, or change-order style workflow.

### 4.2 estimate_system_snapshots

Purpose: immutable selected-system/spec proof for an estimate.

Creation:
- created when selected system/spec context is included in an estimate
- may be created from `selected_floor_systems`, floor system templates, catalog items, and finish/manufacturer product metadata
- supports multiple systems per estimate

Snapshot status:
- active
- superseded
- retracted
- void
- amended

Avoid normal delete/soft-delete language for commercial truth. If an estimate is revised or withdrawn, retain the old snapshot and mark its status appropriately.

Snapshot content should include:
- system name
- service family
- finish family where applicable
- manufacturer
- product line
- product code/SKU
- selected image/render/spec sheet references
- customer-facing description
- technical notes
- area/room/phase/option labels
- component/catalog item references as snapshot metadata
- quantity basis and selected quantities where relevant
- source selection id where applicable

Invariants:
- Estimate snapshots are immutable after creation.
- Estimate revisions create new snapshots or new revision records; they do not edit prior snapshots in place.
- Snapshots preserve the customer-facing and technical proof of what was quoted.
- Template or product metadata changes do not mutate existing snapshots.

### 4.3 contract_system_snapshots

Purpose: immutable selected-system/spec proof for a contract.

Creation:
- created when system/spec context enters contract review or contract generation
- may copy from `estimate_system_snapshots`
- must become binding once send/signature lock applies

Snapshot status:
- active
- superseded
- void
- retracted
- amended

Avoid normal delete/soft-delete language for contract truth. Contract snapshots are binding after signature/send lock and must never be edited in place.

Snapshot content should include:
- system name
- service family
- finish family where applicable
- manufacturer
- product line
- product code/SKU
- selected image/render/spec sheet references
- customer-facing description
- technical notes
- area/room/phase/option labels
- component/catalog item references as snapshot metadata
- quantity basis and selected quantities where relevant
- estimate snapshot source where applicable

Invariants:
- Contract snapshots are immutable once sent/signature-locked or signed.
- Changes require estimate revision, contract amendment, or change-order style workflow.
- Contract snapshots preserve what was agreed, not the current state of templates/products.
- Portal and contractor app surfaces must read the same canonical snapshot records, filtered by visibility and permissions.

## 5. Shared Files And Evidence Layer

### 5.1 files

Purpose: one canonical file registry for product images, room photos, visualizer renders, spec sheets, signed documents, field photos, markups, closeout evidence, payment proof, and other shared evidence.

Planning notes:
- Existing execution attachments remain the current implementation.
- The future direction is a shared file/evidence layer.
- Files should not be trapped in project-only, estimate-only, contract-only, invoice-only, field-only, or portal-only silos.

Useful metadata:
- organization_id where tenant context exists
- storage key/bucket/backend
- original file name
- mime type
- size
- checksum
- uploaded_by where authenticated
- category
- status: uploaded, verified, archived, retained, void

### 5.2 file_links

Purpose: multi-record links between files and canonical records.

Files should be linkable to multiple records, including:
- project
- opportunity
- estimate
- contract
- job
- invoice
- payment
- change order
- daily log
- field note
- communication message
- message delivery event where useful
- selected system/spec
- finish/manufacturer product
- activity event

Delivery photos:
- Delivery photos belong in shared `files` plus `file_links`.
- Field/material delivery, if modeled later, can link to the same shared file layer.
- Do not embed delivery photos directly inside communication delivery proof records.

Visibility:
- Role visibility should be modeled and enforced through RLS plus portal-scoped loaders.
- Useful visibility values: internal, customer_visible, both.
- Portal users should never receive files through a separate portal-copy model.

## 6. Communication And Delivery Proof Layer

This section is about communication delivery proof, not jobsite/material delivery tracking.

Out of scope:
- material delivery
- multi-crew delivery
- jobsite delivery attempts
- field delivery execution events

Later field/material delivery can be modeled as a separate operational layer if needed.

### 6.1 communication_threads

Purpose: canonical conversation context tied to shared records.

Planning notes:
- Threads should attach to canonical records such as project, opportunity, estimate, contract, invoice, change order, payment request, portal invite, daily log, or field note.
- A thread can provide conversation continuity without creating a separate message system per module.
- Contractor app and portal should read the same canonical thread/message records through role-appropriate loaders.

### 6.2 communication_messages

Purpose: canonical message records for outbound, inbound, portal, app, SMS/email-derived, and manual-log communication history.

Planning notes:
- Messages are the business communication record.
- Provider data enriches messages but does not replace them.
- Message records should preserve subject/body/channel/participants/visibility/source context as needed.
- Manual logs can create canonical communication messages when a contractor records a phone call, in-person conversation, or other offline contact.

Visibility:
- internal
- customer_visible
- both

Visibility must be enforced through RLS and portal-scoped loaders.

### 6.3 message_delivery_attempts

Purpose: outbound/inbound communication delivery attempt records for provider-backed or manual communication delivery proof.

These records track communication delivery telemetry for:
- estimates
- contracts
- invoices
- change orders
- payment requests
- portal invites
- customer/contractor messages
- future SMS
- future app push

Useful fields/relationships:
- organization_id where tenant context exists
- communication_message_id
- communication_thread_id where applicable
- related record type and id: estimate, contract, invoice, change_order, payment_request, portal_invite, project, opportunity, customer, or other canonical record
- channel: email, sms, portal, app_push, app_message, manual_log, provider_sync
- direction: outbound, inbound
- recipient/contact context
- provider
- provider_message_id or provider_delivery_id
- attempt_status
- attempted_at/created_at
- latest_event_at
- error/diagnostic metadata

Attempt statuses should be communication-oriented, not jobsite delivery-oriented:
- created
- queued
- processed
- sent
- delivered
- opened
- clicked
- deferred
- bounced
- blocked
- dropped
- failed
- provider_sync

Invariants:
- Provider data is telemetry only.
- FloorConnector canonical communication/message records remain the business source.
- Open/click tracking is useful signal, not perfect legal certainty.
- Attempts/events should be immutable or append-only where they affect audit history.

### 6.4 message_delivery_events

Purpose: immutable provider/manual telemetry events associated with a message delivery attempt.

Event types should include:
- created
- queued
- processed
- sent
- delivered
- opened
- clicked
- deferred
- bounced
- blocked
- dropped
- failed
- provider_sync

Useful fields/relationships:
- organization_id where tenant context exists
- message_delivery_attempt_id
- communication_message_id
- event_type
- event_at
- provider
- provider_event_id
- payload_metadata
- normalized_reason or diagnostic code where available
- related canonical record type/id for query convenience

Invariants:
- Events are immutable telemetry records.
- Provider payloads should be stored carefully and should not leak secrets or unnecessary PII.
- Provider event order can be imperfect; the application should not treat open/click as legal certainty.
- Canonical records such as estimates, contracts, invoices, payments, selected systems, snapshots, messages, and files remain the source of truth for business state.

## 7. Activity Timeline Layer

### 7.1 activity_events

Purpose: readable memory/index layer over canonical records.

Correction:
- `activity_events` are not the legal/business source of truth.
- Canonical records remain the source of truth: estimates, contracts, invoices, payments, selected systems, snapshots, messages, files, jobs, daily logs, field notes, and related workflow records.
- `activity_events` should be immutable summaries/links generated from canonical actions.

Useful fields/relationships:
- organization_id where tenant context exists
- project_id where known
- related canonical record type/id
- secondary related record type/id where useful
- event_type
- headline
- summary
- generated_from action/source
- visibility: internal, customer_visible, both
- created_at

Potential activity examples:
- finish selected
- estimate sent/viewed/approved
- contract sent/signed/amended
- invoice sent/paid
- payment completed
- file uploaded
- message received
- delivery telemetry failed/bounced for a customer-facing send
- job scheduled
- daily log finalized
- closeout evidence captured

Invariants:
- Activity events are generated from canonical actions.
- Activity events link back to canonical records.
- Activity events summarize; they do not own workflow state, legal proof, financial truth, or selected-system truth.
- Audit-critical activity events should be retained indefinitely unless a legal retention policy says otherwise.

## 8. Relationships To Existing System

### 8.1 Canonical Chain Connections

Selected system/spec context should be able to start before the full chain exists, then attach downstream:

`visualizer/session selection -> opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Allowed nullable links on selected system/spec context:
- visualizer_session_id or external_session_key
- opportunity_id
- customer_id
- project_id
- estimate_id
- contract_id
- job_id

Do not create fake opportunity, customer, or project records only to preserve a selection.

### 8.2 Project Hub

Project remains the intended operational memory hub once the workflow becomes real.

Project-linked context may include:
- selected systems/specs
- estimate snapshots
- contract snapshots
- files/evidence
- communication threads/messages
- message delivery attempts/events
- activity timeline summaries

### 8.3 Estimate And Contract

Estimates:
- consume selected system/spec context
- snapshot selected system/spec proof
- keep financial/commercial truth on canonical estimates, estimate line items, approved snapshots, and estimate system snapshots

Contracts:
- consume estimate system snapshots where applicable
- create contract system snapshots
- lock contract snapshots after send/signature lock
- require amendment/change-order style workflows for later changes

### 8.4 Catalog Items

`catalog_items` remain the shared reusable item/cost foundation.

Future floor system components should use `catalog_items` for:
- costing
- quantity basis
- estimate expansion
- reusable item behavior
- future invoice/material planning

Finish/manufacturer products should use finish/spec metadata for:
- manufacturer
- product line
- product code/SKU
- image/spec sheet references
- technical notes
- customer proof

### 8.5 Files

Files use one shared file registry plus `file_links`.

This covers:
- product images
- visualizer renders
- spec sheets
- signed docs
- delivery photos
- field photos
- markups
- closeout evidence

### 8.6 Communications And Delivery Proof

Communication delivery proof should attach to canonical messages and records:
- estimate sends
- contract sends/signature requests
- invoice sends
- change-order sends
- payment requests
- portal invites
- future SMS/app push

It should not model jobsite/material delivery.

## 9. System Invariants

### 9.1 No Duplicate Models

- No second cost item database.
- No module-local product/spec system.
- No portal-only product, estimate, contract, file, message, or selected-system copies.
- No fake project/customer records for visualizer selections.

### 9.2 Multi-Tenant Isolation

- Tenant-owned records require `organization_id` where tenant context exists.
- Public/pre-auth visualizer context needs a safe claim/handoff pattern before tenant context exists.
- Once claimed into a tenant workflow, all downstream records must be organization-scoped and RLS-protected.

### 9.3 Snapshot Immutability

- Estimate and contract system snapshots are immutable.
- Status should use superseded, void, retracted, or amended where needed.
- Contract snapshots are binding after send/signature lock and must never be edited in place.

### 9.4 Communication Proof

- `communication_messages` remain canonical business communication records.
- `message_delivery_attempts` and `message_delivery_events` are telemetry/proof records.
- Provider event data is useful but not the legal/business source of truth.
- Open/click tracking is a signal, not perfect legal certainty.

### 9.5 Activity Timeline

- Activity timeline is a readable memory/index layer.
- Canonical records own business truth.
- Activity entries should be generated from canonical actions and link back to source records.

### 9.6 Visibility

- Role visibility should support internal, customer_visible, and both.
- Visibility must be enforced through RLS and portal-scoped loaders.
- Portal presentation should not require portal-copy records.

## 10. Lifecycle Rules

### 10.1 Selected System Lifecycle

Potential statuses:
- draft
- proposed
- selected
- rejected
- superseded
- retracted
- void
- amended

Rules:
- A selected system may start from a pre-lead visualizer session.
- It can attach to opportunity, customer, project, estimate, contract, or job as context becomes real.
- Multiple selected systems are allowed for areas, rooms, phases, alternates, or options.
- Once included in approved/sent/signature-active commercial truth, changes require revision/amendment/change-order style handling.

### 10.2 Estimate Snapshot Lifecycle

Potential statuses:
- active
- superseded
- retracted
- void
- amended

Rules:
- Created when selected system/spec context is included in an estimate.
- Immutable after creation.
- Revised estimates create new snapshots or revision records.
- Old snapshots remain retained with status; do not delete normal commercial truth.

### 10.3 Contract Snapshot Lifecycle

Potential statuses:
- active
- superseded
- retracted
- void
- amended

Rules:
- Created when selected system/spec context enters contract truth.
- Binding after send/signature lock.
- Never edited in place after lock.
- Changes require contract amendment, estimate revision where still pre-contract, or change-order style workflow.

### 10.4 Communication Delivery Proof Lifecycle

Attempt/event flow:

`created -> queued -> processed -> sent -> delivered`

Additional possible events:
- opened
- clicked
- deferred
- bounced
- blocked
- dropped
- failed
- provider_sync

Rules:
- Attempts summarize the latest known delivery state for a communication.
- Events record immutable telemetry changes.
- Provider sync can add late or out-of-order events.
- Open/click events inform follow-up but should not be treated as legal certainty.

### 10.5 Activity Timeline Lifecycle

Rules:
- Activity events are generated from canonical actions.
- Activity events are retained as immutable summaries/links.
- Corrections should create clarifying events or update source canonical records through their approved workflows, not rewrite history.

## 11. Snapshot Rules

Estimate and contract snapshots should preserve enough customer-facing and technical proof to show what was quoted, agreed, and expected to be installed.

Snapshot metadata should include:
- system name
- service family
- finish family where applicable
- manufacturer
- product line
- product code/SKU
- selected image/render/spec sheet references
- customer-facing description
- technical notes
- area/room/phase/option label
- component/catalog item references as snapshot metadata
- quantity basis and selected quantities where relevant
- source selected system/spec id
- source template id where applicable
- source finish/manufacturer product ids where applicable

Estimate snapshots:
- are proof of what was quoted
- can be superseded/retracted/voided/amended by estimate workflow
- do not mutate when catalog items, templates, or products change

Contract snapshots:
- are proof of what was agreed
- are binding after send/signature lock
- must not be edited in place after lock
- require amendment/change-order style workflow for later changes

## 12. Event Generation Rules

### 12.1 Activity Event Triggers

Potential generated activity summaries:
- selected system created or changed
- estimate created/sent/viewed/approved/rejected/revised
- contract created/sent/signed/amended/voided
- change order sent/approved/rejected
- invoice sent/paid/overdue
- payment completed/failed/voided
- file uploaded/linked
- communication message sent/received
- message delivery bounced/failed for customer-facing sends
- job scheduled/started/completed
- daily log finalized
- closeout evidence captured

Activity events should link to canonical records and summarize them; they do not own business state.

### 12.2 Message Delivery Event Triggers

Potential generated delivery telemetry:
- message/attempt created
- provider queued the message
- provider processed the message
- provider reported sent
- provider reported delivered
- recipient opened where tracking exists
- recipient clicked where tracking exists
- provider deferred delivery
- provider bounced, blocked, dropped, or failed delivery
- provider sync reconciled late event data
- manual log recorded delivery outcome

These are communication proof events. They do not represent jobsite/material delivery.

## 13. Migration Strategy (Not Implementation)

This section outlines a future planning sequence only. No SQL migrations are included here.

Remove jobsite/material delivery tables from this planned communication proof slice. Do not include `delivery_attempts` or `delivery_events` here.

### Phase 1: Product/Spec Planning

Potential planned records:
1. manufacturers
2. finish_products or manufacturer_products
3. floor_system_templates
4. floor_system_template_components linked to `catalog_items`

### Phase 2: Selection And Snapshot Planning

Potential planned records:
5. selected_floor_systems with nullable downstream links
6. estimate_system_snapshots
7. contract_system_snapshots

### Phase 3: Shared File/Evidence Planning

Potential planned records:
8. files
9. file_links

### Phase 4: Communication Proof Planning

Potential planned records:
10. communication_threads
11. communication_messages
12. message_delivery_attempts
13. message_delivery_events

### Phase 5: Activity Memory Planning

Potential planned record:
14. activity_events

Field/material delivery remains a future separate operational layer, not part of this communication proof model.

## 14. Clarifications Answered

### 14.1 Multiple Systems Per Project

Yes. Support multiple selected systems for areas, rooms, phases, alternates, and options.

### 14.2 Delivery Photos

Use shared `files` plus `file_links`. Do not embed photos in message delivery proof records. Future field/material delivery can also use the shared file layer.

### 14.3 Template Versioning

Snapshots remain unchanged when templates/products/catalog items change. Optional template versioning can be designed later, but snapshot immutability is required either way.

### 14.4 Event Retention

Audit-critical activity, message delivery, and snapshot events should be retained indefinitely unless a legal retention policy says otherwise.

### 14.5 Role Visibility

Use internal, customer_visible, and both visibility semantics where needed. Enforce through RLS and portal-scoped loaders.

### 14.6 Field/Material Delivery

Multi-crew/material delivery is out of scope for this communication delivery proof spec. Later field/material delivery can be modeled separately if needed.

### 14.7 Estimate Revisions And Contract Amendments

Do not edit locked snapshots in place. Use estimate revision, contract amendment, or change-order style workflows to create new truth while preserving old snapshots as superseded, retracted, void, or amended.

## 15. Planning Checklist

Before implementation planning, confirm:

- [ ] public/pre-auth visualizer handoff pattern
- [ ] organization claim/handoff rules for selected systems
- [ ] exact selected system/status vocabulary
- [ ] exact service family and finish family values
- [ ] relationship between `catalog_items` and finish/manufacturer product metadata
- [ ] snapshot payload shape and size expectations
- [ ] file visibility and portal-scoped loader rules
- [ ] communication provider payload retention policy
- [ ] message delivery attempt/event normalization rules
- [ ] activity event generation boundaries
- [ ] legal retention policy, if any
- [ ] RLS policy design before migration writing

## 16. Related Documentation

- [Current State](./current-state.md) - implemented truth
- [Developer Source of Truth](./developer-source-of-truth.md) - canonical architecture rules
- [Workflows](./workflows.md) - current and near-term workflow direction
- [Target IA](./target-ia.md) - target information architecture
- [Sales to Production](./sales-to-production.md) - end-to-end commercial flow
- [Roadmap](./Roadmap.md) - planned phases

---

**Document Status**: Planning/spec helper only. Not ready for migrations or implementation without a separate approved schema plan.
**Date**: May 5, 2026
