import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveOperationsReportingSummary,
  type ReportsContractInput,
  type ReportsFieldNoteInput,
  type ReportsInvoiceInput,
  type ReportsJobInput,
  type ReportsPaymentInput,
  type ReportsProjectInput
} from "./operations-summary";

function project(
  overrides: Partial<ReportsProjectInput> = {}
): ReportsProjectInput {
  return {
    id: overrides.id ?? "project-1",
    name: overrides.name ?? "Project One",
    status: overrides.status ?? "active",
    commercialReadinessStatus:
      overrides.commercialReadinessStatus ?? "ready_to_schedule",
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function job(overrides: Partial<ReportsJobInput> = {}): ReportsJobInput {
  return {
    id: overrides.id ?? "job-1",
    projectId: overrides.projectId ?? "project-1",
    dispatchStatus: overrides.dispatchStatus ?? "unscheduled",
    scheduledDate: Object.hasOwn(overrides, "scheduledDate")
      ? overrides.scheduledDate!
      : null,
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    project: overrides.project ?? { name: "Project One" },
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function contract(
  overrides: Partial<ReportsContractInput> = {}
): ReportsContractInput {
  return {
    id: overrides.id ?? "contract-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "CON-001",
    status: overrides.status ?? "sent",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    project: overrides.project ?? { name: "Project One" },
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function invoice(
  overrides: Partial<ReportsInvoiceInput> = {}
): ReportsInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    status: overrides.status ?? "sent",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-01",
    balanceDueAmount: overrides.balanceDueAmount ?? "100.00",
    project: overrides.project ?? { name: "Project One" },
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function payment(
  overrides: Partial<ReportsPaymentInput> = {}
): ReportsPaymentInput {
  return {
    id: overrides.id ?? "payment-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    amount: overrides.amount ?? "100.00",
    status: overrides.status ?? "recorded",
    paymentDate: overrides.paymentDate ?? "2026-05-20",
    createdAt: overrides.createdAt ?? "2026-05-20T12:00:00.000Z",
    invoice: overrides.invoice ?? {
      id: overrides.invoiceId ?? "invoice-1",
      referenceNumber: "INV-001"
    },
    customer: overrides.customer ?? { name: "Customer One" },
    project: overrides.project ?? { id: "project-1", name: "Project One" }
  };
}

function fieldNote(
  overrides: Partial<ReportsFieldNoteInput> = {}
): ReportsFieldNoteInput {
  return {
    id: overrides.id ?? "field-note-1",
    projectId: overrides.projectId ?? "project-1",
    dailyLogId: overrides.dailyLogId ?? "daily-log-1",
    noteType: overrides.noteType ?? "blocker",
    status: overrides.status ?? "open",
    title: overrides.title ?? "Moisture issue",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    project: overrides.project ?? { name: "Project One" }
  };
}

function summary(
  overrides: Partial<
    Parameters<typeof deriveOperationsReportingSummary>[0]
  > = {}
) {
  return deriveOperationsReportingSummary({
    todayIso: overrides.todayIso ?? "2026-05-20",
    projects: overrides.projects ?? [],
    jobs: overrides.jobs ?? [],
    jobAssignments: overrides.jobAssignments ?? [],
    scheduleWarnings: overrides.scheduleWarnings ?? [],
    contracts: overrides.contracts ?? [],
    invoices: overrides.invoices ?? [],
    payments: overrides.payments ?? [],
    dailyLogs: overrides.dailyLogs ?? [],
    fieldNotes: overrides.fieldNotes ?? [],
    attachments: overrides.attachments ?? [],
    collections: overrides.collections ?? {
      openReceivableAmount: "0.00",
      overdueReceivableAmount: "0.00",
      openInvoiceCount: 0,
      overdueInvoiceCount: 0,
      pendingPaymentAmount: "0.00",
      pendingEventCount: 0,
      failedOrVoidedEventCount: 0
    }
  });
}

void test("computes scheduling and crew metrics", () => {
  const result = summary({
    projects: [project()],
    jobs: [
      job({ id: "unscheduled", dispatchStatus: "unscheduled" }),
      job({
        id: "today",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-20"
      }),
      job({
        id: "upcoming",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-25"
      })
    ],
    jobAssignments: [
      {
        id: "assignment-1",
        jobId: "upcoming",
        personId: "person-1",
        vendorId: null
      }
    ],
    scheduleWarnings: [{ jobId: "today", warnings: [{ id: "warning-1" }] }]
  });

  assert.equal(result.counts.unscheduledJobs, 1);
  assert.equal(result.counts.jobsScheduledToday, 1);
  assert.equal(result.counts.upcomingJobs, 1);
  assert.equal(result.counts.jobsMissingCrew, 1);
  assert.equal(result.counts.scheduleWarnings, 1);
  assert.equal(result.lists.jobsNeedingSchedulingOrCrew.length, 2);
});

void test("builds owner operating snapshot from canonical source signals", () => {
  const result = summary({
    projects: [
      project({
        id: "blocked-project",
        commercialReadinessStatus: "contract_required"
      }),
      project({
        id: "ready-project",
        commercialReadinessStatus: "ready_to_schedule"
      })
    ],
    jobs: [
      job({
        id: "ready-unscheduled",
        projectId: "ready-project",
        dispatchStatus: "unscheduled"
      }),
      job({
        id: "in-progress",
        projectId: "ready-project",
        dispatchStatus: "in_progress",
        scheduledDate: "2026-05-20"
      })
    ],
    contracts: [contract({ id: "waiting", status: "sent" })],
    invoices: [invoice({ id: "overdue", dueDate: "2026-05-01" })],
    fieldNotes: [fieldNote({ id: "blocker" })],
    collections: {
      openReceivableAmount: "100.00",
      overdueReceivableAmount: "100.00",
      openInvoiceCount: 1,
      overdueInvoiceCount: 1,
      pendingPaymentAmount: "0.00",
      pendingEventCount: 0,
      failedOrVoidedEventCount: 0
    }
  });

  assert.deepEqual(
    result.ownerSummary.operatingSnapshot.map((metric) => [
      metric.id,
      metric.value,
      metric.href,
      metric.tone
    ]),
    [
      ["owner-ready-to-move", 2, "/projects", "good"],
      ["owner-blocked", 4, "/reports", "blocked"],
      ["owner-slipping", 1, "/schedule", "attention"],
      [
        "owner-cash-pressure",
        "100.00",
        "/financials/accounts-receivable",
        "blocked"
      ]
    ]
  );
  assert.equal(result.ownerSummary.reviewItems.length, 6);
  assert.equal(
    result.ownerSummary.reviewItems.every((item) =>
      [
        "/projects/",
        "/contracts/",
        "/daily-logs",
        "/invoices/",
        "/schedule"
      ].some((prefix) => item.href.startsWith(prefix))
    ),
    true
  );
});

void test("computes receivable and payment attention metrics", () => {
  const result = summary({
    projects: [project()],
    invoices: [
      invoice({ id: "open", balanceDueAmount: "500.00" }),
      invoice({ id: "paid", status: "paid", balanceDueAmount: "0.00" })
    ],
    collections: {
      openReceivableAmount: "500.00",
      overdueReceivableAmount: "500.00",
      openInvoiceCount: 1,
      overdueInvoiceCount: 1,
      pendingPaymentAmount: "75.00",
      pendingEventCount: 1,
      failedOrVoidedEventCount: 1
    }
  });

  assert.equal(result.counts.openReceivables, 1);
  assert.equal(result.counts.overdueInvoices, 1);
  assert.equal(result.counts.paymentAttention, 2);
  assert.equal(result.amounts.openReceivables, "500.00");
  assert.equal(result.lists.invoicesNeedingCollection.length, 1);
});

void test("flags waiting signatures", () => {
  const result = summary({
    projects: [project()],
    contracts: [
      contract({ id: "sent", status: "sent" }),
      contract({ id: "viewed", status: "viewed" }),
      contract({ id: "signed", status: "signed" })
    ]
  });

  assert.equal(result.counts.contractsWaitingSignature, 2);
  assert.deepEqual(
    result.lists.contractsWaitingSignature.map((item) => item.id),
    ["sent", "viewed"]
  );
});

void test("flags field blockers and missing recent Daily Job Logs", () => {
  const result = summary({
    projects: [project()],
    jobs: [job({ dispatchStatus: "in_progress", scheduledDate: "2026-05-20" })],
    dailyLogs: [
      {
        id: "daily-log-1",
        projectId: "project-1",
        jobId: "job-1",
        logDate: "2026-05-19"
      }
    ],
    fieldNotes: [
      {
        id: "note-1",
        projectId: "project-1",
        dailyLogId: "daily-log-1",
        noteType: "blocker",
        status: "open",
        title: "Moisture issue",
        updatedAt: "2026-05-20T12:00:00.000Z",
        project: { name: "Project One" }
      }
    ]
  });

  assert.equal(result.counts.inProgressJobs, 1);
  assert.equal(result.counts.projectsMissingRecentDailyLogs, 1);
  assert.equal(result.counts.fieldBlockers, 1);
  assert.equal(result.lists.fieldBlockers[0]?.title, "Moisture issue");
});

void test("handles empty state without fake counts", () => {
  const result = summary();

  assert.equal(result.counts.openProjects, 0);
  assert.equal(result.counts.unscheduledJobs, 0);
  assert.equal(result.counts.openReceivables, 0);
  assert.equal(result.lists.projectsNeedingNextMove.length, 0);
  assert.equal(
    result.metrics.every(
      (metric) => metric.value === 0 || metric.value === "0.00"
    ),
    true
  );
  assert.deepEqual(
    result.continuitySections.map((section) => ({
      id: section.id,
      items: section.items.length,
      emptyTitle: section.emptyTitle
    })),
    [
      {
        id: "attention",
        items: 0,
        emptyTitle: "No cross-record attention is visible."
      },
      {
        id: "ready",
        items: 0,
        emptyTitle: "No ready-to-move handoffs are visible."
      },
      {
        id: "executionToCash",
        items: 0,
        emptyTitle: "No execution-to-cash handoffs are visible."
      },
      {
        id: "ar",
        items: 0,
        emptyTitle: "No AR exposure is visible."
      },
      {
        id: "field",
        items: 0,
        emptyTitle: "No field execution review is visible."
      },
      {
        id: "recent",
        items: 0,
        emptyTitle: "No recent source-record movement is visible."
      }
    ]
  );
});

void test("execution-to-cash lane routes ready but unscheduled jobs to CrewBoard", () => {
  const result = summary({
    projects: [project()],
    jobs: [job({ id: "ready-unscheduled", dispatchStatus: "unscheduled" })]
  });
  const lane = result.continuitySections.find(
    (section) => section.id === "executionToCash"
  );

  assert.deepEqual(lane?.items, [
    {
      id: "execution-ready-unscheduled:ready-unscheduled",
      title: "Project One",
      subtitle: "Customer One",
      meta: "Ready but unscheduled",
      href: "/schedule?view=unscheduled&jobId=ready-unscheduled",
      tone: "attention",
      sourceLabel: "CrewBoard"
    }
  ]);
});

void test("execution-to-cash lane routes in-field blockers to Daily Logs", () => {
  const result = summary({
    projects: [project()],
    jobs: [
      job({
        id: "in-field",
        dispatchStatus: "in_progress",
        scheduledDate: "2026-05-20"
      })
    ],
    fieldNotes: [fieldNote({ id: "open-blocker" })]
  });
  const lane = result.continuitySections.find(
    (section) => section.id === "executionToCash"
  );

  assert.deepEqual(lane?.items, [
    {
      id: "execution-field-blocked:in-field:open-blocker",
      title: "Project One",
      subtitle: "Customer One",
      meta: "In field with open blockers",
      href: "/daily-logs/daily-log-1",
      tone: "blocked",
      sourceLabel: "Daily Logs"
    }
  ]);
});

void test("execution-to-cash lane routes completed work with open invoices to Invoice Workspace", () => {
  const result = summary({
    projects: [project()],
    jobs: [job({ id: "completed-job", dispatchStatus: "completed" })],
    invoices: [invoice({ id: "open-invoice", balanceDueAmount: "425.00" })]
  });
  const lane = result.continuitySections.find(
    (section) => section.id === "executionToCash"
  );

  assert.deepEqual(lane?.items, [
    {
      id: "execution-completed-open-invoice:completed-job:open-invoice",
      title: "Project One",
      subtitle: "Customer One",
      meta: "Completed with open invoice",
      href: "/invoices/open-invoice",
      tone: "attention",
      sourceLabel: "Invoice Workspace"
    }
  ]);
});

void test("summarizes execution-to-cash without mutating invoice or payment state", () => {
  const result = summary({
    projects: [project()],
    jobs: [
      job({ id: "complete-unbilled", dispatchStatus: "completed" }),
      job({
        id: "complete-collectible",
        projectId: "project-2",
        dispatchStatus: "completed",
        project: { name: "Collectible Project" }
      })
    ],
    invoices: [
      invoice({
        id: "collectible-invoice",
        projectId: "project-2",
        dueDate: "2026-05-01",
        balanceDueAmount: "600.00",
        project: { name: "Collectible Project" }
      })
    ],
    payments: [payment({ id: "cash", amount: "200.00" })],
    collections: {
      openReceivableAmount: "600.00",
      overdueReceivableAmount: "600.00",
      openInvoiceCount: 1,
      overdueInvoiceCount: 1,
      pendingPaymentAmount: "75.00",
      pendingEventCount: 1,
      failedOrVoidedEventCount: 1
    }
  });

  assert.deepEqual(
    result.executionToCashSummary.metrics.map((metric) => [
      metric.id,
      metric.value,
      metric.href,
      metric.tone
    ]),
    [
      ["completed-not-billed", 1, "/projects", "attention"],
      [
        "billable-collectible-flow",
        1,
        "/financials/accounts-receivable",
        "attention"
      ],
      [
        "open-cash-pressure",
        "600.00",
        "/financials/accounts-receivable",
        "blocked"
      ],
      ["payment-event-attention", 2, "/payments", "attention"]
    ]
  );
  assert.deepEqual(
    result.executionToCashSummary.flowItems.map((item) => [
      item.id,
      item.href,
      item.sourceLabel
    ]),
    [
      [
        "completed-not-billed:complete-unbilled",
        "/projects/project-1",
        "Project Workspace"
      ],
      [
        "billable-collectible:complete-collectible:collectible-invoice",
        "/invoices/collectible-invoice",
        "Invoice Workspace"
      ],
      ["cash-received:cash", "/invoices/invoice-1", "Invoice Workspace"]
    ]
  );
});

void test("execution-to-cash lane includes paid and recent payment movement without report-owned records", () => {
  const result = summary({
    projects: [project()],
    payments: [
      payment({
        id: "recorded-payment",
        amount: "425.00",
        createdAt: "2026-05-22T10:00:00.000Z"
      })
    ]
  });
  const lane = result.continuitySections.find(
    (section) => section.id === "executionToCash"
  );
  const recent = result.continuitySections.find(
    (section) => section.id === "recent"
  );

  assert.deepEqual(lane?.items, [
    {
      id: "execution-paid:recorded-payment",
      title: "INV-001",
      subtitle: "Customer One / Project One",
      meta: "Paid 425.00",
      href: "/invoices/invoice-1",
      tone: "good",
      sourceLabel: "Invoice Workspace"
    }
  ]);
  assert.deepEqual(recent?.items[0], {
    id: "payment:recorded-payment",
    title: "INV-001",
    subtitle: "Customer One / Project One",
    meta: "recorded",
    href: "/invoices/invoice-1",
    tone: "good",
    sourceLabel: "Invoice Workspace"
  });
});

void test("distinguishes operations continuity lanes and source links", () => {
  const result = summary({
    projects: [
      project({
        id: "blocked-project",
        name: "Blocked Project",
        commercialReadinessStatus: "contract_required"
      }),
      project({
        id: "ready-project",
        name: "Ready Project",
        commercialReadinessStatus: "ready_to_schedule"
      })
    ],
    jobs: [
      job({
        id: "unscheduled-job",
        projectId: "ready-project",
        dispatchStatus: "unscheduled",
        updatedAt: "2026-05-21T10:00:00.000Z",
        project: { name: "Ready Project" }
      }),
      job({
        id: "in-progress-job",
        projectId: "ready-project",
        dispatchStatus: "in_progress",
        scheduledDate: "2026-05-20",
        updatedAt: "2026-05-22T10:00:00.000Z",
        project: { name: "Ready Project" }
      })
    ],
    contracts: [
      contract({
        id: "signature-contract",
        projectId: "blocked-project",
        status: "sent",
        updatedAt: "2026-05-23T10:00:00.000Z"
      })
    ],
    invoices: [
      invoice({
        id: "overdue-invoice",
        projectId: "blocked-project",
        dueDate: "2026-05-01",
        balanceDueAmount: "900.00"
      })
    ],
    dailyLogs: [
      {
        id: "daily-log-1",
        projectId: "ready-project",
        jobId: "in-progress-job",
        logDate: "2026-05-19"
      }
    ],
    fieldNotes: [
      fieldNote({
        id: "field-blocker",
        projectId: "ready-project",
        updatedAt: "2026-05-24T10:00:00.000Z"
      })
    ],
    collections: {
      openReceivableAmount: "900.00",
      overdueReceivableAmount: "900.00",
      openInvoiceCount: 1,
      overdueInvoiceCount: 1,
      pendingPaymentAmount: "0.00",
      pendingEventCount: 0,
      failedOrVoidedEventCount: 0
    }
  });

  const sections = new Map(
    result.continuitySections.map((section) => [section.id, section])
  );

  assert.equal(result.counts.projectsNeedingAttention, 1);
  assert.equal(result.counts.readyToMove, 2);
  assert.equal(result.counts.fieldBlockers, 1);
  assert.equal(result.counts.openReceivables, 1);
  assert.equal(result.counts.recentMovement, 5);

  assert.deepEqual(
    sections
      .get("attention")
      ?.items.map((item) => [item.href, item.sourceLabel]),
    [
      ["/projects/blocked-project", "Project Workspace"],
      ["/schedule?crew=unassigned&jobId=in-progress-job", "CrewBoard"],
      ["/contracts/signature-contract", "Contract Workspace"],
      ["/daily-logs/daily-log-1", "Daily Logs"]
    ]
  );
  assert.deepEqual(
    sections.get("ready")?.items.map((item) => [item.href, item.sourceLabel]),
    [
      ["/projects/ready-project", "Project Workspace"],
      ["/schedule?view=unscheduled&jobId=unscheduled-job", "CrewBoard"]
    ]
  );
  assert.deepEqual(sections.get("ar")?.items[0], {
    id: "invoice:overdue-invoice",
    title: "INV-001",
    subtitle: "Customer One / Project One",
    meta: "900.00",
    href: "/invoices/overdue-invoice",
    tone: "blocked",
    sourceLabel: "Invoice Workspace"
  });
  assert.equal(
    sections
      .get("field")
      ?.items.some((item) => item.href === "/jobs/in-progress-job"),
    true
  );
  assert.equal(
    sections.get("recent")?.items[0]?.href,
    "/daily-logs/daily-log-1"
  );
});
