import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { VendorForm } from "@/components/vendor-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createVendorAction } from "@/lib/vendors/actions";
import {
  getVendorsManagerReadModel,
  isVendorsManagerView
} from "@/lib/vendors/manager-read-model";

type VendorsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    view?: "all" | "labor" | "active";
  }>;
};

function buildVendorsHref(input: {
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
  return query.length > 0 ? `/vendors?${query}` : "/vendors";
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/vendors");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Vendor records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const view = isVendorsManagerView(resolvedSearchParams.view)
    ? resolvedSearchParams.view
    : "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const readModel = await getVendorsManagerReadModel({
    organizationId: organizationContext.organization.id,
    view,
    query
  });
  const vendorViews = [
    { key: "all", label: "All vendors", count: readModel.counts.all },
    { key: "labor", label: "Labor providers", count: readModel.counts.labor },
    { key: "active", label: "Active", count: readModel.counts.active }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Vendors"
      title={`External companies for ${organizationContext.organization.displayName}`}
      description="Manage subcontractors and supplier companies on the shared vendor foundation so workforce, compliance, and future external operations all stay connected."
      summary={
        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.all}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Labor providers
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.labor}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Active
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.active}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search the subcontractor and supplier roster, filter for active or
            labor-provider companies, and open the vendor composer only when you
            need a new record.
          </p>
        ),
        searchSlot: (
          <form action="/vendors" className="flex flex-col gap-2 sm:flex-row">
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
              placeholder="Search vendor, contact, email, location, or type"
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
                href="/vendors"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: vendorViews.map((vendorView) => {
          const isActive = view === vendorView.key;

          return (
            <Link
              key={vendorView.key}
              href={buildVendorsHref({
                q: query,
                view: vendorView.key,
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{vendorView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {vendorView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={
              buildVendorsHref({ q: query, view, compose: "1" }) +
              "#vendor-create"
            }
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New vendor
          </Link>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_400px]"
            : "space-y-4"
        }
      >
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

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.2fr)_180px_220px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Vendor</span>
                  <span>Type</span>
                  <span className="text-right">Linked workforce</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Vendor records
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {readModel.vendors.length === readModel.matchingCount
                    ? `${readModel.vendors.length} visible`
                    : `Showing ${readModel.vendors.length} of ${readModel.matchingCount}`}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {readModel.vendors.length > 0 ? (
                readModel.vendors.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_180px_220px] md:items-start">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {vendor.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {vendor.primaryContactName ??
                            vendor.email ??
                            "No contact added yet"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {vendor.city || vendor.stateRegion
                            ? [vendor.city, vendor.stateRegion]
                                .filter(Boolean)
                                .join(", ")
                            : "No location added yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Type
                        </p>
                        <p className="text-sm font-medium capitalize text-slate-700">
                          {vendor.vendorType}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {vendor.isLaborProvider
                            ? "Labor provider"
                            : "Company only"}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Operational context
                        </p>
                        <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {readModel.linkedPeopleCountByVendorId.get(
                            vendor.id
                          ) ?? 0}{" "}
                          worker
                          {(readModel.linkedPeopleCountByVendorId.get(
                            vendor.id
                          ) ?? 0) === 1
                            ? ""
                            : "s"}
                        </span>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {readModel.complianceCountByVendorId.get(vendor.id) ??
                            0}{" "}
                          compliance record
                          {(readModel.complianceCountByVendorId.get(
                            vendor.id
                          ) ?? 0) === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={
                      readModel.counts.all > 0
                        ? "No matching vendors"
                        : "No vendors yet"
                    }
                    title={
                      readModel.counts.all > 0
                        ? "Adjust the vendor filters"
                        : "Create the first vendor"
                    }
                    description={
                      readModel.counts.all > 0
                        ? "Try a broader search or switch views to find the vendor record you need."
                        : "Vendor companies anchor subcontract labor and external compliance without creating a separate subcontractor-only silo."
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="vendor-create"
          title="Create vendor"
          description="Add a subcontractor or supplier company inside the active organization."
          open={showComposer}
          openHref={
            buildVendorsHref({ q: query, view, compose: "1" }) +
            "#vendor-create"
          }
          closeHref={buildVendorsHref({ q: query, view })}
          openLabel="Open vendor composer"
        >
          <VendorForm
            action={createVendorAction}
            submitLabel="Create vendor"
            pendingLabel="Creating vendor..."
          />
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
