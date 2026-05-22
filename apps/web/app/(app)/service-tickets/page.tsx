import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ServiceTicketForm } from "@/components/service-ticket-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { deriveServiceCenterSummary } from "@/lib/servicecenter/summary";
import { createServiceTicketAction } from "@/lib/service-tickets/actions";
import {
  getServiceTicketManagerReadModel,
  isServiceTicketManagerView,
  listServiceTicketCustomerOptions,
  listServiceTicketJobOptions,
  listServiceTicketProjectOptions
} from "@/lib/service-tickets/data";

type ServiceTicketsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    view?: "all" | "open" | "warranty" | "service" | "urgent" | "closed";
  }>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function buildServiceTicketHref(input: {
  q?: string;
  view?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/service-tickets?${query}` : "/service-tickets";
}

export default async function ServiceTicketsPage({
  searchParams
}: ServiceTicketsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/service-tickets");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Service tickets need an active organization before they can be reviewed.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const view = isServiceTicketManagerView(resolvedSearchParams.view)
    ? resolvedSearchParams.view
    : "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const [readModel, customerOptions, projectOptions, jobOptions] =
    await Promise.all([
      getServiceTicketManagerReadModel({
        organizationId: organizationContext.organization.id,
        view,
        query
      }),
      listServiceTicketCustomerOptions(),
      listServiceTicketProjectOptions(),
      listServiceTicketJobOptions()
    ]);
  const views = [
    { key: "all", label: "All", count: readModel.counts.all },
    { key: "open", label: "Open", count: readModel.counts.open },
    { key: "warranty", label: "Warranty", count: readModel.counts.warranty },
    { key: "service", label: "Service", count: readModel.counts.service },
    { key: "urgent", label: "High priority", count: readModel.counts.urgent },
    { key: "closed", label: "Resolved", count: readModel.counts.closed }
  ] as const;
  const serviceCenter = deriveServiceCenterSummary({
    tickets: readModel.tickets,
    warrantyDocuments: [],
    serviceJobs: [],
    serviceCenterHref: buildServiceTicketHref({ q: query, view })
  });

  return (
    <ContractorWorkspacePage
      eyebrow="Service / Warranty"
      title={`Service continuity for ${organizationContext.organization.displayName}`}
      description="Track warranty, callback, inspection, and service follow-up as post-installation lifecycle continuity tied to canonical customers, projects, and jobs."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {views.slice(0, 5).map((item) => (
            <div
              key={item.key}
              className="border border-[#e5e5e5] bg-white px-4 py-3"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Service tickets stay attached to customer, project, and job context.
            Portal service requests, stored warranty packets, billing, and
            equipment usage are planned later.
          </p>
        ),
        searchSlot: (
          <form
            action="/service-tickets"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {view !== "all" ? (
              <input type="hidden" name="view" value={view} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, description, or warranty basis"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" || showComposer ? (
              <Link
                href="/service-tickets"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: views.map((item) => {
          const isActive = view === item.key;

          return (
            <Link
              key={item.key}
              href={buildServiceTicketHref({
                q: query,
                view: item.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{item.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {item.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildServiceTicketHref({ q: query, view, compose: "1" }) +
              "#service-ticket-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New service ticket
          </Link>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_430px]"
            : "space-y-4"
        }
      >
        <section className="space-y-4">
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

          <section className="rounded-[4px] border border-[#e5e5e5] bg-[#fffaf4] px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c6b5d]">
                  Service Center Next Move
                </p>
                <h2 className="mt-2 text-base font-semibold text-[#171717]">
                  {serviceCenter.nextMove.reason}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#665446]">
                  {serviceCenter.openTicketCount} open ticket
                  {serviceCenter.openTicketCount === 1 ? "" : "s"} /{" "}
                  {serviceCenter.closedTicketCount} resolved or closed /{" "}
                  {serviceCenter.coverageLabel}.
                </p>
              </div>
              <Link
                href={serviceCenter.nextMove.href}
                className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
              >
                {serviceCenter.nextMove.label}
              </Link>
            </div>
          </section>

          <div className="space-y-3">
            {readModel.tickets.length > 0 ? (
              readModel.tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/service-tickets/${ticket.id}`}
                  className="group block rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-4 transition hover:bg-slate-50/70"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_220px_180px_150px] md:items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {ticket.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {ticket.customer?.name ?? "Unknown customer"} /{" "}
                        {ticket.project?.name ?? "No project context"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize text-slate-700">
                        {formatLabel(ticket.ticketType)}
                      </p>
                      <p className="mt-1 text-sm leading-6 capitalize text-slate-500">
                        {formatLabel(ticket.sourceType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize text-slate-700">
                        {formatLabel(ticket.status)}
                      </p>
                      <p className="mt-1 text-sm leading-6 capitalize text-slate-500">
                        {formatLabel(ticket.priority)} priority
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-sm font-medium text-slate-950">
                        {formatDate(ticket.reportedOn)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {ticket.job
                          ? `Job ${ticket.job.id.slice(0, 8)}`
                          : "No job"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <AppEmptyState
                eyebrow="No service tickets"
                title="No service or warranty continuity has been recorded yet"
                description="Create the first internal ticket from customer, project, and optional job context. Portal requests and customer-facing warranty documents come later."
              />
            )}
          </div>
        </section>

        <WorkspaceComposerSheet
          id="service-ticket-create"
          title="Create service ticket"
          description="Record the internal service or warranty issue against the existing customer/project/job chain."
          open={showComposer}
          openHref={
            buildServiceTicketHref({ q: query, view, compose: "1" }) +
            "#service-ticket-create"
          }
          closeHref={buildServiceTicketHref({ q: query, view })}
          openLabel="Open service ticket composer"
        >
          <ServiceTicketForm
            action={createServiceTicketAction}
            customerOptions={customerOptions}
            projectOptions={projectOptions}
            jobOptions={jobOptions}
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
