import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { VendorForm } from "@/components/vendor-form";
import { listComplianceRecords } from "@/lib/compliance/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPeople } from "@/lib/people/data";
import { createVendorAction } from "@/lib/vendors/actions";
import { listVendors } from "@/lib/vendors/data";

type VendorsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

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

  const [vendors, people, complianceRecords] = await Promise.all([
    listVendors(),
    listPeople(),
    listComplianceRecords()
  ]);

  const laborProviderCount = vendors.filter((vendor) => vendor.isLaborProvider).length;
  const activeCount = vendors.filter((vendor) => vendor.isActive).length;
  const linkedPeopleByVendorId = new Map<string, number>();
  const complianceCountByVendorId = new Map<string, number>();

  for (const person of people) {
    if (!person.vendorId) {
      continue;
    }

    linkedPeopleByVendorId.set(
      person.vendorId,
      (linkedPeopleByVendorId.get(person.vendorId) ?? 0) + 1
    );
  }

  for (const record of complianceRecords) {
    if (record.subjectType !== "vendor") {
      continue;
    }

    complianceCountByVendorId.set(
      record.subjectId,
      (complianceCountByVendorId.get(record.subjectId) ?? 0) + 1
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Vendors
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            External companies for {organizationContext.organization.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Manage subcontractors and supplier companies on the shared vendor foundation so workforce, compliance, and future external operations all stay connected.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Total vendors</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {vendors.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Labor providers</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {laborProviderCount}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Active vendors</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {activeCount}
              </p>
            </div>
          </div>
        </section>

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

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_180px_220px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
              <span>Vendor</span>
              <span>Type</span>
              <span className="text-right">Linked workforce</span>
            </div>
            <div className="md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Vendor records
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_180px_220px] md:items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {vendor.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {vendor.primaryContactName ?? vendor.email ?? "No contact added yet"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {vendor.city || vendor.stateRegion
                          ? [vendor.city, vendor.stateRegion].filter(Boolean).join(", ")
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
                        {vendor.isLaborProvider ? "Labor provider" : "Company only"}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Operational context
                      </p>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {linkedPeopleByVendorId.get(vendor.id) ?? 0} worker
                        {(linkedPeopleByVendorId.get(vendor.id) ?? 0) === 1 ? "" : "s"}
                      </span>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {complianceCountByVendorId.get(vendor.id) ?? 0} compliance record
                        {(complianceCountByVendorId.get(vendor.id) ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No vendors yet"
                  title="Create the first vendor"
                  description="Vendor companies anchor subcontract labor and external compliance without creating a separate subcontractor-only silo."
                />
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          New Vendor
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add a subcontractor or supplier company inside the active organization.
        </p>
        <div className="mt-6">
          <VendorForm
            action={createVendorAction}
            submitLabel="Create vendor"
            pendingLabel="Creating vendor..."
          />
        </div>
      </aside>
    </div>
  );
}
