import { redirect } from "next/navigation";

type MaterialsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextSearch = new URLSearchParams();

  if (resolvedSearchParams.error) {
    nextSearch.set("error", resolvedSearchParams.error);
  }

  if (resolvedSearchParams.message) {
    nextSearch.set("message", resolvedSearchParams.message);
  }

  redirect(
    nextSearch.size > 0
      ? `/cost-items-database/items?${nextSearch.toString()}`
      : "/cost-items-database/items"
  );
}
