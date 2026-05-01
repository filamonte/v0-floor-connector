"use client";

import { useRouter } from "next/navigation";

type DirectoryView = "all" | "customers" | "workforce" | "vendors" | "leads";

type DirectoryViewOption = {
  key: DirectoryView;
  label: string;
  count: number;
};

type DirectoryFilterSelectProps = {
  value: DirectoryView;
  query: string;
  options: DirectoryViewOption[];
};

function buildDirectoryHref(input: { q?: string; view?: string }) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/directory?${query}` : "/directory";
}

export function DirectoryFilterSelect({ value, query, options }: DirectoryFilterSelectProps) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(e) => {
        router.push(buildDirectoryHref({ q: query, view: e.target.value }));
      }}
      className="border border-[#e2dcd5] bg-white px-3 py-1.5 text-[12px] text-[#221a14] outline-none focus:border-[#ef7d32]"
    >
      {options.map((v) => (
        <option key={v.key} value={v.key}>
          {v.label}
        </option>
      ))}
    </select>
  );
}
