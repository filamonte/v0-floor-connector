# Active Waves

Status: Planning-only
Doc Type: Coordination Index

This file is a compact pointer to the current operational capability-wave
planning set. It does not authorize implementation and does not make any planned
wave implemented truth.

For implemented status, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Operational Capability Waves v1

Use
[docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md)
as the coordination source for the four operational waves:

1. [Project Workspace Capability Wave v1](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md)
2. [Scheduling Capability Wave v1](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md)
3. [Field/Mobile Capability Wave v1](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md)
4. [Portal Capability Wave v1](C:/FloorConnector/docs/design/portal-capability-wave-v1.md)

Project Workspace is the first implementation slice. The sequence above should
not be read as permission to implement all four waves at the same time.

Shared guardrails:

- preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- do not create duplicate business models
- keep Project Workspace as the readiness and continuity hub
- keep Scheduling on canonical `jobs` and `job_assignments`
- keep Field/Mobile on canonical execution records
- keep Portal as a scoped customer read/action surface over canonical records
