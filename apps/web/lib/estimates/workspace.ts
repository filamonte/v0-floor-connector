import type {
  EstimateWorkspaceDefaults,
  EstimateItemGroup,
  EstimateScopeItem,
  EstimateWorkspaceContent,
  EstimateWorkspaceItemRow
} from "@floorconnector/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeHtmlField(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeScopeItems(value: unknown): EstimateScopeItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item) || typeof item.text !== "string") {
        return null;
      }

      const text = item.text.trim();
      const sortOrder =
        typeof item.sortOrder === "number" && Number.isFinite(item.sortOrder)
          ? item.sortOrder
          : index;

      if (text.length === 0) {
        return null;
      }

      return {
        id:
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id
            : `scope-${index + 1}`,
        text,
        includeInOutput: item.includeInOutput !== false,
        sortOrder
      } satisfies EstimateScopeItem;
    })
    .filter((item): item is EstimateScopeItem => Boolean(item))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function normalizeItemGroups(value: unknown): EstimateItemGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item) || typeof item.label !== "string") {
        return null;
      }

      const label = item.label.trim();
      const sortOrder =
        typeof item.sortOrder === "number" && Number.isFinite(item.sortOrder)
          ? item.sortOrder
          : index;

      if (label.length === 0) {
        return null;
      }

      return {
        id:
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id
            : `group-${index + 1}`,
        label,
        sortOrder
      } satisfies EstimateItemGroup;
    })
    .filter((item): item is EstimateItemGroup => Boolean(item))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function normalizeItemRows(value: unknown): EstimateWorkspaceItemRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item) || typeof item.rowKey !== "string") {
        return null;
      }

      const rowKey = item.rowKey.trim();

      if (rowKey.length === 0) {
        return null;
      }

      return {
        rowKey,
        groupId:
          typeof item.groupId === "string" && item.groupId.trim().length > 0
            ? item.groupId
            : null,
        baseUnitPrice:
          typeof item.baseUnitPrice === "string" && item.baseUnitPrice.trim().length > 0
            ? item.baseUnitPrice.trim()
            : "0.00",
        markupPercent:
          typeof item.markupPercent === "string" && item.markupPercent.trim().length > 0
            ? item.markupPercent.trim()
            : "0.00",
        taxCode: item.taxCode === "non-taxable" ? "non-taxable" : "taxable",
        assignedTo:
          typeof item.assignedTo === "string" && item.assignedTo.trim().length > 0
            ? item.assignedTo.trim()
            : null
      } satisfies EstimateWorkspaceItemRow;
    })
    .filter((item): item is EstimateWorkspaceItemRow => Boolean(item));
}

export function createEmptyEstimateWorkspaceContent(): EstimateWorkspaceContent {
  return {
    termsHtml: null,
    inclusionsHtml: null,
    exclusionsHtml: null,
    notesHtml: null,
    scopeSummaryHtml: null,
    scopeItems: [],
    itemGroups: [],
    itemRows: []
  };
}

export function hasMeaningfulEstimateWorkspaceContent(
  content: EstimateWorkspaceContent | null | undefined
) {
  if (!content) {
    return false;
  }

  return Boolean(
    normalizeHtmlField(content.termsHtml) ||
      normalizeHtmlField(content.inclusionsHtml) ||
      normalizeHtmlField(content.exclusionsHtml) ||
      normalizeHtmlField(content.notesHtml) ||
      normalizeHtmlField(content.scopeSummaryHtml) ||
      content.scopeItems.length > 0
  );
}

export function applyEstimateWorkspaceDefaults(input: {
  content: EstimateWorkspaceContent;
  defaults: EstimateWorkspaceDefaults;
}): EstimateWorkspaceContent {
  if (hasMeaningfulEstimateWorkspaceContent(input.content)) {
    return input.content;
  }

  return {
    ...input.content,
    termsHtml: input.defaults.termsHtml,
    inclusionsHtml: input.defaults.inclusionsHtml,
    exclusionsHtml: input.defaults.exclusionsHtml,
    scopeSummaryHtml: input.defaults.scopeSummaryHtml
  };
}

export function normalizeEstimateWorkspaceContent(
  value: unknown,
  legacyNotes?: string | null
): EstimateWorkspaceContent {
  const empty = createEmptyEstimateWorkspaceContent();
  const legacyHtml = normalizeHtmlField(legacyNotes);

  if (!isRecord(value)) {
    return {
      ...empty,
      termsHtml: legacyHtml,
      notesHtml: legacyHtml,
      scopeSummaryHtml: legacyHtml
    };
  }

  return {
    termsHtml: normalizeHtmlField(value.termsHtml) ?? legacyHtml,
    inclusionsHtml: normalizeHtmlField(value.inclusionsHtml),
    exclusionsHtml: normalizeHtmlField(value.exclusionsHtml),
    notesHtml: normalizeHtmlField(value.notesHtml) ?? legacyHtml,
    scopeSummaryHtml: normalizeHtmlField(value.scopeSummaryHtml) ?? legacyHtml,
    scopeItems: normalizeScopeItems(value.scopeItems),
    itemGroups: normalizeItemGroups(value.itemGroups),
    itemRows: normalizeItemRows(value.itemRows)
  };
}

export function serializeEstimateWorkspaceContent(
  content: EstimateWorkspaceContent
): Record<string, unknown> {
  return {
    termsHtml: content.termsHtml,
    inclusionsHtml: content.inclusionsHtml,
    exclusionsHtml: content.exclusionsHtml,
    notesHtml: content.notesHtml,
    scopeSummaryHtml: content.scopeSummaryHtml,
    scopeItems: content.scopeItems.map((item, index) => ({
      id: item.id,
      text: item.text.trim(),
      includeInOutput: item.includeInOutput,
      sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index
    })),
    itemGroups: content.itemGroups.map((group, index) => ({
      id: group.id,
      label: group.label.trim(),
      sortOrder: Number.isFinite(group.sortOrder) ? group.sortOrder : index
    })),
    itemRows: content.itemRows.map((item) => ({
      rowKey: item.rowKey,
      groupId: item.groupId,
      baseUnitPrice: item.baseUnitPrice,
      markupPercent: item.markupPercent,
      taxCode: item.taxCode,
      assignedTo: item.assignedTo
    }))
  };
}

export function stripHtmlToPlainText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const stripped = value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.length > 0 ? stripped : null;
}

export function getIncludedEstimateScopeItems(content: EstimateWorkspaceContent) {
  return content.scopeItems.filter(
    (item) => item.includeInOutput && item.text.trim().length > 0
  );
}
