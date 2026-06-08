import { graphFetch } from "./client";
import type { IgComment } from "./types";

export async function getComments(
  accessToken: string,
  mediaId: string
): Promise<{ data: IgComment[] }> {
  return graphFetch<{ data: IgComment[] }>(
    accessToken,
    `/${mediaId}/comments?fields=id,text,username,timestamp,from`
  );
}

export async function replyToComment(
  accessToken: string,
  commentId: string,
  message: string
): Promise<{ id: string }> {
  const body = new URLSearchParams({ message });
  return graphFetch<{ id: string }>(accessToken, `/${commentId}/replies`, {
    method: "POST",
    body,
  });
}

export async function hideComment(
  accessToken: string,
  commentId: string,
  hide: boolean
): Promise<{ success: boolean }> {
  const body = new URLSearchParams({ hide: String(hide) });
  return graphFetch<{ success: boolean }>(accessToken, `/${commentId}`, {
    method: "POST",
    body,
  });
}

export async function deleteComment(
  accessToken: string,
  commentId: string
): Promise<{ success: boolean }> {
  return graphFetch<{ success: boolean }>(accessToken, `/${commentId}`, {
    method: "DELETE",
  });
}
