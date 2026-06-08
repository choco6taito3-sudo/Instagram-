import { graphFetch } from "./client";
import { businessDiscovery } from "./competitors";
import {
  getComments,
  replyToComment,
  hideComment,
  deleteComment,
} from "./comments";
import { searchHashtag } from "./hashtags";
import {
  getAccountInsights,
  getMediaInsights,
  getFollowerDemographics,
  getOnlineFollowers,
} from "./insights";
import { sendMessage, sendPrivateReply } from "./messages";
import {
  createMediaContainer,
  publishMedia,
  checkContainerStatus,
} from "./publish";
import type { CreateMediaParams, IgMedia, IgUser } from "./types";

export async function getUser(
  accessToken: string,
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
    accessToken,
    `/${igUserId}?fields=${fields.join(",")}`
  );
}

export async function getUserMedia(
  accessToken: string,
  igUserId: string,
  limit = 25
): Promise<{ data: IgMedia[] }> {
  const fields = [
    "id",
    "media_type",
    "caption",
    "permalink",
    "thumbnail_url",
    "timestamp",
    "like_count",
    "comments_count",
  ].join(",");
  return graphFetch<{ data: IgMedia[] }>(
    accessToken,
    `/${igUserId}/media?fields=${fields}&limit=${limit}`
  );
}

/** Convenience wrapper used by the web app and worker */
export class InstagramClient {
  constructor(private accessToken: string) {}

  getMe(fields?: string[]) {
    return graphFetch<IgUser>(
      this.accessToken,
      `/me?fields=${(fields ?? ["id", "username", "name"]).join(",")}`
    );
  }

  getUser(igUserId: string, fields?: string[]) {
    return getUser(this.accessToken, igUserId, fields);
  }

  getUserMedia(igUserId: string, limit?: number) {
    return getUserMedia(this.accessToken, igUserId, limit);
  }

  getAccountInsights(
    igUserId: string,
    metrics: string[],
    period?: "day" | "week" | "days_28",
    since?: number,
    until?: number
  ) {
    return getAccountInsights(
      this.accessToken,
      igUserId,
      metrics,
      period,
      since,
      until
    );
  }

  getMediaInsights(mediaId: string, metrics: string[]) {
    return getMediaInsights(this.accessToken, mediaId, metrics);
  }

  getFollowerDemographics(
    igUserId: string,
    breakdown: "age" | "gender" | "city" | "country"
  ) {
    return getFollowerDemographics(this.accessToken, igUserId, breakdown);
  }

  getOnlineFollowers(igUserId: string) {
    return getOnlineFollowers(this.accessToken, igUserId);
  }

  businessDiscovery(igUserId: string, targetUsername: string) {
    return businessDiscovery(this.accessToken, igUserId, targetUsername);
  }

  createMediaContainer(igUserId: string, params: CreateMediaParams) {
    return createMediaContainer(this.accessToken, igUserId, params);
  }

  publishMedia(igUserId: string, creationId: string) {
    return publishMedia(this.accessToken, igUserId, creationId);
  }

  getContainerStatus(containerId: string) {
    return checkContainerStatus(this.accessToken, containerId);
  }

  getComments(mediaId: string) {
    return getComments(this.accessToken, mediaId);
  }

  replyToComment(commentId: string, message: string) {
    return replyToComment(this.accessToken, commentId, message);
  }

  hideComment(commentId: string, hide: boolean) {
    return hideComment(this.accessToken, commentId, hide);
  }

  deleteComment(commentId: string) {
    return deleteComment(this.accessToken, commentId);
  }

  sendMessage(igUserId: string, recipientId: string, message: string) {
    return sendMessage(this.accessToken, igUserId, recipientId, message);
  }

  sendPrivateReply(igUserId: string, commentId: string, message: string) {
    return sendPrivateReply(this.accessToken, igUserId, commentId, message);
  }

  searchHashtag(igUserId: string, hashtag: string) {
    return searchHashtag(this.accessToken, igUserId, hashtag);
  }
}
