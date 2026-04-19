import { AppLoadingState } from "@/components/app-loading-state";

export default function PortalLoading() {
  return (
    <AppLoadingState
      eyebrow="Opening customer portal"
      title="Checking shared project access"
      description="FloorConnector is confirming your portal access and loading the shared project records your contractor made available."
    />
  );
}
