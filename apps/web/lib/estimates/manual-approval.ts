import { z } from "zod";

const approvalMethodLabels = {
  paper_signature: "Paper signature",
  verbal: "Verbal approval",
  email: "Email approval",
  text_message: "Text message",
  onsite_signature: "Onsite signature",
  other: "Other"
} as const;

export const manualEstimateApprovalEvidenceSchema = z.object({
  approvedByName: z
    .string()
    .trim()
    .min(1, "Enter who approved the estimate.")
    .max(160, "Approver name must be 160 characters or fewer."),
  approvalMethod: z.enum(
    ["paper_signature", "verbal", "email", "text_message", "onsite_signature", "other"] as const,
    {
      errorMap: () => ({ message: "Choose how the customer approved." })
    }
  ),
  approvalDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the approval date."),
  approvalTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Enter the approval time."),
  approvalNotes: z
    .string()
    .trim()
    .max(2000, "Notes must be 2000 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null)),
  approvalEvidence: z
    .string()
    .trim()
    .min(1, "Add notes or evidence for the manual approval.")
    .max(2000, "Evidence must be 2000 characters or fewer.")
});

export type ManualEstimateApprovalEvidence = z.infer<
  typeof manualEstimateApprovalEvidenceSchema
>;

export function buildManualEstimateApprovalEvidence(
  input: ManualEstimateApprovalEvidence
) {
  const lines = [
    "Manual approval recorded by contractor.",
    `Approved by: ${input.approvedByName}`,
    `How approved: ${approvalMethodLabels[input.approvalMethod]}`,
    `Approval date/time: ${input.approvalDate} ${input.approvalTime}`,
    input.approvalNotes ? `Notes: ${input.approvalNotes}` : null,
    `Evidence: ${input.approvalEvidence}`
  ];

  return lines.filter((line): line is string => Boolean(line)).join("\n");
}
