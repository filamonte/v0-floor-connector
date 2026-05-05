type SendToContactOption = {
  value: string;
  label: string;
  email: string;
  isPrimary?: boolean;
};

type SendToContactSelectProps = {
  name: string;
  options: SendToContactOption[];
  defaultValue?: string;
  fallbackLabel?: string;
  hint?: string;
  required?: boolean;
};

export function SendToContactSelect({
  name,
  options,
  defaultValue,
  fallbackLabel = "Use primary contact fallback",
  hint,
  required = false
}: SendToContactSelectProps) {
  return (
    <label className="block space-y-2 text-sm leading-6 text-slate-600">
      <span className="font-medium text-slate-950">Send to contact</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {fallbackLabel ? <option value="">{fallbackLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.isPrimary ? " (primary contact)" : ""} - {option.email}
          </option>
        ))}
      </select>
      {hint ? <span className="block text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}
