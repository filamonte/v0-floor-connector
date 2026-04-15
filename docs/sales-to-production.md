FloorConnector Sales → Production Workflow (v1)
Purpose

This document defines the end-to-end workflow from lead intake through job scheduling.

It ensures:

no data duplication
full shared data flow across all stages
consistent contractor operations
support for financing, contracts, and scheduling
🧠 Core Principles
1. Single Source of Truth

All data flows forward:

lead → customer → project → estimate → contract → invoice → job

No re-entry of data at later stages.

2. Project as Operational Root

All downstream workflows attach to:

project
customer
organization
3. Workflow Over Modules

The system is not:

“CRM module”
“Estimate module”
“Invoice module”

It is:

one continuous operational workflow

4. Financing is a Conversion Tool

Financing is introduced during estimate review, not only after contract.

🔁 Full Workflow
1. Lead Intake
Sources
website instant estimator
website contact form
inspection request
online scheduler
manual sales entry
Lead Data
name
contact info
address
service type
notes
source
Lead Status
new
contacted
qualified
inspection_scheduled
inspection_complete
converted
lost
2. Customer Creation

Qualified leads become:

customer record
optionally linked to organization/company

Customer becomes canonical entity for all future work.

3. Opportunity / Site Assessment
Purpose

Capture real job conditions before estimate.

Includes
measurements (sq ft, areas)
photos
substrate condition
prep requirements
recommended system
notes
Input Sources
on-site inspection
customer-provided measurements
instant estimator
4. Estimate Creation
Methods
custom quote
system-based (preset assemblies)
square-foot pricing
hybrid
Uses
reusable catalog items
system templates
5. Estimate Workflow
Statuses
draft
sent
viewed
approved
rejected
expired
6. Customer Review Stage

Customer can:

review estimate
request changes
approve estimate
Financing (Optional)

Customer may:

pre-qualify using soft credit pull
view monthly payment options
Financing Data
prequalified status
estimated terms
7. Estimate Approval

Triggers:

contract generation eligibility
internal workflow progression
8. Contract Generation

Contracts are:

generated from approved estimates
based on job type templates
merged with project/customer data
9. Internal Contract Approval (Optional)

Configurable per organization:

require manager approval
allow sales rep approval
10. E-Sign Workflow
Status Flow
draft
internal_review
ready_to_send
sent_for_signature
partially_signed
signed
void
Default Behavior
customer signs first
contractor countersigns automatically
11. Post-Signature Financial Step

After contract is signed:

Option A: Deposit Required
fixed amount or %
invoice generated automatically
Option B: Financing
final financing application
approval/decline
replaces deposit if approved
12. Sale Completion

Conditions:

contract signed
deposit received OR financing approved

System status:

ready_to_schedule
13. Scheduling
Types
Sales Scheduling
inspections
appointments
Operations Scheduling
job scheduling
crew assignment (future)
Scheduling Status
awaiting_deposit
financing_pending
ready_to_schedule
scheduled
14. Job Execution (Future Phase)
job tracking
crew management
time tracking
field logs
💰 Financing Model
Phase 1: Pre-Qualification
soft credit pull
estimate-stage
optional
improves conversion
Phase 2: Final Financing
post-contract
replaces or supplements deposit
Provider Strategy
initial provider: Wisetack
future: multi-provider support
🧱 Key Data Relationships
Lead
 → Customer
   → Project
     → Site Assessment
     → Estimate
       → Contract
         → Invoice / Payment
         → Financing
     → Job (scheduled)
⚙️ Configuration Requirements

At organization level:

financing enabled/disabled
financing provider
contract approval required
estimate approval rules
deposit rules
tax settings
retainage settings
🚫 What We Avoid
duplicate data between modules
disconnected contract/invoice systems
module-specific templates
manual re-entry of estimate/contract data
forcing financing too early or too late
🚀 Future Extensions
instant estimator builder (per contractor site)
online booking system
customer portal
full AIA billing workflows
automated communications
lead pipelines
CRM enhancements
🧭 What this doc does

This document defines:

how contractors actually operate
how FloorConnector supports revenue generation
how all systems connect without silos