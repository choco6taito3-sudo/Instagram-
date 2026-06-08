import { graphFetch } from "./client";
import type { CreateMediaParams } from "./types";

export async function createMediaContainer(
  accessToken: string,
  igUserId: string,
  params: CreateMediaParams
): Promise<{ id: string }> {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) body.append(key, String(value));
  });
  return graphFetch<{ id: string }>(accessToken, `/${igUserId}/media`, {
    method: "POST",
    body,
  });
}

export async function publishMedia(
  accessToken: string,
  igUserId: string,
  creationId: string
): Promise<{ id: string }> {
  const body = new URLSearchParams({ creation_id: creationId });
  return graphFetch<{ id: string }>(accessToken, `/${igUserId}/media_publish`, {
    method: "POST",
    body,
  });
}

export async function checkContainerStatus(
  accessToken: string,
  containerId: string
): Promise<{ status_code: string }> {
  return graphFetch<{ status_code: string }>(
    accessToken,
    `/${containerId}?fields=status_code`
  );
}
