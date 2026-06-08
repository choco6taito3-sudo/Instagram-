import { graphFetch } from "./client";
import type { BusinessDiscovery } from "./types";

export async function businessDiscovery(
  accessToken: string,
  igUserId: string,
  targetUsername: string
): Promise<{ business_discovery: BusinessDiscovery }> {
  const username = targetUsername.replace(/^@/, "");
  const fields = [
    `business_discovery.username(${username}){`,
    "id,username,name,followers_count,media_count,",
    "media.limit(12){id,media_type,caption,permalink,like_count,comments_count,timestamp}",
    "}",
  ].join("");
  return graphFetch<{ business_discovery: BusinessDiscovery }>(
    accessToken,
    `/${igUserId}?fields=${fields}`
  );
}
