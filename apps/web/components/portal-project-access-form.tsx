import { AuthSubmitButton } from "@/components/auth-submit-button";

type ProjectOption = {
  id: string;
  label: string;
  status: string;
};

type PortalProjectAccessFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customerId: string;
  portalAccessGrantId: string;
  projects: ProjectOption[];
  returnTo?: string;
};

export function PortalProjectAccessForm({
  action,
  customerId,
  portalAccessGrantId,
  projects,
  returnTo
}: PortalProjectAccessFormProps) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="portalAccessGrantId" value={portalAccessGrantId} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Visible project
        </span>
        <select
          name="projectId"
          required
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.label} | {project.status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel="Adding project visibility..." variant="secondary">
          <span>Add project visibility</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Estimate send and portal approval require the portal user to have active visibility to
          the estimate's project. Portal users only see explicitly granted projects beneath the
          shared customer relationship.
        </p>
      </div>
    </form>
  );
}
