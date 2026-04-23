"use client";

import { useState } from "react";
import type { CatalogItem, Estimate, EstimateLineItem } from "@floorconnector/types";
import { FileText, Users, Briefcase, CheckCircle } from "lucide-react";

import {
  CFWorkspaceShell,
  type CFWorkspaceStage
} from "./cf-workspace-shell";
import { ItemsSection } from "./items-section";
import { TermsEditor } from "./terms-editor";
import { ScopeOfWork } from "./scope-of-work";
import { FilesSection } from "./files-section";
import { CoverSheet } from "./cover-sheet";
import { NotesSection } from "./notes-section";
import { ReviewSendModal } from "./review-send-modal";

type EditableEstimate = Estimate & {
  lineItems?: EstimateLineItem[];
  project?: {
    id: string;
    name: string;
    status?: string;
    description?: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
  opportunity?: {
    id: string;
    title: string;
  } | null;
};

type EstimateWorkspaceProps = {
  estimate: EditableEstimate;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  catalogItems?: CatalogItem[];
};

function buildStages(status: string): CFWorkspaceStage[] {
  const getStatus = (
    stage: string,
    currentStatus: string
  ): "active" | "pending" | "complete" => {
    const order = ["draft", "pending_approval", "sent", "approved", "completed"];
    const stageIndex = order.indexOf(stage);
    const currentIndex = order.indexOf(currentStatus);

    if (stageIndex < currentIndex) return "complete";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  return [
    {
      id: "estimating",
      label: "Estimating",
      icon: <FileText className="w-4 h-4" />,
      status: getStatus("draft", status)
    },
    {
      id: "pending",
      label: "Pending Ap...",
      icon: <Users className="w-4 h-4" />,
      status: getStatus("pending_approval", status)
    },
    {
      id: "approved-to-be",
      label: "Approved - ...",
      icon: <Briefcase className="w-4 h-4" />,
      status: getStatus("sent", status)
    },
    {
      id: "approved",
      label: "Approved",
      icon: <CheckCircle className="w-4 h-4" />,
      status: getStatus("approved", status)
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircle className="w-4 h-4" />,
      status: getStatus("completed", status)
    }
  ];
}

function DetailsSection({
  estimate,
  opportunityTitle,
  customerName,
  projectName
}: {
  estimate: EditableEstimate;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
}) {
  return (
    <section id="details" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Opportunity
          </p>
          <p className="mt-1.5 text-[14px] font-semibold text-gray-900">
            {opportunityTitle ?? "Opportunity linked"}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Customer
          </p>
          <p className="mt-1.5 text-[14px] font-semibold text-gray-900">
            {customerName ?? "Customer linked"}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Project
          </p>
          <p className="mt-1.5 text-[14px] font-semibold text-gray-900">
            {projectName ?? "Project linked"}
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] border border-[#e5e7eb] rounded-lg px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Current Status
        </p>
        <p className="mt-1.5 text-[16px] font-semibold capitalize text-gray-900">
          {estimate.status.replaceAll("_", " ")}
        </p>
        <p className="mt-2 text-[13px] text-gray-500">
          Build the estimate first, then review and send. Status changes stay downstream.
        </p>
      </div>
    </section>
  );
}

function ReviewSendSection({
  onOpenModal
}: {
  onOpenModal: () => void;
}) {
  return (
    <section id="review-send">
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900">
              Review / Send
            </h3>
            <p className="text-[13px] text-gray-500 mt-1">
              Save the estimate build first, then continue into the downstream review and send workflow.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenModal}
            className="px-6 py-2.5 bg-[#ef7d32] hover:bg-[#d95c1f] text-white text-[14px] font-semibold rounded-md transition"
          >
            Review and Send
          </button>
        </div>
      </div>
    </section>
  );
}

export function EstimateWorkspace({
  estimate,
  opportunityTitle,
  customerName,
  projectName,
  catalogItems = []
}: EstimateWorkspaceProps) {
  const [activeSection, setActiveSection] = useState("items");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Transform line items to the format expected by ItemsSection
  const itemGroups = [
    {
      id: "default",
      name: "Item",
      collapsed: false,
      items: (estimate.lineItems ?? []).map((item) => ({
        key: item.id,
        type: "material",
        name: item.name,
        costCode: "",
        quantity: item.quantity,
        unitCost: item.unitPrice,
        unit: item.unit,
        markup: "0",
        total: `$${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`,
        tax: false,
        assignedTo: ""
      }))
    }
  ];

  const totalWithTax = (estimate.lineItems ?? []).reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    Number(estimate.taxAmount ?? 0)
  );

  const createdDate = new Date(estimate.createdAt);

  return (
    <>
      <CFWorkspaceShell
        backHref="/estimates"
        backLabel="Back"
        title={estimate.project?.name ?? `Estimate ${estimate.referenceNumber}`}
        subtitle="Project/Opportunity"
        referenceNumber={estimate.referenceNumber}
        statusBadge={estimate.status.replaceAll("_", " ")}
        stages={buildStages(estimate.status)}
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
        createdAt={createdDate.toLocaleDateString()}
        createdTime={createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        createdBy="Jeff Filamonte"
      >
        <div className="space-y-6">
          <DetailsSection
            estimate={estimate}
            opportunityTitle={opportunityTitle}
            customerName={customerName}
            projectName={projectName}
          />

          <ItemsSection
            groups={itemGroups}
            totalWithTax={totalWithTax}
          />

          <TermsEditor />

          <ScopeOfWork
            summary={estimate.notes ?? ""}
            items={[]}
          />

          <FilesSection files={[]} />

          <CoverSheet includeCoverSheet={false} />

          <NotesSection defaultValue="" />

          <ReviewSendSection onOpenModal={() => setReviewModalOpen(true)} />
        </div>
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
