import {
  companyDocumentAudiences,
  companyDocumentCategories,
  type CompanyDocumentAudience,
  type CompanyDocumentCategory
} from "./types";

export type CompanyDocumentStarter = {
  id: string;
  title: string;
  category: CompanyDocumentCategory;
  documentKind: string;
  audience: CompanyDocumentAudience;
  description: string;
  body: string;
};

export type CompanyDocumentStarterDraft = {
  title: string;
  category: CompanyDocumentCategory;
  documentKind: string;
  audience: CompanyDocumentAudience;
  description: string;
  body: string;
};

export const starterDocumentsDisclaimer =
  "Starter Documents are examples only and are not legal advice. Review with qualified counsel or advisors before use.";

const companyDocumentStarters = [
  {
    id: "employee-handbook-starter",
    title: "Employee Handbook Starter",
    category: "employee_document",
    documentKind: "handbook",
    audience: "employee",
    description:
      "A starter handbook outline for company expectations, work standards, and internal review.",
    body: `Employee Handbook Starter

${starterDocumentsDisclaimer}

[Company Name]
Review date: [Review Date]
Responsible role: [Responsible Role]

Purpose
This starter outlines basic company expectations for employees. Update each section so it matches your company policies, benefits, state requirements, and operating practices.

Welcome and company overview
- Company mission and work standards
- Employment relationship and workplace expectations
- Equal opportunity and respectful workplace expectations

Work conduct
- Attendance and schedule expectations
- Jobsite conduct and customer interaction standards
- Vehicle, tool, and equipment care expectations
- Safety reporting and incident reporting expectations

Time, pay, and benefits
- Timekeeping expectations
- Payroll schedule reference
- Benefits summary placeholder
- Paid time off or leave policy placeholder

Acknowledgement
This starter is not an employee acknowledgement workflow. Add your reviewed acknowledgement language only after professional review.`
  },
  {
    id: "subcontractor-agreement-starter",
    title: "Subcontractor Agreement Starter",
    category: "subcontractor_document",
    documentKind: "agreement",
    audience: "subcontractor",
    description:
      "A starter outline for subcontractor expectations, project coordination, safety, and insurance review.",
    body: `Subcontractor Agreement Starter

${starterDocumentsDisclaimer}

[Company Name]
Review date: [Review Date]
Responsible role: [Responsible Role]

Purpose
This starter provides an outline for subcontractor working expectations. Replace placeholders and review all terms with qualified counsel or advisors before use.

Parties and work scope
- Contractor: [Company Name]
- Subcontractor: [Subcontractor Name]
- Work type or project scope: [Scope Summary]
- Project or service area: [Project / Area]

Coordination expectations
- Scheduling and site access expectations
- Communication contact and response expectations
- Required documentation before work starts
- Change handling and written approval expectations

Safety and insurance placeholders
- Safety program responsibilities
- Insurance certificate requirements
- Incident reporting expectations
- Tool, equipment, and material responsibilities

Review note
This starter is not complete, jurisdiction-specific, or legally enforceable by itself.`
  },
  {
    id: "safety-plan-starter",
    title: "Safety Plan Starter",
    category: "safety_compliance",
    documentKind: "safety_plan",
    audience: "internal",
    description:
      "A starter safety plan outline for jobsite expectations, reporting, PPE, and review cadence.",
    body: `Safety Plan Starter

${starterDocumentsDisclaimer}

[Company Name]
Review date: [Review Date]
Responsible role: [Responsible Role]

Purpose
This starter helps document general jobsite safety expectations. Customize it for your work types, training requirements, equipment, materials, and advisor-reviewed safety program.

General expectations
- Follow posted jobsite rules and company safety procedures.
- Stop work and notify [Responsible Role] when unsafe conditions are found.
- Report injuries, near misses, damaged equipment, and hazardous conditions promptly.

Personal protective equipment
- Required PPE: [PPE List]
- Task-specific PPE: [Task / PPE]
- PPE inspection and replacement expectations: [Process]

Materials and equipment
- Chemical handling and storage expectations
- Equipment inspection expectations
- Ventilation, dust control, and housekeeping expectations

Review cadence
- Safety plan review owner: [Responsible Role]
- Next review date: [Review Date]`
  },
  {
    id: "operations-sop-starter",
    title: "Operations SOP Starter",
    category: "operations_sop",
    documentKind: "sop",
    audience: "internal",
    description:
      "A starter SOP outline for repeatable internal operating procedures and role ownership.",
    body: `Operations SOP Starter

${starterDocumentsDisclaimer}

[Company Name]
Review date: [Review Date]
Responsible role: [Responsible Role]

Purpose
Use this starter to document one repeatable company process. Keep the final SOP specific to your team, tools, and project workflow.

Procedure name
[Procedure Name]

When this applies
- Trigger: [When the process starts]
- Scope: [What this SOP covers]
- Out of scope: [What this SOP does not cover]

Roles
- Owner: [Responsible Role]
- Supporting roles: [Roles]
- Escalation contact: [Contact / Role]

Steps
1. [Step one]
2. [Step two]
3. [Step three]

Completion check
- Required output: [Output]
- Review or approval: [Reviewer]
- Record location: [Where the record is kept]`
  },
  {
    id: "warranty-service-policy-starter",
    title: "Warranty Service Policy Starter",
    category: "warranty_service",
    documentKind: "policy",
    audience: "customer_service",
    description:
      "A starter internal policy outline for warranty and service intake, review, and response expectations.",
    body: `Warranty Service Policy Starter

${starterDocumentsDisclaimer}

[Company Name]
Review date: [Review Date]
Responsible role: [Responsible Role]

Purpose
This starter helps outline internal warranty and service response expectations. Customize it to match your actual warranty documents, service process, and advisor-reviewed commitments.

Service intake
- Intake channels: [Phone / Email / Portal / Other]
- Required customer information: [Information]
- Required project or job reference: [Reference]
- Photos or notes requested: [Requirements]

Review process
- Initial review owner: [Responsible Role]
- Target response time: [Response Window]
- Site visit decision criteria: [Criteria]
- Escalation path: [Escalation Role]

Resolution tracking
- Service action summary: [Where documented]
- Customer communication owner: [Responsible Role]
- Follow-up review date: [Review Date]

Important note
This starter does not change any customer warranty document, service ticket, invoice, or payment record.`
  }
] satisfies CompanyDocumentStarter[];

const companyDocumentStarterIds = new Set(
  companyDocumentStarters.map((starter) => starter.id)
);

export function validateStarterDocumentShape(
  starter: CompanyDocumentStarter
): boolean {
  return (
    companyDocumentStarterIds.has(starter.id) &&
    starter.title.trim().length > 0 &&
    starter.documentKind.trim().length > 0 &&
    companyDocumentCategories.includes(starter.category) &&
    companyDocumentAudiences.includes(starter.audience) &&
    starter.description.includes("starter") &&
    starter.body.includes(starterDocumentsDisclaimer)
  );
}

export function listCompanyDocumentStarters() {
  return companyDocumentStarters;
}

export function getCompanyDocumentStarter(starterId: string) {
  return (
    companyDocumentStarters.find((starter) => starter.id === starterId) ?? null
  );
}

export function buildCompanyDocumentStarterDraft(
  starter: CompanyDocumentStarter
): CompanyDocumentStarterDraft {
  return {
    title: starter.title,
    category: starter.category,
    documentKind: starter.documentKind,
    audience: starter.audience,
    description: `${starter.description}\n\n${starterDocumentsDisclaimer}`,
    body: starter.body
  };
}
