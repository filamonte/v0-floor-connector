import { AppLoadingState } from "@/components/app-loading-state";

export default function ProtectedAppLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AppLoadingState
        eyebrow="Opening contractor workspace"
        title="Checking secure workspace access"
        description="FloorConnector is confirming your organization access and loading the protected records for this contractor workflow."
      />
    </div>
  );
}
