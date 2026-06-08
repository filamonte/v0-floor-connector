export type GoldenWorkflowRouteMapStage = {
  id:
    | "lead-opportunity"
    | "project"
    | "estimate"
    | "contract"
    | "readiness"
    | "schedule"
    | "field"
    | "closeout"
    | "invoice"
    | "payment"
    | "reports";
  stage: string;
  href: string;
  owner: string;
  question: string;
  handoff: string;
};

export const goldenWorkflowRouteMap: GoldenWorkflowRouteMapStage[] = [
  {
    id: "lead-opportunity",
    stage: "Lead / opportunity",
    href: "/leads",
    owner: "Leads",
    question: "Is this real work worth estimating?",
    handoff:
      "Qualify the request, capture site context, and route estimating work without duplicating the customer or project."
  },
  {
    id: "project",
    stage: "Project",
    href: "/projects",
    owner: "Project Workspace",
    question: "What is the current project state?",
    handoff:
      "Diagnose linked estimates, contracts, readiness, field, communication, billing, and customer-access context."
  },
  {
    id: "estimate",
    stage: "Estimate",
    href: "/estimates",
    owner: "Estimate Workspace",
    question: "Is the proposed scope ready for customer review?",
    handoff:
      "Build and approve commercial scope on the canonical estimate before contract, job, or invoice handoff."
  },
  {
    id: "contract",
    stage: "Contract",
    href: "/contracts",
    owner: "Contract Workspace",
    question: "Is the approved scope ready to sign?",
    handoff:
      "Review contract readiness and signature state on the same project, estimate, and customer chain."
  },
  {
    id: "readiness",
    stage: "Readiness",
    href: "/projects",
    owner: "Project readiness",
    question: "What blocks execution or billing?",
    handoff:
      "Use Project diagnosis for readiness blockers, then move action to Schedule, Field, Financials, or Communications."
  },
  {
    id: "schedule",
    stage: "Schedule",
    href: "/schedule",
    owner: "CrewBoard",
    question: "When and with whom will the work happen?",
    handoff:
      "Place ready jobs, review crew gaps, and keep schedule movement on canonical jobs and assignments."
  },
  {
    id: "field",
    stage: "Field",
    href: "/daily-logs",
    owner: "Daily Logs / Field",
    question: "What happened onsite today?",
    handoff:
      "Capture daily execution, blockers, notes, time, and evidence against the existing project and job."
  },
  {
    id: "closeout",
    stage: "Closeout",
    href: "/projects",
    owner: "Project closeout",
    question: "Is the work complete enough to hand off?",
    handoff:
      "Review proof, field completion, warranty/service context, and customer-safe document readiness from the Project Workspace."
  },
  {
    id: "invoice",
    stage: "Invoice",
    href: "/invoices",
    owner: "Invoice Workspace",
    question: "What approved or completed work is billable?",
    handoff:
      "Bill from approved estimate, change-order, job, SOV, or explicit invoice-only lineage without creating detached receivables."
  },
  {
    id: "payment",
    stage: "Payment",
    href: "/payments",
    owner: "Payments / AR",
    question: "Has the invoice been collected or failed?",
    handoff:
      "Review canonical payments and payment events; collections action stays with Financials, invoices, and payments."
  },
  {
    id: "reports",
    stage: "Reports",
    href: "/reports",
    owner: "Reports",
    question: "What does the owner need to review?",
    handoff:
      "Summarize portfolio pressure and route back to the workspace that owns the next action."
  }
];

export function getGoldenWorkflowRouteMap() {
  return [...goldenWorkflowRouteMap];
}
