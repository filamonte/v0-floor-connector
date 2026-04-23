"use client";

import { useState } from "react";
import type { Estimate, EstimateLineItem } from "@floorconnector/types";
import { FileText, Users, Briefcase, CheckCircle } from "lucide-react";

import { CFWorkspaceShell, type CFWorkspaceStage } from "./cf-workspace-shell";
import { ItemsSection } from "./items-section";
import { TermsEditor } from "./terms-editor";
import { ScopeOfWork } from "./scope-of-work";
import { FilesSection } from "./files-section";
import { CoverSheet } from "./cover-sheet";
import { NotesSection } from "./notes-section";
import { ReviewSendModal } from "./review-send-modal";

type EditableEstimate = Estimate & {
  lineItems?: EstimateLineItem[];
  project?: { id: string; name: string } | null;
  customer?: { id: string; name: string; email?: string | null } | null;
  opportunity?: { id: string; title: string } | null;
};

type EstimateWorkspaceProps = {
  estimate: EditableEstimate;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
};

function getStages(status: string): CFWorkspaceStage[] {
  const order = ["draft", "pending_approval", "sent", "approved", "completed"];
  const currentIdx = order.indexOf(status);

  return [
    { id: "estimating", label: "Estimating", status: currentIdx >= 0 ? (currentIdx > 0 ? "complete" : "active") : "pending" },
    { id: "pending", label: "Pending Ap...", status: currentIdx >= 1 ? (currentIdx > 1 ? "complete" : "active") : "pending" },
    { id: "approved-to-be", label: "Approved - ...", status: currentIdx >= 2 ? (currentIdx > 2 ? "complete" : "active") : "pending" },
    { id: "approved", label: "Approved", status: currentIdx >= 3 ? (currentIdx > 3 ? "complete" : "active") : "pending" },
    { id: "completed", label: "Completed", status: currentIdx >= 4 ? "active" : "pending" }
  ];
}

// Details Section - CF style
function DetailsSection({ estimate, opportunityTitle, customerName, projectName }: {
  estimate: EditableEstimate;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
}) {
  return (
    <div className="h-full bg-white p-4">
      <h2 className="text-[13px] font-semibold text-[#172b4d] mb-3">Estimate Details</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-[#dfe1e6] rounded p-3">
          <p className="text-[10px] font-semibold uppercase text-[#5e6c84]">Opportunity</p>
          <p className="text-[13px] font-medium text-[#172b4d] mt-1">{opportunityTitle || "-"}</p>
        </div>
        <div className="border border-[#dfe1e6] rounded p-3">
          <p className="text-[10px] font-semibold uppercase text-[#5e6c84]">Customer</p>
          <p className="text-[13px] font-medium text-[#172b4d] mt-1">{customerName || "-"}</p>
        </div>
        <div className="border border-[#dfe1e6] rounded p-3">
          <p className="text-[10px] font-semibold uppercase text-[#5e6c84]">Project</p>
          <p className="text-[13px] font-medium text-[#172b4d] mt-1">{projectName || "-"}</p>
        </div>
      </div>
      <div className="mt-3 border border-[#dfe1e6] rounded p-3">
        <p className="text-[10px] font-semibold uppercase text-[#5e6c84]">Status</p>
        <p className="text-[14px] font-semibold text-[#172b4d] mt-1 capitalize">{estimate.status.replaceAll("_", " ")}</p>
      </div>
    </div>
  );
}

// Bidding Section - CF placeholder
function BiddingSection() {
  return (
    <div className="h-full bg-white p-4">
      <h2 className="text-[13px] font-semibold text-[#172b4d] mb-3">Bidding</h2>
      <p className="text-[12px] text-[#5e6c84]">Bidding configuration will appear here.</p>
    </div>
  );
}

export function EstimateWorkspace({
  estimate,
  opportunityTitle,
  customerName,
  projectName
}: EstimateWorkspaceProps) {
  const [activeSection, setActiveSection] = useState("items");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const totalWithTax = (estimate.lineItems ?? []).reduce(
    (sum, item) => sum + (item.unitCost ?? 0) * (item.quantity ?? 0),
    Number(estimate.taxAmount ?? 0)
  );

  const createdDate = new Date(estimate.createdAt);

  // Render the active section content - FULL BLEED, no cards
  const renderContent = () => {
    switch (activeSection) {
      case "details":
        return (
          <DetailsSection
            estimate={estimate}
            opportunityTitle={opportunityTitle}
            customerName={customerName}
            projectName={projectName}
          />
        );
      case "items":
        return (
          <ItemsSection
            lineItems={estimate.lineItems ?? []}
            totalWithTax={totalWithTax}
          />
        );
      case "terms":
        return <TermsEditor />;
      case "scope-of-work":
        return <ScopeOfWork summary={estimate.notes ?? ""} items={[]} />;
      case "bidding":
        return <BiddingSection />;
      case "files":
        return <FilesSection files={[]} />;
      case "cover-sheet":
        return <CoverSheet includeCoverSheet={false} />;
      case "notes":
        return <NotesSection defaultValue="" />;
      default:
        return (
          <ItemsSection
            lineItems={estimate.lineItems ?? []}
            totalWithTax={totalWithTax}
          />
        );
    }
  };

  return (
    <>
      <CFWorkspaceShell
        backHref="/estimates"
        backLabel="Back"
        title={estimate.project?.name ?? `Estimate ${estimate.referenceNumber}`}
        subtitle="Project/Opportunity"
        referenceNumber={estimate.referenceNumber}
        statusBadge={estimate.status.replaceAll("_", " ")}
        stages={getStages(estimate.status)}
        sections={[
          { id: "details", label: "Details" },
          { id: "items", label: "Items" },
          { id: "terms", label: "Terms" },
          { id: "scope-of-work", label: "Scope of Work" },
          { id: "bidding", label: "Bidding" },
          { id: "files", label: "Files" },
          { id: "cover-sheet", label: "Cover Sheet" },
          { id: "notes", label: "Notes" }
        ]}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onReviewSubmit={() => setReviewModalOpen(true)}
        createdAt={createdDate.toLocaleDateString()}
        createdTime={createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        createdBy="Jeff Filamonte"
      >
        {renderContent()}
      </CFWorkspaceShell>

      <ReviewSendModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        estimateId={estimate.referenceNumber}
        estimateTitle={estimate.project?.name ?? `Estimate ${estimate.referenceNumber}`}
        customerEmail={estimate.customer?.email ?? ""}
      />
    </>
  );
}
