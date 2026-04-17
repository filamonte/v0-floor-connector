import { PlatformTemplateSeedCard } from "@/components/platform-template-seed-card";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { listPlatformTemplateSeedsAdmin } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function PlatformTemplatesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const seeds = await listPlatformTemplateSeedsAdmin();

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="Starter Templates"
        title="Manage platform-owned document seeds"
        description="Platform starter templates are not shared mutable records inside tenant workflows. Organizations adopt editable copies, but the starter definitions here remain the source of truth for future adoptions."
      >
        <div className="space-y-6">
          <PlatformTemplateSeedCard
            templateType="estimate"
            seeds={seeds.filter((seed) => seed.templateType === "estimate")}
          />
          <PlatformTemplateSeedCard
            templateType="invoice"
            seeds={seeds.filter((seed) => seed.templateType === "invoice")}
          />
          <PlatformTemplateSeedCard
            templateType="contract"
            seeds={seeds.filter((seed) => seed.templateType === "contract")}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
