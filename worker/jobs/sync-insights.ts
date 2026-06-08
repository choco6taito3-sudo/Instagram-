import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { InstagramClient } from "@instagram-ops/sdk";

const prisma = new PrismaClient();

function getInsightValue(insights: { name: string; values?: { value: number }[]; total_value?: { value?: number } }[], name: string): number {
  const insight = insights.find((i) => i.name === name);
  if (!insight) return 0;
  if (insight.total_value?.value !== undefined) return insight.total_value.value;
  return insight.values?.[0]?.value ?? 0;
}

export async function processSyncInsights(job: Job<{ accountId?: string }>) {
  const accounts = job.data.accountId
    ? await prisma.account.findMany({ where: { id: job.data.accountId } })
    : await prisma.account.findMany();

  for (const account of accounts) {
    const token = account.pageAccessToken || account.accessToken;
    const client = new InstagramClient(token);

    try {
      const user = await client.getUser(account.igUserId);
      await prisma.account.update({
        where: { id: account.id },
        data: {
          followersCount: user.followers_count ?? account.followersCount,
          name: user.name,
          profilePicture: user.profile_picture_url,
        },
      });

      const until = Math.floor(Date.now() / 1000);
      const since = until - 7 * 24 * 60 * 60;

      const accountInsights = await client.getAccountInsights(
        account.igUserId,
        ["reach", "accounts_engaged", "profile_views"],
        "day",
        since,
        until
      );

      for (const insight of accountInsights.data) {
        for (const val of insight.values || []) {
          if (!val.end_time) continue;
          const date = new Date(val.end_time);
          date.setUTCHours(0, 0, 0, 0);

          const reach = insight.name === "reach" ? val.value : undefined;
          const engaged = insight.name === "accounts_engaged" ? val.value : undefined;
          const profileViews = insight.name === "profile_views" ? val.value : undefined;

          const existing = await prisma.insightsDaily.findUnique({
            where: { accountId_date: { accountId: account.id, date } },
          });

          const reachVal = reach ?? existing?.reach ?? 0;
          const engagedVal = engaged ?? existing?.accountsEngaged ?? 0;
          const engagementRate = reachVal > 0 ? (engagedVal / reachVal) * 100 : 0;

          await prisma.insightsDaily.upsert({
            where: { accountId_date: { accountId: account.id, date } },
            create: {
              accountId: account.id,
              date,
              reach: reachVal,
              impressions: reachVal,
              accountsEngaged: engagedVal,
              followerCount: user.followers_count ?? 0,
              profileViews: profileViews ?? 0,
              engagementRate,
            },
            update: {
              ...(reach !== undefined && { reach, impressions: reach }),
              ...(engaged !== undefined && { accountsEngaged: engaged, engagementRate }),
              ...(profileViews !== undefined && { profileViews }),
              followerCount: user.followers_count ?? 0,
            },
          });
        }
      }

      const media = await client.getUserMedia(account.igUserId, 25);
      for (const item of media.data) {
        let reach = 0;
        let impressions = 0;
        let saved = 0;

        try {
          const metrics = item.media_type === "VIDEO" || item.media_type === "REELS"
            ? ["reach", "saved", "likes", "comments"]
            : ["reach", "saved", "likes", "comments"];
          const mediaInsights = await client.getMediaInsights(item.id, metrics);
          reach = getInsightValue(mediaInsights.data, "reach");
          impressions = reach;
          saved = getInsightValue(mediaInsights.data, "saved");
        } catch {
          // Media insights may fail for very new posts
        }

        const likes = item.like_count ?? 0;
        const comments = item.comments_count ?? 0;
        const engagementRate = reach > 0 ? ((likes + comments + saved) / reach) * 100 : 0;

        await prisma.mediaPost.upsert({
          where: { igMediaId: item.id },
          create: {
            accountId: account.id,
            igMediaId: item.id,
            mediaType: item.media_type,
            caption: item.caption,
            permalink: item.permalink,
            thumbnailUrl: item.thumbnail_url,
            likeCount: likes,
            commentsCount: comments,
            reach,
            impressions,
            saved,
            engagementRate,
            publishedAt: item.timestamp ? new Date(item.timestamp) : null,
          },
          update: {
            likeCount: likes,
            commentsCount: comments,
            reach,
            impressions,
            saved,
            engagementRate,
            syncedAt: new Date(),
          },
        });

        const avgEngagement = await prisma.mediaPost.aggregate({
          where: { accountId: account.id },
          _avg: { engagementRate: true },
        });

        if (avgEngagement._avg.engagementRate && engagementRate < avgEngagement._avg.engagementRate * 0.5) {
          await prisma.performanceAlert.create({
            data: {
              accountId: account.id,
              type: "low_engagement",
              message: `投稿「${(item.caption || "").slice(0, 50)}...」のエンゲージメント率が平均の50%以下です`,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Failed to sync insights for account ${account.username}:`, error);
    }
  }
}
