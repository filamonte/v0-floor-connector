# FloorConnector Build Sequence

Status: practical build-order guidance grounded in the current branch.

This is not a speculative roadmap.
Use it to decide what should usually come next and what should not be built out of order.

## Built Backbone

Already implemented on the branch:
- auth, org bootstrap, tenant isolation
- canonical lead/customer/project/estimate/contract/job/invoice/payment chain
- contractor shell and shared manager-page baseline
- portal continuity on canonical contracts and payments
- global search in the shell
- scheduling/calendar depth on canonical jobs
- punchlists on the project/job execution chain
- appointments on the opportunity/customer/project chain
- progress billing / SOV on the approved-estimate -> invoice chain
- time, daily logs, field notes, people, vendors, compliance foundations

## Recently Filled Gaps

Recent work has already moved several former placeholders into real workflows:
- global search
- contractor-side schedule manager depth
- punchlists
- appointments
- progress billing / SOV
- stronger project workspace direction

Interpretation:
- the branch is no longer mainly about missing-core-feature coverage
- the branch is now more about workflow coherence, workspace quality, and continuity tightening

## Highest-Value Next Layers

Future work should generally prefer this order:

1. Strengthen project-centered continuity and workspace quality
2. Tighten next-action, blocker, and readiness guidance across existing canonical workflows
3. Expand module-dashboard coverage only where it improves real entry surfaces into the shared chain
4. Broaden universal-create coverage and context handoff on existing canonical records
5. Add deeper operational polish on scheduling, field execution, materials, and admin foundations

## What Should Not Be Built Out Of Order

Avoid jumping ahead into:
- disconnected module dashboards with private logic
- second scheduling or dispatch systems
- second billing systems
- portal-only copies of contractor records
- external sync, reminders, or notification layers before the canonical workflow is clear
- broad redesign passes that ignore the current shell and workspace baseline
- target-architecture expansions presented as if they are already on this branch

## Practical Rule

Before adding a new feature, ask:
- does this connect to the current canonical chain?
- does this improve an existing workflow or create a second one?
- does project continuity get stronger or weaker?
- is this the next obvious layer after what is already real?

If the answer is unclear, the work probably needs planning before implementation.
