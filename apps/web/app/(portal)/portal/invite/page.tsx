import Link from "next/link";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { acceptPortalInviteAction } from "@/lib/portal-access/actions";
import { getPortalInvitePreview } from "@/lib/portal-access/data";
import { getCurrentUser } from "@/lib/auth/session";

type PortalInvitePageProps = {
  searchParams?: Promise<{
    token?: string;
    error?: string;
    message?: string;
  }>;
};

function buildAuthHref(pathname: "/login" | "/signup", token: string) {
  const next = `/portal/invite?token=${encodeURIComponent(token)}`;

  return `${pathname}?next=${encodeURIComponent(next)}`;
}

export default async function PortalInvitePage({ searchParams }: PortalInvitePageProps) {
  const params = (await searchParams) ?? {};
  const token = params.token?.trim() ?? "";
  const user = await getCurrentUser();
  const invite = token ? await getPortalInvitePreview(token) : null;
  const isExpired =
    invite?.expiresAt && invite.status !== "active"
      ? new Date(invite.expiresAt).getTime() < Date.now()
      : false;
  const canAccept = Boolean(invite && !isExpired && invite.status !== "revoked");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white p-6 shadow-[0_24px_90px_-35px_rgba(15,23,42,0.9)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
          Customer portal invite
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Continue to your shared project
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Portal access starts from your contractor. This invite links your login to the
          same customer, project, estimate, contract, and invoice records they manage in
          FloorConnector.
        </p>

        {params.error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
            {params.error}
          </div>
        ) : null}

        {params.message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            {params.message}
          </div>
        ) : null}

        {!token ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
            This invite link is missing its token. Ask your contractor for a fresh portal invite.
          </div>
        ) : null}

        {token && !invite ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
            This invite is invalid, expired, or no longer available. Ask your contractor to
            create a new portal invite from the customer record.
          </div>
        ) : null}

        {invite ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Invite details</p>
            <dl className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="font-medium text-slate-950">Customer</dt>
                <dd>{invite.customerCompanyName ?? invite.customerName}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Project</dt>
                <dd>{invite.projectName}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Invited email</dt>
                <dd>{invite.invitedEmail}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Status</dt>
                <dd>{isExpired ? "expired" : invite.status}</dd>
              </div>
              {invite.expiresAt ? (
                <div>
                  <dt className="font-medium text-slate-950">Expires</dt>
                  <dd>{new Date(invite.expiresAt).toLocaleString()}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {invite && isExpired ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
            This invite has expired. Ask your contractor to create a fresh invite.
          </div>
        ) : null}

        {invite && canAccept && !user ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={buildAuthHref("/signup", token)}
              className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
            >
              Create portal account
            </Link>
            <Link
              href={buildAuthHref("/login", token)}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        ) : null}

        {invite && canAccept && user ? (
          <form action={acceptPortalInviteAction} className="mt-6">
            <input type="hidden" name="token" value={token} />
            <AuthSubmitButton pendingLabel="Activating access..." className="sm:min-w-[220px]">
              <span>Accept portal invite</span>
            </AuthSubmitButton>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              FloorConnector will verify your signed-in email matches the invited customer
              email before activating project access.
            </p>
          </form>
        ) : null}
      </div>
    </main>
  );
}
