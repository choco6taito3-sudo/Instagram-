import { NextRequest, NextResponse } from "next/server";
import {
  insightsQueue,
  audienceQueue,
  competitorsQueue,
  publishQueue,
} from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { refreshLongLivedToken } from "@instagram-ops/sdk";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await prisma.account.findMany();
    const appId = process.env.META_APP_ID!;
    const appSecret = process.env.META_APP_SECRET!;

    for (const account of accounts) {
      const daysUntilExpiry =
        (account.tokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

      if (daysUntilExpiry < 14) {
        try {
          const refreshed = await refreshLongLivedToken(
            appId,
            appSecret,
            account.accessToken
          );
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + refreshed.expires_in);
          await prisma.account.update({
            where: { id: account.id },
            data: {
              accessToken: refreshed.access_token,
              tokenExpiresAt: expiresAt,
            },
          });
        } catch (err) {
          console.error(`Token refresh failed for ${account.username}:`, err);
        }
      }
    }

    await insightsQueue.add("sync", {});
    await audienceQueue.add("sync", {});
    await competitorsQueue.add("sync", {});

    const pendingPosts = await prisma.scheduledPost.findMany({
      where: {
        status: "pending",
        scheduledAt: { lte: new Date(Date.now() + 15 * 60 * 1000) },
      },
    });

    for (const post of pendingPosts) {
      await publishQueue.add("publish", { postId: post.id });
    }

    return NextResponse.json({
      status: "ok",
      insights: "queued",
      audience: "queued",
      competitors: "queued",
      pendingPosts: pendingPosts.length,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
