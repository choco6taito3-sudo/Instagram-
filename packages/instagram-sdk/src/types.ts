export interface IgUser {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
  biography?: string;
}

export interface IgMedia {
  id: string;
  media_type: string;
  caption?: string;
  permalink?: string;
  thumbnail_url?: string;
  media_url?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export interface IgInsightValue {
  value: number;
  end_time?: string;
}

export interface IgInsight {
  name: string;
  period: string;
  values?: IgInsightValue[];
  total_value?: {
    value?: number;
    breakdowns?: Array<{
      dimension_keys: string[];
      results: Array<{
        dimension_values: string[];
        value: number;
      }>;
    }>;
  };
}

export interface BusinessDiscovery {
  id: string;
  username: string;
  name?: string;
  followers_count: number;
  media_count: number;
  media?: {
    data: IgMedia[];
  };
}

export interface IgComment {
  id: string;
  text: string;
  username?: string;
  timestamp?: string;
  from?: { id: string; username: string };
}

export type MediaType = "IMAGE" | "VIDEO" | "REELS" | "CAROUSEL";

export interface CreateMediaParams {
  image_url?: string;
  video_url?: string;
  caption?: string;
  media_type?: MediaType;
  is_carousel_item?: boolean;
  children?: string;
  published?: boolean;
  scheduled_publish_time?: number;
}
