import { AppLoadingState } from "@/components/app-loading-state";

export default function ProtectedAppLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AppLoadingState
        eyebrow="Loading workspace"
        title="Refreshing tenant-scoped data"
        description="FloorConnector is loading the latest protected records for this area."
      />
    </div>
  );
}
