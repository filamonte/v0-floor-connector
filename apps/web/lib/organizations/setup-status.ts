export type CompanySetupFields = {
  logoUrl?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  primaryTrade?: string | null;
  brandAccentColor?: string | null;
  timeZone?: string | null;
};

export function hasCompanyProfileFields(organization: CompanySetupFields) {
  return [
    organization.logoUrl,
    organization.phone,
    organization.websiteUrl,
    organization.primaryTrade,
    organization.brandAccentColor,
    organization.timeZone
  ].some((value) => Boolean(value?.trim()));
}
