import type {
  CommunicationChannelKind,
  CommunicationMessageDeliveryStatus,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  CommunicationMessageSenderType,
  CommunicationMessageVisibility,
  CommunicationThreadStatus
} from "@floorconnector/types";

export type CommunicationWriteAudience = CommunicationMessageVisibility;

export type CommunicationWriteFields = {
  visibility: CommunicationMessageVisibility;
  messageKind: CommunicationMessageKind;
  direction: CommunicationMessageDirection;
  channelKind: CommunicationChannelKind;
  deliveryStatus: CommunicationMessageDeliveryStatus;
  nextThreadStatus: CommunicationThreadStatus;
};

export function deriveCommunicationWriteFields(input: {
  actorKind: Extract<
    CommunicationMessageSenderType,
    "organization_user" | "portal_user"
  >;
  audience?: CommunicationWriteAudience;
  messageKind?: CommunicationMessageKind;
  deliveryStatus?: CommunicationMessageDeliveryStatus;
}): CommunicationWriteFields {
  if (input.actorKind === "portal_user") {
    if (input.audience === "internal") {
      throw new Error("Portal replies cannot create internal notes.");
    }

    return {
      visibility: "customer_visible",
      messageKind: "customer_message",
      direction: "inbound",
      channelKind: "portal",
      deliveryStatus: input.deliveryStatus ?? "logged",
      nextThreadStatus: "waiting_on_contractor"
    };
  }

  const visibility = input.audience ?? "internal";

  if (visibility === "customer_visible") {
    return {
      visibility,
      messageKind: input.messageKind ?? "customer_message",
      direction: "outbound",
      channelKind: "portal",
      deliveryStatus: input.deliveryStatus ?? "logged",
      nextThreadStatus: "waiting_on_customer"
    };
  }

  return {
    visibility: "internal",
    messageKind: input.messageKind ?? "internal_note",
    direction: "internal",
    channelKind: "internal_note",
    deliveryStatus: input.deliveryStatus ?? "logged",
    nextThreadStatus: "open"
  };
}
