import assert from "node:assert/strict";
import test from "node:test";

import {
  type CommercialReadinessInput,
  type CommercialReadinessPaymentRequirementInput,
  computeCommercialReadiness
} from "@floorconnector/domain";

function baseInput(
  overrides: Partial<CommercialReadinessInput> = {}
): CommercialReadinessInput {
  return {
    estimateStatus: "approved",
    siteAssessmentStatus: "completed",
    hasContract: true,
    contractInternalApprovalStatus: "approved",
    contractStatus: "signed",
    requireContractInternalApproval: true,
    requireContractSignatureBeforeJobScheduling: true,
    requireDepositBeforeJobScheduling: false,
    requireFinancingApprovalBeforeJobScheduling: false,
    financingStatus: "not_applicable",
    depositInvoiceStatus: null,
    depositInvoiceRole: null,
    paymentRequirements: [],
    ...overrides
  };
}

function requirement(
  overrides: Partial<CommercialReadinessPaymentRequirementInput> = {}
): CommercialReadinessPaymentRequirementInput {
  return {
    id: "requirement-1",
    scheduleType: "deposit_before_scheduling",
    dueBasis: "before_scheduling",
    amountMode: "fixed_amount",
    amount: "500.00",
    percentage: null,
    scheduleBlocking: true,
    linkedInvoiceId: "invoice-1",
    linkedInvoiceStatus: "sent",
    linkedInvoiceTotalAmount: "500.00",
    linkedInvoiceBalanceDueAmount: "500.00",
    linkedInvoiceRecordedPaymentAmount: "0.00",
    hasCanonicalPaymentEventEvidence: true,
    ...overrides
  };
}

void test("no upfront payment required proceeds after signature", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          scheduleType: "no_upfront_payment_required",
          dueBasis: "completion",
          amountMode: "none",
          amount: null,
          scheduleBlocking: false,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
  assert.equal(readiness.isReadyToSchedule, true);
});

void test("net terms proceeds without prepayment", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          scheduleType: "net_terms",
          dueBasis: "net_terms",
          amountMode: "none",
          amount: null,
          scheduleBlocking: false,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("due on completion proceeds before payment", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          scheduleType: "due_on_completion",
          dueBasis: "completion",
          amountMode: "remaining_balance",
          scheduleBlocking: false,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("deposit payment required blocks until canonical evidence is satisfied", () => {
  const blocked = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [requirement()]
    })
  );
  const satisfied = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          linkedInvoiceStatus: "paid",
          linkedInvoiceBalanceDueAmount: "0.00",
          linkedInvoiceRecordedPaymentAmount: "500.00"
        })
      ]
    })
  );

  assert.deepEqual(blocked.blockers, ["payment_requirement_unsatisfied"]);
  assert.equal(blocked.status, "waiting_on_deposit");
  assert.equal(satisfied.status, "ready_to_schedule");
});

void test("partial payment does not satisfy required amount", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceBalanceDueAmount: "250.00",
          linkedInvoiceRecordedPaymentAmount: "250.00"
        })
      ]
    })
  );

  assert.equal(readiness.isReadyToSchedule, false);
  assert.ok(readiness.blockers.includes("payment_requirement_unsatisfied"));
});

void test("50/50 percentage requirement blocks below threshold", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "first-half",
          scheduleType: "fifty_fifty",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "50.00",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "10000.00",
          linkedInvoiceBalanceDueAmount: "5001.00",
          linkedInvoiceRecordedPaymentAmount: "4999.00"
        })
      ]
    })
  );

  assert.equal(readiness.isReadyToSchedule, false);
  assert.ok(readiness.blockers.includes("payment_requirement_unsatisfied"));
});

void test("50/50 percentage requirement proceeds at threshold", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "first-half",
          scheduleType: "fifty_fifty",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "50.00",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "10000.00",
          linkedInvoiceBalanceDueAmount: "5000.00",
          linkedInvoiceRecordedPaymentAmount: "5000.00"
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("50/50 only blocks on the first schedule-blocking event", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "first-half",
          scheduleType: "fifty_fifty",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "50.00",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "1000.00",
          linkedInvoiceBalanceDueAmount: "500.00",
          linkedInvoiceRecordedPaymentAmount: "500.00"
        }),
        requirement({
          id: "remaining-half",
          scheduleType: "fifty_fifty",
          dueBasis: "completion",
          amountMode: "remaining_balance",
          amount: null,
          percentage: null,
          scheduleBlocking: true,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("thirds percentage requirement blocks below threshold", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "first-third",
          scheduleType: "thirds",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "33.33",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "9000.00",
          linkedInvoiceBalanceDueAmount: "6000.31",
          linkedInvoiceRecordedPaymentAmount: "2999.69"
        })
      ]
    })
  );

  assert.equal(readiness.isReadyToSchedule, false);
  assert.ok(readiness.blockers.includes("payment_requirement_unsatisfied"));
});

void test("thirds percentage requirement proceeds at threshold", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "first-third",
          scheduleType: "thirds",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "33.33",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "9000.00",
          linkedInvoiceBalanceDueAmount: "6000.30",
          linkedInvoiceRecordedPaymentAmount: "2999.70"
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("thirds only blocks on the first schedule-blocking event", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "first-third",
          scheduleType: "thirds",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "33.33",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "1000.00",
          linkedInvoiceBalanceDueAmount: "666.70",
          linkedInvoiceRecordedPaymentAmount: "333.30"
        }),
        requirement({
          id: "second-third",
          scheduleType: "thirds",
          dueBasis: "mobilization",
          amountMode: "percentage",
          amount: null,
          percentage: "33.33",
          scheduleBlocking: true,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        }),
        requirement({
          id: "final-third",
          scheduleType: "thirds",
          dueBasis: "completion",
          amountMode: "remaining_balance",
          amount: null,
          percentage: null,
          scheduleBlocking: true,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("percentage requirement without invoice total remains blocked", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "percentage-no-total",
          scheduleType: "fifty_fifty",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "50.00",
          scheduleBlocking: true,
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: "5000.00",
          linkedInvoiceRecordedPaymentAmount: "5000.00"
        })
      ]
    })
  );

  assert.equal(readiness.isReadyToSchedule, false);
  assert.ok(readiness.blockers.includes("payment_requirement_unsatisfied"));
});

void test("satisfies percentage requirement with missing total when linked invoice is paid", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          id: "paid-percentage-no-total",
          scheduleType: "fifty_fifty",
          dueBasis: "contract_signing",
          amountMode: "percentage",
          amount: null,
          percentage: "50.00",
          scheduleBlocking: true,
          linkedInvoiceStatus: "paid",
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
  assert.equal(readiness.isReadyToSchedule, true);
});

void test("milestone placeholder does not become fake billing completion", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          scheduleType: "milestone_placeholder",
          dueBasis: "milestone",
          amountMode: "none",
          amount: null,
          scheduleBlocking: false,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("future AIA progress placeholder does not become fake billing completion", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          scheduleType: "progress_billing_placeholder",
          dueBasis: "progress_billing_placeholder",
          amountMode: "none",
          amount: null,
          scheduleBlocking: false,
          linkedInvoiceId: null,
          linkedInvoiceStatus: null,
          linkedInvoiceTotalAmount: null,
          linkedInvoiceBalanceDueAmount: null,
          linkedInvoiceRecordedPaymentAmount: null
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("readiness uses canonical invoice and payment evidence only", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      paymentRequirements: [
        requirement({
          linkedInvoiceStatus: "partially_paid",
          linkedInvoiceTotalAmount: "500.00",
          linkedInvoiceBalanceDueAmount: "0.00",
          linkedInvoiceRecordedPaymentAmount: "500.00",
          hasCanonicalPaymentEventEvidence: true
        })
      ]
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});

void test("legacy deposit invoice behavior remains compatible when no payment requirements exist", () => {
  const readiness = computeCommercialReadiness(
    baseInput({
      requireDepositBeforeJobScheduling: true,
      depositInvoiceRole: "deposit",
      depositInvoiceStatus: "paid"
    })
  );

  assert.equal(readiness.status, "ready_to_schedule");
});
