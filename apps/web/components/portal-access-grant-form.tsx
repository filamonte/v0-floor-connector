type PortalAccessGrantFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customerId: string;
  defaultEmail?: string | null;
  customerContacts?: Array<{
    id: string;
    label: string;
    email?: string | null;
  }>;
  projects?: Array<{
    id: string;
    label: string;
    status: string;
  }>;
  defaultCustomerContactId?: string | null;
  returnTo?: string;
};

export function PortalAccessGrantForm({
  action,
  customerId,
  defaultEmail,
  customerContacts = [],
  projects = [],
  defaultCustomerContactId,
  returnTo
}: PortalAccessGrantFormProps) {
  const defaultProjectId = projects.length === 1 ? projects[0]?.id : "";
  const defaultContactId =
    defaultCustomerContactId ?? (customerContacts.length === 1 ? customerContacts[0]?.id : "") ?? "";
  const defaultContact = customerContacts.find(
    (customerContact) => customerContact.id === defaultContactId
  );
  const defaultInviteEmail = defaultEmail ?? defaultContact?.email ?? "";
  const defaultContactIsRecommended =
    defaultContact?.label.toLowerCase().includes("recommended portal contact") ?? false;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="customerId" value={customerId} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="block">
          <label
            htmlFor="portal-invite-email"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Invite email
          </label>
          <input
            id="portal-invite-email"
            name="portalUserEmail"
            type="email"
            defaultValue={defaultInviteEmail}
            required
            className="w-full rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            placeholder="customer@example.com"
          />
        </div>

        <div className="block">
          <label
            htmlFor="portal-invite-project"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Project visibility
          </label>
          <select
            id="portal-invite-project"
            name="projectId"
            defaultValue={defaultProjectId}
            required
            className="w-full rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label} - {project.status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="block">
        <label
          htmlFor="portal-invite-contact"
          className="mb-2 block text-sm font-medium text-slate-800"
        >
          Customer contact
        </label>
        <select
          id="portal-invite-contact"
          name="customerContactId"
          defaultValue={defaultContactId}
          required
          className="w-full rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Select a customer contact</option>
          {customerContacts.map((customerContact) => (
            <option key={customerContact.id} value={customerContact.id}>
              {customerContact.label}
            </option>
          ))}
        </select>
        {defaultContact ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {defaultContactIsRecommended
              ? "The main customer contact is selected as the recommended portal invite candidate."
              : "The selected customer contact anchors this portal access grant."}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="inline-flex h-9 w-full items-center justify-center gap-2 border border-[#d8731f] bg-[#d8731f] px-3 text-sm font-medium text-white transition hover:bg-[#bf6519] sm:w-auto sm:min-w-[220px]"
        >
          Invite portal contact
        </button>
        <p className="text-sm leading-6 text-slate-500">
          Creates or reuses contact-level access, adds project visibility, and sends the
          invite email when delivery is available.
        </p>
      </div>
    </form>
  );
}
