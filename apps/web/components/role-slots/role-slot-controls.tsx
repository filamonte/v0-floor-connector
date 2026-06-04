import type {
  RoleSlotKey,
  RoleSlotPersonOption
} from "@/lib/role-slots/read-model";
import {
  buildRoleSlotDisplay,
  roleSlotLabels
} from "@/lib/role-slots/read-model";

type RoleSlotControl = {
  role: RoleSlotKey;
  fieldName: string;
  personId: string | null;
  emptyLabel?: string;
  readOnly?: boolean;
};

export function RoleSlotControls({
  title,
  description,
  recordIdName,
  recordId,
  returnTo,
  action,
  people,
  controls,
  submitLabel = "Save role slots"
}: {
  title: string;
  description: string;
  recordIdName: string;
  recordId: string;
  returnTo: string;
  action?: (formData: FormData) => void | Promise<void>;
  people: RoleSlotPersonOption[];
  controls: RoleSlotControl[];
  submitLabel?: string;
}) {
  const hasEditableControls =
    Boolean(action) && controls.some((control) => !control.readOnly);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {hasEditableControls && action ? (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name={recordIdName} value={recordId} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="grid gap-4 sm:grid-cols-2">
            {controls.map((control) => (
              <RoleSlotControlField
                key={control.role}
                control={control}
                people={people}
              />
            ))}
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            {submitLabel}
          </button>
        </form>
      ) : (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {controls.map((control) => {
            const display = buildRoleSlotDisplay({
              role: control.role,
              personId: control.personId,
              people,
              emptyLabel: control.emptyLabel
            });

            return (
              <div key={control.role}>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {display.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-950">
                  {display.displayText}
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      {people.length === 0 ? (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Add active assignable people before setting ownership role slots.
        </p>
      ) : null}
    </section>
  );
}

function RoleSlotControlField({
  control,
  people
}: {
  control: RoleSlotControl;
  people: RoleSlotPersonOption[];
}) {
  const display = buildRoleSlotDisplay({
    role: control.role,
    personId: control.personId,
    people,
    emptyLabel: control.emptyLabel
  });

  if (control.readOnly) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {display.label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-950">
          {display.displayText}
        </p>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {roleSlotLabels[control.role]}
      </span>
      <select
        name={control.fieldName}
        defaultValue={control.personId ?? ""}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
      >
        <option value="">{control.emptyLabel ?? "Not assigned"}</option>
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
