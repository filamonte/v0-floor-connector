import assert from "node:assert/strict";
import test from "node:test";

import { deriveTimeCardsFromPunchEvents } from "./index";

void test("derives completed time cards with break minutes from canonical punch events", () => {
  const cards = deriveTimeCardsFromPunchEvents([
    {
      id: "event-1",
      eventType: "punch_in",
      occurredAt: "2026-05-19T13:00:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: null,
      notes: null
    },
    {
      id: "event-2",
      eventType: "break_start",
      occurredAt: "2026-05-19T15:00:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: null,
      notes: null
    },
    {
      id: "event-3",
      eventType: "break_end",
      occurredAt: "2026-05-19T15:30:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: null,
      notes: null
    },
    {
      id: "event-4",
      eventType: "punch_out",
      occurredAt: "2026-05-19T21:00:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: null,
      notes: "End of shift"
    }
  ]);

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.status, "completed");
  assert.equal(cards[0]?.sourcePunchInEventId, "event-1");
  assert.equal(cards[0]?.sourcePunchOutEventId, "event-4");
  assert.equal(cards[0]?.breakMinutes, 30);
  assert.equal(cards[0]?.workedMinutes, 450);
});

void test("keeps open sessions as derived open time cards", () => {
  const cards = deriveTimeCardsFromPunchEvents([
    {
      id: "event-1",
      eventType: "punch_in",
      occurredAt: "2026-05-19T13:00:00.000Z",
      projectId: "project-1",
      jobId: null,
      serviceTicketId: null,
      notes: "Project prep"
    }
  ]);

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.status, "open");
  assert.equal(cards[0]?.sourcePunchOutEventId, null);
  assert.equal(cards[0]?.projectId, "project-1");
  assert.equal(cards[0]?.jobId, null);
});

void test("flags overlapping punch-in sessions instead of merging audit truth", () => {
  const cards = deriveTimeCardsFromPunchEvents([
    {
      id: "event-1",
      eventType: "punch_in",
      occurredAt: "2026-05-19T13:00:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: null,
      notes: null
    },
    {
      id: "event-2",
      eventType: "punch_in",
      occurredAt: "2026-05-19T14:00:00.000Z",
      projectId: "project-1",
      jobId: "job-2",
      serviceTicketId: null,
      notes: null
    }
  ]);

  assert.equal(cards.length, 2);
  assert.equal(cards[0]?.status, "flagged");
  assert.equal(cards[0]?.workedMinutes, 60);
  assert.equal(cards[1]?.status, "open");
});

void test("carries service ticket context from punch-in into derived time cards", () => {
  const cards = deriveTimeCardsFromPunchEvents([
    {
      id: "event-1",
      eventType: "punch_in",
      occurredAt: "2026-05-19T13:00:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: "service-ticket-1",
      notes: null
    },
    {
      id: "event-2",
      eventType: "punch_out",
      occurredAt: "2026-05-19T14:00:00.000Z",
      projectId: "project-1",
      jobId: "job-1",
      serviceTicketId: "service-ticket-1",
      notes: null
    }
  ]);

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.serviceTicketId, "service-ticket-1");
  assert.equal(cards[0]?.status, "completed");
});
