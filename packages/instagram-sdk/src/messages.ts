import { graphFetchJson } from "./client";

export async function sendMessage(
  accessToken: string,
  igUserId: string,
  recipientId: string,
  message: string
): Promise<{ recipient_id: string; message_id: string }> {
  return graphFetchJson(accessToken, `/${igUserId}/messages`, {
    recipient: { id: recipientId },
    message: { text: message },
  });
}

export async function sendPrivateReply(
  accessToken: string,
  igUserId: string,
  commentId: string,
  message: string
): Promise<{ recipient_id: string; message_id: string }> {
  return graphFetchJson(accessToken, `/${igUserId}/messages`, {
    recipient: { comment_id: commentId },
    message: { text: message },
  });
}
