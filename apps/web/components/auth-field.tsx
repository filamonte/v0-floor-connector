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
      <span className="mb-1.5 block text-[13px] font-medium text-[#221a14]">
        {label}
      </span>
      <input
        id={inputId}
        aria-describedby={hintId}
        className={`h-10 w-full border border-[#e2dcd5] bg-white px-3 text-[13px] text-[#221a14] outline-none transition placeholder:text-[#8a7a6c] focus:border-[#ef7d32] ${className ?? ""}`.trim()}
        {...props}
      />
      {hint ? (
        <span id={hintId} className="mt-1.5 block text-[12px] leading-4 text-[#5f564d]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
