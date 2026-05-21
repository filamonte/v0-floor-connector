import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  addFloorSystemTemplateComponentAction,
  archiveFinishProductAction,
  archiveFloorSystemTemplateAction,
  saveFinishProductAction,
  saveFloorSystemTemplateAction,
  saveFloorSystemTemplateComponentsAction
} from "@/lib/system-layers/actions";
import {
  componentRoleOptions,
  finishFamilyOptions,
  formatSystemLayerOption,
  quantityBasisOptions,
  serviceFamilyOptions,
  systemLayerStatuses
} from "@/lib/system-layers/constants";
import {
  getSystemLayersAdminData,
  type FinishProduct,
  type FloorSystemTemplate,
  type FloorSystemTemplateComponent
} from "@/lib/system-layers/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const returnPath = "/settings/system-layers";

function StatusSelect({
  name,
  defaultValue
}: {
  name: string;
  defaultValue: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#171717]"
    >
      {systemLayerStatuses.map((status) => (
        <option key={status} value={status}>
          {formatSystemLayerOption(status)}
        </option>
      ))}
    </select>
  );
}

function ServiceFamilySelect({
  name,
  defaultValue,
  required = true
}: {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#171717]"
    >
      {!required ? <option value="">None</option> : null}
      {serviceFamilyOptions.map((family) => (
        <option key={family} value={family}>
          {formatSystemLayerOption(family)}
        </option>
      ))}
    </select>
  );
}

function FinishFamilySelect({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#171717]"
    >
      <option value="">None</option>
      {finishFamilyOptions.map((family) => (
        <option key={family} value={family}>
          {formatSystemLayerOption(family)}
        </option>
      ))}
    </select>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#171717]"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#171717]"
      />
    </label>
  );
}

function SaveButton({ children = "Save" }: { children?: string }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children }: { children: string }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function FinishProductForm({ product }: { product?: FinishProduct }) {
  return (
    <form action={saveFinishProductAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnPath} />
      <input type="hidden" name="finishProductId" value={product?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Manufacturer"
          name="manufacturerName"
          defaultValue={product?.manufacturerName}
          required
        />
        <Field
          label="Product name"
          name="productName"
          defaultValue={product?.productName}
          required
        />
        <Field label="Product line" name="productLine" defaultValue={product?.productLine} />
        <Field label="Product code" name="productCode" defaultValue={product?.productCode} />
        <Field label="SKU" name="sku" defaultValue={product?.sku} />
        <Field
          label="Display color"
          name="displayColorName"
          defaultValue={product?.displayColorName}
        />
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Service family
          </span>
          <ServiceFamilySelect
            name="serviceFamily"
            defaultValue={product?.serviceFamily}
            required={false}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Finish family
          </span>
          <FinishFamilySelect name="finishFamily" defaultValue={product?.finishFamily} />
        </label>
        {product ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Status
            </span>
            <StatusSelect name="status" defaultValue={product.status} />
          </label>
        ) : (
          <input type="hidden" name="status" value="draft" />
        )}
      </div>
      <TextAreaField
        label="Customer-facing description"
        name="customerFacingDescription"
        defaultValue={product?.customerFacingDescription}
      />
      <TextAreaField
        label="Technical notes"
        name="technicalNotes"
        defaultValue={product?.technicalNotes}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Finish products are proof/spec metadata only. Pricing and cost stay on Catalog Items.
        </p>
        <SaveButton>{product ? "Save product" : "Create product"}</SaveButton>
      </div>
    </form>
  );
}

function TemplateForm({ template }: { template?: FloorSystemTemplate }) {
  return (
    <form action={saveFloorSystemTemplateAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnPath} />
      <input type="hidden" name="templateId" value={template?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Template name" name="name" defaultValue={template?.name} required />
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Service family
          </span>
          <ServiceFamilySelect name="serviceFamily" defaultValue={template?.serviceFamily} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Finish family
          </span>
          <FinishFamilySelect name="finishFamily" defaultValue={template?.finishFamily} />
        </label>
        {template ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Status
            </span>
            <StatusSelect name="status" defaultValue={template.status} />
          </label>
        ) : (
          <input type="hidden" name="status" value="draft" />
        )}
      </div>
      <TextAreaField
        label="Customer-facing description"
        name="customerFacingDescription"
        defaultValue={template?.customerFacingDescription}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <TextAreaField
          label="Internal notes"
          name="internalNotes"
          defaultValue={template?.internalNotes}
        />
        <TextAreaField
          label="Prep requirements"
          name="prepRequirements"
          defaultValue={template?.prepRequirements}
        />
        <TextAreaField
          label="Technical notes"
          name="technicalNotes"
          defaultValue={template?.technicalNotes}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Structural changes to families or components increment the template version.
        </p>
        <SaveButton>{template ? "Save template" : "Create template"}</SaveButton>
      </div>
    </form>
  );
}

function ComponentsEditor({
  template,
  components,
  catalogItems,
  finishProducts
}: {
  template: FloorSystemTemplate;
  components: FloorSystemTemplateComponent[];
  catalogItems: Array<{
    id: string;
    name: string;
    itemType: string;
    unit: string;
    status: string;
  }>;
  finishProducts: FinishProduct[];
}) {
  const activeCatalogItems = catalogItems.filter((item) => item.status === "active");
  const availableFinishProducts = finishProducts.filter(
    (product) => product.status !== "archived"
  );

  return (
    <div className="space-y-4">
      <form action={saveFloorSystemTemplateComponentsAction} className="space-y-3">
        <input type="hidden" name="returnTo" value={returnPath} />
        <input type="hidden" name="templateId" value={template.id} />
        {components.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 bg-white">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Catalog item</th>
                  <th className="px-3 py-2">Finish proof</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Basis</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Optional</th>
                  <th className="px-3 py-2">Remove</th>
                </tr>
              </thead>
              <tbody>
                {components.map((component) => (
                  <tr key={component.id} className="border-b border-slate-100 text-sm">
                    <td className="px-3 py-2 align-top">
                      <input type="hidden" name="componentId" value={component.id} />
                      <input
                        name="sortOrder"
                        type="number"
                        min="0"
                        defaultValue={component.sortOrder}
                        className="w-20 rounded-[4px] border border-[#d6d6d6] px-2 py-1.5"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        name="componentCatalogItemId"
                        defaultValue={component.catalogItemId}
                        required
                        className="w-56 rounded-[4px] border border-[#d6d6d6] bg-white px-2 py-1.5"
                      >
                        {activeCatalogItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        name="customerFacingLabel"
                        placeholder="Customer label"
                        defaultValue={component.customerFacingLabel ?? ""}
                        className="mt-2 w-56 rounded-[4px] border border-[#d6d6d6] px-2 py-1.5"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        name="componentFinishProductId"
                        defaultValue={component.finishProductId ?? ""}
                        className="w-48 rounded-[4px] border border-[#d6d6d6] bg-white px-2 py-1.5"
                      >
                        <option value="">None</option>
                        {availableFinishProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        name="componentRole"
                        defaultValue={component.componentRole}
                        className="w-36 rounded-[4px] border border-[#d6d6d6] bg-white px-2 py-1.5"
                      >
                        {componentRoleOptions.map((role) => (
                          <option key={role} value={role}>
                            {formatSystemLayerOption(role)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        name="quantityBasis"
                        defaultValue={component.quantityBasis}
                        className="w-32 rounded-[4px] border border-[#d6d6d6] bg-white px-2 py-1.5"
                      >
                        {quantityBasisOptions.map((basis) => (
                          <option key={basis} value={basis}>
                            {formatSystemLayerOption(basis)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        name="defaultQuantity"
                        type="number"
                        min="0"
                        step="0.0001"
                        defaultValue={component.defaultQuantity ?? ""}
                        className="w-28 rounded-[4px] border border-[#d6d6d6] px-2 py-1.5"
                      />
                      <textarea
                        name="formulaMetadata"
                        defaultValue={JSON.stringify(component.formulaMetadata)}
                        rows={2}
                        className="mt-2 w-36 rounded-[4px] border border-[#d6d6d6] px-2 py-1.5 text-xs"
                      />
                      <textarea
                        name="internalNotes"
                        placeholder="Internal notes"
                        defaultValue={component.internalNotes ?? ""}
                        rows={2}
                        className="mt-2 w-36 rounded-[4px] border border-[#d6d6d6] px-2 py-1.5 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="checkbox"
                        name={`isOptional.${component.id}`}
                        defaultChecked={component.isOptional}
                        className="h-4 w-4 rounded border-slate-300 text-brand-700"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          name="removeComponentId"
                          value={component.id}
                          className="h-4 w-4 rounded border-slate-300 text-rose-700"
                        />
                        remove
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
            No components yet. Add the first required catalog-backed component below.
          </div>
        )}
        {components.length > 0 ? <SaveButton>Save component order</SaveButton> : null}
      </form>

      <form
        action={addFloorSystemTemplateComponentAction}
        className="grid gap-3 border border-dashed border-slate-300 bg-slate-50 px-4 py-4 md:grid-cols-4"
      >
        <input type="hidden" name="returnTo" value={returnPath} />
        <input type="hidden" name="templateId" value={template.id} />
        <select
          name="catalogItemId"
          required
          className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm"
        >
          <option value="">Catalog item</option>
          {activeCatalogItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
        <select
          name="finishProductId"
          className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm"
        >
          <option value="">Finish proof</option>
          {availableFinishProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.productName}
            </option>
          ))}
        </select>
        <select
          name="componentRole"
          defaultValue="standard"
          className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm"
        >
          {componentRoleOptions.map((role) => (
            <option key={role} value={role}>
              {formatSystemLayerOption(role)}
            </option>
          ))}
        </select>
        <select
          name="quantityBasis"
          defaultValue="sqft"
          className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm"
        >
          {quantityBasisOptions.map((basis) => (
            <option key={basis} value={basis}>
              {formatSystemLayerOption(basis)}
            </option>
          ))}
        </select>
        <input
          name="defaultQuantity"
          type="number"
          min="0"
          step="0.0001"
          placeholder="Default quantity"
          className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm"
        />
        <input
          name="customerFacingLabel"
          placeholder="Customer label"
          className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm"
        />
        <input type="hidden" name="formulaMetadata" value="{}" />
        <input type="hidden" name="internalNotes" value="" />
        <label className="flex items-center gap-2 rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input type="checkbox" name="isOptional" className="h-4 w-4 rounded" />
          Optional
        </label>
        <SaveButton>Add component</SaveButton>
      </form>
    </div>
  );
}

export default async function SystemLayersSettingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getSystemLayersAdminData(returnPath);
  const componentsByTemplate = new Map<string, FloorSystemTemplateComponent[]>();

  for (const component of data.components) {
    const existing = componentsByTemplate.get(component.templateId) ?? [];
    existing.push(component);
    componentsByTemplate.set(component.templateId, existing);
  }

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="System Layers"
        title="Finish Products"
        description="Manage manufacturer and finish proof metadata. These records are intentionally not a cost, price, or estimate item source."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {data.finishProducts.map((product) => (
              <details key={product.id} className="border border-slate-200 bg-white">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    <span className="font-semibold text-slate-950">
                      {product.manufacturerName} - {product.productName}
                    </span>
                    <span className="ml-2 text-slate-500">
                      {formatSystemLayerOption(product.status)}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatSystemLayerOption(product.finishFamily)}
                  </span>
                </summary>
                <div className="border-t border-slate-200 p-4">
                  <FinishProductForm product={product} />
                  {product.status === "retired" ? (
                    <form action={archiveFinishProductAction} className="mt-3">
                      <input type="hidden" name="returnTo" value={returnPath} />
                      <input type="hidden" name="finishProductId" value={product.id} />
                      <SecondaryButton>Archive product</SecondaryButton>
                    </form>
                  ) : null}
                </div>
              </details>
            ))}
            {data.finishProducts.length === 0 ? (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
                No finish products exist yet.
              </div>
            ) : null}
          </div>
          <div className="border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="mb-4 text-sm font-semibold text-slate-950">
              Add finish product
            </p>
            <FinishProductForm />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="System Layers"
        title="Floor System Templates"
        description="Create and maintain reusable floor system blueprints. Components are catalog-backed and optional finish products provide proof metadata only."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {data.templates.map((template) => {
              const components = componentsByTemplate.get(template.id) ?? [];

              return (
                <details key={template.id} className="border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span>
                      <span className="font-semibold text-slate-950">{template.name}</span>
                      <span className="ml-2 text-slate-500">
                        v{template.templateVersion} - {formatSystemLayerOption(template.status)}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500">
                      {components.length} component{components.length === 1 ? "" : "s"}
                    </span>
                  </summary>
                  <div className="space-y-5 border-t border-slate-200 p-4">
                    <TemplateForm template={template} />
                    {template.status === "retired" ? (
                      <form action={archiveFloorSystemTemplateAction}>
                        <input type="hidden" name="returnTo" value={returnPath} />
                        <input type="hidden" name="templateId" value={template.id} />
                        <SecondaryButton>Archive template</SecondaryButton>
                      </form>
                    ) : null}
                    <div className="border-t border-slate-200 pt-5">
                      <p className="mb-3 text-sm font-semibold text-slate-950">
                        Components
                      </p>
                      <ComponentsEditor
                        template={template}
                        components={components}
                        catalogItems={data.catalogItems}
                        finishProducts={data.finishProducts}
                      />
                    </div>
                  </div>
                </details>
              );
            })}
            {data.templates.length === 0 ? (
              <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
                No floor system templates exist yet.
              </div>
            ) : null}
          </div>
          <div className="border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="mb-4 text-sm font-semibold text-slate-950">
              Add floor system template
            </p>
            <TemplateForm />
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
