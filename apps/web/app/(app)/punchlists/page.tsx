import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { NextActionCard } from "@/components/next-action-card";
import { PunchlistQuickCreateForm } from "@/components/punchlist-quick-create-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { quickCreatePunchlistItemAction } from "@/lib/punchlists/actions";
import { listPunchlistItems } from "@/lib/punchlists/data";
import { listJobs } from "@/lib/jobs/data";
import { listProjects } from "@/lib/projects/data";

type PunchlistsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    status?: "all" | "open" | "in_progress" | "resolved" | "closed";
    projectId?: string;
    jobId?: string;
  }>;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "No due date";
}

function getStatusClasses(status: string) {
  switch (status) {
    case "open":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "in_progress":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function buildPunchlistsHref(input: {
  q?: string;
  status?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/punchlists?${query}` : "/punchlists";
}

export default async function PunchlistsPage({
  searchParams
}: PunchlistsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/punchlists");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Punchlist records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [punchlistItems, projects, jobs] = await Promise.all([
    listPunchlistItems(),
    listProjects(),
    listJobs()
  ]);

  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId) ||
    Boolean(resolvedSearchParams.jobId);
  const openCount = punchlistItems.filter((item) => item.status === "open").length;
  const inProgressCount = punchlistItems.filter((item) => item.status === "in_progress").length;
  const resolvedCount = punchlistItems.filter((item) => item.status === "resolved").length;
  const closedCount = punchlistItems.filter((item) => item.status === "closed").length;
  const nextAction =
    openCount > 0
      ? {
          title: "Requires follow-up: move open closeout items into real action",
          description:
            "Open punchlist work already exists, so the highest-value next step is assigning responsibility and pushing the oldest project items into progress."
        }
      : {
          title: "Ready: close out the next execution issue",
          description:
            "No open punchlist items are waiting right now, so new closeout work can be captured only when the execution chain truly needs it."
        };
  const filteredPunchlistItems = punchlistItems.filter((item) => {
    const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            item.title,
            item.details ?? "",
            item.project?.name ?? "",
            item.job?.id ?? "",
            item.assignee?.displayName ?? "",
            item.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
  const punchlistViews = [
    { key: "all", label: "All items", count: punchlistItems.length },
    { key: "open", label: "Open", count: openCount },
    { key: "in_progress", label: "In progress", count: inProgressCount },
    { key: "resolved", label: "Resolved", count: resolvedCount },
    { key: "closed", label: "Closed", count: closedCount }
  ] as const;
  const defaultProjectId = projects.some(
    (project) => project.id === resolvedSearchParams.projectId
  )
    ? resolvedSearchParams.projectId
    : undefined;
  const defaultJobId = jobs.some((job) => job.id === resolvedSearchParams.jobId)
    ? resolvedSearchParams.jobId
    : undefined;

  return (
    <ContractorWorkspacePage
      eyebrow="Punchlists"
      title={`Project closeout items for ${organizationContext.organization.displayName}`}
      description="Use punchlists as the canonical closeout and corrective-work queue on the shared project and optional job chain, not as a separate field subsystem."
      summary={
        <WorkspaceSummaryBand
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)]"
          items={[
            {
              key: "open-items",
              label: "Open items",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {openCount}
                </p>
              )
            },
            {
              key: "in-progress",
              label: "In progress",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {inProgressCount}
                </p>
              )
            },
            {
              key: "resolved-closed",
              label: "Resolved / closed",
              content: (
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {resolvedCount + closedCount}
                </p>
              )
            },
            {
              key: "next-action",
              label: "Next best action",
              content: (
                <NextActionCard
                  eyebrow="Closeout guidance"
                  title={nextAction.title}
                  description={nextAction.description}
                  className="space-y-3 text-sm leading-6 text-slate-600"
                />
              )
            }
          ]}
        />
      }
      commandBar={{
        supportSlot: (
          <p>
            Review project closeout items, see whether they belong to a broader project or a specific job, and jump back into the real execution workspace when work needs follow-through.
          </p>
        ),
        searchSlot: (
          <form action="/punchlists" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, details, project, job, or assignee"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
              <Link
                href="/punchlists"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: punchlistViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildPunchlistsHref({
                q: query,
                status: view.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildPunchlistsHref({ q: query, status: statusFilter, compose: "1" }) +
              "#punchlist-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            New punchlist item
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_400px]" : "space-y-4"}>
        <section className="space-y-6">
          {resolvedSearchParams.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.2fr)_220px_160px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Punchlist item</span>
                  <span>Project / job</span>
                  <span>Assignee / due</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Punchlist items
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {filteredPunchlistItems.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredPunchlistItems.length > 0 ? (
                filteredPunchlistItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/punchlists/${item.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_220px_160px_140px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.details?.trim() || "No closeout details have been captured yet."}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Project / job
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {item.project?.name ?? "No project"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {item.job
                            ? `Job ${item.job.id.slice(0, 8)} | ${formatStatusLabel(item.job.dispatchStatus)}`
                            : "Project-level closeout item"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Assignee / due
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {item.assignee?.displayName ?? "Unassigned"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Due {formatDate(item.dueDate)}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span
                          className={`inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                            item.status
                          )}`}
                        >
                          {formatStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={
                      punchlistItems.length > 0 ? "No matching punchlist items" : "No punchlist items yet"
                    }
                    title={
                      punchlistItems.length > 0
                        ? "Adjust the closeout filters"
                        : "Create the first punchlist item"
                    }
                    description={
                      punchlistItems.length > 0
                        ? "Try a broader search or switch status views to find the closeout record you need."
                        : "Punchlists are now real canonical project/job closeout records, not a dashboard placeholder or a field-note-only workaround."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="punchlist-create"
          title="Quick create punchlist item"
          description="Capture only the minimum closeout context here, create the canonical punchlist item, and then finish responsibility and detail in the full workspace."
          open={showComposer}
          openHref={
            buildPunchlistsHref({ q: query, status: statusFilter, compose: "1" }) +
            "#punchlist-create"
          }
          closeHref={buildPunchlistsHref({ q: query, status: statusFilter })}
          openLabel="Open punchlist quick create"
        >
          <PunchlistQuickCreateForm
            action={quickCreatePunchlistItemAction}
            projects={projects.map((project) => ({
              id: project.id,
              name: project.name
            }))}
            jobs={jobs.map((job) => ({
              id: job.id,
              projectId: job.projectId,
              label: job.project?.name ?? "Job",
              dispatchStatus: job.dispatchStatus
            }))}
            defaultProjectId={defaultProjectId}
            defaultJobId={defaultJobId}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
