import type { EquipmentAsset } from "@floorconnector/types";
import type { ReactNode } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import type { EquipmentVendorOption } from "@/lib/equipment/data";
import {
  equipmentOperationalStatusesList,
  equipmentOwnershipStatusesList,
  equipmentTypesList
} from "@/lib/equipment/schemas";

type EquipmentAssetFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  asset?: EquipmentAsset | null;
  vendorOptions: EquipmentVendorOption[];
};

const equipmentTypeLabels: Record<string, string> = {
  grinder: "Grinder",
  polisher: "Polisher",
  vacuum: "Vacuum",
  dust_collector: "Dust collector",
  shot_blaster: "Shot blaster",
  scarifier: "Scarifier",
  scraper: "Floor scraper",
  mixer: "Mixer",
  sprayer: "Sprayer",
  trailer: "Trailer",
  truck: "Truck",
  generator: "Generator",
  moisture_meter: "Moisture meter",
  testing_tool: "Testing tool",
  coating_tool: "Coating tool",
  burnisher: "Burnisher",
  hand_tool: "Hand tool",
  kit: "Kit",
  other: "Other"
};

const ownershipStatusLabels: Record<string, string> = {
  owned: "Owned",
  rented: "Rented",
  leased: "Leased",
  subcontractor_owned: "Subcontractor owned",
  other: "Other"
};

const operationalStatusLabels: Record<string, string> = {
  available: "Available",
  assigned: "Assigned",
  in_use: "In use",
  maintenance: "Maintenance",
  out_of_service: "Out of service",
  retired: "Retired"
};

function getValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function SelectField({
  name,
  label,
  defaultValue,
  children
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-[6px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32] focus:ring-4 focus:ring-[#f3d4bd]"
      >
        {children}
      </select>
    </label>
  );
}

export function EquipmentAssetForm({
  action,
  submitLabel,
  pendingLabel,
  asset,
  vendorOptions
}: EquipmentAssetFormProps) {
  return (
    <form action={action} className="space-y-5">
      {asset ? (
        <input type="hidden" name="equipmentAssetId" value={asset.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Equipment name"
          name="name"
          defaultValue={asset?.name ?? ""}
          placeholder="Husqvarna PG 820 grinder"
          required
        />
        <AuthField
          label="Asset tag"
          name="assetTag"
          defaultValue={getValue(asset?.assetTag)}
          placeholder="GR-001"
        />
        <SelectField
          name="equipmentType"
          label="Equipment type"
          defaultValue={asset?.equipmentType ?? "other"}
        >
          {equipmentTypesList.map((type) => (
            <option key={type} value={type}>
              {equipmentTypeLabels[type] ?? type}
            </option>
          ))}
        </SelectField>
        <SelectField
          name="operationalStatus"
          label="Operational status"
          defaultValue={asset?.operationalStatus ?? "available"}
        >
          {equipmentOperationalStatusesList.map((status) => (
            <option key={status} value={status}>
              {operationalStatusLabels[status] ?? status}
            </option>
          ))}
        </SelectField>
        <SelectField
          name="ownershipStatus"
          label="Ownership"
          defaultValue={asset?.ownershipStatus ?? "owned"}
        >
          {equipmentOwnershipStatusesList.map((status) => (
            <option key={status} value={status}>
              {ownershipStatusLabels[status] ?? status}
            </option>
          ))}
        </SelectField>
        <SelectField
          name="vendorId"
          label="Vendor / rental source"
          defaultValue={asset?.vendorId ?? ""}
        >
          <option value="">No linked vendor</option>
          {vendorOptions.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
              {vendor.isActive ? "" : " (inactive)"}
            </option>
          ))}
        </SelectField>
        <AuthField
          label="Manufacturer"
          name="manufacturer"
          defaultValue={getValue(asset?.manufacturer)}
          placeholder="Husqvarna"
        />
        <AuthField
          label="Model"
          name="model"
          defaultValue={getValue(asset?.model)}
          placeholder="PG 820"
        />
        <AuthField
          label="Serial number"
          name="serialNumber"
          defaultValue={getValue(asset?.serialNumber)}
          placeholder="Optional serial number"
        />
        <AuthField
          label="Year"
          name="year"
          type="number"
          defaultValue={getValue(asset?.year)}
          placeholder="2024"
        />
        <AuthField
          label="Purchase date"
          name="purchaseDate"
          type="date"
          defaultValue={getValue(asset?.purchaseDate)}
        />
        <AuthField
          label="Purchase cost"
          name="purchaseCost"
          type="number"
          step="0.01"
          min="0"
          defaultValue={getValue(asset?.purchaseCost)}
          placeholder="0.00"
        />
        <AuthField
          label="Rental start"
          name="rentalStartDate"
          type="date"
          defaultValue={getValue(asset?.rentalStartDate)}
        />
        <AuthField
          label="Rental end"
          name="rentalEndDate"
          type="date"
          defaultValue={getValue(asset?.rentalEndDate)}
        />
      </div>

      <section className="rounded-[6px] border border-[#d6d6d6] bg-[#f8f8f8] p-5 sm:p-6">
        <label className="flex items-start gap-3 rounded-[6px] border border-[#e5e5e5] bg-white px-4 py-4">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={asset?.isActive ?? true}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#b86a2c] focus:ring-[#f3d4bd]"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Active asset
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Inactive equipment stays in the registry for history but should
              not be treated as current operating capacity.
            </span>
          </span>
        </label>
      </section>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(asset?.notes)}
          rows={5}
          className="w-full rounded-[6px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32] focus:ring-4 focus:ring-[#f3d4bd]"
          placeholder="Optional internal notes about this equipment asset"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton
          pendingLabel={pendingLabel}
          className="sm:min-w-[220px]"
        >
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          This registry creates the canonical asset spine only. Assignment,
          maintenance, readiness, utilization, and costing remain planned
          slices.
        </p>
      </div>
    </form>
  );
}
