import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { InstagramClient } from "@instagram-ops/sdk";

const prisma = new PrismaClient();

export async function processSyncAudience(job: Job<{ accountId?: string }>) {
  const accounts = job.data.accountId
    ? await prisma.account.findMany({ where: { id: job.data.accountId } })
    : await prisma.account.findMany();

  for (const account of accounts) {
    const token = account.pageAccessToken || account.accessToken;
    const client = new InstagramClient(token);
    const snapshotAt = new Date();

    try {
      const breakdowns = ["age", "gender", "city", "country"] as const;
      for (const breakdown of breakdowns) {
        try {
          const demo = await client.getFollowerDemographics(
            account.igUserId,
            breakdown
          );
          const results =
            demo.data[0]?.total_value?.breakdowns?.[0]?.results || [];
          const total = results.reduce((sum, r) => sum + r.value, 0);

          await prisma.audienceDemographic.deleteMany({
            where: {
              accountId: account.id,
              type: breakdown,
              snapshotAt: {
                gte: new Date(snapshotAt.getTime() - 1000),
              },
            },
          });

          for (const result of results) {
            const dimValue =
              result.dimension_values[result.dimension_values.length - 1];
            await prisma.audienceDemographic.create({
              data: {
                accountId: account.id,
                type: breakdown,
                dimension: breakdown,
                value: dimValue,
                count: result.value,
                percentage: total > 0 ? (result.value / total) * 100 : 0,
                snapshotAt,
              },
            });
          }
        } catch {
          // Demographics may not be available for accounts with <100 followers
        }
      }

      try {
        const online = await client.getOnlineFollowers(account.igUserId);
        const values = online.data[0]?.values || [];

        await prisma.audienceOnline.deleteMany({
          where: {
            accountId: account.id,
            snapshotAt: { gte: new Date(snapshotAt.getTime() - 1000) },
          },
        });

        for (const val of values) {
          if (!val.end_time) continue;
          const d = new Date(val.end_time);
          await prisma.audienceOnline.create({
            data: {
              accountId: account.id,
              dayOfWeek: d.getUTCDay(),
              hour: d.getUTCHours(),
              count: val.value,
              snapshotAt,
            },
          });
        }
      } catch {
        // online_followers may not be available
      }
    } catch (error) {
      console.error(
        `Failed to sync audience for account ${account.username}:`,
        error
      );
    }
  }
}
