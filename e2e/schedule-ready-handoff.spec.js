const { test, expect } = require("@playwright/test");
const { loadRootEnv } = require("./auth-utils");

const unscheduledJobHandoffPath =
  process.env.FLOORCONNECTOR_E2E_UNSCHEDULED_JOB_CUE_BRIDGE_PATH;
const unscheduledJobFixtureProjectName = "[E2E] Unscheduled Job Cue Bridge";
const unscheduledJobFixtureCustomerEmail =
  "e2e-unscheduled-job-cue@floorconnector.local";
const scheduledJobHandoffPath =
  process.env.FLOORCONNECTOR_E2E_SCHEDULED_JOB_HANDOFF_PATH;
const scheduledJobHandoffFixtureProjectName = "[E2E] Scheduled Job Handoff";
const scheduledJobHandoffFixtureCustomerEmail =
  "e2e-scheduled-job-handoff@floorconnector.local";
const scheduleSubmitFixtureProjectName = "[E2E] Schedule Submit Path";
const scheduleSubmitFixtureCustomerEmail =
  "e2e-schedule-submit@floorconnector.local";

function attachIssueCapture(page) {
  const issues = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    issues.push(`page error: ${error.message}`);
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      issues.push(`bad response ${response.status()}: ${response.url()}`);
    }
  });

  return issues;
}

function projectIdFromPath(projectPath) {
  return projectPath.split("?")[0].split("#")[0].split("/").filter(Boolean).at(-1);
}

async function expectAuthenticatedSchedulePage(page) {
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Schedule handoff QA requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(
    page.getByText("Run the operational schedule from one shared job surface")
  ).toBeVisible();
}

async function getScheduleUpdateForm(page) {
  const scheduleForm = page.locator("#schedule-action form").filter({
    hasText: "Update schedule"
  });

  await expect(scheduleForm).toHaveCount(1);

  return scheduleForm;
}

async function getSupabaseFixtureContext() {
  loadRootEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const e2eEmail = process.env.FLOORCONNECTOR_E2E_EMAIL;

  if (!supabaseUrl || !serviceRoleKey || !e2eEmail) {
    return {
      skipReason:
        "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FLOORCONNECTOR_E2E_EMAIL to seed schedule handoff fixtures."
    };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .eq("email", e2eEmail)
    .maybeSingle();

  if (userResponse.error) {
    throw new Error(`Unable to load E2E user for schedule fixture: ${userResponse.error.message}`);
  }

  if (!userResponse.data) {
    return {
      skipReason: `No public.users row exists for FLOORCONNECTOR_E2E_EMAIL (${e2eEmail}).`
    };
  }

  const membershipResponse = await supabase
    .from("company_memberships")
    .select("company_id, membership_role, membership_status")
    .eq("user_id", userResponse.data.id)
    .eq("membership_status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipResponse.error) {
    throw new Error(
      `Unable to load E2E organization membership for schedule fixture: ${membershipResponse.error.message}`
    );
  }

  if (!membershipResponse.data) {
    return {
      skipReason: `No active company membership exists for FLOORCONNECTOR_E2E_EMAIL (${e2eEmail}).`
    };
  }

  return {
    supabase,
    userId: userResponse.data.id,
    organizationId: membershipResponse.data.company_id
  };
}

async function ensureFixtureCustomer({
  supabase,
  organizationId,
  userId,
  email,
  name,
  notes
}) {
  const existingResponse = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", organizationId)
    .eq("email", email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(`Unable to load schedule fixture customer: ${existingResponse.error.message}`);
  }

  if (existingResponse.data) {
    return existingResponse.data.id;
  }

  const insertResponse = await supabase
    .from("customers")
    .insert({
      company_id: organizationId,
      name,
      company_name: "FloorConnector E2E",
      email,
      phone: "555-0100",
      notes,
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (insertResponse.error) {
    throw new Error(`Unable to create schedule fixture customer: ${insertResponse.error.message}`);
  }

  return insertResponse.data.id;
}

async function loadFixtureProjects({ supabase, organizationId, projectName }) {
  const projectsResponse = await supabase
    .from("projects")
    .select("id, name, customer_id, created_at")
    .eq("company_id", organizationId)
    .ilike("name", `${projectName}%`)
    .order("created_at", { ascending: true });

  if (projectsResponse.error) {
    throw new Error(`Unable to load schedule fixture projects: ${projectsResponse.error.message}`);
  }

  return projectsResponse.data ?? [];
}

async function findSignedFixtureContract({ supabase, organizationId, projectId }) {
  const contractResponse = await supabase
    .from("contracts")
    .select("id, title, estimate_id")
    .eq("company_id", organizationId)
    .eq("project_id", projectId)
    .eq("status", "signed")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (contractResponse.error) {
    throw new Error(
      `Unable to load signed schedule fixture contract: ${contractResponse.error.message}`
    );
  }

  return contractResponse.data;
}

async function findFixtureUnscheduledJobs({ supabase, organizationId, projectId }) {
  const jobsResponse = await supabase
    .from("jobs")
    .select("id")
    .eq("company_id", organizationId)
    .eq("project_id", projectId)
    .eq("dispatch_status", "unscheduled")
    .order("created_at", { ascending: true });

  if (jobsResponse.error) {
    throw new Error(`Unable to load schedule fixture unscheduled jobs: ${jobsResponse.error.message}`);
  }

  return jobsResponse.data ?? [];
}

async function findFixtureScheduledJobs({ supabase, organizationId, projectId }) {
  const jobsResponse = await supabase
    .from("jobs")
    .select("id")
    .eq("company_id", organizationId)
    .eq("project_id", projectId)
    .eq("dispatch_status", "scheduled")
    .order("created_at", { ascending: true });

  if (jobsResponse.error) {
    throw new Error(`Unable to load schedule fixture scheduled jobs: ${jobsResponse.error.message}`);
  }

  return jobsResponse.data ?? [];
}

async function ensureFixtureOpportunity({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  projectName,
  customerName,
  customerEmail,
  requirementsSummary
}) {
  const existingResponse = await supabase
    .from("opportunities")
    .select("id")
    .eq("company_id", organizationId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(`Unable to load schedule fixture opportunity: ${existingResponse.error.message}`);
  }

  if (existingResponse.data) {
    return existingResponse.data.id;
  }

  const insertResponse = await supabase
    .from("opportunities")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      status: "converted",
      title: projectName,
      source: "e2e",
      source_detail: "schedule-ready-handoff",
      prospect_name: customerName,
      prospect_company_name: "FloorConnector E2E",
      email: customerEmail,
      phone: "555-0100",
      site_name: projectName,
      service_type: "Epoxy flooring",
      site_assessment_status: "completed",
      requirements_summary: requirementsSummary,
      qualified_at: new Date().toISOString(),
      converted_at: new Date().toISOString(),
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (insertResponse.error) {
    throw new Error(`Unable to create schedule fixture opportunity: ${insertResponse.error.message}`);
  }

  return insertResponse.data.id;
}

async function createFixtureProject({
  supabase,
  organizationId,
  userId,
  customerId,
  fixtureProjectName,
  description
}) {
  const projectName = `${fixtureProjectName} ${Date.now()}`;
  const projectResponse = await supabase
    .from("projects")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      name: projectName,
      status: "approved",
      description,
      address_line_1: "100 E2E Schedule Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      commercial_readiness_status: "ready_to_schedule",
      financing_status: "not_applicable",
      created_by: userId,
      updated_by: userId
    })
    .select("id, name, customer_id")
    .single();

  if (projectResponse.error) {
    throw new Error(`Unable to create schedule fixture project: ${projectResponse.error.message}`);
  }

  return projectResponse.data;
}

async function createApprovedFixtureEstimate({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  opportunityId,
  title,
  notes
}) {
  const estimateResponse = await supabase
    .from("estimates")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      opportunity_id: opportunityId,
      title,
      status: "approved",
      discount_amount: "0.00",
      notes,
      content: {
        termsHtml: "<p>E2E fixture terms.</p>",
        inclusionsHtml: "<p>E2E fixture inclusions.</p>",
        exclusionsHtml: "<p>E2E fixture exclusions.</p>",
        notesHtml: "<p>E2E fixture notes.</p>",
        scopeSummaryHtml: "<p>E2E schedule handoff scope.</p>",
        scopeItems: [],
        itemGroups: [],
        itemRows: []
      },
      created_by: userId,
      updated_by: userId
    })
    .select("id, reference_number")
    .single();

  if (estimateResponse.error) {
    throw new Error(`Unable to create approved schedule fixture estimate: ${estimateResponse.error.message}`);
  }

  return estimateResponse.data;
}

async function createSignedFixtureContract({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimate
}) {
  const signedAt = new Date().toISOString();
  const contractResponse = await supabase
    .from("contracts")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimate.id,
      status: "signed",
      title: "E2E Schedule Handoff Contract",
      rendered_subject: "E2E Schedule Handoff Contract",
      rendered_content:
        "<p>Signed contract fixture for ready-to-schedule handoff coverage.</p>",
      generated_from_estimate_reference: estimate.reference_number,
      sent_at: signedAt,
      viewed_at: signedAt,
      customer_viewed_at: signedAt,
      customer_signed_at: signedAt,
      signed_at: signedAt,
      internal_approval_status: "approved",
      internal_approved_at: signedAt,
      signature_readiness_status: "signed",
      created_by: userId,
      updated_by: userId
    })
    .select("id, title, estimate_id")
    .single();

  if (contractResponse.error) {
    throw new Error(`Unable to create signed schedule fixture contract: ${contractResponse.error.message}`);
  }

  return contractResponse.data;
}

async function createFixtureJob({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId,
  scheduled
}) {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 14);
  scheduledDate.setUTCHours(14, 0, 0, 0);

  const scheduledEnd = new Date(scheduledDate);
  scheduledEnd.setUTCHours(18, 0, 0, 0);

  const jobResponse = await supabase
    .from("jobs")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimateId,
      dispatch_status: scheduled ? "scheduled" : "unscheduled",
      scheduled_date: scheduled ? scheduledDate.toISOString().slice(0, 10) : null,
      scheduled_start_at: scheduled ? scheduledDate.toISOString() : null,
      scheduled_end_at: scheduled ? scheduledEnd.toISOString() : null,
      schedule_notes: scheduled
        ? "Scheduled job fixture for schedule destination handoff coverage."
        : null,
      crew_vendor_id: null,
      notes: scheduled
        ? "Scheduled job fixture for schedule destination handoff coverage."
        : "Unscheduled job fixture for schedule destination handoff coverage.",
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (jobResponse.error) {
    throw new Error(`Unable to create schedule fixture job: ${jobResponse.error.message}`);
  }

  return jobResponse.data;
}

async function createReadyProjectFixture({
  fixtureProjectName,
  customerEmail,
  customerName,
  description,
  jobScheduled
}) {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
  const customerId = await ensureFixtureCustomer({
    supabase,
    organizationId,
    userId,
    email: customerEmail,
    name: customerName,
    notes: description
  });
  const project = await createFixtureProject({
    supabase,
    organizationId,
    userId,
    customerId,
    fixtureProjectName,
    description
  });
  const opportunityId = await ensureFixtureOpportunity({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    projectName: project.name,
    customerName,
    customerEmail,
    requirementsSummary: description
  });
  const estimate = await createApprovedFixtureEstimate({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    opportunityId,
    title: `${fixtureProjectName} Estimate`,
    notes: description
  });
  const contract = await createSignedFixtureContract({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimate
  });
  const job = await createFixtureJob({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimateId: estimate.id,
    scheduled: jobScheduled
  });

  return {
    projectPath: `/projects/${project.id}`,
    projectId: project.id,
    jobId: job.id,
    contractId: contract.id,
    estimateId: estimate.id
  };
}

async function ensureUnscheduledJobHandoffFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId } = context;
  const reusableProjects = await loadFixtureProjects({
    supabase,
    organizationId,
    projectName: unscheduledJobFixtureProjectName
  });

  for (const project of reusableProjects) {
    const signedContract = await findSignedFixtureContract({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (!signedContract) {
      continue;
    }

    const unscheduledJobs = await findFixtureUnscheduledJobs({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (unscheduledJobs.length === 1) {
      return {
        projectPath: `/projects/${project.id}`,
        projectId: project.id,
        jobId: unscheduledJobs[0].id,
        contractId: signedContract.id,
        estimateId: signedContract.estimate_id
      };
    }
  }

  return createReadyProjectFixture({
    fixtureProjectName: unscheduledJobFixtureProjectName,
    customerEmail: unscheduledJobFixtureCustomerEmail,
    customerName: "E2E Unscheduled Job Cue Customer",
    description:
      "Stable local E2E fixture for ready-project-with-unscheduled-job schedule handoff coverage.",
    jobScheduled: false
  });
}

async function ensureScheduledJobHandoffFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId } = context;
  const reusableProjects = await loadFixtureProjects({
    supabase,
    organizationId,
    projectName: scheduledJobHandoffFixtureProjectName
  });

  for (const project of reusableProjects) {
    const signedContract = await findSignedFixtureContract({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (!signedContract) {
      continue;
    }

    const unscheduledJobs = await findFixtureUnscheduledJobs({
      supabase,
      organizationId,
      projectId: project.id
    });
    const scheduledJobs = await findFixtureScheduledJobs({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (scheduledJobs.length > 0 && unscheduledJobs.length === 0) {
      return {
        projectPath: `/projects/${project.id}`,
        projectId: project.id,
        jobId: scheduledJobs[0].id,
        contractId: signedContract.id,
        estimateId: signedContract.estimate_id
      };
    }
  }

  return createReadyProjectFixture({
    fixtureProjectName: scheduledJobHandoffFixtureProjectName,
    customerEmail: scheduledJobHandoffFixtureCustomerEmail,
    customerName: "E2E Scheduled Job Handoff Customer",
    description:
      "Stable local E2E fixture for ready-to-schedule already-scheduled-job handoff coverage.",
    jobScheduled: true
  });
}

async function createScheduleSubmitFixture() {
  return createReadyProjectFixture({
    fixtureProjectName: scheduleSubmitFixtureProjectName,
    customerEmail: scheduleSubmitFixtureCustomerEmail,
    customerName: "E2E Schedule Submit Customer",
    description:
      "Disposable local E2E fixture for the intentional schedule submit path.",
    jobScheduled: false
  });
}

async function resolveUnscheduledFixture() {
  if (unscheduledJobHandoffPath) {
    const projectId = projectIdFromPath(unscheduledJobHandoffPath);
    const context = await getSupabaseFixtureContext();

    if (context.skipReason) {
      return context;
    }

    const jobs = await findFixtureUnscheduledJobs({
      supabase: context.supabase,
      organizationId: context.organizationId,
      projectId
    });

    if (jobs.length !== 1) {
      throw new Error(
        `FLOORCONNECTOR_E2E_UNSCHEDULED_JOB_CUE_BRIDGE_PATH must point to a project with exactly one unscheduled job. Found ${jobs.length}.`
      );
    }

    return {
      projectPath: unscheduledJobHandoffPath,
      projectId,
      jobId: jobs[0].id
    };
  }

  return ensureUnscheduledJobHandoffFixture();
}

async function resolveScheduledFixture() {
  if (scheduledJobHandoffPath) {
    const projectId = projectIdFromPath(scheduledJobHandoffPath);
    const context = await getSupabaseFixtureContext();

    if (context.skipReason) {
      return context;
    }

    const unscheduledJobs = await findFixtureUnscheduledJobs({
      supabase: context.supabase,
      organizationId: context.organizationId,
      projectId
    });
    const scheduledJobs = await findFixtureScheduledJobs({
      supabase: context.supabase,
      organizationId: context.organizationId,
      projectId
    });

    if (scheduledJobs.length < 1 || unscheduledJobs.length > 0) {
      throw new Error(
        `FLOORCONNECTOR_E2E_SCHEDULED_JOB_HANDOFF_PATH must point to a project with scheduled jobs and no unscheduled jobs. Found ${scheduledJobs.length} scheduled and ${unscheduledJobs.length} unscheduled.`
      );
    }

    return {
      projectPath: scheduledJobHandoffPath,
      projectId,
      jobId: scheduledJobs[0].id
    };
  }

  return ensureScheduledJobHandoffFixture();
}

async function countWorkItemsForProject({ projectId }) {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return null;
  }

  const response = await context.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("company_id", context.organizationId)
    .eq("project_id", projectId);

  if (response.error) {
    throw new Error(`Unable to count project work items: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function countJobsForProject({ projectId }) {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return null;
  }

  const response = await context.supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", context.organizationId)
    .eq("project_id", projectId);

  if (response.error) {
    throw new Error(`Unable to count project jobs: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function getJobScheduleState({ projectId, jobId }) {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return null;
  }

  const response = await context.supabase
    .from("jobs")
    .select("id, project_id, dispatch_status, scheduled_date, scheduled_start_at, scheduled_end_at, schedule_notes")
    .eq("company_id", context.organizationId)
    .eq("project_id", projectId)
    .eq("id", jobId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load job schedule state: ${response.error.message}`);
  }

  return response.data;
}

async function resetJobToUnscheduled({ projectId, jobId }) {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return null;
  }

  const response = await context.supabase
    .from("jobs")
    .update({
      dispatch_status: "unscheduled",
      scheduled_date: null,
      scheduled_start_at: null,
      scheduled_end_at: null,
      schedule_notes: null,
      updated_by: context.userId
    })
    .eq("company_id", context.organizationId)
    .eq("project_id", projectId)
    .eq("id", jobId)
    .select("id, project_id, dispatch_status, scheduled_date, scheduled_start_at, scheduled_end_at, schedule_notes")
    .single();

  if (response.error) {
    throw new Error(`Unable to reset schedule submit fixture job: ${response.error.message}`);
  }

  return response.data;
}

function getFutureScheduleInput() {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 21);
  const dateKey = scheduledDate.toISOString().slice(0, 10);

  return {
    scheduledDate: dateKey,
    scheduledStartAt: `${dateKey}T09:30`,
    scheduledEndAt: `${dateKey}T15:00`,
    scheduleNotes: `E2E schedule submit path ${Date.now()}`
  };
}

test("schedule handoff opens one unscheduled job in the focused scheduling composer without saving", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = await resolveUnscheduledFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No ready project with one unscheduled job fixture was available for /schedule handoff QA."
  );

  const workItemCountBefore = await countWorkItemsForProject({
    projectId: fixture.projectId
  });
  const scheduleStateBefore = await getJobScheduleState({
    projectId: fixture.projectId,
    jobId: fixture.jobId
  });

  await page.goto(
    `/schedule?projectId=${fixture.projectId}&jobId=${fixture.jobId}&view=unscheduled&action=schedule#schedule-action`,
    { waitUntil: "domcontentloaded" }
  );
  await expectAuthenticatedSchedulePage(page);

  expect(new URL(page.url()).pathname).toBe("/schedule");
  expect(new URL(page.url()).searchParams.get("projectId")).toBe(fixture.projectId);
  expect(new URL(page.url()).searchParams.get("jobId")).toBe(fixture.jobId);
  expect(new URL(page.url()).searchParams.get("view")).toBe("unscheduled");
  expect(new URL(page.url()).searchParams.get("action")).toBe("schedule");

  await expect(page.getByText("Schedule handoff context is active")).toBeVisible();
  await expect(page.getByText("Only canonical jobs attached to this project are shown.")).toBeVisible();
  await expect(page.getByText("Schedule view")).toBeVisible();
  await expect(page.getByRole("link", { name: /Unscheduled \d+/ })).toBeVisible();
  await expect(page.locator("#schedule-action")).toBeVisible();
  await expect(page.locator("#schedule-action")).toContainText("Refine schedule");
  await expect(page.locator("#schedule-action")).toContainText(
    "keeps the schedule surface tied to the same canonical project and job chain"
  );
  await expect(page.locator("#schedule-action")).toContainText("Update schedule");
  await expect(page.locator("#schedule-action")).toContainText("Unscheduled");
  await expect(page.locator("#schedule-action")).toContainText("No crew attached yet");
  const scheduleForm = await getScheduleUpdateForm(page);
  await expect(scheduleForm.locator('input[name="jobId"]')).toHaveValue(fixture.jobId);
  await expect(scheduleForm.locator('input[name="scheduledDate"]')).toHaveValue("");
  await expect(scheduleForm.getByRole("button", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Move back to unscheduled" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create job" })).toHaveCount(0);
  await expect(page.locator("#work-items")).toHaveCount(0);

  const scheduleStateAfter = await getJobScheduleState({
    projectId: fixture.projectId,
    jobId: fixture.jobId
  });
  expect(scheduleStateAfter).toEqual(scheduleStateBefore);

  if (workItemCountBefore !== null) {
    expect(await countWorkItemsForProject({ projectId: fixture.projectId })).toBe(
      workItemCountBefore
    );
  }

  expect(issues).toEqual([]);
});

test("schedule submit path schedules an isolated unscheduled job and persists after reload", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = await createScheduleSubmitFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No disposable ready project with one unscheduled job fixture was available for schedule submit QA."
  );

  try {
    const scheduleInput = getFutureScheduleInput();
    const workItemCountBefore = await countWorkItemsForProject({
      projectId: fixture.projectId
    });
    const jobCountBefore = await countJobsForProject({
      projectId: fixture.projectId
    });
    const scheduleStateBefore = await getJobScheduleState({
      projectId: fixture.projectId,
      jobId: fixture.jobId
    });

    expect(scheduleStateBefore.dispatch_status).toBe("unscheduled");
    expect(scheduleStateBefore.scheduled_date).toBeNull();
    expect(scheduleStateBefore.scheduled_start_at).toBeNull();
    expect(scheduleStateBefore.scheduled_end_at).toBeNull();
    expect(scheduleStateBefore.schedule_notes).toBeNull();

    await page.goto(
      `/schedule?projectId=${fixture.projectId}&jobId=${fixture.jobId}&view=unscheduled&action=schedule#schedule-action`,
      { waitUntil: "domcontentloaded" }
    );
    await expectAuthenticatedSchedulePage(page);

    await expect(page.locator("#schedule-action")).toBeVisible();
    await expect(page.locator("#schedule-action")).toContainText("Refine schedule");
    await expect(page.locator("#schedule-action")).toContainText(/unscheduled/i);
    const scheduleForm = await getScheduleUpdateForm(page);
    await expect(scheduleForm.locator('input[name="jobId"]')).toHaveValue(
      fixture.jobId
    );
    await expect(scheduleForm.locator('input[name="scheduledDate"]')).toHaveValue("");
    await expect(scheduleForm.locator('input[name="scheduledStartAt"]')).toHaveValue("");
    await expect(scheduleForm.locator('input[name="scheduledEndAt"]')).toHaveValue("");

    const scheduleStateBeforeSubmit = await getJobScheduleState({
      projectId: fixture.projectId,
      jobId: fixture.jobId
    });
    expect(scheduleStateBeforeSubmit).toEqual(scheduleStateBefore);

    await scheduleForm.locator('input[name="scheduledDate"]').fill(
      scheduleInput.scheduledDate
    );
    await scheduleForm.locator('input[name="scheduledStartAt"]').fill(
      scheduleInput.scheduledStartAt
    );
    await scheduleForm.locator('input[name="scheduledEndAt"]').fill(
      scheduleInput.scheduledEndAt
    );
    await scheduleForm.locator('textarea[name="scheduleNotes"]').fill(
      scheduleInput.scheduleNotes
    );
    await expect(scheduleForm.locator('button[type="submit"]')).toBeEnabled();
    await scheduleForm.locator('button[type="submit"]').click();

    await expect
      .poll(
        async () => {
          const state = await getJobScheduleState({
            projectId: fixture.projectId,
            jobId: fixture.jobId
          });

          return state?.dispatch_status ?? null;
        },
        { timeout: 15000 }
      )
      .toBe("scheduled");
    await expectAuthenticatedSchedulePage(page);

    const scheduleStateAfterSubmit = await getJobScheduleState({
      projectId: fixture.projectId,
      jobId: fixture.jobId
    });
    expect(scheduleStateAfterSubmit.id).toBe(scheduleStateBefore.id);
    expect(scheduleStateAfterSubmit.project_id).toBe(scheduleStateBefore.project_id);
    expect(scheduleStateAfterSubmit.dispatch_status).toBe("scheduled");
    expect(scheduleStateAfterSubmit.scheduled_date).toBe(
      scheduleInput.scheduledDate
    );
    expect(scheduleStateAfterSubmit.scheduled_start_at).toBeTruthy();
    expect(scheduleStateAfterSubmit.scheduled_end_at).toBeTruthy();
    expect(scheduleStateAfterSubmit.schedule_notes).toBe(
      scheduleInput.scheduleNotes
    );

    if (jobCountBefore !== null) {
      expect(await countJobsForProject({ projectId: fixture.projectId })).toBe(
        jobCountBefore
      );
    }

    if (workItemCountBefore !== null) {
      expect(await countWorkItemsForProject({ projectId: fixture.projectId })).toBe(
        workItemCountBefore
      );
    }

    await expect(page.locator("#work-items")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Create job" })).toHaveCount(0);

    await page.goto(
      `/schedule?projectId=${fixture.projectId}&jobId=${fixture.jobId}&view=scheduled&action=schedule#schedule-action`,
      { waitUntil: "domcontentloaded" }
    );
    await expectAuthenticatedSchedulePage(page);
    await expect(page.locator("#schedule-action")).toContainText("Scheduled");
    const savedScheduleForm = await getScheduleUpdateForm(page);
    await expect(savedScheduleForm.locator('input[name="scheduledDate"]')).toHaveValue(
      scheduleInput.scheduledDate
    );
    const persistedStartAt = await savedScheduleForm
      .locator('input[name="scheduledStartAt"]')
      .inputValue();
    const persistedEndAt = await savedScheduleForm
      .locator('input[name="scheduledEndAt"]')
      .inputValue();
    expect(persistedStartAt).toContain(scheduleInput.scheduledDate);
    expect(persistedEndAt).toContain(scheduleInput.scheduledDate);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectAuthenticatedSchedulePage(page);
    await expect(page.locator("#schedule-action")).toBeVisible();
    await expect(page.locator("#schedule-action")).toContainText("Scheduled");
    const reloadedScheduleForm = await getScheduleUpdateForm(page);
    await expect(
      reloadedScheduleForm.locator('input[name="scheduledDate"]')
    ).toHaveValue(scheduleInput.scheduledDate);
    await expect(
      reloadedScheduleForm.locator('textarea[name="scheduleNotes"]')
    ).toHaveValue(scheduleInput.scheduleNotes);

    expect(issues).toEqual([]);
  } finally {
    if (!fixture.skipReason) {
      await resetJobToUnscheduled({
        projectId: fixture.projectId,
        jobId: fixture.jobId
      });
    }
  }
});

test("schedule handoff infers the exact one unscheduled project job without saving", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = await resolveUnscheduledFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No ready project with one unscheduled job fixture was available for /schedule legacy handoff QA."
  );

  const scheduleStateBefore = await getJobScheduleState({
    projectId: fixture.projectId,
    jobId: fixture.jobId
  });

  await page.goto(
    `/schedule?projectId=${fixture.projectId}&view=unscheduled&action=schedule#schedule-action`,
    { waitUntil: "domcontentloaded" }
  );
  await expectAuthenticatedSchedulePage(page);

  expect(new URL(page.url()).searchParams.get("jobId")).toBeNull();
  await expect(page.locator("#schedule-action")).toBeVisible();
  await expect(page.locator("#schedule-action")).toContainText("Refine schedule");
  const scheduleForm = await getScheduleUpdateForm(page);
  await expect(scheduleForm.locator('input[name="jobId"]')).toHaveValue(fixture.jobId);
  await expect(page.locator("#schedule-action")).toContainText("Unscheduled");

  const scheduleStateAfter = await getJobScheduleState({
    projectId: fixture.projectId,
    jobId: fixture.jobId
  });
  expect(scheduleStateAfter).toEqual(scheduleStateBefore);

  expect(issues).toEqual([]);
});

test("schedule project-only handoff for scheduled jobs stays project-scoped without opening create surfaces", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = await resolveScheduledFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No ready project with already scheduled jobs fixture was available for /schedule project-only handoff QA."
  );

  const workItemCountBefore = await countWorkItemsForProject({
    projectId: fixture.projectId
  });
  const scheduleStateBefore = await getJobScheduleState({
    projectId: fixture.projectId,
    jobId: fixture.jobId
  });

  await page.goto(`/schedule?projectId=${fixture.projectId}`, {
    waitUntil: "domcontentloaded"
  });
  await expectAuthenticatedSchedulePage(page);

  expect(new URL(page.url()).pathname).toBe("/schedule");
  expect(new URL(page.url()).searchParams.get("projectId")).toBe(fixture.projectId);
  expect(new URL(page.url()).searchParams.get("jobId")).toBeNull();
  expect(new URL(page.url()).searchParams.get("action")).toBeNull();

  await expect(page.getByText("Schedule handoff context is active")).toBeVisible();
  await expect(page.getByText("Only canonical jobs attached to this project are shown.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open project" }).first()).toBeVisible();
  await expect(page.locator("#schedule-action")).toHaveCount(0);
  await expect(page.getByText("Update schedule")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Create job" })).toHaveCount(0);
  await expect(page.locator("#work-items")).toHaveCount(0);

  const scheduleStateAfter = await getJobScheduleState({
    projectId: fixture.projectId,
    jobId: fixture.jobId
  });
  expect(scheduleStateAfter).toEqual(scheduleStateBefore);

  if (workItemCountBefore !== null) {
    expect(await countWorkItemsForProject({ projectId: fixture.projectId })).toBe(
      workItemCountBefore
    );
  }

  expect(issues).toEqual([]);
});
