import type { InputHTMLAttributes } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function AuthField({
  label,
  hint,
  id,
  className,
  ...props
}: AuthFieldProps) {
  const inputId = id ?? props.name;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <input
        id={inputId}
        aria-describedby={hintId}
        className={`h-9 w-full border border-[var(--border-warm)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] ${className ?? ""}`.trim()}
        {...props}
      />
      {hint ? (
        <span id={hintId} className="mt-2 block text-xs leading-5 text-[var(--text-secondary)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
