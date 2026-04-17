import { AppModulePlaceholder } from "@/components/app-module-placeholder";

export default function MaterialsPage() {
  return (
    <AppModulePlaceholder
      eyebrow="Materials Module"
      title="Materials"
      description="Reusable materials, assemblies, and shared catalog data are planned here, but this area does not yet have live workflow records. The current app keeps this surface explicit so review sessions do not confuse future scope with implemented product behavior."
      actionHref="/estimates"
      actionLabel="Review estimates"
    />
  );
}
