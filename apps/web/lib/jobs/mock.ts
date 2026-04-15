export type MockJobStatus = "lead" | "scheduled" | "in_progress" | "completed";

export type MockJob = {
  id: string;
  title: string;
  customer: string;
  status: MockJobStatus;
  date: string;
  total: number;
  location: string;
  description: string;
};

export const mockJobs: readonly MockJob[] = [
  {
    id: "demo-garage-epoxy",
    title: "Garage epoxy installation",
    customer: "Harper Residential",
    status: "lead",
    date: "2026-04-18",
    total: 4200,
    location: "Westfield, MA",
    description:
      "New residential coating job waiting on final scope review and schedule confirmation."
  },
  {
    id: "demo-showroom-polish",
    title: "Showroom concrete polish",
    customer: "Northline Auto Group",
    status: "scheduled",
    date: "2026-04-21",
    total: 12850,
    location: "Springfield, MA",
    description:
      "Commercial polish project with approved estimate and confirmed production slot."
  },
  {
    id: "demo-warehouse-overlay",
    title: "Warehouse epoxy overlay",
    customer: "Granite Industrial",
    status: "in_progress",
    date: "2026-04-15",
    total: 26750,
    location: "Chicopee, MA",
    description:
      "Multi-day installation currently in field execution with staged prep and coating work."
  },
  {
    id: "demo-basement-flake",
    title: "Basement flake system",
    customer: "Morrison Custom Homes",
    status: "completed",
    date: "2026-04-10",
    total: 6850,
    location: "Longmeadow, MA",
    description:
      "Completed residential project ready for billing review and customer closeout."
  }
] as const;

export function listMockJobs() {
  return [...mockJobs];
}

export function getMockJobById(jobId: string) {
  return mockJobs.find((job) => job.id === jobId) ?? null;
}
