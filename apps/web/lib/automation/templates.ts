import type {
  AutomationNotificationPreferenceCategory,
  AutomationNotificationTemplateDefinition
} from "@floorconnector/types";

export const automationNotificationTemplateDefinitions: readonly AutomationNotificationTemplateDefinition[] =
  [
    {
      category: "customer_message_received",
      displayName: "Customer message received",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource: "A customer posts into an existing canonical communication thread.",
      sampleSubject: "New customer message needs review",
      sampleBody:
        "A customer added a new message to the project conversation. Review the canonical thread and follow up manually from the existing communication workspace.",
      requiredCanonicalContextFields: [
        {
          key: "threadId",
          label: "Communication thread ID",
          description: "Identifies the canonical thread that received the message."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Connects the message back to the shared project workflow."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Anchors the communication to the canonical customer."
        },
        {
          key: "lastMessageAt",
          label: "Last message timestamp",
          description: "Marks when the latest customer message landed."
        }
      ],
      executionAvailable: false
    },
    {
      category: "estimate_awaiting_approval",
      displayName: "Estimate awaiting approval",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource: "A canonical estimate remains sent and has not been approved or rejected.",
      sampleSubject: "Estimate is still awaiting approval",
      sampleBody:
        "A sent estimate is still awaiting customer approval. Review the canonical estimate and follow up manually from the existing workspace.",
      requiredCanonicalContextFields: [
        {
          key: "estimateId",
          label: "Estimate ID",
          description: "Identifies the sent canonical estimate."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Links the estimate back to the shared project chain."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Anchors the estimate follow-up to the canonical customer."
        },
        {
          key: "sentAt",
          label: "Sent timestamp",
          description: "Confirms when the estimate moved out for customer review."
        }
      ],
      executionAvailable: false
    },
    {
      category: "contract_awaiting_signature",
      displayName: "Contract awaiting signature",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource:
        "A canonical contract remains sent or viewed and signature completion has not landed.",
      sampleSubject: "Contract is still awaiting signature",
      sampleBody:
        "A contract is still awaiting signature on the canonical contract record. Review signer status and follow up manually from the existing contract workspace.",
      requiredCanonicalContextFields: [
        {
          key: "contractId",
          label: "Contract ID",
          description: "Identifies the canonical contract awaiting signature."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Links the contract back to the shared project hub."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Anchors the contract follow-up to the canonical customer."
        },
        {
          key: "sentAt",
          label: "Sent timestamp",
          description: "Confirms when the contract moved out for signature."
        }
      ],
      executionAvailable: false
    },
    {
      category: "contract_signed",
      displayName: "Contract signed",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource: "A canonical contract reaches signed status.",
      sampleSubject: "Contract signed and ready for workflow review",
      sampleBody:
        "A contract has been signed on the canonical contract record. Review the linked project readiness and confirm the next manual handoff step.",
      requiredCanonicalContextFields: [
        {
          key: "contractId",
          label: "Contract ID",
          description: "Identifies the signed canonical contract."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Links the signed contract back to the shared project hub."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Anchors the signed contract to the canonical customer."
        },
        {
          key: "signedAt",
          label: "Signed timestamp",
          description: "Confirms when signature completion occurred."
        }
      ],
      executionAvailable: false
    },
    {
      category: "deposit_paid_ready_to_schedule",
      displayName: "Deposit paid / ready to schedule",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource:
        "Canonical payment success and workflow readiness together indicate the project is ready for scheduling review.",
      sampleSubject: "Project may be ready for scheduling review",
      sampleBody:
        "A deposit-related payment succeeded and the project now appears ready to schedule. Review the canonical project readiness state before any manual scheduling follow-through.",
      requiredCanonicalContextFields: [
        {
          key: "projectId",
          label: "Project ID",
          description: "Identifies the canonical project entering scheduling review."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Keeps the readiness handoff tied to the canonical customer."
        },
        {
          key: "invoiceId",
          label: "Invoice ID",
          description: "Connects the deposit-related payment back to the billing chain."
        },
        {
          key: "readyToScheduleAt",
          label: "Ready-to-schedule timestamp",
          description: "Confirms when workflow gates cleared on the canonical project."
        }
      ],
      executionAvailable: false
    },
    {
      category: "payment_failed",
      displayName: "Payment failed",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource: "A canonical payment event is recorded as payment_failed.",
      sampleSubject: "Payment failed on an open invoice",
      sampleBody:
        "A payment attempt failed on the canonical invoice chain. Review the invoice and payment event history, then decide the next manual collections step.",
      requiredCanonicalContextFields: [
        {
          key: "invoiceId",
          label: "Invoice ID",
          description: "Identifies the invoice with the failed payment attempt."
        },
        {
          key: "paymentEventId",
          label: "Payment event ID",
          description: "Identifies the immutable failed payment event."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Connects the failed payment back to the project workflow."
        },
        {
          key: "occurredAt",
          label: "Failure timestamp",
          description: "Confirms when the failed payment event occurred."
        }
      ],
      executionAvailable: false
    },
    {
      category: "invoice_overdue",
      displayName: "Invoice overdue",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource: "A canonical invoice due date passes while balance remains open.",
      sampleSubject: "Invoice is overdue and still open",
      sampleBody:
        "An invoice is now overdue with an outstanding balance on the canonical billing chain. Review collections follow-through manually from the invoice or payments workspace.",
      requiredCanonicalContextFields: [
        {
          key: "invoiceId",
          label: "Invoice ID",
          description: "Identifies the overdue canonical invoice."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Keeps the overdue invoice tied to the shared project chain."
        },
        {
          key: "dueDate",
          label: "Due date",
          description: "Determines when the invoice moved into overdue status."
        },
        {
          key: "balanceDueAmount",
          label: "Open balance amount",
          description: "Confirms the invoice still has money outstanding."
        }
      ],
      executionAvailable: false
    },
    {
      category: "change_order_approved",
      displayName: "Change order approved",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource: "A canonical change order reaches approved status.",
      sampleSubject: "Approved change order ready for downstream review",
      sampleBody:
        "A change order has been approved on the canonical workflow chain. Review downstream billing or schedule-of-values follow-through manually from the existing workspace.",
      requiredCanonicalContextFields: [
        {
          key: "changeOrderId",
          label: "Change order ID",
          description: "Identifies the approved canonical change order."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Connects the approved change order to the shared project."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Anchors the approval to the canonical customer."
        },
        {
          key: "approvedAt",
          label: "Approved timestamp",
          description: "Confirms when customer approval landed."
        }
      ],
      executionAvailable: false
    },
    {
      category: "schedule_reminder",
      displayName: "Schedule reminder",
      intendedRecipients: ["owner", "admin", "manager", "member"],
      triggerSource: "A scheduled date approaches on the canonical job record.",
      sampleSubject: "Upcoming scheduled work reminder",
      sampleBody:
        "Scheduled work is approaching on a canonical job. Review the job, crew readiness, and field plan manually before the service date.",
      requiredCanonicalContextFields: [
        {
          key: "jobId",
          label: "Job ID",
          description: "Identifies the scheduled canonical job."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Links the reminder back to the shared project chain."
        },
        {
          key: "scheduledDate",
          label: "Scheduled date",
          description: "Determines when the reminder would be relevant."
        },
        {
          key: "customerId",
          label: "Customer ID",
          description: "Keeps the work reminder anchored to the canonical customer."
        }
      ],
      executionAvailable: false
    },
    {
      category: "crew_assignment_reminder",
      displayName: "Crew assignment reminder",
      intendedRecipients: ["owner", "admin", "manager"],
      triggerSource:
        "A scheduled canonical job still lacks crew assignment coverage.",
      sampleSubject: "Scheduled job still needs crew assignment",
      sampleBody:
        "A scheduled job does not yet show crew coverage on the canonical job chain. Review staffing manually before work begins.",
      requiredCanonicalContextFields: [
        {
          key: "jobId",
          label: "Job ID",
          description: "Identifies the scheduled canonical job missing crew coverage."
        },
        {
          key: "projectId",
          label: "Project ID",
          description: "Connects the crew reminder to the shared project workflow."
        },
        {
          key: "scheduledDate",
          label: "Scheduled date",
          description: "Determines when the crew gap becomes urgent."
        },
        {
          key: "crewVendorId",
          label: "Crew vendor ID",
          description: "Used to confirm whether a crew assignment already exists."
        }
      ],
      executionAvailable: false
    }
  ] as const;

export const automationNotificationTemplateDefinitionsByCategory: Readonly<
  Record<
    AutomationNotificationPreferenceCategory,
    AutomationNotificationTemplateDefinition
  >
> = Object.freeze(
  automationNotificationTemplateDefinitions.reduce(
    (definitionsByCategory, definition) => {
      definitionsByCategory[definition.category] = definition;
      return definitionsByCategory;
    },
    {} as Record<
      AutomationNotificationPreferenceCategory,
      AutomationNotificationTemplateDefinition
    >
  )
);
