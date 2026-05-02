"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import type {
  OpportunityMeasurement,
  OpportunityObservation
} from "@floorconnector/types";

type MeasurementRow = {
  areaLabel: string;
  measurementType: string;
  valueNumeric: string;
  unit: string;
  quantity: string;
  captureMethod: string;
  notes: string;
};

type ObservationRow = {
  observationType: string;
  title: string;
  body: string;
  severity: string;
};

type OpportunityStructuredIntakeFieldsProps = {
  measurements?: OpportunityMeasurement[];
  observations?: OpportunityObservation[];
};

const measurementTypeOptions = [
  { value: "area", label: "Area", unit: "sqft" },
  { value: "linear", label: "Linear", unit: "lf" },
  { value: "count", label: "Count", unit: "ea" }
] as const;

const observationTypeOptions = [
  { value: "general", label: "General" },
  { value: "existing_floor", label: "Existing Floor" },
  { value: "removal", label: "Removal" },
  { value: "crack_repair", label: "Crack Repair" },
  { value: "control_joints", label: "Control Joints" },
  { value: "moisture_concern", label: "Moisture Concern" },
  { value: "oil_contamination", label: "Oil / Contamination" },
  { value: "access_logistics", label: "Access / Logistics" },
  { value: "cove_base", label: "Cove Base" },
  { value: "other", label: "Other" }
] as const;

const severityOptions = [
  { value: "", label: "Not specified" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" }
] as const;

const captureMethodOptions = [
  { value: "", label: "Not specified" },
  { value: "manual", label: "Manual" },
  { value: "onsite", label: "Onsite" },
  { value: "photo_derived", label: "Photo derived" },
  { value: "imported", label: "Imported" }
] as const;

function normalizeMeasurementType(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (
    normalized === "area" ||
    normalized === "sqft" ||
    normalized === "sq_ft" ||
    normalized === "square_footage" ||
    normalized === "square_feet"
  ) {
    return "area";
  }

  if (
    normalized === "linear" ||
    normalized === "lf" ||
    normalized === "linear_footage" ||
    normalized === "linear_feet"
  ) {
    return "linear";
  }

  if (
    normalized === "count" ||
    normalized === "ea" ||
    normalized === "each"
  ) {
    return "count";
  }

  return normalized;
}

function deriveMeasurementUnit(measurementType: string) {
  return (
    measurementTypeOptions.find((option) => option.value === measurementType)
      ?.unit ?? ""
  );
}

function buildMeasurementRows(
  measurements: OpportunityMeasurement[] | undefined
): MeasurementRow[] {
  const seeded =
    measurements?.map((measurement) => {
      const measurementType = normalizeMeasurementType(
        measurement.measurementType
      );

      return {
        areaLabel: measurement.areaLabel ?? "",
        measurementType,
        valueNumeric: measurement.valueNumeric,
        unit: deriveMeasurementUnit(measurementType) || measurement.unit,
        quantity:
          measurement.quantity === null ? "" : String(measurement.quantity),
        captureMethod: measurement.captureMethod ?? "",
        notes: measurement.notes ?? ""
      };
    }) ?? [];

  if (seeded.length > 0) {
    return seeded;
  }

  return [
    {
      areaLabel: "",
      measurementType: "area",
      valueNumeric: "",
      unit: "sqft",
      quantity: "",
      captureMethod: "",
      notes: ""
    }
  ];
}

function buildObservationRows(
  observations: OpportunityObservation[] | undefined
): ObservationRow[] {
  const seeded =
    observations?.map((observation) => ({
      observationType: observation.observationType,
      title: observation.title,
      body: observation.body ?? "",
      severity: observation.severity ?? ""
    })) ?? [];

  if (seeded.length > 0) {
    return seeded;
  }

  return [
    {
      observationType: "general",
      title: "",
      body: "",
      severity: ""
    }
  ];
}

function blankMeasurementRow(): MeasurementRow {
  return {
    areaLabel: "",
    measurementType: "area",
    valueNumeric: "",
    unit: "sqft",
    quantity: "",
    captureMethod: "",
    notes: ""
  };
}

function blankObservationRow(): ObservationRow {
  return {
    observationType: "general",
    title: "",
    body: "",
    severity: ""
  };
}

function formatUnitLabel(unit: string) {
  if (unit === "sqft") {
    return "sqft";
  }

  if (unit === "lf") {
    return "lf";
  }

  if (unit === "ea") {
    return "ea";
  }

  return "Select a measurement type";
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
      >
        {children}
      </select>
    </label>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
      />
    </label>
  );
}

export function OpportunityStructuredIntakeFields({
  measurements,
  observations
}: OpportunityStructuredIntakeFieldsProps) {
  const initialMeasurementRows = useMemo(
    () => buildMeasurementRows(measurements),
    [measurements]
  );
  const initialObservationRows = useMemo(
    () => buildObservationRows(observations),
    [observations]
  );
  const [measurementRows, setMeasurementRows] = useState(initialMeasurementRows);
  const [observationRows, setObservationRows] = useState(initialObservationRows);

  return (
    <>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
              Measurements
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Save one simple Room / Area block for each physical space measured
              during the site visit.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMeasurementRows((current) => [...current, blankMeasurementRow()])
            }
            className="inline-flex h-9 items-center justify-center border border-[#d8c5ae] bg-white px-3 text-sm font-medium text-[#6f4d2d] transition hover:border-[#d8731f] hover:text-[#2b2118]"
          >
            + Add Room / Area
          </button>
        </div>
        <div className="space-y-4">
          {measurementRows.map((measurement, index) => {
            const derivedUnit =
              deriveMeasurementUnit(measurement.measurementType) ||
              measurement.unit;

            return (
              <div
                key={`measurement-${index}`}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3"
              >
                <input
                  type="hidden"
                  name="measurementUnit"
                  value={derivedUnit}
                />
                <TextField
                  label="Room / Area"
                  name="measurementAreaLabel"
                  value={measurement.areaLabel}
                  onChange={(value) =>
                    setMeasurementRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, areaLabel: value } : row
                      )
                    )
                  }
                  placeholder="Garage, Warehouse Bay 1, Kitchen"
                />
                <SelectField
                  label="Measurement type"
                  name="measurementType"
                  value={measurement.measurementType}
                  onChange={(value) =>
                    setMeasurementRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? {
                              ...row,
                              measurementType: value,
                              unit: deriveMeasurementUnit(value)
                            }
                          : row
                      )
                    )
                  }
                >
                  {measurementTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Value"
                  name="measurementValue"
                  value={measurement.valueNumeric}
                  onChange={(value) =>
                    setMeasurementRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, valueNumeric: value }
                          : row
                      )
                    )
                  }
                  placeholder="1200"
                  type="number"
                />
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-600">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Unit
                  </span>
                  <span className="font-medium text-slate-950">
                    {formatUnitLabel(derivedUnit)}
                  </span>
                </div>
                <TextField
                  label="Quantity"
                  name="measurementQuantity"
                  value={measurement.quantity}
                  onChange={(value) =>
                    setMeasurementRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, quantity: value } : row
                      )
                    )
                  }
                  placeholder="1"
                  type="number"
                />
                <SelectField
                  label="Capture method"
                  name="measurementCaptureMethod"
                  value={measurement.captureMethod}
                  onChange={(value) =>
                    setMeasurementRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, captureMethod: value }
                          : row
                      )
                    )
                  }
                >
                  {captureMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <label className="block md:col-span-3">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Measurement notes
                  </span>
                  <textarea
                    name="measurementNotes"
                    value={measurement.notes}
                    onChange={(event) =>
                      setMeasurementRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, notes: event.target.value }
                            : row
                        )
                      )
                    }
                    rows={2}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    placeholder="Optional context for this room or area"
                  />
                </label>
                {measurementRows.length > 1 ? (
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={() =>
                        setMeasurementRows((current) =>
                          current.filter((_, rowIndex) => rowIndex !== index)
                        )
                      }
                      className="text-sm font-medium text-slate-500 transition hover:text-rose-700"
                    >
                      Remove Room / Area
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
              Observations
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Capture structured pre-sale observations for estimator review and
              later handoff.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setObservationRows((current) => [...current, blankObservationRow()])
            }
            className="inline-flex h-9 items-center justify-center border border-[#d8c5ae] bg-white px-3 text-sm font-medium text-[#6f4d2d] transition hover:border-[#d8731f] hover:text-[#2b2118]"
          >
            + Add observation
          </button>
        </div>
        <div className="space-y-4">
          {observationRows.map((observation, index) => {
            const hasUnknownObservationType =
              observation.observationType.length > 0 &&
              !observationTypeOptions.some(
                (option) => option.value === observation.observationType
              );

            return (
              <div
                key={`observation-${index}`}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2"
              >
                <SelectField
                  label="Observation type"
                  name="observationType"
                  value={observation.observationType}
                  onChange={(value) =>
                    setObservationRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, observationType: value }
                          : row
                      )
                    )
                  }
                >
                  {hasUnknownObservationType ? (
                    <option value={observation.observationType}>
                      {observation.observationType.replaceAll("_", " ")}
                    </option>
                  ) : null}
                  {observationTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Severity"
                  name="observationSeverity"
                  value={observation.severity}
                  onChange={(value) =>
                    setObservationRows((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, severity: value } : row
                      )
                    )
                  }
                >
                  {severityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <div className="md:col-span-2">
                  <TextField
                    label="Observation title"
                    name="observationTitle"
                    value={observation.title}
                    onChange={(value) =>
                      setObservationRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, title: value } : row
                        )
                      )
                    }
                    placeholder="Existing coating is peeling near north wall"
                  />
                </div>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Observation details
                  </span>
                  <textarea
                    name="observationBody"
                    value={observation.body}
                    onChange={(event) =>
                      setObservationRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, body: event.target.value }
                            : row
                        )
                      )
                    }
                    rows={3}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    placeholder="Describe the condition, risk, customer request, or estimator note"
                  />
                </label>
                {observationRows.length > 1 ? (
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() =>
                        setObservationRows((current) =>
                          current.filter((_, rowIndex) => rowIndex !== index)
                        )
                      }
                      className="text-sm font-medium text-slate-500 transition hover:text-rose-700"
                    >
                      Remove observation
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
