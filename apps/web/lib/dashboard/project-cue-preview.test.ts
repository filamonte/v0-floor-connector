import assert from "node:assert/strict";
import test from "node:test";

import type { ProjectCue } from "../projects/cues";
import { mapProjectCueToDashboardPreviewItem } from "./project-cue-preview";

void test("dashboard project cue preview keeps approved-estimate cue as project entry plus canonical workflow context", () => {
  const projectId = "project-1";
  const estimateId = "estimate-1";
  const cue = {
    id: `${projectId}:approved-estimate-missing-contract`,
    projectId,
    projectName: "Library Renovation",
    title: "Approved estimate needs a contract",
    description:
      "Approved scope exists, but no canonical contract has been generated yet.",
    href: `/contracts?estimateId=${estimateId}`,
    actionLabel: "Generate contract",
    priority: "critical",
    reason: "Estimate EST-100 is approved.",
    sortOrder: 10,
    workItemBridge: {
      cue: "approved_estimate_missing_contract",
      href: `/projects/${projectId}?workItemCue=approved_estimate_missing_contract#work-items`,
      label: "Create work item",
      sourceType: "estimate",
      sourceId: estimateId,
      sourceLabel: "Estimate EST-100",
      context: {
        estimateId,
        estimateReferenceNumber: "EST-100"
      }
    }
  } satisfies ProjectCue;

  const item = mapProjectCueToDashboardPreviewItem(cue);

  assert.equal(item.id, cue.id);
  assert.equal(item.title, cue.title);
  assert.equal(item.subtitle, cue.projectName);
  assert.equal(item.meta, cue.reason);
  assert.equal(item.badge, cue.priority);
  assert.equal(item.href, `/projects/${projectId}#project-guidance-cues`);
  assert.equal(item.actionLabel, "Review project cue");
  assert.equal(item.contextHref, cue.href);
  assert.equal(item.contextLabel, cue.actionLabel);
  assert.equal(item.bridgeHref, undefined);
  assert.equal(item.bridgeLabel, undefined);
  assert.equal(item.workItemId, undefined);
  assert.doesNotMatch(item.href, /workItemCue|#work-items/);
  assert.doesNotMatch(item.contextHref, /workItemCue|#work-items/);
  assert.match(item.searchText, /Approved estimate needs a contract/);
  assert.match(item.searchText, /Library Renovation/);
  assert.match(item.searchText, /Estimate EST-100 is approved/);
  assert.match(item.searchText, /critical/);
});
