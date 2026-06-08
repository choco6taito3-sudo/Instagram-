import { subDays, format } from "date-fns";

export type InsightChartPoint = {
  date: string;
  reach: number;
  impressions: number;
  engagementRate: number;
};

export type MediaPostSummary = {
  id: string;
  caption: string | null;
  mediaType: string;
  reach: number;
  engagementRate: number;
};

export type InsightRecord = {
  date: Date;
  reach: number;
  impressions: number;
  engagementRate: number;
};

export function toChartPoint(i: InsightRecord): InsightChartPoint {
  return {
    date: format(i.date, "yyyy-MM-dd"),
    reach: i.reach,
    impressions: i.impressions,
    engagementRate: i.engagementRate,
  };
}

export function generateDemoInsights(days = 30): InsightChartPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    const reach = Math.floor(800 + Math.random() * 1200);
    const impressions = Math.floor(reach * (1.2 + Math.random() * 0.5));
    const accountsEngaged = Math.floor(reach * (0.03 + Math.random() * 0.05));
    return {
      date: format(date, "yyyy-MM-dd"),
      reach,
      impressions,
      accountsEngaged,
      engagementRate: reach > 0 ? (accountsEngaged / reach) * 100 : 0,
      followerCount: 1250 + i * 3,
    };
  });
}

export const demoDemographics = {
  age: [
    { value: "18-24", count: 320, percentage: 25.6 },
    { value: "25-34", count: 450, percentage: 36.0 },
    { value: "35-44", count: 280, percentage: 22.4 },
    { value: "45-54", count: 120, percentage: 9.6 },
    { value: "55+", count: 80, percentage: 6.4 },
  ],
  gender: [
    { value: "男性", count: 520, percentage: 41.6 },
    { value: "女性", count: 680, percentage: 54.4 },
    { value: "その他", count: 50, percentage: 4.0 },
  ],
  city: [
    { value: "東京", count: 380, percentage: 30.4 },
    { value: "大阪", count: 150, percentage: 12.0 },
    { value: "名古屋", count: 90, percentage: 7.2 },
    { value: "福岡", count: 75, percentage: 6.0 },
    { value: "札幌", count: 60, percentage: 4.8 },
  ],
  country: [
    { value: "日本", count: 1100, percentage: 88.0 },
    { value: "アメリカ", count: 80, percentage: 6.4 },
    { value: "韓国", count: 40, percentage: 3.2 },
    { value: "その他", count: 30, percentage: 2.4 },
  ],
};

export function generateDemoOnline() {
  const data: { dayOfWeek: number; hour: number; count: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const base = hour >= 19 && hour <= 23 ? 80 : hour >= 12 && hour <= 14 ? 50 : 20;
      const weekendBoost = day === 0 || day === 6 ? 1.3 : 1;
      data.push({
        dayOfWeek: day,
        hour,
        count: Math.floor(base * weekendBoost * (0.8 + Math.random() * 0.4)),
      });
    }
  }
  return data;
}

const now = new Date();

export const demoInbox = {
  unreadComments: 3,
  unreadMessages: 1,
  comments: [
    {
      id: "demo-c1",
      username: "fan_tokyo",
      text: "このリール最高です！また見たいです🔥",
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: "demo-c2",
      username: "music_lover_22",
      text: "詳細教えてください！",
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    },
    {
      id: "demo-c3",
      username: "osaka_smile",
      text: "いつも応援してます！",
      isRead: true,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  ],
  messages: [
    {
      id: "demo-m1",
      senderId: "u123",
      senderName: "collab_brand",
      text: "コラボのご相談させていただけますか？",
      isFromUser: true,
      isRead: false,
      windowEndsAt: new Date(now.getTime() + 20 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      id: "demo-m2",
      senderId: "self",
      senderName: "自分",
      text: "ありがとうございます！詳細送りますね",
      isFromUser: false,
      isRead: true,
      windowEndsAt: null,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  ],
  templates: [
    {
      id: "demo-t1",
      name: "詳細案内",
      keywords: ["詳細", "教えて"],
      replyText: "DMで詳細をお送りします！",
      dmText: "お問い合わせありがとうございます。詳細はこちらです→",
      isActive: true,
    },
  ],
};

export const demoReports = [
  {
    id: "demo-r1",
    periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: now,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    summary:
      "リール投稿のリーチが前週比+18%。19〜22時の投稿が最もエンゲージメント率が高い傾向です。",
    strengths: "・リールの保存率が平均を上回る\n・20代女性からの反応が強い\n・コメント返信率が良好",
    weaknesses: "・フィード投稿のリーチがやや低下\n・ストーリーズの閲覧完了率に改善余地",
    actions:
      "1. 水・金 20:00にリール投稿\n2. 高パフォーマンスハッシュタグセット「リール用」を活用\n3. 競合Aのカルーセル形式を参考にフィード改善",
    fullReport:
      "【週次レポート】\n\nリーチ合計: 12,400（+18%）\nエンゲージメント率: 4.2%（+0.3pt）\n\nリールがアルゴリズムに好まれる傾向。保存率重視の構成を継続推奨。",
  },
];

export const demoCompetitors = [
  {
    id: "demo-comp1",
    username: "rival_creator_01",
    name: "Rival Creator",
    followersCount: 15200,
    mediaCount: 340,
    posts: [
      {
        id: "demo-cp1",
        caption: "週末ライブの様子🎤",
        mediaType: "REELS",
        likeCount: 890,
        commentsCount: 42,
        engagementRate: 6.1,
      },
    ],
  },
  {
    id: "demo-comp2",
    username: "genre_star_jp",
    name: "Genre Star",
    followersCount: 28400,
    mediaCount: 520,
    posts: [
      {
        id: "demo-cp2",
        caption: "新曲ティザー",
        mediaType: "REELS",
        likeCount: 2100,
        commentsCount: 156,
        engagementRate: 8.2,
      },
    ],
  },
];

export const demoTopCompetitorPosts = [
  {
    id: "demo-tcp1",
    caption: "新曲ティザー",
    mediaType: "REELS",
    engagementRate: 8.2,
    likeCount: 2100,
    commentsCount: 156,
    competitor: { username: "genre_star_jp" },
  },
  {
    id: "demo-tcp2",
    caption: "週末ライブの様子🎤",
    mediaType: "REELS",
    engagementRate: 6.1,
    likeCount: 890,
    commentsCount: 42,
    competitor: { username: "rival_creator_01" },
  },
];

export const demoScheduledPosts = [
  {
    id: "demo-sp1",
    mediaType: "REELS",
    caption: "新リール投稿予定 #ライブ #音楽",
    scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    status: "pending",
    hashtagSet: { name: "リール用" },
    errorMessage: null,
  },
  {
    id: "demo-sp2",
    mediaType: "IMAGE",
    caption: "週末のお知らせ📢",
    scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    status: "pending",
    hashtagSet: null,
    errorMessage: null,
  },
];

export const demoHashtagSets = [
  {
    id: "demo-h1",
    name: "日常",
    tags: ["#laughpandemicmikey", "#日常", "#音楽"],
    usageCount: 12,
    avgReach: 980,
    avgEngagement: 4.1,
  },
  {
    id: "demo-h2",
    name: "リール用",
    tags: ["#リール", "#バズり", "#おすすめ"],
    usageCount: 8,
    avgReach: 1450,
    avgEngagement: 5.8,
  },
];
