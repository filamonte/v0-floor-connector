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
    <label className="block space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
      <span className="font-medium text-[var(--text-primary)]">Send to contact</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-2xl border border-[var(--border-medium)] bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--copper)] focus:outline-none focus:ring-2 focus:ring-[var(--copper)]/20"
      >
        {fallbackLabel ? <option value="">{fallbackLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.isPrimary ? " (primary contact)" : ""} - {option.email}
          </option>
        ))}
      </select>
      {hint ? <span className="block text-xs leading-5 text-[var(--text-secondary)]">{hint}</span> : null}
    </label>
  );
}
