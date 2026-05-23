export function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function buildSearchText(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

export function getSearchVariants(query: string) {
  const underscoredQuery = query.replace(/\s+/g, "_");

  return Array.from(new Set([query, underscoredQuery]))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function buildIlikePredicates(columns: string[], query: string) {
  return getSearchVariants(query).flatMap((variant) => {
    const escapedQuery = escapeLikePattern(variant);

    return columns.map((column) => `${column}.ilike.%${escapedQuery}%`);
  });
}

export function buildEnumEqualityPredicates(
  column: string,
  allowedValues: readonly string[],
  query: string
) {
  const normalizedVariants = getSearchVariants(query).map((variant) =>
    normalizeText(variant).replaceAll("-", "_")
  );
  const matchingValues = allowedValues.filter((value) => {
    const normalizedValue = normalizeText(value);
    const label = normalizedValue.replaceAll("_", " ");

    return normalizedVariants.some(
      (variant) =>
        normalizedValue.includes(variant) ||
        label.includes(variant.replaceAll("_", " "))
    );
  });

  return matchingValues.map((value) => `${column}.eq.${value}`);
}

export function buildDateEqualityPredicates(column: string, query: string) {
  const trimmed = query.trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? [`${column}.eq.${trimmed}`] : [];
}

export function labelize(value: string) {
  return value.replaceAll("_", " ");
}
