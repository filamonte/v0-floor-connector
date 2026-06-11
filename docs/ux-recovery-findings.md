# UX Recovery Findings

Status: Active
Doc Type: Planning

This document groups the 45 manual UX/IA findings into root-cause epics for the
UX Recovery Wave. It is planning truth only and does not claim that any recovery
work is implemented.

## Epic Summary

| Epic | Name                                                    | Recovery objective                                                                                    |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A    | Workspace Ownership & Content Placement                 | Put each piece of information in the workspace that owns the next action.                             |
| B    | Navigation Architecture                                 | Create one contractor app shell, one route-context pattern, and predictable search/recent navigation. |
| C    | Display, Density & Responsive Architecture              | Make dense operational information scan safely on 14 inch laptops, tablets, and mobile.               |
| D    | Settings & Configuration Architecture                   | Separate tenant configuration from operational review and reduce settings sprawl.                     |
| E    | Sales Lifecycle & Assessment Architecture               | Clarify Opportunity, Assessment Package, site visit, estimate, and project handoffs.                  |
| F    | Financial / Invoice Review Architecture                 | Make invoice review centered on invoice decisions, evidence, and payment context.                     |
| G    | Portal & Customer-Facing Organization                   | Keep portal customer-safe while preparing for multi-project, multi-document customers.                |
| H    | Naming & Terminology System                             | Standardize product nouns so users and agents do not infer competing ownership.                       |
| I    | Scheduling / Calendar Market Blocker                    | Add a calendar MVP path over existing canonical schedule data.                                        |
| J    | Support, Operations Monitor & Platform Admin Experience | Route support, platform oversight, and operational monitoring to clear homes.                         |
| K    | Visual Language & Color System                          | Define scalable status, priority, and action color semantics.                                         |
| L    | Universal Capture / Intent Capture                      | Capture user intent and prepare canonical handoffs without creating a parallel task app.              |

## Finding Map

| #   | Finding                                                                                                                                       | Primary epic | Planning note                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| 1   | Assessment owns customer/contact info that should come from customer/contact/project.                                                         | E            | Assessment should reference canonical customer/contact/project context instead of re-owning it.     |
| 2   | 14 inch laptop layout failures, text outside boxes.                                                                                           | C            | Responsive constraints and text wrapping must become acceptance criteria.                           |
| 3   | Assessment asks users to manually enter calculated fields like sq ft and perimeter.                                                           | E            | Calculated quantities should come from structured measurement inputs where practical.               |
| 4   | Rename Current Flooring to Existing Surface, dropdown, platform-seeded and contractor-customizable.                                           | E            | Treat as terminology/configuration planning; no schema in this foundation pass.                     |
| 5   | Need official naming convention for Command Centers, Workspaces, Managers, Packets, Reports, Trails, Libraries, Ready Checks, AI guidance.    | H            | Create one product noun system before more UX copy changes.                                         |
| 6   | Workspaces are huge, dense, and cognitively heavy.                                                                                            | A            | Workspace Framework V2 should define summary, action, primary work, and detail layers.              |
| 7   | CrewBoard has useful data but is too dense to use.                                                                                            | C            | CrewBoard needs density and calendar treatment without forking schedule truth.                      |
| 8   | Multiple header/subheader/navigation systems exist.                                                                                           | B            | Contractor app needs one shell/navigation grammar.                                                  |
| 9   | Work Order / Job naming conflict.                                                                                                             | H            | Pick official display terminology while preserving canonical table/route names.                     |
| 10  | Action safety and action hierarchy needed.                                                                                                    | C            | Primary, secondary, overflow, and protected action rules belong in the recovery system.             |
| 11  | Need future context layer strategy for communications, AI, activity, notes, notifications.                                                    | A            | Context layers should support source records without owning business truth.                         |
| 12  | Settings has too many large areas and does not flow well.                                                                                     | D            | Settings IA cleanup should group tenant configuration by user job.                                  |
| 13  | Company Workflow Error Monitor does not belong in Settings; preferred area name Operations Monitor.                                           | J            | Operational monitoring should not be buried in tenant configuration.                                |
| 14  | Project nav should support quick project search/recent projects.                                                                              | B            | Navigation shell should include recent/search affordances without route rewrites.                   |
| 15  | Alerts/queues/review lists should preserve context, opening records in new tabs or side panels.                                               | A            | Recovery should define contextual open behavior and side-panel/new-tab posture.                     |
| 16  | Invoice Review does everything except review invoices well.                                                                                   | F            | Invoice Review needs its own architecture pass over canonical invoice/payment evidence.             |
| 17  | Current color scheme does not scale with many statuses.                                                                                       | K            | Status color semantics should be distinct from action emphasis.                                     |
| 18  | Lead Workspace scroll-jump nav may need focused sections/pages.                                                                               | B            | Workspace Framework V2 should decide section navigation versus focused sub-surfaces.                |
| 19  | Settings IA and nesting strategy needs review.                                                                                                | D            | Avoid deep nesting unless it improves repeated admin work.                                          |
| 20  | Account status for incomplete signup should be top-of-page, not buried.                                                                       | D            | Account activation state is a top-level setting/admin status.                                       |
| 21  | Appointment Workspace is dense.                                                                                                               | C            | Appointment/site-visit surfaces need the same density rules as CrewBoard.                           |
| 22  | Header search opens awkward popup; all popups/overlays need review.                                                                           | B            | Search and overlays need one interaction model.                                                     |
| 23  | Mobile header is hard to see.                                                                                                                 | B            | Mobile shell visibility is a first-wave acceptance criterion.                                       |
| 24  | Mobile is not reviewable yet because mobile/responsive shell is broken.                                                                       | C            | Mobile shell recovery must precede serious mobile QA claims.                                        |
| 25  | Super Admin works but has density and missing direction issues.                                                                               | J            | Super Admin needs platform-control-room framing, not contractor workspace density.                  |
| 26  | Need Support Center / Customer Success Center for contractors.                                                                                | J            | Support should be planned as contractor success workflow, not hidden settings content.              |
| 27  | Missing calendar view is a go-to-market blocker.                                                                                              | I            | Calendar MVP should use existing jobs, appointments, assignments, and schedule state.               |
| 28  | Customer Portal looks decent but needs more functionality and capitalization/copy QA.                                                         | G            | Portal cleanup should be customer-safe and copy-consistent.                                         |
| 29  | Portal will become dense as customers have multiple projects/estimates/invoices.                                                              | G            | Add sorting/filtering/compact organization posture before portal complexity grows.                  |
| 30  | App-wide issue: lots of data and functionality, poor display.                                                                                 | C            | Presentation architecture, not data invention, is the recovery theme.                               |
| 31  | Portal and most of FC need better organization.                                                                                               | G            | Portal organization should follow the same root-cause approach as contractor app.                   |
| 32  | Marketing website needs review/alignment.                                                                                                     | G            | Keep marketing alignment as a later customer-facing organization stream unless explicitly approved. |
| 33  | Preparing Your Workspace display needs improvement.                                                                                           | C            | Setup/loading/empty transitional states need polish rules.                                          |
| 34  | Universal Capture should capture intent and do the work.                                                                                      | L            | Capture should prepare canonical handoffs and require confirmation for risky actions.               |
| 35  | System-wide display/device compatibility review needed.                                                                                       | C            | Responsive QA matrix should cover desktop, 14 inch laptop, tablet, and mobile.                      |
| 36  | Lead status and other workflow statuses need easy editing/configuration.                                                                      | D            | Status configuration belongs in Settings / workflow configuration, not ad hoc pages.                |
| 37  | Whole-FC navigation review required, especially left-side nav and avoiding scroll-jump workspace nav.                                         | B            | Navigation recovery should cover shell, secondary nav, and section nav together.                    |
| 38  | Workspace ownership/content placement audit required.                                                                                         | A            | Misplaced roles, contacts, estimate plan, and work items are ownership symptoms.                    |
| 39  | Sales lifecycle terminology review: Lead may mean initial contact only; site visits/assessments may require Opportunity or Pre-Sales concept. | H            | Naming system must align user-facing labels with canonical Opportunity and target operating model.  |
| 40  | Reports contains operational status items that do not belong there.                                                                           | A            | Reports should analyze/export; operational action belongs in owning workspaces.                     |
| 41  | Brand accent color setting needs real color picker/preview or should be removed.                                                              | D            | Configuration without clear user value should be improved or removed in an approved stream.         |
| 42  | Contractor website URL should auto-normalize to full URL.                                                                                     | D            | Settings should validate and normalize configuration input.                                         |
| 43  | Template merge fields/short codes need better guidance, visual builder, and drag/drop insertion.                                              | D            | Template configuration needs a clearer builder model later.                                         |
| 44  | Settings Overview contains configuration that does not belong there.                                                                          | D            | Overview should summarize status and route to focused configuration areas.                          |
| 45  | Draft/in-progress records need reversion/editable status flow before approval/commitment.                                                     | E            | Treat as workflow-state architecture planning; implementation needs careful per-record approval.    |

## Cross-Epic Priorities

The first implementation wave should prioritize issues that unlock many other
findings:

1. One shell/navigation grammar.
2. Workspace Framework V2 for Lead/Sales and Project.
3. Settings IA cleanup.
4. Responsive/display and overlay recovery.
5. Calendar MVP.
6. Invoice Review cleanup.
7. Portal organization cleanup.

## Guardrail

None of these findings authorize schema changes, route renames, canonical table
renames, provider behavior, portal-owned state, financial/signature/payment
mutation, or broad UI implementation in this foundation pass.
