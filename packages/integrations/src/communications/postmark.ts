import { getServerEnv } from "@floorconnector/config";

export type PostmarkEmailInput = {
  fromEmail?: string | null;
  toEmail: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  messageStream?: string | null;
};

export type PostmarkEmailResult = {
  messageId: string;
  submittedAt: string | null;
  to: string;
  errorCode: number;
};

export function isPostmarkEmailConfigured() {
  const env = getServerEnv();
  return Boolean(env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL);
}

export async function sendPostmarkEmail(
  input: PostmarkEmailInput
): Promise<PostmarkEmailResult> {
  const env = getServerEnv();
  const serverToken = env.POSTMARK_SERVER_TOKEN;
  const fromEmail = input.fromEmail ?? env.POSTMARK_FROM_EMAIL;
  const messageStream =
    input.messageStream ??
    env.POSTMARK_BROADCAST_STREAM ??
    env.POSTMARK_MESSAGE_STREAM ??
    undefined;

  if (!serverToken || !fromEmail) {
    throw new Error(
      "Postmark email delivery is not configured. Set POSTMARK_SERVER_TOKEN and POSTMARK_FROM_EMAIL before sending notifications."
    );
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": serverToken
    },
    body: JSON.stringify({
      From: fromEmail,
      To: input.toEmail,
      Subject: input.subject,
      HtmlBody: input.htmlBody,
      TextBody: input.textBody,
      MessageStream: messageStream
    }),
    cache: "no-store"
  });

  const payload = (await response.json()) as {
    MessageID?: unknown;
    SubmittedAt?: unknown;
    To?: unknown;
    ErrorCode?: unknown;
    Message?: unknown;
  };

  if (!response.ok) {
    throw new Error(
      typeof payload.Message === "string"
        ? payload.Message
        : `Postmark rejected the email delivery request with status ${response.status}.`
    );
  }

  if (
    typeof payload.MessageID !== "string" ||
    typeof payload.To !== "string" ||
    typeof payload.ErrorCode !== "number"
  ) {
    throw new Error("Postmark email delivery did not return the expected message metadata.");
  }

  return {
    messageId: payload.MessageID,
    submittedAt: typeof payload.SubmittedAt === "string" ? payload.SubmittedAt : null,
    to: payload.To,
    errorCode: payload.ErrorCode
  };
}
