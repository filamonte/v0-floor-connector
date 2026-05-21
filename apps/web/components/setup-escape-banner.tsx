import Link from "next/link";

export function SetupEscapeBanner() {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="font-semibold">Finish setup to unlock full access.</span>{" "}
        You can go to the dashboard now and come back to setup when you&apos;re ready.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center rounded-[4px] border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-950 transition hover:border-amber-500"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
