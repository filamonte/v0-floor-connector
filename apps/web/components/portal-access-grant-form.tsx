import { AuthSubmitButton } from "@/components/auth-submit-button";

type PortalAccessGrantFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customerId: string;
  defaultEmail?: string | null;
};

export function PortalAccessGrantForm({
  action,
  customerId,
  defaultEmail
}: PortalAccessGrantFormProps) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="customerId" value={customerId} />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Portal user email
          </span>
          <input
            name="portalUserEmail"
            type="email"
            defaultValue={defaultEmail ?? ""}
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="customer@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Initial status
          </span>
          <select
            name="status"
            defaultValue="invited"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="invited">Invited</option>
            <option value="active">Active</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel="Granting portal access..." className="sm:min-w-[220px]">
          <span>Grant portal access</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          The email must already belong to an authenticated FloorConnector user. This pass does not send invitation emails automatically.
        </p>
      </div>
    </form>
  );
}
