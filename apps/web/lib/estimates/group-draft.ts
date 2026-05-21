export type DeleteEstimateGroupDraftInput<
  TGroup extends { id: string; sortOrder: number },
  TLineItem extends { groupId: string | null }
> = {
  groupId: string;
  groups: TGroup[];
  lineItems: TLineItem[];
};

export function deleteEstimateGroupDraft<
  TGroup extends { id: string; sortOrder: number },
  TLineItem extends { groupId: string | null }
>(input: DeleteEstimateGroupDraftInput<TGroup, TLineItem>) {
  return {
    groups: input.groups
      .filter((group) => group.id !== input.groupId)
      .map((group, index) => ({
        ...group,
        sortOrder: index
      })),
    lineItems: input.lineItems.map((lineItem) =>
      lineItem.groupId === input.groupId ? { ...lineItem, groupId: null } : lineItem
    )
  };
}
