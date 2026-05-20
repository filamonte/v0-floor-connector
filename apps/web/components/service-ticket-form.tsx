import type { ServiceTicketListItem } from "@/lib/service-tickets/data";
import {
  serviceTicketPriorities,
  serviceTicketSourceTypes,
  serviceTicketStatuses,
  serviceTicketTypes
} from "@/lib/service-tickets/schemas";

type Option = {
  id: string;
  label: string;
  customerId?: string;
  projectId?: string;
};

type ServiceTicketFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  ticket?: ServiceTicketListItem;
  customerOptions: Option[];
  projectOptions: Option[];
  jobOptions: Option[];
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ServiceTicketForm({
  action,
  ticket,
  customerOptions,
  projectOptions,
  jobOptions
}: ServiceTicketFormProps) {
  return (
    <form action={action} className="space-y-4">
      {ticket ? (
        <input type="hidden" name="ticketId" value={ticket.id} />
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Title
        </span>
        <input
          name="title"
          required
          defaultValue={ticket?.title ?? ""}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          placeholder="Warranty touch-up, callback, service inspection..."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Customer
          </span>
          <select
            name="customerId"
            required
            defaultValue={ticket?.customerId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">Select customer</option>
            {customerOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Project
          </span>
          <select
            name="projectId"
            defaultValue={ticket?.projectId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">No project context yet</option>
            {projectOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Job
          </span>
          <select
            name="jobId"
            defaultValue={ticket?.jobId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">No original job context yet</option>
            {jobOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Reported on
          </span>
          <input
            type="date"
            name="reportedOn"
            required
            defaultValue={ticket?.reportedOn ?? today()}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Type
          </span>
          <select
            name="ticketType"
            defaultValue={ticket?.ticketType ?? "warranty"}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm capitalize text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {serviceTicketTypes.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={ticket?.status ?? "open"}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm capitalize text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {serviceTicketStatuses.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Priority
          </span>
          <select
            name="priority"
            defaultValue={ticket?.priority ?? "normal"}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm capitalize text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {serviceTicketPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {formatLabel(priority)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Source
          </span>
          <select
            name="sourceType"
            defaultValue={ticket?.sourceType ?? "internal"}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm capitalize text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {serviceTicketSourceTypes.map((source) => (
              <option key={source} value={source}>
                {formatLabel(source)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Warranty start
          </span>
          <input
            type="date"
            name="warrantyStartDate"
            defaultValue={ticket?.warrantyStartDate ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Warranty end
          </span>
          <input
            type="date"
            name="warrantyEndDate"
            defaultValue={ticket?.warrantyEndDate ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Description
        </span>
        <textarea
          name="description"
          rows={4}
          defaultValue={ticket?.description ?? ""}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Warranty basis
        </span>
        <textarea
          name="warrantyBasis"
          rows={3}
          defaultValue={ticket?.warrantyBasis ?? ""}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          placeholder="Workmanship coverage, project warranty note, manufacturer context, or goodwill rationale"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Resolution summary
        </span>
        <textarea
          name="resolutionSummary"
          rows={3}
          defaultValue={ticket?.resolutionSummary ?? ""}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
        />
      </label>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
      >
        {ticket ? "Update service ticket" : "Create service ticket"}
      </button>
    </form>
  );
}
