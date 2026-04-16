"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";

type ProjectOption = {
  id: string;
  name: string;
  customerId: string;
  customerName: string | null;
};

type LineItem = {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

type CreateEstimateFormProps = {
  action: (formData: FormData) => Promise<void>;
  projects: ProjectOption[];
  initialProjectId?: string | null;
};

const STEPS = [
  { id: 1, name: "Project", description: "Select project" },
  { id: 2, name: "Line Items", description: "Add work items" },
  { id: 3, name: "Review", description: "Finalize estimate" }
];

function createLineItem(id: string): LineItem {
  return {
    id,
    name: "",
    description: "",
    quantity: "1.00",
    unit: "each",
    unitPrice: "0.00"
  };
}

function parseAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export function CreateEstimateForm({
  action,
  projects,
  initialProjectId
}: CreateEstimateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const nextId = useRef(1);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "");
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem("line-0")]);
  const [taxAmount, setTaxAmount] = useState("0.00");
  const [discountAmount, setDiscountAmount] = useState("0.00");
  const [notes, setNotes] = useState("");

  // Computed values
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const subtotal = useMemo(
    () =>
      lineItems.reduce(
        (sum, item) => sum + parseAmount(item.quantity) * parseAmount(item.unitPrice),
        0
      ),
    [lineItems]
  );

  const total = Math.max(
    0,
    subtotal + parseAmount(taxAmount) - parseAmount(discountAmount)
  );

  // Validation
  const canProceedFromStep1 = selectedProjectId !== "";
  const canProceedFromStep2 =
    lineItems.length > 0 &&
    lineItems.every((item) => item.name.trim() !== "" && parseAmount(item.unitPrice) >= 0);

  // Line item management
  function updateLineItem(id: string, field: keyof Omit<LineItem, "id">, value: string) {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function addLineItem() {
    setLineItems((current) => [...current, createLineItem(`line-${nextId.current++}`)]);
  }

  function removeLineItem(id: string) {
    setLineItems((current) =>
      current.length > 1 ? current.filter((item) => item.id !== id) : current
    );
  }

  function duplicateLineItem(id: string) {
    const itemToDuplicate = lineItems.find((item) => item.id === id);
    if (itemToDuplicate) {
      setLineItems((current) => [
        ...current,
        { ...itemToDuplicate, id: `line-${nextId.current++}` }
      ]);
    }
  }

  // Navigation
  function goToStep(step: number) {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === 2 && canProceedFromStep1) {
      setCurrentStep(2);
    } else if (step === 3 && canProceedFromStep1 && canProceedFromStep2) {
      setCurrentStep(3);
    }
  }

  function handleNext() {
    if (currentStep === 1 && canProceedFromStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromStep2) {
      setCurrentStep(3);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  // Form submission
  async function handleSubmit(asDraft: boolean) {
    const formData = new FormData();
    formData.append("projectId", selectedProjectId);
    formData.append("status", asDraft ? "draft" : "sent");
    formData.append("taxAmount", taxAmount);
    formData.append("discountAmount", discountAmount);
    formData.append("notes", notes);

    lineItems.forEach((item) => {
      formData.append("lineItemName", item.name);
      formData.append("lineItemDescription", item.description);
      formData.append("lineItemQuantity", item.quantity);
      formData.append("lineItemUnit", item.unit);
      formData.append("lineItemUnitPrice", item.unitPrice);
    });

    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main Form */}
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="rounded-xl border border-[--line] bg-[--surface] p-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                    currentStep === step.id
                      ? "bg-white/10 text-white"
                      : currentStep > step.id
                        ? "text-[--accent] hover:bg-white/5"
                        : "text-[--muted]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      currentStep === step.id
                        ? "bg-white text-black"
                        : currentStep > step.id
                          ? "bg-[--accent] text-black"
                          : "bg-[--surface-strong] text-[--muted]"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </span>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-[--muted]">{step.description}</p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className="mx-4 hidden h-px w-12 bg-[--line] lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-[--line] bg-[--surface]">
          {/* Step 1: Project Selection */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white">Select Project</h2>
              <p className="mt-1 text-sm text-[--muted]">
                Choose the project this estimate will be associated with
              </p>

              <div className="mt-6 space-y-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedProjectId === project.id
                        ? "border-[--accent] bg-[--accent-soft]"
                        : "border-[--line] bg-[--background] hover:border-[--line-strong]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        {project.customerName && (
                          <p className="mt-1 text-sm text-[--muted]">
                            Customer: {project.customerName}
                          </p>
                        )}
                      </div>
                      {selectedProjectId === project.id && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--accent]">
                          <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Line Items */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Line Items</h2>
                  <p className="mt-1 text-sm text-[--muted]">
                    Add the work items for this estimate
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="inline-flex items-center gap-2 rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm font-medium text-white transition hover:bg-[--surface-strong]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {lineItems.map((item, index) => {
                  const lineTotal = parseAmount(item.quantity) * parseAmount(item.unitPrice);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[--line] bg-[--background] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-[--muted]">
                          Item {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {formatMoney(lineTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => duplicateLineItem(item.id)}
                            className="rounded p-1 text-[--muted] transition hover:bg-[--surface] hover:text-white"
                            title="Duplicate"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              className="rounded p-1 text-red-400 transition hover:bg-red-500/10"
                              title="Remove"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-[--muted]">
                            Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                            placeholder="e.g., Epoxy floor coating"
                            className="mt-1 w-full rounded-lg border border-[--line] bg-[--surface] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-[--muted]">
                            Description (optional)
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                            placeholder="Additional details..."
                            rows={2}
                            className="mt-1 w-full rounded-lg border border-[--line] bg-[--surface] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[--muted]">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[--line] bg-[--surface] px-3 py-2 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[--muted]">
                            Unit
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateLineItem(item.id, "unit", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[--line] bg-[--surface] px-3 py-2 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                          >
                            <option value="each">Each</option>
                            <option value="sqft">Sq Ft</option>
                            <option value="lnft">Ln Ft</option>
                            <option value="hour">Hour</option>
                            <option value="day">Day</option>
                            <option value="gallon">Gallon</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-[--muted]">
                            Unit Price
                          </label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]">
                              $
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                              className="w-full rounded-lg border border-[--line] bg-[--surface] py-2 pl-7 pr-3 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Review & Finalize */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white">Review & Finalize</h2>
              <p className="mt-1 text-sm text-[--muted]">
                Review your estimate and add any final adjustments
              </p>

              {/* Project Summary */}
              <div className="mt-6 rounded-xl border border-[--line] bg-[--background] p-4">
                <h3 className="text-sm font-medium text-[--muted]">Project</h3>
                <p className="mt-1 font-medium text-white">{selectedProject?.name}</p>
                {selectedProject?.customerName && (
                  <p className="text-sm text-[--muted]">
                    Customer: {selectedProject.customerName}
                  </p>
                )}
              </div>

              {/* Line Items Summary */}
              <div className="mt-4 rounded-xl border border-[--line] bg-[--background] p-4">
                <h3 className="text-sm font-medium text-[--muted]">Line Items</h3>
                <div className="mt-3 divide-y divide-[--line]">
                  {lineItems.map((item) => {
                    const lineTotal = parseAmount(item.quantity) * parseAmount(item.unitPrice);
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-[--muted]">
                            {item.quantity} {item.unit} × {formatMoney(parseAmount(item.unitPrice))}
                          </p>
                        </div>
                        <p className="text-sm font-medium tabular-nums text-white">
                          {formatMoney(lineTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tax & Discount */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[--muted]">
                    Tax
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="w-full rounded-lg border border-[--line] bg-[--background] py-2 pl-7 pr-3 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[--muted]">
                    Discount
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full rounded-lg border border-[--line] bg-[--background] py-2 pl-7 pr-3 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-[--muted]">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes or terms..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-[--line] px-6 py-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[--muted] transition hover:text-white disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                Continue
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-[--line] bg-[--background] px-4 py-2 text-sm font-medium text-white transition hover:bg-[--surface-strong] disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[--muted] border-t-white" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-[--accent] px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Send Estimate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Summary Sidebar */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-[--line] bg-[--surface] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[--muted]">
            Estimate Summary
          </h3>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--muted]">Subtotal</span>
              <span className="tabular-nums text-white">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--muted]">Tax</span>
              <span className="tabular-nums text-white">
                {formatMoney(parseAmount(taxAmount))}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--muted]">Discount</span>
              <span className="tabular-nums text-red-400">
                -{formatMoney(parseAmount(discountAmount))}
              </span>
            </div>
            <div className="h-px bg-[--line]" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">Total</span>
              <span className="text-2xl font-bold tabular-nums text-white">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          {selectedProject && (
            <div className="mt-6 rounded-lg border border-[--line] bg-[--background] p-3">
              <p className="text-xs font-medium text-[--muted]">Project</p>
              <p className="mt-1 text-sm font-medium text-white">{selectedProject.name}</p>
              {selectedProject.customerName && (
                <p className="text-xs text-[--muted]">{selectedProject.customerName}</p>
              )}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-[--line] bg-[--background] p-3">
            <p className="text-xs font-medium text-[--muted]">Line Items</p>
            <p className="mt-1 text-2xl font-bold text-white">{lineItems.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
