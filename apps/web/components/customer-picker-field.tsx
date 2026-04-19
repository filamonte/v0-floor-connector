"use client";

import { useId, useMemo, useState } from "react";

import type { Customer } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";

type CustomerPickerFieldProps = {
  customers: Customer[];
  initialCustomerId?: string | null;
  allowCreate?: boolean;
  required?: boolean;
};

function formatCustomerTitle(customer: Customer) {
  return customer.companyName ? `${customer.name} - ${customer.companyName}` : customer.name;
}

function formatCustomerMeta(customer: Customer) {
  const parts = [customer.email, customer.phone].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : "Canonical customer record";
}

export function CustomerPickerField({
  customers,
  initialCustomerId,
  allowCreate = false,
  required = false
}: CustomerPickerFieldProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectionKind, setSelectionKind] = useState<"existing" | "new" | null>(() => {
    return initialCustomerId ? "existing" : null;
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId ?? "");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: ""
  });

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.companyName, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch))
    );
  }, [customers, searchTerm]);

  const selectedCustomer =
    selectionKind === "existing"
      ? customers.find((customer) => customer.id === selectedCustomerId) ?? null
      : null;

  let buttonTitle = "Choose a customer";
  let buttonMeta = "Search existing customers or create a new one from the same control.";

  if (selectedCustomer) {
    buttonTitle = formatCustomerTitle(selectedCustomer);
    buttonMeta = formatCustomerMeta(selectedCustomer);
  } else if (selectionKind === "new") {
    buttonTitle = draftCustomer.name.trim() || "New customer draft";
    buttonMeta =
      draftCustomer.companyName.trim() ||
      "A new canonical customer will be created and linked to this project.";
  }

  return (
    <div className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="block text-sm font-medium text-slate-800">Customer</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {selectionKind === "new" ? "New" : selectedCustomer ? "Selected" : "Required"}
        </span>
      </div>

      <input
        type="hidden"
        name="customerId"
        value={selectionKind === "existing" ? selectedCustomerId : ""}
      />
      <input
        type="hidden"
        name="newCustomerName"
        value={selectionKind === "new" ? draftCustomer.name : ""}
      />
      <input
        type="hidden"
        name="newCustomerCompanyName"
        value={selectionKind === "new" ? draftCustomer.companyName : ""}
      />
      <input
        type="hidden"
        name="newCustomerEmail"
        value={selectionKind === "new" ? draftCustomer.email : ""}
      />
      <input
        type="hidden"
        name="newCustomerPhone"
        value={selectionKind === "new" ? draftCustomer.phone : ""}
      />

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full rounded-[1.75rem] border border-slate-300 bg-white px-4 py-4 text-left shadow-sm transition hover:border-slate-400 focus:border-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{buttonTitle}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{buttonMeta}</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            {isOpen ? "Close" : "Change"}
          </span>
        </div>
      </button>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {required
          ? "Projects must stay linked to one canonical customer record in this organization."
          : "Project updates stay linked to the same canonical customer record."}
      </p>

      {isOpen ? (
        <div
          id={panelId}
          className="mt-4 space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]"
        >
          {allowCreate ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectionKind("existing");
                  setIsCreatingNew(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !isCreatingNew
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950"
                }`}
              >
                Find existing customer
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionKind("new");
                  setSelectedCustomerId("");
                  setIsCreatingNew(true);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isCreatingNew
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950"
                }`}
              >
                Create new customer
              </button>
            </div>
          ) : null}

          {isCreatingNew ? (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                This new customer draft will be created on the canonical customer model when you save the project.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AuthField
                  label="Customer name"
                  name={`${panelId}-draft-name`}
                  value={draftCustomer.name}
                  onChange={(event) =>
                    setDraftCustomer((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Smith Residence"
                  hint="Required for a new customer."
                />
                <AuthField
                  label="Company name"
                  name={`${panelId}-draft-company`}
                  value={draftCustomer.companyName}
                  onChange={(event) =>
                    setDraftCustomer((current) => ({
                      ...current,
                      companyName: event.target.value
                    }))
                  }
                  placeholder="Smith Family"
                />
                <AuthField
                  label="Email"
                  name={`${panelId}-draft-email`}
                  type="email"
                  value={draftCustomer.email}
                  onChange={(event) =>
                    setDraftCustomer((current) => ({
                      ...current,
                      email: event.target.value
                    }))
                  }
                  placeholder="customer@example.com"
                />
                <AuthField
                  label="Phone"
                  name={`${panelId}-draft-phone`}
                  type="tel"
                  value={draftCustomer.phone}
                  onChange={(event) =>
                    setDraftCustomer((current) => ({
                      ...current,
                      phone: event.target.value
                    }))
                  }
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AuthField
                label="Search customers"
                name={`${panelId}-search`}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, company, email, or phone"
                autoComplete="off"
              />

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const isSelected =
                      selectionKind === "existing" && selectedCustomerId === customer.id;

                    return (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectionKind("existing");
                          setSelectedCustomerId(customer.id);
                          setIsCreatingNew(false);
                          setIsOpen(false);
                        }}
                        className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-brand-300 bg-brand-50/80 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-950">
                          {formatCustomerTitle(customer)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {formatCustomerMeta(customer)}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-4 py-6 text-sm leading-6 text-slate-500">
                    No matching customers found. Use create new customer to keep the project moving.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
