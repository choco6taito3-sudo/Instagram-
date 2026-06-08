import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { InstagramClient } from "@instagram-ops/sdk";

const prisma = new PrismaClient();

export async function processSyncCompetitors(job: Job<{ accountId?: string }>) {
  const accounts = job.data.accountId
    ? await prisma.account.findMany({ where: { id: job.data.accountId } })
    : await prisma.account.findMany();

  for (const account of accounts) {
    const token = account.pageAccessToken || account.accessToken;
    const client = new InstagramClient(token);
    const competitors = await prisma.competitor.findMany({
      where: { accountId: account.id },
    });

    for (const competitor of competitors) {
      try {
        const discovery = await client.businessDiscovery(
          account.igUserId,
          competitor.username.replace("@", "")
        );
        const bd = discovery.business_discovery;

        await prisma.competitor.update({
          where: { id: competitor.id },
          data: {
            igUserId: bd.id,
            name: bd.name,
            followersCount: bd.followers_count,
            mediaCount: bd.media_count,
          },
        });

        for (const post of bd.media?.data || []) {
          const likes = post.like_count ?? 0;
          const comments = post.comments_count ?? 0;
          const engagementRate =
            bd.followers_count > 0
              ? ((likes + comments) / bd.followers_count) * 100
              : 0;

          await prisma.competitorPost.upsert({
            where: {
              competitorId_igMediaId: {
                competitorId: competitor.id,
                igMediaId: post.id,
              },
            },
            create: {
              competitorId: competitor.id,
              igMediaId: post.id,
              mediaType: post.media_type,
              caption: post.caption,
              permalink: post.permalink,
              likeCount: likes,
              commentsCount: comments,
              engagementRate,
              publishedAt: post.timestamp ? new Date(post.timestamp) : null,
            },
            update: {
              likeCount: likes,
              commentsCount: comments,
              engagementRate,
              syncedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`Failed to sync competitor ${competitor.username}:`, error);
      }
    }
  }
}
