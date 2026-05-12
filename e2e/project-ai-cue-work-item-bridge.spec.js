const { test, expect } = require("@playwright/test");
const { loadRootEnv } = require("./auth-utils");

const projectCueBridgePath =
  process.env.FLOORCONNECTOR_E2E_PROJECT_CUE_BRIDGE_PATH ??
  "/projects/6922a413-1350-496c-89d9-6b03dcbad0f1";
const estimateCueBridgePath =
  process.env.FLOORCONNECTOR_E2E_ESTIMATE_CUE_BRIDGE_PATH;
const estimateCueTitle = "Approved estimate needs a contract";
const estimateCueFixtureProjectName = "[E2E] Approved Estimate Cue Bridge";
const estimateCueFixtureCustomerEmail =
  "e2e-approved-estimate-cue@floorconnector.local";
const signedReadyNoJobCueBridgePath =
  process.env.FLOORCONNECTOR_E2E_SIGNED_READY_NO_JOB_CUE_BRIDGE_PATH;
const signedReadyNoJobCueTitle = "Signed contract is ready for job creation";
const signedReadyNoJobFixtureProjectName = "[E2E] Signed Ready No Job Cue Bridge";
const signedReadyNoJobFixtureCustomerEmail =
  "e2e-signed-ready-no-job-cue@floorconnector.local";
const unscheduledJobCueBridgePath =
  process.env.FLOORCONNECTOR_E2E_UNSCHEDULED_JOB_CUE_BRIDGE_PATH;
const unscheduledJobCueTitle = "Ready project needs scheduling";
const unscheduledJobFixtureProjectName = "[E2E] Unscheduled Job Cue Bridge";
const unscheduledJobFixtureCustomerEmail =
  "e2e-unscheduled-job-cue@floorconnector.local";
const scheduledJobHandoffPath =
  process.env.FLOORCONNECTOR_E2E_SCHEDULED_JOB_HANDOFF_PATH;
const scheduledJobHandoffFixtureProjectName = "[E2E] Scheduled Job Handoff";
const scheduledJobHandoffFixtureCustomerEmail =
  "e2e-scheduled-job-handoff@floorconnector.local";
const fieldNoteCueBridgePath =
  process.env.FLOORCONNECTOR_E2E_FIELD_NOTE_CUE_BRIDGE_PATH;
const fieldNoteCueTitle = "Open blocker field notes need review";
const fieldNoteFixtureProjectName = "[E2E] Field Note Cue Bridge";
const fieldNoteFixtureCustomerEmail =
  "e2e-field-note-cue@floorconnector.local";

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

function parseDisplayedCount(value) {
  const parsed = Number.parseInt(value.trim(), 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse work-item count from "${value}".`);
  }

  return parsed;
}

function projectIdFromPath(projectPath) {
  return projectPath.split("?")[0].split("#")[0].split("/").filter(Boolean).at(-1);
}

async function expectAuthenticatedProjectPage(page) {
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Project AI cue bridge test requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(page.locator("#project-guidance-cues")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suggested project actions" })).toBeVisible();
}

async function expectAuthenticatedDashboardPage(page) {
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Project AI cue dashboard preview test requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(
    page.getByRole("heading", { name: "Suggested project actions" })
  ).toBeVisible();
}

function getReadyToSchedulePanel(page) {
  return page
    .getByRole("heading", { name: "Sign to schedule handoff is clear" })
    .locator("xpath=ancestor::section[1]");
}

async function getOpenWorkItemCount(page) {
  const openCountValue = await page
    .locator("#work-items")
    .getByText(/^\d+$/)
    .first()
    .innerText();

  return parseDisplayedCount(openCountValue);
}

async function getSupabaseFixtureContext() {
  loadRootEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const e2eEmail = process.env.FLOORCONNECTOR_E2E_EMAIL;

  if (!supabaseUrl || !serviceRoleKey || !e2eEmail) {
    return {
      skipReason:
        "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FLOORCONNECTOR_E2E_EMAIL to seed project AI cue bridge fixtures."
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
    throw new Error(`Unable to load E2E user for cue fixture: ${userResponse.error.message}`);
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
      `Unable to load E2E organization membership for cue fixture: ${membershipResponse.error.message}`
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
  email = estimateCueFixtureCustomerEmail,
  name = "E2E Approved Estimate Cue Customer",
  notes =
    "Stable local E2E fixture for approved-estimate-missing-contract project guidance cue coverage."
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
    throw new Error(`Unable to load cue fixture customer: ${existingResponse.error.message}`);
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
    throw new Error(`Unable to create cue fixture customer: ${insertResponse.error.message}`);
  }

  return insertResponse.data.id;
}

async function loadFixtureProjects({
  supabase,
  organizationId,
  projectName = estimateCueFixtureProjectName
}) {
  const projectsResponse = await supabase
    .from("projects")
    .select("id, name, customer_id, created_at")
    .eq("company_id", organizationId)
    .ilike("name", `${projectName}%`)
    .order("created_at", { ascending: true });

  if (projectsResponse.error) {
    throw new Error(`Unable to load cue fixture projects: ${projectsResponse.error.message}`);
  }

  return projectsResponse.data ?? [];
}

async function projectHasContracts({ supabase, organizationId, projectId }) {
  const contractsResponse = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("company_id", organizationId)
    .eq("project_id", projectId);

  if (contractsResponse.error) {
    throw new Error(
      `Unable to check cue fixture project contracts: ${contractsResponse.error.message}`
    );
  }

  return (contractsResponse.count ?? 0) > 0;
}

async function projectHasJobs({ supabase, organizationId, projectId }) {
  const jobsResponse = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", organizationId)
    .eq("project_id", projectId);

  if (jobsResponse.error) {
    throw new Error(`Unable to check cue fixture project jobs: ${jobsResponse.error.message}`);
  }

  return (jobsResponse.count ?? 0) > 0;
}

async function findApprovedFixtureEstimate({ supabase, organizationId, projectId }) {
  const estimateResponse = await supabase
    .from("estimates")
    .select("id, reference_number")
    .eq("company_id", organizationId)
    .eq("project_id", projectId)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (estimateResponse.error) {
    throw new Error(
      `Unable to load approved cue fixture estimate: ${estimateResponse.error.message}`
    );
  }

  return estimateResponse.data;
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
      `Unable to load signed cue fixture contract: ${contractResponse.error.message}`
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
    throw new Error(`Unable to load cue fixture unscheduled jobs: ${jobsResponse.error.message}`);
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
    throw new Error(`Unable to load ready handoff scheduled jobs: ${jobsResponse.error.message}`);
  }

  return jobsResponse.data ?? [];
}

async function findFixtureOpenBlockerFieldNotes({ supabase, organizationId, projectId }) {
  const fieldNotesResponse = await supabase
    .from("field_notes")
    .select("id, daily_log_id, note_type, status, title")
    .eq("company_id", organizationId)
    .eq("project_id", projectId)
    .in("note_type", ["blocker", "issue"])
    .eq("status", "open")
    .order("created_at", { ascending: true });

  if (fieldNotesResponse.error) {
    throw new Error(
      `Unable to load cue fixture open field notes: ${fieldNotesResponse.error.message}`
    );
  }

  return fieldNotesResponse.data ?? [];
}

async function ensureFixtureOpportunity({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  projectName,
  customerName = "E2E Approved Estimate Cue Customer",
  customerEmail = estimateCueFixtureCustomerEmail,
  requirementsSummary =
    "Approved estimate cue bridge fixture. No contract should exist for this project."
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
    throw new Error(`Unable to load cue fixture opportunity: ${existingResponse.error.message}`);
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
      source_detail: "project-ai-cue-work-item-bridge",
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
    throw new Error(`Unable to create cue fixture opportunity: ${insertResponse.error.message}`);
  }

  return insertResponse.data.id;
}

async function createFixtureProject({
  supabase,
  organizationId,
  userId,
  customerId,
  fixtureProjectName = estimateCueFixtureProjectName,
  status = "estimating",
  commercialReadinessStatus = "waiting_on_contract",
  description =
    "Stable local E2E fixture for approved-estimate-missing-contract project guidance cue coverage."
}) {
  const projectName = `${fixtureProjectName} ${Date.now()}`;
  const projectResponse = await supabase
    .from("projects")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      name: projectName,
      status,
      description,
      address_line_1: "100 E2E Cue Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      commercial_readiness_status: commercialReadinessStatus,
      financing_status: "not_applicable",
      created_by: userId,
      updated_by: userId
    })
    .select("id, name, customer_id")
    .single();

  if (projectResponse.error) {
    throw new Error(`Unable to create cue fixture project: ${projectResponse.error.message}`);
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
  title = "E2E Approved Estimate Cue Bridge",
  notes = "Approved estimate fixture for deterministic project guidance cue bridge coverage."
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
        scopeSummaryHtml: "<p>E2E approved estimate cue bridge scope.</p>",
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
    throw new Error(`Unable to create approved cue fixture estimate: ${estimateResponse.error.message}`);
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
      title: "E2E Signed Ready No Job Contract",
      rendered_subject: "E2E Signed Ready No Job Contract",
      rendered_content:
        "<p>Signed contract fixture for deterministic project guidance cue bridge coverage.</p>",
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
    throw new Error(`Unable to create signed cue fixture contract: ${contractResponse.error.message}`);
  }

  return contractResponse.data;
}

async function createUnscheduledFixtureJob({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId
}) {
  const jobResponse = await supabase
    .from("jobs")
    .insert({
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimateId,
      dispatch_status: "unscheduled",
      scheduled_date: null,
      scheduled_start_at: null,
      scheduled_end_at: null,
      schedule_notes: null,
      crew_vendor_id: null,
      notes:
        "Unscheduled job fixture for deterministic project guidance cue bridge coverage.",
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (jobResponse.error) {
    throw new Error(`Unable to create unscheduled cue fixture job: ${jobResponse.error.message}`);
  }

  return jobResponse.data;
}

async function createScheduledFixtureJob({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId
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
      dispatch_status: "scheduled",
      scheduled_date: scheduledDate.toISOString().slice(0, 10),
      scheduled_start_at: scheduledDate.toISOString(),
      scheduled_end_at: scheduledEnd.toISOString(),
      schedule_notes:
        "Scheduled job fixture for ready-to-schedule handoff readability coverage.",
      crew_vendor_id: null,
      notes:
        "Scheduled job fixture for ready-to-schedule handoff readability coverage.",
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (jobResponse.error) {
    throw new Error(`Unable to create scheduled handoff fixture job: ${jobResponse.error.message}`);
  }

  return jobResponse.data;
}

async function createFixtureDailyLog({
  supabase,
  organizationId,
  userId,
  projectId
}) {
  const now = new Date();
  const dateOffsetDays = Math.floor(Math.random() * 3650);
  now.setDate(now.getDate() - dateOffsetDays);
  const logDate = now.toISOString().slice(0, 10);
  const dailyLogResponse = await supabase
    .from("daily_logs")
    .insert({
      company_id: organizationId,
      project_id: projectId,
      job_id: null,
      log_date: logDate,
      status: "draft",
      summary:
        "Daily log fixture for deterministic open blocker field-note guidance cue bridge coverage.",
      delays_or_blockers:
        "Open blocker fixture used to verify project guidance work-item prefill.",
      safety_notes: "No safety incident recorded for this E2E fixture.",
      weather_summary: "Clear",
      created_by: userId,
      updated_by: userId
    })
    .select("id, log_date")
    .single();

  if (dailyLogResponse.error) {
    throw new Error(`Unable to create cue fixture daily log: ${dailyLogResponse.error.message}`);
  }

  return dailyLogResponse.data;
}

async function createFixtureFieldNote({
  supabase,
  organizationId,
  userId,
  projectId,
  dailyLogId
}) {
  const fieldNoteResponse = await supabase
    .from("field_notes")
    .insert({
      company_id: organizationId,
      daily_log_id: dailyLogId,
      project_id: projectId,
      job_id: null,
      note_type: "blocker",
      title: "E2E Open Field Blocker",
      body:
        "Open blocker field note fixture for deterministic project guidance cue bridge coverage.",
      status: "open",
      visibility: "internal",
      created_by: userId,
      updated_by: userId
    })
    .select("id, daily_log_id, note_type, status, title")
    .single();

  if (fieldNoteResponse.error) {
    throw new Error(`Unable to create cue fixture field note: ${fieldNoteResponse.error.message}`);
  }

  return fieldNoteResponse.data;
}

async function ensureApprovedEstimateCueFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
  const reusableProjects = await loadFixtureProjects({ supabase, organizationId });

  for (const project of reusableProjects) {
    if (await projectHasContracts({ supabase, organizationId, projectId: project.id })) {
      continue;
    }

    const approvedEstimate = await findApprovedFixtureEstimate({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (approvedEstimate) {
      return {
        projectPath: `/projects/${project.id}`,
        projectId: project.id,
        estimateId: approvedEstimate.id
      };
    }
  }

  const customerId = await ensureFixtureCustomer({ supabase, organizationId, userId });
  const project = await createFixtureProject({
    supabase,
    organizationId,
    userId,
    customerId
  });
  const opportunityId = await ensureFixtureOpportunity({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    projectName: project.name
  });
  const estimate = await createApprovedFixtureEstimate({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    opportunityId
  });

  return {
    projectPath: `/projects/${project.id}`,
    projectId: project.id,
    estimateId: estimate.id
  };
}

async function ensureSignedReadyNoJobCueFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
  const reusableProjects = await loadFixtureProjects({
    supabase,
    organizationId,
    projectName: signedReadyNoJobFixtureProjectName
  });

  for (const project of reusableProjects) {
    if (await projectHasJobs({ supabase, organizationId, projectId: project.id })) {
      continue;
    }

    const signedContract = await findSignedFixtureContract({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (signedContract) {
      return {
        projectPath: `/projects/${project.id}`,
        projectId: project.id,
        contractId: signedContract.id,
        estimateId: signedContract.estimate_id
      };
    }
  }

  const customerId = await ensureFixtureCustomer({
    supabase,
    organizationId,
    userId,
    email: signedReadyNoJobFixtureCustomerEmail,
    name: "E2E Signed Ready No Job Cue Customer",
    notes:
      "Stable local E2E fixture for signed-ready-no-job project guidance cue coverage."
  });
  const project = await createFixtureProject({
    supabase,
    organizationId,
    userId,
    customerId,
    fixtureProjectName: signedReadyNoJobFixtureProjectName,
    status: "approved",
    commercialReadinessStatus: "ready_to_schedule",
    description:
      "Stable local E2E fixture for signed-ready-no-job project guidance cue coverage."
  });
  const opportunityId = await ensureFixtureOpportunity({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    projectName: project.name,
    customerName: "E2E Signed Ready No Job Cue Customer",
    customerEmail: signedReadyNoJobFixtureCustomerEmail,
    requirementsSummary:
      "Signed ready no-job cue bridge fixture. A signed contract exists and no job should exist for this project."
  });
  const estimate = await createApprovedFixtureEstimate({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    opportunityId,
    title: "E2E Signed Ready No Job Estimate",
    notes:
      "Approved estimate fixture for deterministic signed-ready-no-job project guidance cue bridge coverage."
  });
  const contract = await createSignedFixtureContract({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimate
  });

  return {
    projectPath: `/projects/${project.id}`,
    projectId: project.id,
    contractId: contract.id,
    estimateId: estimate.id
  };
}

async function ensureUnscheduledJobCueFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
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

  const customerId = await ensureFixtureCustomer({
    supabase,
    organizationId,
    userId,
    email: unscheduledJobFixtureCustomerEmail,
    name: "E2E Unscheduled Job Cue Customer",
    notes:
      "Stable local E2E fixture for ready-project-with-unscheduled-job project guidance cue coverage."
  });
  const project = await createFixtureProject({
    supabase,
    organizationId,
    userId,
    customerId,
    fixtureProjectName: unscheduledJobFixtureProjectName,
    status: "approved",
    commercialReadinessStatus: "ready_to_schedule",
    description:
      "Stable local E2E fixture for ready-project-with-unscheduled-job project guidance cue coverage."
  });
  const opportunityId = await ensureFixtureOpportunity({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    projectName: project.name,
    customerName: "E2E Unscheduled Job Cue Customer",
    customerEmail: unscheduledJobFixtureCustomerEmail,
    requirementsSummary:
      "Ready project with unscheduled job cue bridge fixture. A signed contract and exactly one unscheduled job should exist for this project."
  });
  const estimate = await createApprovedFixtureEstimate({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    opportunityId,
    title: "E2E Unscheduled Job Cue Estimate",
    notes:
      "Approved estimate fixture for deterministic ready-project-with-unscheduled-job guidance cue bridge coverage."
  });
  const contract = await createSignedFixtureContract({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimate
  });
  const job = await createUnscheduledFixtureJob({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimateId: estimate.id
  });

  return {
    projectPath: `/projects/${project.id}`,
    projectId: project.id,
    jobId: job.id,
    contractId: contract.id,
    estimateId: estimate.id
  };
}

async function ensureScheduledJobHandoffFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
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

  const customerId = await ensureFixtureCustomer({
    supabase,
    organizationId,
    userId,
    email: scheduledJobHandoffFixtureCustomerEmail,
    name: "E2E Scheduled Job Handoff Customer",
    notes:
      "Stable local E2E fixture for ready-to-schedule scheduled-job handoff coverage."
  });
  const project = await createFixtureProject({
    supabase,
    organizationId,
    userId,
    customerId,
    fixtureProjectName: scheduledJobHandoffFixtureProjectName,
    status: "approved",
    commercialReadinessStatus: "ready_to_schedule",
    description:
      "Stable local E2E fixture for ready-to-schedule scheduled-job handoff coverage."
  });
  const opportunityId = await ensureFixtureOpportunity({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    projectName: project.name,
    customerName: "E2E Scheduled Job Handoff Customer",
    customerEmail: scheduledJobHandoffFixtureCustomerEmail,
    requirementsSummary:
      "Ready-to-schedule handoff fixture. A signed contract and scheduled job should exist with no unscheduled jobs."
  });
  const estimate = await createApprovedFixtureEstimate({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    opportunityId,
    title: "E2E Scheduled Job Handoff Estimate",
    notes:
      "Approved estimate fixture for ready-to-schedule scheduled-job handoff coverage."
  });
  const contract = await createSignedFixtureContract({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimate
  });
  const job = await createScheduledFixtureJob({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimateId: estimate.id
  });

  return {
    projectPath: `/projects/${project.id}`,
    projectId: project.id,
    jobId: job.id,
    contractId: contract.id,
    estimateId: estimate.id
  };
}

async function ensureFieldNoteCueFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
  const reusableProjects = await loadFixtureProjects({
    supabase,
    organizationId,
    projectName: fieldNoteFixtureProjectName
  });

  for (const project of reusableProjects) {
    const openFieldNotes = await findFixtureOpenBlockerFieldNotes({
      supabase,
      organizationId,
      projectId: project.id
    });

    if (openFieldNotes.length === 1) {
      return {
        projectPath: `/projects/${project.id}`,
        projectId: project.id,
        dailyLogId: openFieldNotes[0].daily_log_id,
        fieldNoteId: openFieldNotes[0].id
      };
    }
  }

  const customerId = await ensureFixtureCustomer({
    supabase,
    organizationId,
    userId,
    email: fieldNoteFixtureCustomerEmail,
    name: "E2E Field Note Cue Customer",
    notes:
      "Stable local E2E fixture for open blocker field-note project guidance cue coverage."
  });
  const project = await createFixtureProject({
    supabase,
    organizationId,
    userId,
    customerId,
    fixtureProjectName: fieldNoteFixtureProjectName,
    status: "approved",
    commercialReadinessStatus: "ready_to_schedule",
    description:
      "Stable local E2E fixture for open blocker field-note project guidance cue coverage."
  });
  const opportunityId = await ensureFixtureOpportunity({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    projectName: project.name,
    customerName: "E2E Field Note Cue Customer",
    customerEmail: fieldNoteFixtureCustomerEmail,
    requirementsSummary:
      "Open blocker field-note cue bridge fixture. A daily log has one open blocker field note for this project."
  });
  const estimate = await createApprovedFixtureEstimate({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    opportunityId,
    title: "E2E Field Note Cue Estimate",
    notes:
      "Approved estimate fixture for deterministic open blocker field-note guidance cue bridge coverage."
  });
  await createSignedFixtureContract({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId: project.id,
    estimate
  });
  const dailyLog = await createFixtureDailyLog({
    supabase,
    organizationId,
    userId,
    projectId: project.id
  });
  const fieldNote = await createFixtureFieldNote({
    supabase,
    organizationId,
    userId,
    projectId: project.id,
    dailyLogId: dailyLog.id
  });

  return {
    projectPath: `/projects/${project.id}`,
    projectId: project.id,
    dailyLogId: dailyLog.id,
    fieldNoteId: fieldNote.id
  };
}

test("ready-to-schedule handoff points no-job projects to canonical job creation", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = signedReadyNoJobCueBridgePath
    ? { projectPath: signedReadyNoJobCueBridgePath }
    : await ensureSignedReadyNoJobCueFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No signed-ready no-job project fixture was available for ready-to-schedule handoff QA."
  );

  await page.goto(fixture.projectPath, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Ready-to-schedule handoff QA requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(page.getByText("Project Workspace").first()).toBeVisible();

  const panel = getReadyToSchedulePanel(page);
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Ready to schedule");
  await expect(panel).toContainText("No job yet");
  await expect(panel).toContainText(
    "Jobs remain the canonical execution record for this project."
  );
  await expect(panel).toContainText("Create the job first");

  const createJobHref = await panel
    .getByRole("link", { name: "Create job" })
    .getAttribute("href");
  const createJobUrl = new URL(createJobHref, "http://localhost");

  expect(createJobUrl.pathname).toBe("/jobs");
  expect(createJobUrl.searchParams.get("projectId")).toBe(
    projectIdFromPath(fixture.projectPath)
  );
  expect(createJobUrl.searchParams.get("compose")).toBe("1");
  expect(createJobHref).not.toContain("workItemCue=");
  expect(createJobHref).not.toContain("#work-items");

  expect(issues).toEqual([]);
});

test("ready-to-schedule handoff points one unscheduled job to the focused schedule action", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = unscheduledJobCueBridgePath
    ? { projectPath: unscheduledJobCueBridgePath }
    : await ensureUnscheduledJobCueFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No ready project with one unscheduled job fixture was available for ready-to-schedule handoff QA."
  );

  await page.goto(fixture.projectPath, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Ready-to-schedule handoff QA requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(page.getByText("Project Workspace").first()).toBeVisible();

  const panel = getReadyToSchedulePanel(page);
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Ready to schedule");
  await expect(panel).toContainText("1 job created");
  await expect(panel).toContainText("1 waiting on schedule");
  await expect(panel).toContainText("Scheduling stays on the existing job schedule fields.");

  const scheduleHref = await panel
    .getByRole("link", { name: "Schedule job" })
    .getAttribute("href");
  const scheduleUrl = new URL(scheduleHref, "http://localhost");

  expect(scheduleUrl.pathname).toBe("/schedule");
  expect(scheduleUrl.searchParams.get("projectId")).toBe(
    projectIdFromPath(fixture.projectPath)
  );
  expect(scheduleUrl.searchParams.get("view")).toBe("unscheduled");
  expect(scheduleUrl.searchParams.get("action")).toBe("schedule");
  expect(scheduleUrl.searchParams.get("jobId")).toMatch(/^[0-9a-f-]+$/);
  expect(scheduleHref).not.toContain("workItemCue=");
  expect(scheduleHref).not.toContain("#work-items");

  expect(issues).toEqual([]);
});

test("ready-to-schedule handoff opens the project schedule when jobs are already scheduled", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  const fixture = scheduledJobHandoffPath
    ? { projectPath: scheduledJobHandoffPath }
    : await ensureScheduledJobHandoffFixture();

  test.skip(
    Boolean(fixture.skipReason),
    fixture.skipReason ??
      "No ready project with scheduled jobs fixture was available for ready-to-schedule handoff QA."
  );

  await page.goto(fixture.projectPath, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Ready-to-schedule handoff QA requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(page.getByText("Project Workspace").first()).toBeVisible();

  const panel = getReadyToSchedulePanel(page);
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Ready to schedule");
  await expect(panel).toContainText("1 job created");
  await expect(panel).toContainText("Job schedule already set");
  await expect(panel).toContainText(
    "Review calendar timing or crew details on the shared schedule."
  );

  const scheduleHref = await panel
    .getByRole("link", { name: "Open schedule" })
    .getAttribute("href");
  const scheduleUrl = new URL(scheduleHref, "http://localhost");

  expect(scheduleUrl.pathname).toBe("/schedule");
  expect(scheduleUrl.searchParams.get("projectId")).toBe(
    projectIdFromPath(fixture.projectPath)
  );
  expect(scheduleUrl.searchParams.get("view")).toBeNull();
  expect(scheduleUrl.searchParams.get("action")).toBeNull();
  expect(scheduleUrl.searchParams.get("jobId")).toBeNull();
  expect(scheduleHref).not.toContain("workItemCue=");
  expect(scheduleHref).not.toContain("#work-items");

  await expect(panel.getByRole("link", { name: "Create job" })).toHaveCount(0);

  expect(issues).toEqual([]);
});

test("project unpaid deposit cue routes to invoice without work-item prefill", async ({
  page
}) => {
  const issues = attachIssueCapture(page);

  await page.goto(projectCueBridgePath, { waitUntil: "domcontentloaded" });
  await expectAuthenticatedProjectPage(page);

  const depositCue = page.locator("#project-guidance-cues article").filter({
    hasText: "Deposit invoice is still unpaid"
  });
  await expect(depositCue).toBeVisible();
  await expect(depositCue).toContainText(
    "Financial readiness is waiting on the existing deposit invoice"
  );

  const invoiceHref = await depositCue
    .getByRole("link", { name: "Review deposit invoice" })
    .getAttribute("href");
  expect(invoiceHref).toMatch(/^\/invoices\/[0-9a-f-]+$/);
  const invoiceId = invoiceHref.split("/").at(-1);

  expect(invoiceId).toMatch(/^[0-9a-f-]+$/);
  await expect(depositCue.getByRole("link", { name: "Create work item" })).toHaveCount(0);
  expect(invoiceHref).not.toContain("workItemCue=");
  expect(invoiceHref).not.toContain("#work-items");
  await expect(page.locator("#work-items")).not.toContainText(
    "Prefilled from project guidance"
  );
  await expect(page.locator("#work-items")).not.toContainText("Work item created.");

  expect(issues).toEqual([]);
});

test("dashboard project cue preview routes to project guidance without opening work-item creation", async ({
  page
}) => {
  const issues = attachIssueCapture(page);

  if (!estimateCueBridgePath) {
    const fixture = await ensureApprovedEstimateCueFixture();

    test.skip(
      Boolean(fixture.skipReason),
      fixture.skipReason ??
        "No seeded project with an approved-estimate-missing-contract cue was found and a safe E2E fixture could not be created."
    );
  }

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expectAuthenticatedDashboardPage(page);

  const projectCueSection = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Suggested project actions" })
  });
  await expect(projectCueSection).toBeVisible();
  await expect(projectCueSection).toContainText("Project guidance");
  await expect(projectCueSection).toContainText(
    "Suggested actions from current project records only"
  );

  const estimateCuePreview = projectCueSection.locator("article").filter({
    hasText: estimateCueTitle
  }).first();
  await expect(estimateCuePreview).toBeVisible();
  await expect(estimateCuePreview).toContainText(estimateCueTitle);

  await expect(
    estimateCuePreview.getByRole("link", { name: "Create work item" })
  ).toHaveCount(0);

  const projectCueHref = await estimateCuePreview
    .getByRole("link", { name: estimateCueTitle })
    .getAttribute("href");
  expect(projectCueHref).toMatch(/^\/projects\/[0-9a-f-]+#project-guidance-cues$/);

  const workflowHref = await estimateCuePreview
    .getByRole("link", { name: "Generate contract" })
    .getAttribute("href");
  expect(workflowHref).toMatch(/^\/contracts\?estimateId=[0-9a-f-]+$/);
  expect(workflowHref).not.toContain("workItemCue=");
  expect(workflowHref).not.toContain("#work-items");

  await Promise.all([
    page.waitForURL((url) => url.pathname.startsWith("/projects/") && url.hash === "#project-guidance-cues"),
    estimateCuePreview.getByRole("link", { name: estimateCueTitle }).click()
  ]);
  await expectAuthenticatedProjectPage(page);

  expect(new URL(page.url()).searchParams.get("workItemCue")).toBeNull();
  expect(new URL(page.url()).hash).toBe("#project-guidance-cues");

  await expect(
    page.getByRole("region", { name: "Suggested project actions" })
  ).toBeVisible();

  const projectEstimateCue = page.locator("#project-guidance-cues article").filter({
    hasText: estimateCueTitle
  });
  await expect(projectEstimateCue).toBeVisible();
  await expect(projectEstimateCue).toContainText(
    "Approved scope exists, but no canonical contract has been generated yet"
  );
  await expect(projectEstimateCue).toContainText(/Priority:\s*critical/i);
  await expect(page.locator("#work-items")).not.toContainText(
    "Prefilled from project guidance"
  );
  await expect(page.locator("#work-items")).not.toContainText("Work item created.");

  expect(issues).toEqual([]);
});

test("project approved-estimate cue routes to contract generation without work-item prefill", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  let projectPath = estimateCueBridgePath ?? null;

  if (!projectPath) {
    const fixture = await ensureApprovedEstimateCueFixture();

    test.skip(
      Boolean(fixture.skipReason),
      fixture.skipReason ??
        "No seeded project with an approved-estimate-missing-contract cue was found and a safe E2E fixture could not be created."
    );

    projectPath = fixture.projectPath;
  }

  test.skip(
    !projectPath,
    "No seeded project with an approved-estimate-missing-contract cue was found. Set FLOORCONNECTOR_E2E_ESTIMATE_CUE_BRIDGE_PATH to run this regression."
  );

  await page.goto(projectPath, { waitUntil: "domcontentloaded" });
  await expectAuthenticatedProjectPage(page);

  const estimateCue = page.locator("#project-guidance-cues article").filter({
    hasText: estimateCueTitle
  });
  await expect(estimateCue).toBeVisible();
  await expect(estimateCue).toContainText(
    "Approved scope exists, but no canonical contract has been generated yet"
  );
  await expect(page.getByRole("region", { name: "Suggested project actions" })).toContainText(
    /nothing is created or changed until you submit/i
  );
  await expect(page.getByRole("region", { name: "Suggested project actions" })).toContainText(
    "Canonical workflow actions"
  );
  await expect(page.getByRole("region", { name: "Suggested project actions" })).toContainText(
    "without creating side records"
  );
  await expect(estimateCue).toContainText(/Priority:\s*critical/i);

  await expect(
    estimateCue.getByRole("link", {
      name: new RegExp(`Generate contract.*${estimateCueTitle}`)
    })
  ).toBeVisible();
  await expect(estimateCue.getByRole("link", { name: "Create work item" })).toHaveCount(0);

  const contractHref = await estimateCue
    .getByRole("link", { name: "Generate contract" })
    .getAttribute("href");
  expect(contractHref).toMatch(/^\/contracts\?estimateId=[0-9a-f-]+$/);
  expect(new URL(contractHref, "http://localhost").searchParams.get("estimateId")).toMatch(
    /^[0-9a-f-]+$/
  );
  expect(contractHref).not.toContain("workItemCue=");
  expect(contractHref).not.toContain("#work-items");
  await expect(page.locator("#work-items")).not.toContainText(
    "Prefilled from project guidance"
  );
  await expect(page.locator("#work-items")).not.toContainText("Work item created.");

  expect(issues).toEqual([]);
});

test("project signed-ready no-job cue routes to job quick-create without work-item prefill", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  let projectPath = signedReadyNoJobCueBridgePath ?? null;

  if (!projectPath) {
    const fixture = await ensureSignedReadyNoJobCueFixture();

    test.skip(
      Boolean(fixture.skipReason),
      fixture.skipReason ??
        "No seeded project with a signed-ready-no-job cue was found and a safe E2E fixture could not be created."
    );

    projectPath = fixture.projectPath;
  }

  test.skip(
    !projectPath,
    "No seeded project with a signed-ready-no-job cue was found. Set FLOORCONNECTOR_E2E_SIGNED_READY_NO_JOB_CUE_BRIDGE_PATH to run this regression."
  );

  await page.goto(projectPath, { waitUntil: "domcontentloaded" });
  await expectAuthenticatedProjectPage(page);

  const signedNoJobCue = page.locator("#project-guidance-cues article").filter({
    hasText: signedReadyNoJobCueTitle
  });
  await expect(signedNoJobCue).toBeVisible();
  await expect(signedNoJobCue).toContainText(
    "Readiness is clear, but the project has no canonical job yet"
  );

  const jobHref = await signedNoJobCue
    .getByRole("link", { name: "Create job" })
    .getAttribute("href");
  expect(jobHref).toMatch(/^\/jobs\?projectId=[0-9a-f-]+/);

  const jobHrefParams = new URL(jobHref, "http://localhost").searchParams;
  const projectId = projectIdFromPath(projectPath);
  const contractId = jobHrefParams.get("contractId");
  const estimateId = jobHrefParams.get("estimateId");

  expect(jobHrefParams.get("projectId")).toBe(projectId);
  expect(contractId).toMatch(/^[0-9a-f-]+$/);
  expect(estimateId).toMatch(/^[0-9a-f-]+$/);

  await expect(signedNoJobCue.getByRole("link", { name: "Create work item" })).toHaveCount(0);
  expect(jobHref).not.toContain("workItemCue=");
  expect(jobHref).not.toContain("#work-items");
  await expect(page.locator("#work-items")).not.toContainText(
    "Prefilled from project guidance"
  );
  await expect(page.locator("#work-items")).not.toContainText("Work item created.");

  expect(issues).toEqual([]);
});

test("project ready unscheduled-job cue routes to scheduling without work-item prefill", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  let projectPath = unscheduledJobCueBridgePath ?? null;

  if (!projectPath) {
    const fixture = await ensureUnscheduledJobCueFixture();

    test.skip(
      Boolean(fixture.skipReason),
      fixture.skipReason ??
        "No seeded project with a ready-project-unscheduled-job cue was found and a safe E2E fixture could not be created."
    );

    projectPath = fixture.projectPath;
  }

  test.skip(
    !projectPath,
    "No seeded project with a ready-project-unscheduled-job cue was found. Set FLOORCONNECTOR_E2E_UNSCHEDULED_JOB_CUE_BRIDGE_PATH to run this regression."
  );

  await page.goto(projectPath, { waitUntil: "domcontentloaded" });
  await expectAuthenticatedProjectPage(page);

  const unscheduledJobCue = page.locator("#project-guidance-cues article").filter({
    hasText: unscheduledJobCueTitle
  });
  await expect(unscheduledJobCue).toBeVisible();
  await expect(unscheduledJobCue).toContainText(
    "Readiness is clear, but one or more canonical jobs still need schedule placement"
  );

  const scheduleHref = await unscheduledJobCue
    .getByRole("link", { name: "Open scheduling" })
    .getAttribute("href");
  expect(scheduleHref).toMatch(
    /^\/schedule\?projectId=[0-9a-f-]+&view=unscheduled&action=schedule&jobId=[0-9a-f-]+$/
  );

  const scheduleParams = new URL(scheduleHref, "http://localhost").searchParams;
  const projectId = projectIdFromPath(projectPath);
  const jobId = scheduleParams.get("jobId");

  expect(scheduleParams.get("projectId")).toBe(projectId);
  expect(scheduleParams.get("view")).toBe("unscheduled");
  expect(scheduleParams.get("action")).toBe("schedule");
  expect(jobId).toMatch(/^[0-9a-f-]+$/);

  await expect(unscheduledJobCue.getByRole("link", { name: "Create work item" })).toHaveCount(0);
  expect(scheduleHref).not.toContain("workItemCue=");
  expect(scheduleHref).not.toContain("#work-items");
  await expect(page.locator("#work-items")).not.toContainText(
    "Prefilled from project guidance"
  );
  await expect(page.locator("#work-items")).not.toContainText("Work item created.");

  expect(issues).toEqual([]);
});

test("project open field-note blocker cue opens project-locked work-item prefill without creating one", async ({
  page
}) => {
  const issues = attachIssueCapture(page);
  let projectPath = fieldNoteCueBridgePath ?? null;

  if (!projectPath) {
    const fixture = await ensureFieldNoteCueFixture();

    test.skip(
      Boolean(fixture.skipReason),
      fixture.skipReason ??
        "No seeded project with an open blocker field-note cue was found and a safe E2E fixture could not be created."
    );

    projectPath = fixture.projectPath;
  }

  test.skip(
    !projectPath,
    "No seeded project with an open blocker field-note cue was found. Set FLOORCONNECTOR_E2E_FIELD_NOTE_CUE_BRIDGE_PATH to run this regression."
  );

  await page.goto(projectPath, { waitUntil: "domcontentloaded" });
  await expectAuthenticatedProjectPage(page);

  const fieldNoteCue = page.locator("#project-guidance-cues article").filter({
    hasText: fieldNoteCueTitle
  });
  await expect(fieldNoteCue).toBeVisible();
  await expect(page.getByRole("region", { name: "Suggested project actions" })).toContainText(
    "Human follow-up actions"
  );
  await expect(page.getByRole("region", { name: "Suggested project actions" })).toContainText(
    "work item is still user-confirmed"
  );
  await expect(fieldNoteCue).toContainText(
    "Field blockers are still open on daily logs for this project"
  );
  await expect(fieldNoteCue).toContainText("E2E Open Field Blocker");

  const dailyLogHref = await fieldNoteCue
    .getByRole("link", { name: "Open daily log" })
    .getAttribute("href");
  expect(dailyLogHref).toMatch(/^\/daily-logs\/[0-9a-f-]+$/);
  const dailyLogId = dailyLogHref.split("/").at(-1);
  const projectId = projectIdFromPath(projectPath);

  const openCountBefore = await getOpenWorkItemCount(page);

  const bridgeHref = await fieldNoteCue
    .getByRole("link", { name: "Create work item" })
    .getAttribute("href");
  expect(bridgeHref).toContain("workItemCue=open_blocker_field_notes");
  expect(bridgeHref).toContain("#work-items");

  const bridgeLink = fieldNoteCue.getByRole("link", { name: "Create work item" });
  await bridgeLink.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForURL((url) => {
      return (
        url.searchParams.get("workItemCue") === "open_blocker_field_notes" &&
        url.hash === "#work-items"
      );
    }),
    bridgeLink.click()
  ]);

  expect(new URL(page.url()).searchParams.get("workItemCue")).toBe(
    "open_blocker_field_notes"
  );
  await expect(page.locator("#work-items")).toBeVisible();
  await expect(page.locator("#work-items")).toContainText(
    "Prefilled from project guidance"
  );

  const workItemsPanel = page.locator("#work-items");

  await expect(workItemsPanel.locator('input[name="sourceType"]')).toHaveValue("project");
  await expect(workItemsPanel.locator('input[name="sourceId"]')).toHaveValue(projectId);
  await expect(workItemsPanel.locator('input[name="projectId"]')).toHaveValue(projectId);
  await expect(workItemsPanel.locator('input[name="linkPath"]')).toHaveValue(dailyLogHref);
  await expect(workItemsPanel.locator('select[name="kind"]')).toHaveValue("human_handoff");
  await expect(workItemsPanel.locator('input[name="title"]')).toHaveValue(
    /Resolve project blocker/
  );
  await expect(workItemsPanel.locator('textarea[name="description"]')).toContainText(
    "Prefilled from project guidance"
  );
  await expect(workItemsPanel.locator('textarea[name="description"]')).toContainText(
    fieldNoteCueTitle
  );
  await expect(workItemsPanel.locator('textarea[name="description"]')).toContainText(
    "Source context: Field note: E2E Open Field Blocker"
  );
  await expect(workItemsPanel.locator('textarea[name="description"]')).toContainText(
    "Workflow handoff:"
  );

  const metadata = JSON.parse(
    await workItemsPanel.locator('input[name="metadata"]').inputValue()
  );
  expect(metadata.cue).toBe("project_guidance");
  expect(metadata.projectCue).toBe("open_blocker_field_notes");
  expect(metadata.projectId).toBe(projectId);
  expect(metadata.fieldNoteId).toMatch(/^[0-9a-f-]+$/);
  expect(metadata.dailyLogId).toBe(dailyLogId);
  expect(metadata.fieldNoteTitle).toBe("E2E Open Field Blocker");
  expect(metadata.fieldNoteType).toBe("blocker");
  expect(metadata.fieldNoteStatus).toBe("open");
  expect(metadata.openBlockerFieldNoteCount).toBe(1);
  expect(metadata.workflowHref).toBe(dailyLogHref);

  expect(await getOpenWorkItemCount(page)).toBe(openCountBefore);
  await expect(page.getByRole("button", { name: "Create work item" })).toBeVisible();
  await expect(page.locator("#work-items")).not.toContainText("Work item created.");

  expect(issues).toEqual([]);
});

