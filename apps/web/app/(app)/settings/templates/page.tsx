import { DocumentTemplateSettingsCard } from "@/components/document-template-settings-card";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { listDocumentTemplates, listPlatformTemplateSeeds } from "@/lib/templates/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsTemplatesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [allTemplates, platformSeeds] = await Promise.all([
    listDocumentTemplates(),
    listPlatformTemplateSeeds()
  ]);

  const estimateTemplates = allTemplates.filter(
    (template) => template.templateType === "estimate"
  );
  const invoiceTemplates = allTemplates.filter(
    (template) => template.templateType === "invoice"
  );
  const contractTemplates = allTemplates.filter(
    (template) => template.templateType === "contract"
  );

  const estimateSeeds = platformSeeds.filter(
    (seed) =>
      seed.templateType === "estimate" &&
      !estimateTemplates.some((template) => template.sourceSeedId === seed.id)
  );
  const invoiceSeeds = platformSeeds.filter(
    (seed) =>
      seed.templateType === "invoice" &&
      !invoiceTemplates.some((template) => template.sourceSeedId === seed.id)
  );
  const contractSeeds = platformSeeds.filter(
    (seed) =>
      seed.templateType === "contract" &&
      !contractTemplates.some((template) => template.sourceSeedId === seed.id)
  );

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="Document Templates"
        title="Manage organization-owned document output"
        description="FloorConnector keeps estimate, invoice, and contract templates on one shared canonical template system. Adopt platform defaults into this organization, then edit the organization-owned copies without affecting other contractors."
      >
        <div className="grid gap-6">
          <DocumentTemplateSettingsCard
            templateType="estimate"
            templates={estimateTemplates}
            availableSeeds={estimateSeeds}
          />
          <DocumentTemplateSettingsCard
            templateType="invoice"
            templates={invoiceTemplates}
            availableSeeds={invoiceSeeds}
          />
          <DocumentTemplateSettingsCard
            templateType="contract"
            templates={contractTemplates}
            availableSeeds={contractSeeds}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
