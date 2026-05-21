---
goal: Catalog-Backed Estimate Line Items - Complete Source of Truth Implementation
version: 1.0
date_created: 2026-05-03
last_updated: 2026-05-03
owner: FloorConnector Development Team
status: 'Planned'
tags: ['feature', 'estimate', 'catalog', 'backend', 'frontend', 'database']
---

# Catalog-Backed Estimate Line Items: Implementation Plan

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

## Introduction

Make the cost item database (catalog_items) the authoritative source for all estimate line items. Every estimate line item must be backed by an organization-owned catalog_items record. Existing "manual/custom" item creation becomes "Create new cost item + add to estimate." Users can select existing items, create new items inline from the estimate editor, and edit linked items by clicking their names.

## 1. Requirements & Constraints

### Functional Requirements
- **REQ-001**: Every estimate line item must be backed by organization-scoped catalog_items
- **REQ-002**: Users must select existing catalog items or create new ones from estimate editor
- **REQ-003**: New items created from estimate editor must create both catalog_items and estimate_line_items records
- **REQ-004**: Clicking estimate line item name must open edit modal for linked catalog item
- **REQ-005**: Edit saves must update both catalog_items and current estimate_line_items snapshot
- **REQ-006**: Estimate totals must recalculate after edits
- **REQ-007**: Duplicate active catalog item names must be prevented or redirected to existing item selection
- **REQ-008**: System-generated items must continue working unchanged
- **REQ-009**: Orphan/manual estimate lines must be handled safely (no breaking changes)
- **REQ-010**: No new cost item tables; use only catalog_items

## 2. Implementation Phases Overview

### Phase 1: Audit & Analysis (10 tasks)
- Understand current flows and identify blocking issues

### Phase 2: Data Model & Validation Setup (10 tasks)
- Prepare catalog-backed foundation and validation rules

### Phase 3: Inline Catalog Item Creation UI (10 tasks)
- Replace manual item entry with "Create new cost item" modal

### Phase 4: Estimate Line Item Click-to-Edit (12 tasks)
- Enable editing catalog items by clicking item name on estimate detail

### Phase 5: Estimate Editor Workflow Updates (10 tasks)
- Make catalog-backed item creation the primary flow

### Phase 6: Orphan/Manual Item Handling (10 tasks)
- Safely handle existing estimates with manual-only items

### Phase 7: System-Generated Items (10 tasks)
- Ensure system expansion and generated items continue working

### Phase 8: Downstream Financial Flows (10 tasks)
- Verify contracts, invoices, and payments remain unaffected

### Phase 9: Validation & Error Handling (10 tasks)
- Ensure robust validation and clear user messaging

### Phase 10: Documentation & Cleanup (10 tasks)
- Update docs and clean up implementation

### Phase 11: Testing & Validation (20 tasks)
- Verify complete implementation and edge cases

Total: 112 tasks across 11 phases

## Detailed Task Breakdown

See full plan document in repository for complete task tables and validation criteria.

## Key Files to Create/Modify

### New Components
- apps/web/components/estimates/create-catalog-item-modal.tsx
- apps/web/components/estimates/edit-catalog-item-modal.tsx

### Updated Files
- apps/web/components/estimates/items-section.tsx
- apps/web/components/estimates/estimate-workspace-shell.tsx
- apps/web/lib/estimates/actions.ts
- docs/current-state.md
- docs/workflows.md

## Validation Checklist

- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] Create new estimate with inline catalog item
- [ ] Add existing catalog item to estimate
- [ ] Click item name and edit from detail page
- [ ] Duplicate name detection blocks duplicate
- [ ] System-generated items still work
- [ ] Approved estimate snapshot immutable after creation
- [ ] Invoice creation from approved estimate works
- [ ] Old orphan estimates still load
- [ ] Full Phase B internal validation runbook passes

