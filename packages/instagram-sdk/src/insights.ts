import { graphFetch } from "./client";
import type { IgInsight } from "./types";

export async function getAccountInsights(
  accessToken: string,
  igUserId: string,
  metrics: string[],
  period: "day" | "week" | "days_28" = "day",
  since?: number,
  until?: number
): Promise<{ data: IgInsight[] }> {
  let path = `/${igUserId}/insights?metric=${metrics.join(",")}&period=${period}`;
  if (since) path += `&since=${since}`;
  if (until) path += `&until=${until}`;
  return graphFetch<{ data: IgInsight[] }>(accessToken, path);
}

export async function getMediaInsights(
  accessToken: string,
  mediaId: string,
  metrics: string[]
): Promise<{ data: IgInsight[] }> {
  return graphFetch<{ data: IgInsight[] }>(
    accessToken,
    `/${mediaId}/insights?metric=${metrics.join(",")}`
  );
}

export async function getFollowerDemographics(
  accessToken: string,
  igUserId: string,
  breakdown: "age" | "gender" | "city" | "country"
): Promise<{ data: IgInsight[] }> {
  return graphFetch<{ data: IgInsight[] }>(
    accessToken,
    `/${igUserId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=${breakdown}`
  );
}

export async function getOnlineFollowers(
  accessToken: string,
  igUserId: string
): Promise<{ data: IgInsight[] }> {
  return graphFetch<{ data: IgInsight[] }>(
    accessToken,
    `/${igUserId}/insights?metric=online_followers&period=lifetime`
  );
}
