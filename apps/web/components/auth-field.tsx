import type { InputHTMLAttributes } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  icon?: "email" | "password";
};

function EmailIcon() {
  return (
    <svg className="h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

export function AuthField({
  label,
  hint,
  id,
  className,
  icon,
  ...props
}: AuthFieldProps) {
  const inputId = id ?? props.name;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;
  const hasIcon = icon === "email" || icon === "password";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <div className="relative">
        {hasIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {icon === "email" ? <EmailIcon /> : <LockIcon />}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-describedby={hintId}
          className={`h-11 w-full rounded-xl border border-[var(--border-warm)] bg-white text-sm text-[var(--text-primary)] shadow-sm outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10 ${hasIcon ? "pl-10 pr-3" : "px-3"} ${className ?? ""}`.trim()}
          {...props}
        />
      </div>
      {hint ? (
        <span id={hintId} className="mt-2 block text-xs leading-5 text-[var(--text-secondary)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
