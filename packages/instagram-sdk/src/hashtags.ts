import { graphFetch } from "./client";

export interface HashtagSearchResult {
  id: string;
  name: string;
}

export interface HashtagTopMedia {
  id: string;
  media_type: string;
  caption?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
}

export async function searchHashtag(
  accessToken: string,
  igUserId: string,
  hashtag: string
): Promise<{
  data: HashtagSearchResult[];
}> {
  const tag = hashtag.replace(/^#/, "");
  return graphFetch<{ data: HashtagSearchResult[] }>(
    accessToken,
    `/ig_hashtag_search?user_id=${igUserId}&q=${encodeURIComponent(tag)}`
  );
}

export async function getHashtagTopMedia(
  accessToken: string,
  hashtagId: string,
  igUserId: string,
  limit = 25
): Promise<{ data: HashtagTopMedia[] }> {
  const fields = [
    "id",
    "media_type",
    "caption",
    "permalink",
    "like_count",
    "comments_count",
  ].join(",");
  return graphFetch<{ data: HashtagTopMedia[] }>(
    accessToken,
    `/${hashtagId}/top_media?user_id=${igUserId}&fields=${fields}&limit=${limit}`
  );
}
