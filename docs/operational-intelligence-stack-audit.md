# Operational Intelligence Stack Audit

Status: Active
Doc Type: Audit

Date: 2026-05-25

## Scope

This audit reviews the recently connected operational stack:

- AI Operational Copilot foundation
- Dashboard Operational Digest
- Scheduling Dispatch Board foundation
- Copilot draft handoff into Communications
- Collections Follow-Up Intelligence in Accounts Receivable
- Workflow Guidance / AI assistance controls

This is not a feature plan, schema plan, or redesign. The audit checks whether
the implemented surfaces read as one contractor command center over canonical
records.

## Summary

The stack is directionally coherent. Dashboard and module surfaces act as
queues, Project Workspace remains the continuity hub, Accounts Receivable and
Schedule organize daily operating pressure, and Communications is the
review-first action path for Copilot drafts. The implemented wording mostly
preserves the key boundary: deterministic, advisory, review-first, and
non-mutating.

Current workflow continuity is:

`dashboard attention -> project/job/invoice context -> Copilot or AR/schedule signal -> review-first draft/action -> communications composer or canonical workspace`

No duplicate intelligence, scheduling, communication, AR, invoice, payment, or
AI-owned business model was found in this pass.

## P0 Defects

None found.

No evidence was found of schema drift, migrations, provider AI calls,
autonomous sends, reminder creation, notification creation from Copilot saves,
automatic thread creation, invoice/payment mutation from intelligence output,
or duplicate communication/payment models.

## P1 Polish Before Broader Demo Or Testing

- Dashboard AI digest visibility depends on organization AI dashboard controls.
  In the current local org smoke, the dashboard route loaded correctly but the
  digest was not visible. This is expected when disabled, but demo prep should
  set workflow guidance preferences intentionally so the demo story is visible.
- Accounts Receivable had mobile horizontal overflow caused by the lower
  collections table expanding its grid column. The first fix adds `min-w-0` and
  local overflow containment so the table scroll remains inside the AR panel.
- Project Workspace Copilot may show summaries while draft actions are hidden
  by AI drafting controls. This is correct, but demos should intentionally
  choose whether they want to show "Use draft" or the disabled-state copy.
- Communications handoff currently uses the existing selected thread when
  available. The draft preview is read-only in that selected-thread state, and
  the editable review field is the canonical thread composer below it. The copy
  is clear enough, but this is a UX detail to re-check during founder demo
  rehearsal.

## P2 Later Polish

- Consider aligning dashboard digest, schedule readiness, and AR collections
  section titles around a shared "attention / ready / follow-up" vocabulary once
  more real user feedback exists.
- Consider adding a small source-context row to dashboard digest items when
  many sections are populated, so users can see whether an item came from
  readiness, billing, schedule, or field evidence before opening it.
- Consider a future communication thread selection refinement so no-thread
  copy/review handoffs and existing-thread prefill handoffs feel visually
  distinct at a glance.

## Browser QA Notes

Protected-route Playwright smoke with saved local contractor auth reached:

- `/dashboard`
- one linked Project Workspace from dashboard
- `/schedule`
- `/communications` with a Copilot payment-reminder handoff query
- `/financials/accounts-receivable`
- `/settings/workflows`

Observed behavior:

- Project Workspace rendered AI Operational Copilot and ProjectPulse.
- Schedule rendered readiness review and scheduling queues.
- Accounts Receivable rendered Collections intelligence, canonical invoice
  links, project links, and customer links.
- Communications rendered the Copilot draft handoff, preserved context, and
  prefilled an editable canonical thread composer without submitting anything.
- Workflow settings rendered AI assistance controls and human-confirmation
  boundary copy.

No runtime or hydration errors were captured during the smoke.

## Guardrail Confirmation

This pass did not add schema, migrations, environment variables, provider calls,
new routes, new models, autonomous workflow behavior, customer-facing sends, or
financial mutations.
