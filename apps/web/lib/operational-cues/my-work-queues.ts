import type { MembershipRole } from "@floorconnector/types";

import type { OperationalCue } from "./types";

export const myWorkQueueModes = ["company", "mine", "unresolved"] as const;

export type MyWorkQueueMode = (typeof myWorkQueueModes)[number];

export function isMyWorkQueueMode(
  value: string | undefined
): value is MyWorkQueueMode {
  return myWorkQueueModes.some((mode) => mode === value);
}

export type MyWorkQueueCaveat =
  | "noLinkedPerson"
  | "noMineItems"
  | "unresolvedItemsPresent";

type BuildMyWorkQueueModesInput = {
  cues: OperationalCue[];
  currentUserId: string;
  currentPersonId?: string | null;
  membershipRole: MembershipRole;
};

const unresolvedResolutionStatuses = new Set([
  "strategy_only",
  "organization_queue",
  "record_owner_unavailable"
]);

function isCueResolvedToCurrentUser(
  cue: OperationalCue,
  input: Pick<BuildMyWorkQueueModesInput, "currentUserId" | "currentPersonId">
) {
  if (cue.responsibility.userId === input.currentUserId) {
    return true;
  }

  return Boolean(
    input.currentPersonId && cue.responsibility.personId === input.currentPersonId
  );
}

function getDefaultMode(role: MembershipRole): MyWorkQueueMode {
  return role === "member" ? "mine" : "company";
}

export function buildMyWorkQueueModes(input: BuildMyWorkQueueModesInput) {
  const companyCues = input.cues;
  const mineCues = input.cues.filter((cue) =>
    isCueResolvedToCurrentUser(cue, input)
  );
  const unresolvedCues = input.cues.filter((cue) =>
    unresolvedResolutionStatuses.has(cue.responsibility.resolutionStatus)
  );

  return {
    selectedDefaultMode: getDefaultMode(input.membershipRole),
    queues: {
      company: {
        mode: "company" as const,
        cues: companyCues
      },
      mine: {
        mode: "mine" as const,
        cues: mineCues
      },
      unresolved: {
        mode: "unresolved" as const,
        cues: unresolvedCues
      }
    },
    counts: {
      company: companyCues.length,
      mine: mineCues.length,
      unresolved: unresolvedCues.length
    },
    caveats: {
      noLinkedPerson: !input.currentPersonId,
      noMineItems: mineCues.length === 0,
      unresolvedItemsPresent: unresolvedCues.length > 0
    } satisfies Record<MyWorkQueueCaveat, boolean>
  };
}
