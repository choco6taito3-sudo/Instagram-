import { BASE_URL, GRAPH_API_VERSION, graphFetch } from "./client";
import type { IgUser } from "./types";

export const META_SCOPES = [
  "instagram_basic",
  "instagram_manage_insights",
  "instagram_content_publish",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
].join(",");

export function getMetaAuthUrl(appId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: META_SCOPES,
    response_type: "code",
  });
  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params}`;
}

export async function exchangeCodeForToken(
  appId: string,
  appSecret: string,
  redirectUri: string,
  code: string
): Promise<{ access_token: string; token_type: string; expires_in?: number }> {
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${BASE_URL}/oauth/access_token?${params}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Token exchange failed");
  }
  return data;
}

export async function getLongLivedToken(
  appId: string,
  appSecret: string,
  shortLivedToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(`${BASE_URL}/oauth/access_token?${params}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Long-lived token exchange failed");
  }
  return data;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

export async function getFacebookPages(
  userAccessToken: string
): Promise<FacebookPage[]> {
  const res = await fetch(
    `${BASE_URL}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch pages");
  }
  return data.data || [];
}

export async function getInstagramAccount(
  pageAccessToken: string,
  igUserId: string,
  fields: string[] = [
    "id",
    "username",
    "name",
    "profile_picture_url",
    "followers_count",
    "media_count",
    "biography",
  ]
): Promise<IgUser> {
  return graphFetch<IgUser>(
    pageAccessToken,
    `/${igUserId}?fields=${fields.join(",")}`
  );
}

export async function refreshLongLivedToken(
  appId: string,
  appSecret: string,
  currentToken: string
): Promise<{ access_token: string; expires_in: number }> {
  return getLongLivedToken(appId, appSecret, currentToken);
}
