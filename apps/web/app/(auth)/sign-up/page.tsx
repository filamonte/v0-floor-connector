import { redirect } from "next/navigation";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = (await searchParams) ?? {};
  const search = new URLSearchParams();

  if (params.error) {
    search.set("error", params.error);
  }

  if (params.message) {
    search.set("message", params.message);
  }

  if (params.next) {
    search.set("next", params.next);
  }

  redirect(search.size > 0 ? `/signup?${search.toString()}` : "/signup");
}
