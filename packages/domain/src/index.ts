import type {
  EstimateStatus,
  JobStatus,
  MembershipRole,
  MembershipStatus,
  ProjectStatus
} from "@floorconnector/types";

export const trialPolicy = {
  withCardDays: 14,
  withoutCardDays: 3,
  graceDays: 7
} as const;

export const membershipRoles = [
  "owner",
  "admin",
  "manager",
  "member"
] as const satisfies readonly MembershipRole[];

export const membershipStatuses = [
  "invited",
  "active",
  "inactive",
  "suspended"
] as const satisfies readonly MembershipStatus[];

export const projectStatuses = [
  "lead",
  "estimating",
  "approved",
  "scheduled",
  "in_progress",
  "completed"
] as const satisfies readonly ProjectStatus[];

export const estimateStatuses = [
  "draft",
  "sent",
  "approved",
  "rejected"
] as const satisfies readonly EstimateStatus[];

export const jobStatuses = [
  "unscheduled",
  "scheduled",
  "in_progress",
  "completed",
  "canceled"
] as const satisfies readonly JobStatus[];

export const membershipRoleRank: Record<MembershipRole, number> = {
  owner: 0,
  admin: 1,
  manager: 2,
  member: 3
};

export const projectStatusRank: Record<ProjectStatus, number> = {
  lead: 0,
  estimating: 1,
  approved: 2,
  scheduled: 3,
  in_progress: 4,
  completed: 5
};

export const estimateStatusRank: Record<EstimateStatus, number> = {
  draft: 0,
  sent: 1,
  approved: 2,
  rejected: 3
};

export const jobStatusRank: Record<JobStatus, number> = {
  unscheduled: 0,
  scheduled: 1,
  in_progress: 2,
  completed: 3,
  canceled: 4
};

export const estimateStatusTransitions: Record<
  EstimateStatus,
  readonly EstimateStatus[]
> = {
  draft: ["sent"],
  sent: ["approved", "rejected"],
  approved: [],
  rejected: []
};

export function isMembershipRole(value: string): value is MembershipRole {
  return membershipRoles.includes(value as MembershipRole);
}

export function isMembershipStatus(value: string): value is MembershipStatus {
  return membershipStatuses.includes(value as MembershipStatus);
}

export function compareMembershipRoles(
  left: MembershipRole,
  right: MembershipRole
) {
  return membershipRoleRank[left] - membershipRoleRank[right];
}

export function compareProjectStatuses(
  left: ProjectStatus,
  right: ProjectStatus
) {
  return projectStatusRank[left] - projectStatusRank[right];
}

export function compareEstimateStatuses(
  left: EstimateStatus,
  right: EstimateStatus
) {
  return estimateStatusRank[left] - estimateStatusRank[right];
}

export function compareJobStatuses(left: JobStatus, right: JobStatus) {
  return jobStatusRank[left] - jobStatusRank[right];
}

export function canTransitionEstimateStatus(
  from: EstimateStatus,
  to: EstimateStatus
) {
  return estimateStatusTransitions[from].includes(to);
}
