import {
  dismissWorkflowCueAction,
  snoozeWorkflowCueAction
} from "@/lib/cue-states/actions";
import type {
  CueStateActionSupport,
  WorkflowCueIdentity
} from "@/lib/cue-states/types";

function CueIdentityFields({
  identity,
  returnTo
}: {
  identity: WorkflowCueIdentity;
  returnTo: string;
}) {
  return (
    <>
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="companyId" value={identity.companyId} />
      <input type="hidden" name="cueFamily" value={identity.cueFamily} />
      <input type="hidden" name="cueKey" value={identity.cueKey} />
      <input type="hidden" name="cueVersion" value={String(identity.cueVersion)} />
      <input
        type="hidden"
        name="cueFingerprint"
        value={identity.cueFingerprint}
      />
      <input type="hidden" name="subjectType" value={identity.subjectType} />
      <input type="hidden" name="subjectId" value={identity.subjectId} />
      <input type="hidden" name="projectId" value={identity.projectId ?? ""} />
    </>
  );
}

const controlClassName =
  "inline-flex h-7 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50";
const selectClassName =
  "h-7 rounded-full border border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-600";

export function CueStateControls({
  identity,
  support,
  returnTo
}: {
  identity: WorkflowCueIdentity;
  support: CueStateActionSupport;
  returnTo: string;
}) {
  if (!support.dismiss && !support.snooze) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Cue visibility controls"
      className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500"
    >
      {support.snooze ? (
        <form action={snoozeWorkflowCueAction} className="flex items-center gap-1.5">
          <CueIdentityFields identity={identity} returnTo={returnTo} />
          <select
            name="snoozePreset"
            aria-label="Snooze duration"
            defaultValue="tomorrow"
            className={selectClassName}
          >
            <option value="later_today">Later today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="next_week">Next week</option>
          </select>
          <button type="submit" className={controlClassName}>
            Snooze
          </button>
        </form>
      ) : null}
      {support.dismiss ? (
        <form action={dismissWorkflowCueAction}>
          <CueIdentityFields identity={identity} returnTo={returnTo} />
          <button type="submit" className={controlClassName}>
            Dismiss
          </button>
        </form>
      ) : null}
      <span className="text-[11px] leading-4 text-slate-500">
        Only for you
      </span>
    </div>
  );
}
