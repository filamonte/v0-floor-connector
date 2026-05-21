---
goal: System-Wide UI Refactor - Decision-First SaaS Interface
version: 1.0
date_created: 2026-05-03
last_updated: 2026-05-03
owner: FloorConnector Engineering
status: 'Planned'
tags: ['refactor', 'ui', 'ux', 'architecture', 'components']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan guides a system-wide UI refactor that converts FloorConnector from a data-display interface to a decision-first SaaS interface. Every page will clearly communicate: (1) What is this? (2) What state is it in? (3) What should I do next?

This refactor is **UI-only**: no backend logic or data models are modified. The refactor applies consistently to all major pages (Dashboard, Projects, Estimates, Invoices, Jobs, Contracts).

## 1. Requirements & Constraints

### Core Requirements
- **REQ-001**: All major pages must implement global page structure: PageHeader + ActionBar + WorkflowBar (when applicable) + PrimarySection + SecondarySection
- **REQ-002**: ActionBar component must appear directly under PageHeader on all workflow pages
- **REQ-003**: WorkflowBar component must appear on Project, Estimate, Invoice, and Job pages
- **REQ-004**: Implement getNextAction() utility function that determines next action for any record
- **REQ-005**: Create ProjectStateSummary component showing core workflow states
- **REQ-006**: Enforce design system with specified colors, typography, and spacing globally
- **REQ-007**: Dashboard must include PriorityStrip component at top
- **REQ-008**: All cards must follow consistent styling (8px border-radius, 1px border, minimal shadow)

### Design System Requirements
- **DSY-001**: Theme colors must include primary (#F97316), success (#16A34A), warning (#F59E0B), danger (#DC2626), info (#2563EB)
- **DSY-002**: Background = #F4F5F7, Card = #FFFFFF, Border = #E2E5E9
- **DSY-003**: Typography: Title 22px bold, Section header 16px semibold, Body 14px, Secondary 12px muted
- **DSY-004**: Spacing: Card padding 16-20px, Section spacing 24-32px, Grid gap 16px

### Architectural Constraints
- **CON-001**: No backend or data model modifications permitted
- **CON-002**: Components must work with existing Supabase data structures
- **CON-003**: Changes must not break existing authentication or role-based access control
- **CON-004**: Must preserve multi-tenant isolation in all UI changes

### Pattern Requirements
- **PAT-001**: Follow modular component architecture (new components in packages/ui and apps/web/components)
- **PAT-002**: Use existing TypeScript and React patterns from codebase
- **PAT-003**: Maintain consistent naming conventions (PascalCase components, camelCase utilities)
- **PAT-004**: Create utilities in packages/utils for shared logic (getNextAction)

### Operational Guidelines
- **GUD-001**: Each page refactor should preserve existing functionality while restructuring layout
- **GUD-002**: Use CSS Grid and Flexbox for responsive layouts
- **GUD-003**: Ensure accessible markup (semantic HTML, ARIA labels)
- **GUD-004**: Test each component in isolation before page integration

## 2. Implementation Steps

### Phase 1: Foundation - Design System & Core Components

**GOAL-001**: Establish design system theme and create reusable base components (ActionBar, WorkflowBar, ProjectStateSummary, SectionLayout components)

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create theme.ts in packages/ui with color constants and spacing values | | |
| TASK-002 | Create ActionBar.tsx component in packages/ui/components | | |
| TASK-003 | Create WorkflowBar.tsx component in packages/ui/components | | |
| TASK-004 | Create ProjectStateSummary.tsx component in packages/ui/components | | |
| TASK-005 | Create PrimarySection.tsx layout component in packages/ui/components | | |
| TASK-006 | Create SecondarySection.tsx layout component in packages/ui/components | | |
| TASK-007 | Create workflow utility getNextAction() in packages/utils | | |
| TASK-008 | Document component API and theme usage in components/README.md | | |

**Deliverables**:
- FILE-001: packages/ui/theme.ts - Theme object with colors, typography, spacing
- FILE-002: packages/ui/components/ActionBar.tsx - Component showing status + next action + CTA
- FILE-003: packages/ui/components/WorkflowBar.tsx - Horizontal workflow step indicator
- FILE-004: packages/ui/components/ProjectStateSummary.tsx - State summary display
- FILE-005: packages/ui/components/PrimarySection.tsx - Wrapper for core workflow content
- FILE-006: packages/ui/components/SecondarySection.tsx - Wrapper for execution/support content
- FILE-007: packages/utils/getNextAction.ts - Logic to determine next action from record state

### Phase 2: Core Workflow Sections

**GOAL-002**: Create section components that organize content into CoreWorkflowSection, ExecutionSection, and SupportSection

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Create CoreWorkflowSection.tsx in apps/web/components/layout | | |
| TASK-010 | Create ExecutionSection.tsx in apps/web/components/layout | | |
| TASK-011 | Create SupportSection.tsx in apps/web/components/layout | | |
| TASK-012 | Create page layout wrapper component in packages/ui | | |
| TASK-013 | Document section composition patterns | | |

**Deliverables**:
- FILE-008: apps/web/components/layout/CoreWorkflowSection.tsx - Contains Estimate, Contract, Job, Invoice cards
- FILE-009: apps/web/components/layout/ExecutionSection.tsx - Contains Schedule and Tasks
- FILE-010: apps/web/components/layout/SupportSection.tsx - Contains Notes and Files

### Phase 3: Remove Anti-Patterns from Existing Components

**GOAL-003**: Audit and refactor existing components to remove equal-weight cards, duplicate summaries, excessive icons, and dense stacked layouts

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | Audit apps/web/components/dashboard for anti-patterns | | |
| TASK-015 | Audit apps/web/components/estimates for anti-patterns | | |
| TASK-016 | Audit apps/web/components/invoices for anti-patterns | | |
| TASK-017 | Audit apps/web/components/contracts for anti-patterns | | |
| TASK-018 | Document anti-patterns found and refactoring approach | | |

**Deliverables**:
- FILE-011: docs/ui-refactor-audit.md - Audit findings and refactoring map

### Phase 4: Dashboard Refactor

**GOAL-004**: Transform dashboard from data display to decision center with PriorityStrip, key metrics, and work queues

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-019 | Create PriorityStrip.tsx component in apps/web/components/dashboard | | |
| TASK-020 | Refactor dashboard page (apps/web/app/(app)/dashboard/page.tsx) structure | | |
| TASK-021 | Create dashboard key metrics cards with improved hierarchy | | |
| TASK-022 | Reorganize dashboard sections: Priority strip → Metrics → Work queues | | |
| TASK-023 | Apply new theme and spacing to dashboard | | |
| TASK-024 | Test dashboard with multiple user roles and data states | | |

**Deliverables**:
- FILE-012: apps/web/components/dashboard/PriorityStrip.tsx - Top-priority action items
- FILE-013: apps/web/app/(app)/dashboard/page.tsx - Refactored dashboard page

### Phase 5: Project Page Refactor

**GOAL-005**: Refactor project detail page with new structure (ActionBar → WorkflowBar → Sections)

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Refactor apps/web/app/(app)/projects/[id]/page.tsx with new structure | | |
| TASK-026 | Implement ActionBar on project detail page | | |
| TASK-027 | Implement WorkflowBar on project detail page | | |
| TASK-028 | Reorganize project content into CoreWorkflowSection + ExecutionSection + SupportSection | | |
| TASK-029 | Update ProjectStateSummary display on project page | | |
| TASK-030 | Apply theme and spacing | | |

**Deliverables**:
- FILE-014: apps/web/app/(app)/projects/[id]/page.tsx - Refactored project detail

### Phase 6: Estimate Page Refactor

**GOAL-006**: Refactor estimate detail page with decision-first structure

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-031 | Refactor apps/web/app/(app)/estimates/[id]/page.tsx with new structure | | |
| TASK-032 | Implement ActionBar with "Create Contract" / "Send Contract" logic | | |
| TASK-033 | Implement WorkflowBar showing Estimate → Contract → Job → Invoice steps | | |
| TASK-034 | Reorganize estimate details into sections | | |
| TASK-035 | Apply theme and spacing | | |

**Deliverables**:
- FILE-015: apps/web/app/(app)/estimates/[id]/page.tsx - Refactored estimate detail

### Phase 7: Invoice Page Refactor

**GOAL-007**: Refactor invoice detail page and list with decision-first structure

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-036 | Refactor apps/web/app/(app)/invoices/[id]/page.tsx with new structure | | |
| TASK-037 | Implement ActionBar with payment status logic | | |
| TASK-038 | Implement WorkflowBar | | |
| TASK-039 | Refactor invoice list page with improved card hierarchy | | |
| TASK-040 | Apply theme and spacing | | |

**Deliverables**:
- FILE-016: apps/web/app/(app)/invoices/[id]/page.tsx - Refactored invoice detail

### Phase 8: Job Page Refactor

**GOAL-008**: Refactor job detail page with execution-focused structure

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-041 | Refactor apps/web/app/(app)/jobs/[id]/page.tsx with new structure | | |
| TASK-042 | Implement ActionBar with job execution status | | |
| TASK-043 | Implement WorkflowBar | | |
| TASK-044 | Emphasize ExecutionSection (schedule, tasks, crew) over other content | | |
| TASK-045 | Apply theme and spacing | | |

**Deliverables**:
- FILE-017: apps/web/app/(app)/jobs/[id]/page.tsx - Refactored job detail

### Phase 9: Contract Page Refactor

**GOAL-009**: Refactor contract detail and list pages

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-046 | Refactor apps/web/app/(app)/contracts/[id]/page.tsx | | |
| TASK-047 | Implement ActionBar with signing/sending status | | |
| TASK-048 | Implement WorkflowBar | | |
| TASK-049 | Apply theme and spacing | | |

**Deliverables**:
- FILE-018: apps/web/app/(app)/contracts/[id]/page.tsx - Refactored contract detail

### Phase 10: Customers & Projects List Pages

**GOAL-010**: Refactor list pages with improved hierarchy and decision guidance

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-050 | Refactor customers list page (apps/web/app/(app)/customers/page.tsx) | | |
| TASK-051 | Refactor projects list page (apps/web/app/(app)/projects/page.tsx) | | |
| TASK-052 | Update card hierarchy - remove equal-weight design | | |
| TASK-053 | Add status badges and next action callouts to list items | | |

**Deliverables**:
- FILE-019: apps/web/app/(app)/projects/page.tsx - Refactored projects list
- FILE-020: apps/web/app/(app)/customers/page.tsx - Refactored customers list

### Phase 11: Global Component Updates

**GOAL-011**: Update reusable components across all pages to use new theme

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-054 | Update card components in apps/web/components/ui with new theme | | |
| TASK-055 | Update badge components with status colors | | |
| TASK-056 | Update button components - enforce primary color rule (orange for CTAs only) | | |
| TASK-057 | Update typography components with new sizing | | |
| TASK-058 | Update spacing utilities | | |

**Deliverables**:
- Updated component files in apps/web/components/ui

### Phase 12: Portal & Super-Admin Consistency

**GOAL-012**: Apply refactored patterns to portal and super-admin surfaces where applicable

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-059 | Identify portal pages requiring refactor | | |
| TASK-060 | Apply ActionBar and WorkflowBar to portal pages | | |
| TASK-061 | Apply theme to portal components | | |
| TASK-062 | Identify super-admin pages requiring refactor | | |
| TASK-063 | Apply ActionBar to super-admin pages | | |

**Deliverables**:
- Updated portal and super-admin pages

### Phase 13: Testing & Validation

**GOAL-013**: Validate refactor across browsers, devices, roles, and data states

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-064 | Create test plan for UI refactor | | |
| TASK-065 | Test ActionBar logic with different record states | | |
| TASK-066 | Test WorkflowBar step visibility with different workflows | | |
| TASK-067 | Test responsive layout on mobile/tablet/desktop | | |
| TASK-068 | Test with different user roles (admin, contractor, super-admin) | | |
| TASK-069 | Verify theme colors are applied consistently | | |
| TASK-070 | Test accessibility (keyboard nav, screen readers) | | |
| TASK-071 | Performance test - ensure no regressions | | |

**Deliverables**:
- TEST-001: test-plan-ui-refactor.md
- TEST-002: Component unit tests
- TEST-003: Page layout tests

### Phase 14: Documentation & Cleanup

**GOAL-014**: Document patterns, create component library, update README

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-072 | Create component API documentation | | |
| TASK-073 | Document theme usage and customization | | |
| TASK-074 | Create page structure template documentation | | |
| TASK-075 | Update packages/ui README with new components | | |
| TASK-076 | Create migration guide for future features | | |
| TASK-077 | Remove deprecated component patterns | | |

**Deliverables**:
- FILE-021: packages/ui/README.md - Updated component library docs
- FILE-022: docs/ui-patterns.md - Component patterns guide
- FILE-023: docs/page-structure-template.md - Page structure template

## 3. Alternatives

- **ALT-001**: Implement as incremental micro-updates per page - REJECTED: Requires duplicated effort and inconsistent application. Batch approach ensures consistency.
- **ALT-002**: Build new component library from scratch - REJECTED: Expensive and duplicative. Enhance existing packages/ui structure.
- **ALT-003**: Use CSS-in-JS framework for theme management - REJECTED: Project already has CSS/Tailwind patterns. Keep consistent.
- **ALT-004**: Create separate design system package - REJECTED: Keep theme close to component implementations for maintainability.

## 4. Dependencies

- **DEP-001**: Existing Supabase schema and data models must remain unchanged
- **DEP-002**: Current authentication system (Google auth via packages/auth) must remain functional
- **DEP-003**: Existing page routing structure in apps/web/app must remain intact
- **DEP-004**: React and Next.js versions must remain compatible
- **DEP-005**: CSS/styling approach (current patterns) must remain consistent

## 5. Files

### New Files to Create

- **FILE-001**: packages/ui/theme.ts - Design system theme constants
- **FILE-002**: packages/ui/components/ActionBar.tsx - Action bar component
- **FILE-003**: packages/ui/components/WorkflowBar.tsx - Workflow step component
- **FILE-004**: packages/ui/components/ProjectStateSummary.tsx - State summary component
- **FILE-005**: packages/ui/components/PrimarySection.tsx - Primary section layout
- **FILE-006**: packages/ui/components/SecondarySection.tsx - Secondary section layout
- **FILE-007**: packages/utils/getNextAction.ts - Workflow logic utility
- **FILE-008**: apps/web/components/layout/CoreWorkflowSection.tsx - Core workflow container
- **FILE-009**: apps/web/components/layout/ExecutionSection.tsx - Execution container
- **FILE-010**: apps/web/components/layout/SupportSection.tsx - Support container
- **FILE-011**: docs/ui-refactor-audit.md - Audit findings
- **FILE-012**: apps/web/components/dashboard/PriorityStrip.tsx - Priority strip component
- **FILE-013**: apps/web/app/(app)/dashboard/page.tsx - Refactored dashboard
- **FILE-014**: apps/web/app/(app)/projects/[id]/page.tsx - Refactored project detail
- **FILE-015**: apps/web/app/(app)/estimates/[id]/page.tsx - Refactored estimate detail
- **FILE-016**: apps/web/app/(app)/invoices/[id]/page.tsx - Refactored invoice detail
- **FILE-017**: apps/web/app/(app)/jobs/[id]/page.tsx - Refactored job detail
- **FILE-018**: apps/web/app/(app)/contracts/[id]/page.tsx - Refactored contract detail
- **FILE-019**: apps/web/app/(app)/projects/page.tsx - Refactored projects list
- **FILE-020**: apps/web/app/(app)/customers/page.tsx - Refactored customers list
- **FILE-021**: packages/ui/README.md - Updated documentation
- **FILE-022**: docs/ui-patterns.md - Pattern guide
- **FILE-023**: docs/page-structure-template.md - Template documentation

### Files to Modify

- apps/web/components/ui/* - Update with new theme colors and spacing
- apps/web/components/dashboard/* - Existing dashboard components
- apps/web/components/estimates/* - Existing estimate components
- apps/web/components/invoices/* - Existing invoice components
- apps/web/components/contracts/* - Existing contract components

## 6. Testing

### Unit Tests
- **TEST-001**: ActionBar component - Test with different status values and actions
- **TEST-002**: WorkflowBar component - Test step rendering and active state
- **TEST-003**: ProjectStateSummary component - Test with different state combinations
- **TEST-004**: getNextAction utility - Test all workflow state combinations

### Integration Tests
- **TEST-005**: Project page layout with ActionBar + WorkflowBar + Sections
- **TEST-006**: Estimate page with contract creation workflow
- **TEST-007**: Invoice page with payment status workflow
- **TEST-008**: Dashboard with PriorityStrip and metrics

### E2E Tests
- **TEST-009**: Complete workflow: Create project → Create estimate → Send contract → Create invoice
- **TEST-010**: Dashboard decision flow - verify next actions are visible
- **TEST-011**: Multi-role access - verify dashboard/action visibility by role

### Visual Tests
- **TEST-012**: Theme color application across all pages
- **TEST-013**: Responsive layout mobile/tablet/desktop
- **TEST-014**: Spacing and typography consistency

### Accessibility Tests
- **TEST-015**: Keyboard navigation on all pages
- **TEST-016**: Screen reader compatibility
- **TEST-017**: Color contrast verification
- **TEST-018**: ARIA labels on interactive elements

## 7. Risks & Assumptions

### Risks
- **RISK-001**: Refactoring many pages simultaneously could introduce regressions - MITIGATION: Test each page before committing, incremental rollout
- **RISK-002**: Team may not adopt new patterns consistently - MITIGATION: Clear documentation, code review checklist, pattern enforcement
- **RISK-003**: Performance impact from new components - MITIGATION: Profile and optimize components, lazy loading where applicable
- **RISK-004**: Breaking existing workflows during refactor - MITIGATION: Preserve all functionality, only restructure layout
- **RISK-005**: Theme colors may not work in all contexts (e.g., dark mode) - MITIGATION: Define theme for all modes upfront, test thoroughly

### Assumptions
- **ASSUMPTION-001**: Existing data structures support ActionBar and WorkflowBar logic (records have contract, job, invoice, payment status fields)
- **ASSUMPTION-002**: Team has capacity for multi-phase implementation over 2-4 weeks
- **ASSUMPTION-003**: Page structure can be refactored without backend API changes
- **ASSUMPTION-004**: CSS/styling patterns are flexible enough to support new theme
- **ASSUMPTION-005**: Current component library can be extended without major rewrites
- **ASSUMPTION-006**: User roles and permissions don't need changes for new UI structure

## 8. Related Specifications / Further Reading

- FloorConnector AGENTS.md - Production-first rules and architecture guidelines
- packages/ui/README.md - Current component library documentation
- apps/web/README.md - Web app architecture documentation
- docs/database-schema.md - Data model reference for workflow logic
- Next.js App Router Documentation - https://nextjs.org/docs/app
- React Best Practices - https://react.dev/

---

**Implementation Plan Metadata**:
- Estimated Duration: 3-4 weeks (14 phases, 77 tasks)
- Team Size: 2-3 frontend engineers
- Complexity: High (systematic, requires pattern adoption)
- Risk Level: Medium (large scope, existing functionality must be preserved)
- Review Points: After Phase 1 (foundation), Phase 4 (dashboard), Phase 13 (testing)
