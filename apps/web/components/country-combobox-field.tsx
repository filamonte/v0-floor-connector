"use client";

import { useId } from "react";

type CountryComboboxFieldProps = {
  name: string;
  label?: string;
  defaultValue?: string | null;
  hint?: string;
};

const countryOptions = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" }
];

export function CountryComboboxField({
  name,
  label = "Country",
  defaultValue,
  hint = "Search by country name or enter a two-letter country code. United States and Canada are pinned first."
}: CountryComboboxFieldProps) {
  const listId = useId();
  const hintId = `${name}-hint`;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        list={listId}
        maxLength={2}
        autoComplete="country"
        placeholder="US"
        aria-describedby={hintId}
        className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
      />
      <datalist id={listId}>
        {countryOptions.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name} ({country.code})
          </option>
        ))}
      </datalist>
      <span id={hintId} className="mt-2 block text-xs leading-5 text-slate-500">
        {hint}
      </span>
    </label>
  );
}
